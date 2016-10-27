'use strict';

/*CONFIG STAGE*/
if (process.env.NODE_ENV == 'development') {
    let path = require('path');

    // add another folder
    console.warn('Takes local mue-core package');
    require('app-module-path').addPath(path.join(__dirname + './../../'));
}

/*RUN STAGE*/
let path = require('path');

let config = require('config');

let express = require('express');
let helmet = require('helmet');
let session = require('express-session');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let log = require('mue-core/modules/log')(module);

/*Modules*/
let auth = require('./auth');

// start api server
require('mue-core/modules/api-server')({
    name: config.get('name'),
    port: config.get('network:port'),

    init: function (app) {
        //protect app from some well-known web vulnerabilities by setting HTTP headers appropriately
        app.use(helmet());

        // set up public folder
        app.use(express.static(__dirname + '/public'));

        app.use(cookieParser());
        app.use(bodyParser.urlencoded({extended: false}));

        app.use(
            session({
                secret: '7!_-dsr', // TODO: move to secret place
                name: 'sessionId',
                saveUninitialized: false,
                resave: false,

                cookie: {
                    // Ensures the cookie is sent only over HTTP(S), not client JavaScript, helping to protect against
                    // cross-site scripting attacks
                    httpOnly: true,

                    // use to set expiration date for persistent cookies
                    expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
                }
            })
        );

        auth.initialize(app);

        // initialize routes
        require('./routes')(app);

        // set up views engine
        app.set('views', __dirname + "/views");
        app.set('view engine', 'jade');
    }
});

// connect to DB
require('modules/db').initConnection({
    port: config.get('db:port'),
    name: config.get('db:name'),
    host: config.get('db:host')
});
