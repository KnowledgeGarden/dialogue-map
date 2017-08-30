# Dialogue Map [![Circle CI](https://circleci.com/gh/wenzowski/dialogue-map/tree/master.svg?style=shield&circle-token=846af5194f8f6079cd803a5cb0f2dafa348ffa99)](https://circleci.com/gh/wenzowski/dialogue-map/tree/master)[![Coverage Status](https://coveralls.io/repos/github/wenzowski/dialogue-map/badge.svg?branch=master&t=cxY0fy)](https://coveralls.io/github/wenzowski/dialogue-map?branch=master)[![AVA test suite](https://img.shields.io/badge/test_suite-AVA-5ed9c7.svg)](https://github.com/sindresorhus/ava)[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
A web-based platform for structured conversation. See [docs](https://github.com/wenzowski/dialogue-map/tree/docs).

##Docs for Major Components 
| Component           | Dependency                                                                |
| ------------------- | ------------------------------------------------------------------------- |
| Topic Map Provider  | [BacksideServletKS](https://github.com/KnowledgeGarden/BacksideServletKS) |
| Database            | [RethinkDB](https://www.rethinkdb.com/)                                   |
| Database schema     | [GraphQL](https://github.com/graphql/graphql-js)                          |
| Client validation   | [Joi](https://github.com/hapijs/joi)                                      |
| Database hooks      | [GraphQL](https://github.com/graphql/graphql-js)                          |
| Forms               | [redux-form](https://github.com/erikras/redux-form)                       |
| Client-side cache   | [redux](http://redux.js.org/)                                             |
| Socket server       | [socketcluster](http://socketcluster.io/#!/)                              |
| Authentication      | [JWTs](https://jwt.io)                                                    |
| Auth-transport      | GraphQL (via HTTP)                                                        |
| Front-end           | [React](https://facebook.github.io/react/)                                |
| Build system        | [webpack](https://webpack.github.io/)                                     |
| CSS                 | [css-modules](https://github.com/css-modules/css-modules)                 |
| Optimistic UI       | [redux-optimistic-ui](https://github.com/mattkrick/redux-optimistic-ui)   |
| Testing             | [AVA](https://github.com/sindresorhus/ava)                                |
| Linting             | [xo](https://www.npmjs.com/package/xo)                                    |
| Routing             | [redux-simple-router](https://github.com/rackt/redux-simple-router)       |

##Installation
- `brew install rethinkdb` ...and run it
- `brew install elasticsearch` ...and run it
- `git clone -b local-testing git@github.com:wenzowski/BacksideServletKS.git`
- `ant && ./run.sh` ...from the BacksideServletKS repo to start it
- `git clone` this repo
- `cd dialogue-map`
- `npm install`
- `npm run quickstart`

##Client-side development
- `npm start`
- [http://localhost:3000](http://localhost:3000)

Rebuilds the client code in-memory & uses hot module reload so you can give <F5> a break.

##Server-side development
- `npm run prod`
- [http://localhost:3000](http://localhost:3000)
- If you edit any client or universal files, run `npm run bs` to rebuild & serve the bundle

This mode enables changes to the server ***without to client code recompilation***.
That means you only wait for the server to restart!

##Database development
- [http://localhost:8080](http://localhost:8080) for RethinkDB
- All tables are managed in `./src/server/setupDB.js`. Just add your tables & indices to that file and rerun
- A standard ORM might check for tables & ensure indices at least once per build. Doing it this way keeps your build times down
- [http://localhost:3000/graphql](http://localhost:3000/graphql) for testing out new queries/mutations

##Webpack configs
####Development config
When the page is opened, a basic HTML layout is sent to the client along with a stringified redux store and a request for the common chunk of the JS.
The client then injects the redux store & router to create the page.
The redux devtools & logger are also loaded so you track your every state-changing action. 
The routes are loaded async, check your networks tab in chrome devtools and you'll see funny js files load now & again. 

####Production config
Builds the website & saves it to the `build` folder.
Maps the styles to the components, but uses the prerendered CSS from the server config (below)
Separates the `vendor` packages and the `app` packages for a super quick, cachable second visit.
Creates a webpack manifest to enable longterm caching (eg can push new vendor.js without pushing a new app.js)
Optimizes the number of chunks, sometimes it's better to have the modules of 2 routes in the same chunk if they're small

####Server config
A webpack config builds the entire contents of the routes on the server side.
This is required because node doesn't know how to require `.css`.
When a request is sent to the server, react-router matches the url to the correct route & sends it to the client.
Any browser dependency is ignored & uglified away.
To test this, disable javascript in the browser. You'll see the site & css loads without a FOUC.

##Develop
```
docker-compose -f docker-compose.yml -f docker-compose.development.yml up --build -d
docker-compose -f docker-compose.yml -f docker-compose.development.yml run --rm web npm i
docker-compose -f docker-compose.yml -f docker-compose.development.yml run --rm web npm run db:migrate
docker-compose -f docker-compose.yml -f docker-compose.development.yml run --rm web npm run test
docker-compose -f docker-compose.yml -f docker-compose.development.yml down
```

##Deploy
```
docker-compose -f docker-compose.yml -f docker-compose.development.yml run web npm run build
docker cp `docker ps -aqf "name=dialoguemap_web_1"`:/app/build ./ # if your docker-machine is running remotely
docker build -t wenzowski/dialogue-map .
docker push wenzowski/dialogue-map
docker-machine create --driver digitalocean --digitalocean-access-token=$DIGITAL_OCEAN_TOKEN --digitalocean-size=2gb --digitalocean-region=tor1 dialogue-map.wenzowski.com
eval $(docker-machine env dialogue-map.wenzowski.com)
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
docker-compose -f docker-compose.yml -f docker-compose.production.yml run --rm web npm run db:migrate
docker-compose -f docker-compose.yml -f docker-compose.production.yml logs -f
```

##License
Apache 2.0
