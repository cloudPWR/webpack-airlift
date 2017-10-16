import Vue from 'vue'

import '../node_modules/jquery/dist/jquery'
import '../static/airliftapi'
import '../static/airlift'

// Fontawesome 5 Pro SVG Framework
import '../static/everything'

import router from './router'
import store from './store'

airliftapi.account_id = $config.airlift.account_id

import App from './App.vue'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
