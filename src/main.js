import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import App from './App.vue'
import router from './router.js'

const vuetify = createVuetify({})

createApp(App).use(vuetify).use(router).mount('#app')
