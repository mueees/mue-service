'use strict';

let config = require('../../config');
let env = require('mue-core/modules/environment');

let host = env.isDevelopment() ? config.get('network:hostName') + ':' + config.get('network:port') : config.get('network:hostName');
let protocol = 'http://';

exports.host = host;
exports.hostAndProtocol = protocol + host;