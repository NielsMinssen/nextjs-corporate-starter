'use strict';

/**
 * cpu service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::cpu.cpu');
