// Auth0 setup
const a0config = {
  client_id: 'wlx24OQ9PHj02m0nt422ALThAcbFhICa',
  domain: 'pitch-app-playground.eu.auth0.com',
  audience: 'document-sync-1',
  redirect_uri: 'http://localhost:8080',
  cacheLocation: 'localstorage',
  useRefreshTokens: true
}

const a0 = new Auth0Client(a0config);

function login() {
  return a0.isAuthenticated()
    .then((isAuthenticated) => {
      if(isAuthenticated) {
        console.warn("Already authenticated");
        return a0.getUser()
      } else {
        return a0.handleRedirectCallback().then(() => {
          console.warn("Auth callback handled.")
          return a0.getUser()
        }).catch(() => {
          return a0.loginWithRedirect()
        })
      }
    })
}

function getToken() {
  return a0.getTokenSilently()
}

// Demo UI
function displayUser(user) {
  document.querySelector("#user").innerText = JSON.stringify(user)
}

function displayToken(token) {
  document.querySelector("#token").innerText = token
}

// Init logic
login()
  .then(displayUser)

function expireToken() {
  const k = `@@auth0spajs@@::${a0config.client_id}::${a0config.audience}::openid profile email offline_access`;
  const json = localStorage.getItem(k)
  if (json){
    const tokens = JSON.parse(json)
    tokens.expiresAt = 1;
    localStorage.setItem(k, JSON.stringify(tokens))
  }
}

function sleep(ms) {
  return function (x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}

function jitter(p) {
  // We perform real network requests, so this function is meant to mimic
  // the random delay those might cause
  return Promise.resolve()
    .then(sleep(1000 * Math.random()))
    .then(p)
}

let counter = 1;
function mimicInitializationLogic() {
  // expire token to mimic opening a new tab after a while
  expireToken()

  // on every app init we populate our app's state with the user data, only once
  jitter(() => a0.isAuthenticated())
    .then(() => {
      console.log("getUser")
      a0.getUser()
      a0.getIdTokenClaims()
    })

  // in different places throughout the app we do two things:
  // the number "30" is not random here - that's the actual number of how many times
  // we might call the Auth0 API functions when a user opens a new tab
  for (let i = 0; i < 30; i++) {
    // - we get the token and talk to our servers
    jitter(() => {
      console.log("getTokenSilently")
      a0.getTokenSilently()
    })
    // - we check if user is authenticated to make decisions in different parts of the application
    jitter(() => {
      console.log("isAuthenticated")
      a0.isAuthenticated()
    })
  }

  console.log("-----", counter, "-----")
  counter++;
}

document.querySelector("#hundred").addEventListener('click', mimicInitializationLogic)
