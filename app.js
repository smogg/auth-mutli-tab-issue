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

function expireToken() {
  const k = `@@auth0spajs@@::${a0config.client_id}::${a0config.audience}::openid profile email offline_access`;
  const json = localStorage.getItem(k)
  if (json) {
    const tokens = JSON.parse(json)
    tokens.expiresAt = 1;
    localStorage.setItem(k, JSON.stringify(tokens))
  }
}

// Demo UI
function displayUser(user) {
  document.querySelector("#user").innerText = JSON.stringify(user)
}

function displayToken(token) {
  document.querySelector("#token").innerText = token
}

login()
  .then(displayUser)

// expires the token exery 10 seconds. Usually, this would happen only every 2 hours
// as that's the token lifetime we have set in production.
// This function should only be fired in a single tab to be realistic.
function startExpiringToken() {
  setInterval(() => {
    expireToken()
  }, 10000)
}

// start requesting a new token every second
setInterval(() => {
  a0.getTokenSilently()
}, 1000)

document.querySelector("#expire").addEventListener('click', startExpiringToken)
