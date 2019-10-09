import Vue from 'vue'
/* eslint-disable no-unused-vars */
import Framework7 from 'framework7'
import Framework7Vue from 'framework7-vue'
/* eslint-disable no-unused-vars */
/* import Framework7Theme from 'framework7/dist/css/framework7.ios.min.css'
import Framework7ThemeColors from 'framework7/dist/css/framework7.ios.colors.min.css' */
/* OR for Material Theme: */
import Framework7Theme from 'framework7/dist/css/framework7.material.min.css'
import Framework7ThemeColors from 'framework7/dist/css/framework7.material.colors.min.css'

// Import App Custom Styles
// import AppStyles from './css/app.css'

import moment from 'moment'

// Import Routes
import Routes from './routes.js'
import App from './App'

Vue.use(Framework7Vue)
// Registering components
Vue.component('right-panel', require('./components/rightpanel.vue'))
Vue.component('left-panel', require('./components/leftpanel.vue'))
Vue.component('pop-up', require('./components/popup.vue'))
Vue.component('login-screen', require('./components/loginscreen.vue'))
Vue.component('signup-screen', require('./components/signupscreen.vue'))
Vue.component('material-icon', require('./components/material-icon.vue'))

Vue.filter('formatDate', function (value) {
    if (value) {
        return moment(value).format('YYYY/MM/DD')
    }
})

/* eslint-disable no-new */
new Vue({
    el: '#app',
    template: '<app/>',
    framework7: {
        root: '#app',
        swipePanel: 'right',
        /* hideNavbarOnPageScroll: true,
        hideToolbarOnPageScroll: true,
        hideTabbarOnPageScroll: true,
        showBarsOnPageScrollEnd: true, */
        modalTitle: 'Annot.ai',
        material: true,
        routes: Routes
    },
    components: {
        app: App
    }
})

document.addEventListener('deviceready', onDeviceReady, false)
function onDeviceReady () {
    /* eslint-disable no-undef */
    window.open = cordova.InAppBrowser.open
}
