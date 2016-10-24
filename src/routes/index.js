'use strict';

let error = require('mue-core/modules/error');
let config = require('../config');
let auth = require('../auth');

module.exports = function (app) {
    app.get('/signup', auth.middlewares.skipSignInUser, function (request, response, next) {
        response.render('pages/signup', {});
    });

    app.post('/signup', auth.middlewares.skipSignInUser, function (request, response, next) {
        auth.strategy('local-signup', function (err) {
            let locals = {};

            if (err) {
                locals.errorMessage = err.message;
            } else {
                locals.successMessage = 'Well done! Confirm your email to complete your registration';
            }

            response.render('pages/signup', locals);
        })(request, response, next);
    });

    app.get('/signin', auth.middlewares.skipSignInUser, function (request, response, next) {
        response.render('pages/signin', {});
    });

    /*app.post('/signin?:continue', auth.middlewares.localSignIn, function (request, response, next) {
     let redirectUrl = request.query.continue || config.get('config:urls:redirectAfterSignIn');

     response.redirect(redirectUrl);
     });*/

    app.get('/logout', function (request, response, next) {
        request.logout();

        response.redirect(config.get('config:urls:redirectAfterLogout'));
    });

    /*OAUTH 2*/
    /*app.get('/oauth2/auth?:redirect_uri:client_id', function (request, response, next) {

     });

     app.post('/oauth2/token', function (request, response, next) {

     });*/
};