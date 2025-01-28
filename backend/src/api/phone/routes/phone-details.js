module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/phones/details',
            handler: 'phone.getPhoneDetails',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
            },
        },
    ],
};