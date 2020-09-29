'use strict';

const config = require('../../config');

module.exports = require('../../libs/db_client/redis')(config.redis.endPoint);
