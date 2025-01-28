'use strict';

/**
 * gpu controller
 */
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::gpu.gpu', ({ strapi }) => ({
    // Spread the default controller actions
    ...createCoreController('api::gpu.gpu'),

    // Add our custom action
    async getGpuDetails(ctx) {
        try {
            const { query } = ctx;
            const { fields, filters, sort, pagination } = query;

            // Get base query
            let entries = await strapi.entityService.findMany('api::gpu.gpu', {
                populate: ['GPU'],
            });

            // If no fields specified, return all data
            if (!fields) return { data: entries };

            const fieldsList = fields.split(',');

            // Process each entry to extract specified fields
            const processedEntries = entries.map(entry => {
                const result = {};
                fieldsList.forEach(field => {
                    if (entry.GPU && entry.GPU.hasOwnProperty(field)) {
                        result[field] = entry.GPU[field];
                    }
                });
                return result;
            });

            // Apply filters if any
            let filteredEntries = processedEntries;
            if (filters) {
                Object.keys(filters).forEach(key => {
                    const filter = filters[key];
                    filteredEntries = filteredEntries.filter(entry => {
                        if (typeof filter === 'object') {
                            // Handle operators like gt, lt, etc.
                            const operator = Object.keys(filter)[0];
                            const value = filter[operator];
                            switch (operator) {
                                case '$gt':
                                    return entry[key] > value;
                                case '$lt':
                                    return entry[key] < value;
                                case '$gte':
                                    return entry[key] >= value;
                                case '$lte':
                                    return entry[key] <= value;
                                case '$eq':
                                    return entry[key] === value;
                                default:
                                    return true;
                            }
                        }
                        return entry[key] === filter;
                    });
                });
            }

            // Apply sorting if specified
            if (sort) {
                const [field, order] = sort.split(':');
                filteredEntries.sort((a, b) => {
                    if (order === 'desc') {
                        return b[field] - a[field];
                    }
                    return a[field] - b[field];
                });
            }

            // Apply pagination if specified
            if (pagination) {
                const { page = 1, pageSize = 25 } = pagination;
                const start = (page - 1) * pageSize;
                const end = start + pageSize;
                filteredEntries = filteredEntries.slice(start, end);
            }

            return {
                data: filteredEntries,
                meta: {
                    pagination: {
                        page: pagination?.page || 1,
                        pageSize: pagination?.pageSize || 25,
                        total: processedEntries.length
                    }
                }
            };

        } catch (error) {
            ctx.throw(500, error);
        }
    },
}));