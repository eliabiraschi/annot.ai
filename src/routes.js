export default [
    {
        path: '/about/',
        component: require('./views/About.vue')
    },
    {
        path: '/',
        component: require('./views/Home.vue')
    },
    {
        path: '/home/:filter',
        component: require('./views/Home.vue')
    },
    {
        path: '/editor/',
        component: require('./views/Editor.vue')
    },
    {
        path: '/account/',
        component: require('./views/Account.vue')
    }
]
