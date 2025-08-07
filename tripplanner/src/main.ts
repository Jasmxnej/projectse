import './assets/main.css'
import './assets/tailwind.css'
import './assets/editable-item.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'


import App from './App.vue'
import router from './router'
import { checkAPIConnection } from './api'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

checkAPIConnection()
