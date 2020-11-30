### Summary
Due to the nature of the application we are building, our users are peforming a lot of authorized requests from multiple browser tabs. We are using Auth0 SPA SDK v1.12.1 with the settings you can view here: https://github.com/smogg/auth-mutli-tab-issue/blob/07f6059eab4374d02622853afaf56edf2e102343/app.js#L2-L9
Notably, we use Refresh Token Rotation with localStorage as cache location.

### The problem
When multiple tabs are open, at some point two (or more) tabs will request a new Access Token using the same Refresh Token stored in localStorage. If I understand what the Auth0 SPA SDK offers, this should be prevented, however it doesn't seem like that's the case. A similar issue is tracked here: https://github.com/auth0/auth0-spa-js/issues/553

**This problem is affecting hundreds of our users daily and we consider it a critical issue.**

### Steps to reproduce
1. Start the server `./server.sh` and open http://localhost:8080 in your browser
1. After signing in, open multiple tabs pointed at the same url
1. In one of the tabs, click "Start expiring token" button. Eventually you'll start seeing 403s in the network tab.
