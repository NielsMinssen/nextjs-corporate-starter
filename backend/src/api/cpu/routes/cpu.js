'use strict';

/**
 * cpu router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::cpu.cpu');
