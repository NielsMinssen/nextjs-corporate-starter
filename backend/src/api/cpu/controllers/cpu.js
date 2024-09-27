'use strict';

/**
 * cpu controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::cpu.cpu');
