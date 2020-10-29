// Auth0 setup
const a0config = {
  client_id: 'wlx24OQ9PHj02m0nt422ALThAcbFhICa',
  domain: 'pitch-app-playground.eu.auth0.com',
  // audience: 'document-sync-1',
  redirect_uri: 'http://localhost:8080',
  cacheLocation: 'localstorage',
  userRefreshTokens: true
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

  return a0.isAuthenticated()
    .then(() => {
      return a0.getTokenSilently().catch((err) => console.error("couldn't get token", err))
     })
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

// ********
// THE LOOP
// ********
let interval;

function stop() {
  interval && clearInterval(interval)
}

function start() {
  stop()
  interval = setInterval(
    function () { getToken().then(displayToken) },
    50
  )
}

function expireToken() {
  const k = "@@auth0spajs@@::wlx24OQ9PHj02m0nt422ALThAcbFhICa::default::openid profile email";
  const json = localStorage.getItem(k)
  if (json){
    const tokens = JSON.parse(json)
    tokens.expiresAt = 1;
    localStorage.setItem(k, JSON.stringify(tokens))
  }
}

document.querySelector("#start").addEventListener('click', start)
document.querySelector("#stop").addEventListener('click', stop)
document.querySelector("#expire").addEventListener('click', expireToken)

expireToken()
for (let i = 0; i < 500; i++) {

  getToken()
}
