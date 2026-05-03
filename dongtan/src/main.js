import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import AdComponent from './components/AdComponent.vue'

const app = createApp(App)
app.component('AdComponent', AdComponent)
app.use(router)
app.mount('#app')
