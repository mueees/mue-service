'use strict';

let action = require('mue-core/modules/action');
require('mue-core/modules/actions/send-email');

let log = require('mue-core/modules/log')(module);
let error = require('mue-core/modules/error');
let env = require('mue-core/modules/environment');
let config = require('../config');
let auth = require('../auth');

module.exports = function (app) {
    // render main page
    app.get('/', function (request, response, next) {
        response.render('pages/home', {
            page: 'page-home'
        });
    });

    // render signup page
    app.get('/signup', auth.middlewares.skipSignInUser, function (request, response, next) {
        response.render('pages/signup', {
            page: 'page-sign'
        });
    });

    app.post('/signup', auth.middlewares.skipSignInUser, function (request, response, next) {
        if (!request.body.email || !request.body.password ||
            request.body.password !== request.body.confirmPassword) {
            response.render('pages/signup', {
                errorMessage: 'Invalid credentials'
            });

            return;
        }

        action.execute('requestToService', {
            service: 'account',
            method: 'POST',
            url: '/signup',
            data: {
                email: request.body.email,
                password: request.body.password
            }
        })
            .then(function (user) {
                response.render('pages/signup', {
                    successMessage: 'Well done! Confirm your email to complete your registration'
                });

                let host = env.isDevelopment() ? config.get('network:hostName') + ':' + config.get('network:port') : config.get('network:hostName');
                let confirmationLink = 'http://' + host + '/confirmation?confirmationId=' + user.confirmationId;

                action.execute('sendEmail', {
                    service: config.get('email:service'),
                    user: config.get('email:user'),
                    password: config.get('email:password'),

                    from: config.get('email:from'),
                    to: user.email,
                    subject: 'Sign up confirmation',
                    text: 'Well done! Please click to the link and confirm your email. ' + confirmationLink
                }).catch(function () {
                    log.error('Cannot send confirmation Id');
                });
            })
            .catch(function (err) {
                response.render('pages/signup', {
                    errorMessage: err ? err.message : 'Invalid credentials'
                });
            });
    });

    // confirm user id
    app.get('/confirmation?:confirmationId', function (request, response, next) {
        action.execute('requestToService', {
            service: 'account',
            method: 'GET',
            url: '/confirmation?confirmationId=' + request.query.confirmationId
        }).then(function (user) {
            // manual login current user
            request.login(user, function (err) {
                if (err) {
                    log.error(err);
                    response.redirect('/signin');

                    return;
                }

                response.redirect('/');
            });
        }, function (err) {
            log.error(err);

            response.render('pages/400', {
                errorMessage: err.message
            });
        });
    });

    app.get('/forgot-password', auth.middlewares.skipSignInUser, function (request, response, next) {
        response.render('pages/forgot-password', {
            page: 'forgot-password'
        });
    });

    // render signin page
    app.get('/signin?:continue', auth.middlewares.skipSignInUser, function (request, response, next) {
        response.render('pages/signin', {
            page: 'page-sign'
        });
    });

    app.post('/signin?:continue', auth.middlewares.skipSignInUser, function (request, response, next) {
        if (!request.body.email || !request.body.password) {
            response.render('pages/signin', {
                errorMessage: 'Invalid credentials'
            });

            return;
        }

        auth.strategy('local-signin', function (err, user) {
            if (err) {
                response.render('pages/signin', {
                    errorMessage: err.message
                });
                return;
            }

            // manual login current user
            request.login(user, function (err) {
                if (err) {
                    log.error(err);

                    response.redirect('/signin');
                    return;
                }

                let redirectUrl = request.query.continue || config.get('config:urls:redirectAfterSignIn');

                response.redirect(redirectUrl);
            });
        })(request, response, next);
    });

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