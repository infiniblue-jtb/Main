// v1.0.5 - Final Deployment Trigger
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import AdComponent from './components/AdComponent.vue'

const app = createApp(App)
app.component('AdComponent', AdComponent)
app.use(router)
app.mount('#app')

// For pre-rendering
router.isReady().then(() => {
  document.dispatchEvent(new Event('render-event'))
})
