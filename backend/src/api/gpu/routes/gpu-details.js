module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/gpus/details',
            handler: 'gpu.getGpuDetails',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
            },
        },
    ],
};