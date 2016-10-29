'use strict';

let action = require('mue-core/modules/action');
require('mue-core/modules/actions/send-email');
require('mue-core/modules/actions/request-to-service');

let _ = require('lodash');
let utils = require('mue-core/modules/utils');
let log = require('mue-core/modules/log')(module);
let error = require('mue-core/modules/error');
let env = require('mue-core/modules/environment');
let config = require('../config');
let auth = require('../auth');
let serviceUrl = require('../modules/service-url');

module.exports = function (app) {
    // render main page
    app.get('/', function (request, response, next) {
        response.render('pages/home', {
            page: 'page-register page-home page-dark',
            user: {
                email: _.get(request, 'user.email')
            }
        });
    });

    // render signup page
    app.get('/signup', auth.middlewares.skipSignInUser, function (request, response, next) {
        response.render('pages/signup', {
            page: 'page-register page-sign page-dark'
        });
    });

    app.post('/signup', auth.middlewares.skipSignInUser, function (request, response, next) {
        if (!request.body.email || !request.body.password ||
            request.body.password !== request.body.confirmPassword) {
            response.render('pages/signup', {
                page: 'page-register page-sign page-dark',
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
                    page: 'page-register page-sign page-dark',
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
                    page: 'page-register page-sign page-dark',
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
            page: 'page-forgot-password'
        });
    });

    // send passwordConfirmationId to uses email
    app.post('/forgot-password', auth.middlewares.skipSignInUser, function (request, response, next) {
        if (!utils.isEmail(request.body.email)) {
            response.render('pages/forgot-password', {
                page: 'page-forgot-password',
                errorMessage: 'Invalid email'
            });
        } else {
            action.execute('requestToService', {
                service: 'account',
                method: 'POST',
                url: '/forgot-password',
                data: {
                    email: request.body.email
                }
            }).then(function (passwordConfirmationId) {
                response.render('pages/forgot-password', {
                    page: 'page-forgot-password',
                    successMessage: 'Please check your email'
                });

                let restorePasswordLynk = serviceUrl.hostAndProtocol + '/restore-password/' + passwordConfirmationId;

                action.execute('sendEmail', {
                    service: config.get('email:service'),
                    user: config.get('email:user'),
                    password: config.get('email:password'),

                    from: config.get('email:from'),
                    to: request.body.email,
                    subject: 'Galaxy password reset link',
                    text: 'You requested a password reset. Please visit this link to enter your new password: ' + restorePasswordLynk
                }).catch(function () {
                    log.error('Cannot send password confirmation Id');
                });
            }).catch(function (err) {
                response.render('pages/forgot-password', {
                    page: 'page-forgot-password',
                    errorMessage: err.message
                });
            });
        }
    });

    app.get('/restore-password/:passwordConfirmationId', function (request, response, next) {
        response.render('pages/restore-password', {
            page: 'page-forgot-password'
        });
    });

    app.post('/restore-password/:passwordConfirmationId', function (request, response, next) {
        if (!request.body.password) {
            response.render('pages/restore-password', {
                page: 'page-forgot-password',
                errorMessage: 'Password is empty'
            });
        } else {
            action.execute('requestToService', {
                service: 'account',
                method: 'POST',
                url: '/restore-password',
                data: {
                    passwordConfirmationId: request.params.passwordConfirmationId,
                    newPassword: request.body.password
                }
            }).then(function () {
                response.render('pages/restore-password', {
                    page: 'page-forgot-password',
                    successMessage: 'Well done! Password was changed'
                });
            }).catch(function (err) {
                response.render('pages/restore-password', {
                    page: 'page-forgot-password',
                    errorMessage: err.message
                });
            });
        }
    });

    // render signin page
    app.get('/signin?:continue', auth.middlewares.skipSignInUser, function (request, response, next) {
        response.render('pages/signin', {
            page: 'page-register page-sign page-dark'
        });
    });

    app.post('/signin?:continue', auth.middlewares.skipSignInUser, function (request, response, next) {
        if (!request.body.email || !request.body.password) {
            response.render('pages/signin', {
                page: 'page-register page-sign page-dark',
                errorMessage: 'Invalid credentials'
            });

            return;
        }

        auth.strategy('local-signin', function (err, user) {
            if (err) {
                response.render('pages/signin', {
                    page: 'page-register page-sign page-dark',
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