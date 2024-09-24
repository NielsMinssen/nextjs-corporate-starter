'use strict';

/**
 * gpu service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::gpu.gpu');
