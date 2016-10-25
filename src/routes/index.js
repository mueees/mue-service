'use strict';

let action = require('mue-core/modules/action');
require('mue-core/modules/actions/send-email');

let log = require('mue-core/modules/log')(module);
let error = require('mue-core/modules/error');
let env = require('mue-core/modules/environment');
let config = require('../config');
let auth = require('../auth');

module.exports = function (app) {
    // render signup page
    app.get('/signup', auth.middlewares.skipSignInUser, function (request, response, next) {
        response.render('pages/signup', {});
    });

    app.post('/signup', auth.middlewares.skipSignInUser, function (request, response, next) {
        auth.strategy('local-signup', function (err, user) {
            let viewData = {};

            if (err) {
                viewData.errorMessage = err.message;
            } else {
                viewData.successMessage = 'Well done! Confirm your email to complete your registration';
            }

            response.render('pages/signup', viewData);

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
        })(request, response, next);
    });

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

    // render signin page
    app.get('/signin?:continue', auth.middlewares.skipSignInUser, function (request, response, next) {
        response.render('pages/signin');
    });

    app.post('/signin?:continue', auth.middlewares.skipSignInUser, function (request, response, next) {
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