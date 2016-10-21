'use strict';

let config = require('../../config');

module.exports = function (request, response, next) {
    if(request.isAuthenticated()){
        response.redirect(config.get('config:urls:redirectAfterSignUp'));
    }else{
        next();
    }
};