# Actionhero + Angular + CORS + CSRF
*visit www.actionherojs.com for more information*

This example project can be viewed live at [angular.actionherojs.com](http://angular.actionherojs.com)

This project highlights how to use actionhero to serve the API for a single-page "static file" application run by angular.  The highlights of this project include:
- user management with mySQL via the Sequelize package
- session management in redis
- using actionhero to serve the static content
- creating helpers within angular to wrap actionhero actions (http)
- creating helpers within angular to wrap websocket communication
- protecting your single-page application from Cross-Site Forgery (CSRF)
- protecting your single-page application with CORS 

If you are an actionhero beginner, you can learn the fundamentals at [github.com/evantahler/actionhero-tutorial](https://github.com/evantahler/actionhero-tutorial)

## Getting Started

### To install:
(assuming you have [node](http://nodejs.org/) and NPM installed)

`npm install`

### To Run:
Copy the `.env.example` file to `.env` and fill in the data you will need to boot the application 
`source .env && npm start`

## Server Configuration

#### `./config/server/web.js`
- we have disabled `simpleRouting` and `queryRouting` to force API consumers to use the routes defined in `./config/routes.js`
- Since we are developing a site served via static files, when developing we set `flatFileCacheDuration` to be very low, so that each page request will re-load the assets from disk.  However, in production we set this back to longer cache duration to reduce the server load.
- in production, `Access-Control-Allow-Origin` is set to only allow requests from browsers originating from *from* this domain (CORS protection).

#### `./config/api.js`
- we add `password` and `csrfToken` to `filteredParams`, so they don't appear in the logs

#### `./config/sequelize.js`
- this file contains the settings for connecting to mySQL.

## User Management

#### `./models/users`
- Users are stored in a mySQL table defined by this file.  Note how we can define helper methods on the user class itself for hashing and checking passwords. We can also define a helper `apiData()` which will allow us to JSON-ify the user object simply when returning it via the API

#### `./initializers/sequelize`
- When the server boots, we use the `sequelize.sync()` to create any tables we don't yet have in our database from their model definition.  You can also use migrations with sequelize.

#### `./actions/user`
- We have a number of API actions for dealing with users, including creation, viewing, and editing them.  Note that `user:view` and `user:edit` require the `logged-in-session` middleware, which we will address later. Sequelize makes it very easy to do partial updates to the user object with a simple `user.updateAttributes(data.params)`, and params would already be sanitized and filtered via actionhero.

#### `./counfig/routes`
- We have mapped our user actions to the appropriate routes and HTTP verbs.

## Session Management

#### `./initializers/session`
- `load`, `create`, and `destroy` helpers are defined for the session.  We use the connection's fingerprint as the key each time, since we can already count on actionhero properly identifying the user with a unique session id.
- every time the session is loaded, we touch the TTL of the redis session key again, so it will again be valid 24 hours from now.  This has the nice feature of ensuring that if you have a very active user, they can remain logged in.
- the session data stored in redis also contains a random CSRF token which we will send down to the client later

#### `./actions/session`
- we have 3 session actions, `create`, `destroy`, and `check`... which do as you would expect, invoking the initializer described above. 
- when the session is created of checked, we return the CSRF token (along with some user data) down to the client to save in RAM.
- `check` is used when the single-page app is hard-reloaded.  If a session cookie is present, the browser asks the server if it is valid, and if so, is returned the valid CSRF token to store in ram again.  This is used when a user returns to their dashboard after being idle for some time.
  - if the session is in-valid, the user it logged out and returned to the homepage
- there is a speical action for web sockets, which sets `connection.autehenticated`, which is required to access the chat room
  - this action is not exposed in the routes, so http connections cannot access it.  We make sure of this via `blockedConnectionTypes`
  - this action will source the fingerprint of the parent http connection, so we can use the same session authentication logic! 

#### `./counfig/routes`
- We have mapped our user actions to the appropriate routes and HTTP verbs.

## Angular

### Project Layout
- This project is not minified so you can get a better idea of how to organize your controllers and views.
- We make heavy use of dynamic content injection via page partials (found in `./public/pages`)
- There is a separate navigation bar depending on if you are logged in or not, but there are some pages both types of users have access to. (this is in `./public/sections`)
- `./public/index.html` is the only entry-point into the project.  All other pages are loaded in dynamically.
  - we use the `angular-route` plug-in to use ajax-y static URLs
- `./public/js/app.js` is where the main angular module is configured, and then `./public/js/controlers` contain the logic for each page.

#### app.js
- we have a collection of routes ($rootScope.routes) and define where they can be loaded from, the page title, and if this page requires a logged-in user.  If a logged-out user lands on this URL, they will be rediredted to the home page (defined in `pageController`)
- the `pageController` also checks to see if the user is logged in or not by hitting the `session:check` action.  This helps us to load user data in to RAM, and modify the navigation bar as needed. This action also sets the CSRF token for use in later actions
- we define `$rootScope.actionHelper`, which is a simple wrapper around angular's built-in `$http`, so it makes it easier to call actions.
  - we define a default error behavior to write to `$scope.error`, but allow for custom error callbacks. 
  - we handle building up GET url strings dynamically if needed
  - we auto-append the `$rootScope.csrtToken` to the params if present.
- `$rootScope.sessionCheck` is a state variable which informs `$rootScope.actionHelper` if have completed our logged-in check (and loading the CSRF token).  If not, and another action is called, we'll sleep 100ms and try again.  
 
#### chat.js
- hooking an actionhero ws client into angular is quite simple!  
  - be sure that you call `$rootScope.$apply()` if you need to re-draw based on an event from websockets.

## Notes

- CSRF protection can be thought of as a 2-factor key.  The pair of both the sessionID and CSRF token are both required to make request.  One part of the key is stored as a cookie which will persist between page loads, while the other is only stored in RAM within the page.  Since only pages which originate from our domain can make HTTP and API requests, we can be sure that the only way to hold a CSRF token in RAM is to be loading HTML from our domain.  
  - of course you can use curl to work though the API assuming you had valid user credentials or a session token, but you would need to make subsequent requests.  This is the key test for preventing a malicious site crafting a foriegn POST/PUT/DELETE request back to our domain

```
curl -X PUT -H "Content-Type: application/json" --cookie 'sessionID=d8875cfc42a038af96f1aca1707bcb69ffb18302' --data '{"firstName": "newName"}' http://angular.actionherojs.com/api/user -v
=> {"error":"CSRF error"}

curl -X PUT -H "Content-Type: application/json" --cookie 'sessionID=d8875cfc42a038af96f1aca1707bcb69ffb18302' http://angular.actionherojs.com/api/session -v
=> {"user":{"id":1,"email":"evan@evantahler.com","firstName":"Evan.","lastName":"Tahler"},"csrfToken":"2943a850da2500b8d81f1b7af9d1281bc10f9c88ff338835e7b27ce88ef9377bcecce90317aac72ded496f77b27fb8736b362781c707007cf4261f57680626d1","success":true}

curl -X PUT -H "Content-Type: application/json" --cookie 'sessionID=d8875cfc42a038af96f1aca1707bcb69ffb18302' --data '{"csrfToken": "2943a850da2500b8d81f1b7af9d1281bc10f9c88ff338835e7b27ce88ef9377bcecce90317aac72ded496f77b27fb8736b362781c707007cf4261f57680626d1", "firstName": "newName"}' http://angular.actionherojs.com/api/user -v
=> {"user":{"id":1,"email":"evan@evantahler.com","firstName":"newName","lastName":"Tahler"}}
```


## Next Steps
- tests
- https cookies (and an HTTPS-only site and API)