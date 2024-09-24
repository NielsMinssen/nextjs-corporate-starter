'use strict';

/**
 * gpu controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::gpu.gpu');
