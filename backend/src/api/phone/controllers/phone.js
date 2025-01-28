'use strict';

/**
 * phone controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::phone.phone', ({ strapi }) => ({
    ...createCoreController('api::phone.phone'),

    async getPhoneDetails(ctx) {
        try {
            const { query } = ctx;
            const { fields, filters, sort, pagination } = query;

            // Fetch data from Strapi
            let entries = await strapi.entityService.findMany('api::phone.phone', {
                populate: ['phone'],
            });


            // Split fields into an array and extract nested values
            const fieldsList = fields?.split(',');

            const getNestedValue = (obj, path) => {
                return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
            };

            const processedEntries = entries.map(entry => {
                const result = {};
                fieldsList?.forEach(field => {
                    const value = getNestedValue(entry.phone, field);
                    if (value !== undefined) {
                        result[field] = value;
                    }
                });
                return result;
            });

            // Apply filters
            let filteredEntries = processedEntries;
            if (!fields) {
                // Apply filters even when no fields are specified
                if (filters) {
                    Object.keys(filters).forEach(key => {
                        const filter = filters[key];
                        entries = entries.filter(entry => {
                            const fieldValue = entry.phone[key];
                            if (typeof filter === 'object') {
                                const operator = Object.keys(filter)[0];
                                const value = filter[operator];
                                switch (operator) {
                                    case '$gt':
                                        return fieldValue > value;
                                    case '$lt':
                                        return fieldValue < value;
                                    case '$gte':
                                        return fieldValue >= value;
                                    case '$lte':
                                        return fieldValue <= value;
                                    case '$eq':
                                        return fieldValue === value;
                                    default:
                                        return true;
                                }
                            }
                            return fieldValue === filter;
                        });
                    });
                }
                return { data: entries }; // Return filtered entries
            }


            // Apply sorting
            if (sort) {
                const [field, order] = sort.split(':');
                filteredEntries.sort((a, b) => {
                    const valueA = getNestedValue(a, field);
                    const valueB = getNestedValue(b, field);
                    if (order === 'desc') {
                        return valueB - valueA;
                    }
                    return valueA - valueB;
                });
            }

            // Apply pagination
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
                        total: processedEntries.length,
                    },
                },
            };

        } catch (error) {
            ctx.throw(500, error);
        }
    },
}));
