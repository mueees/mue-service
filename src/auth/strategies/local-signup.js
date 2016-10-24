'use strict';

let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

let action = require('mue-core/modules/action');

passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback : true
    },
    function(request, email, password, done) {
        /**
         * done(err, user, info)
         * */

        action.execute('requestToService', {
            service: 'account',
            method: 'POST',
            url: '/signup',
            data: {
                email: email,
                password: password
            }
        }).then(function () {
            done(null, null, null);
        }).catch(function (error) {
            done(error, null, null);
        });
    }
));