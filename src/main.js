import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import App from './App.vue'
import router from './router.js'
import SvgIcon from './components/SvgIcon.vue'

const vuetify = createVuetify({})

createApp(App).use(vuetify).use(router).component('SvgIcon', SvgIcon).mount('#app')
