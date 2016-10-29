'use strict';

let config = require('../config');
let passport = require('passport');
let assert = require('mue-core/modules/assert');
let log = require('mue-core/modules/log')(module);

let action = require('mue-core/modules/action');
require('mue-core/modules/actions/request-to-service');

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    action.execute('requestToService', {
        service: 'account',
        url: '/account/' + id
    })
        .then(function (user) {
            done(null, user);
        })
        .catch(function (err) {
            log.error(err.message);

            done('Cannot find user');
        });
});

/*Initialize actions*/
require('mue-core/modules/actions/request-to-service');

/*Initialize strategies*/
require('./strategies/local-signin');

exports.strategy = function (name, callback) {
    assert.isDefined(name);
    assert.isString(name);

    switch (name) {
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