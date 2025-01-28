module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/cpus/details',
            handler: 'cpu.getCpuDetails',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
            },
        },
    ],
};