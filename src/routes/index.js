'use strict';

let error = require('mue-core/modules/error');

module.exports = function (app) {
    app.get('/signup?:continue', function (request, response, next) {
        response.render('pages/signup', {

        });
    });

    app.post('/signup', function (request, response, next) {

    });

    app.get('/signin', function (request, response, next) {
        var session = request.session;

        if (session.views) {
            session.views += 1;
        } else {
            session.views = 1;
        }

        response.render('layout', {
            views: session.views
        });
    });

    app.post('/signin?:continue', function (request, response, next) {

    });

    /*OAUTH 2*/
    app.get('/oauth2/auth?:redirect_uri:client_id', function (request, response, next) {

    });

    app.post('/oauth2/token', function (request, response, next) {

    });
};