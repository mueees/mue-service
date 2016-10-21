'use strict';

let config = require('../config');
let passport = require('passport');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    let user = {
        id: 123
    };

    done(null, user);
});

/*Initialize actions*/
require('mue-core/modules/actions/request-to-service');


/*Initialize strategies*/
require('./strategies/local-signin');
require('./strategies/local-signup');

exports.middlewares = {
    // List of authenticate strategies
    localSignUp: passport.authenticate('local-signup'),
    localSignIn: passport.authenticate('local-signin'),

    // List of usefull middlewares
    skipSignInUser: require('./middlewares/skip-signIn-user')
};

exports.initialize = function (app) {
    app.use(passport.initialize());
    app.use(passport.session());
};