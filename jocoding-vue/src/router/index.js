import { createRouter, createWebHistory } from 'vue-router'
import KidsView from '../views/KidsView.vue'
import FoodView from '../views/FoodView.vue'

const routes = [
  {
    path: '/',
    name: 'Kids',
    component: KidsView
  },
  {
    path: '/food',
    name: 'Food',
    component: FoodView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
