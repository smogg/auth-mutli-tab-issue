// Auth0 setup
const a0config = {
  client_id: 'wlx24OQ9PHj02m0nt422ALThAcbFhICa',
  domain: 'pitch-app-playground.eu.auth0.com',
  audience: 'document-sync-1',
  redirect_uri: 'http://localhost:8080',
  cacheLocation: 'localstorage',
  useRefreshTokens: true
};

const a0 = new Auth0Client(a0config);

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}


function LamportMutex(id) {
    const X = '_lock-X',
          Y = '_lock-Y';

    let set = (k, v) => localStorage.setItem(k, v);
    let get = (k) => localStorage.getItem(k);

    return {
        acquire: function() {
            return this.lock(0);
        },
        release: function() {
            set(Y, null);
        },
        lock: function(retries) {
            const retry = (resolve, reject) => {
                window.requestAnimationFrame(() => {
                    this.lock(retries + 1).then(resolve, reject);
                });
            };
            const isFree = (v) => {
                const val = get(v);
                return val === undefined || val === null;
            };

            set(X, id);

            return new Promise((resolve, reject) => {
                if (isFree(Y) || retries > 10) {
                    set(Y, id);
                    if (get(X) === id) {
                        resolve();
                    } else {
                        window.requestAnimationFrame(() => {
                            if (get(Y) === id) {
                                resolve();
                            } else {
                                retry(resolve, reject);
                            }
                        });
                    }
                } else retry(resolve, reject);
            });
        }
    };
}


function login() {
  return a0.isAuthenticated()
    .then((isAuthenticated) => {
      if(isAuthenticated) {
        console.warn("Already authenticated");
        return a0.getUser();
      } else {
        return a0.handleRedirectCallback().then(() => {
          console.warn("Auth callback handled.");
          return a0.getUser();
        }).catch(() => {
          return a0.loginWithRedirect();
        });
      }
    });
}

function expireToken() {
  const k = `@@auth0spajs@@::${a0config.client_id}::${a0config.audience}::openid profile email offline_access`;
  const json = localStorage.getItem(k);
  if (json) {
    const tokens = JSON.parse(json);
    tokens.expiresAt = 1;
    localStorage.setItem(k, JSON.stringify(tokens));
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// Demo UI
function displayUser(user) {
  document.querySelector("#user").innerText = JSON.stringify(user);
}

function displayToken(token) {
  document.querySelector("#token").innerText = token;
}

login().then(displayUser);

// expires the token exery 10 seconds. Usually, this would happen only every 2 hours
// as that's the token lifetime we have set in production.
// This function should only be fired in a single tab to be realistic.
function startExpiringToken() {
  setInterval(() => {
    expireToken();
  }, 10000);
}

var mtx = LamportMutex(uuidv4());

// start requesting a new token every second
setInterval(() => { mtx.acquire().then(
    () => {
        console.log('getTokenSilently');
        a0.getTokenSilently().then((t) => mtx.release());
    });
}, 500);

document.querySelector("#expire").addEventListener('click', startExpiringToken);
