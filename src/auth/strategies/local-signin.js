'use strict';

let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let action = require('mue-core/modules/action');

passport.use('local-signin', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (request, email, password, done) {
        action.execute('requestToService', {
            service: 'security',
            method: 'POST',
            url: '/signin',
            data: {
                email: email,
                password: password
            }
        }).then(function (user) {
            done(null, user);
        }, function (error) {
            done(error, null);
        });
    }
));