### Summary
Due to the nature of the application we are building, our users are peforming a lot of authorized requests when the app is initialized. Previously, we thought the problems is caused by multiple-tab usage (see `master` branch). We no longer think that's the case and we can reproduce the problem with just a single tab.
We are using Auth0 SPA SDK v1.12.1 with the settings you can view here: https://github.com/smogg/auth-mutli-tab-issue/blob/single-tab/app.js#L2-L9
Notably, we use Refresh Token Rotation with localStorage as cache location.

### The problem
When the app is initialized, we call `.getTokenSilently` and `.isAuthenticated` functions from the Auth0 SPA SDK multiple times. This can cause the same Refresh Token to be used twice, which results in a 403 response being returned. We log the users out when we see a 403 response, assuming their session has expired (or that someone has stoled their token).
A similar issue is tracked here: https://github.com/auth0/auth0-spa-js/issues/553

**This problem is affecting hundreds of our users and we consider it a critical issue.**

### Steps to reproduce
1. Start the server `./server.sh` and open http://localhost:8080 in your browser
1. After signing in, continue pressing the "mimic opening a new tab" button.
1. After a while (1-30 tries from my experience) you'll see an (unwanted) 403 response.

### Mitigation
The following screenshots represents the token settings for the application used in this demo:

![Auth0 token settings](token_settings.png)
