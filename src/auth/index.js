'use strict';

let config = require('../config');
let passport = require('passport');
let assert = require('mue-core/modules/assert');
let log = require('mue-core/modules/log')(module);

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    let user = {
        _id: 123
    };

    done(null, user);
});

/*Initialize actions*/
require('mue-core/modules/actions/request-to-service');

/*Initialize strategies*/
require('./strategies/local-signin');
require('./strategies/local-signup');

exports.strategy = function (name, callback) {
    assert.isDefined(name);
    assert.isString(name);

    switch(name){
        case 'local-signup':
            return passport.authenticate('local-signup', callback);

        break;
        case 'local-signin':
            return passport.authenticate('local-signin', callback);

            break;
        default:
            throw new Error('Cannot find such strategy');

            break;
    }
};

exports.middlewares = {
    skipSignInUser: require('./middlewares/skip-signIn-user')
};

exports.initialize = function (app) {
    app.use(passport.initialize());
    app.use(passport.session());

    log.debug('Auth was initialized');
};