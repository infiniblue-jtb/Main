import { createRouter, createWebHashHistory } from 'vue-router'
import KidsView from '../views/KidsView.vue'
import FoodView from '../views/FoodView.vue'

const routes = [
  { path: '/', name: 'Kids', component: KidsView },
  { path: '/food', name: 'Food', component: FoodView }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
