'use strict';

let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

passport.use('local-signin', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback : true
    },
    function(request, username, password, done) {
        return done(null, {
            id: 123
        });
    }
));