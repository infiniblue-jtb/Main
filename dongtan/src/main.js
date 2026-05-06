// v1.0.3 - Static Rendering Fix
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
