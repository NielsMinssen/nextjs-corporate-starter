'use strict';

/**
 * gpu router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::gpu.gpu');
