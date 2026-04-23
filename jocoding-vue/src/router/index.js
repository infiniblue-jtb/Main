import { createRouter, createWebHashHistory } from 'vue-router'
import KidsView from '../views/KidsView.vue'
import FoodView from '../views/FoodView.vue'
import CafeView from '../views/CafeView.vue'
import BoardView from '../views/BoardView.vue'

const routes = [
  { path: '/', name: 'Kids', component: KidsView },
  { path: '/food', name: 'Food', component: FoodView },
  { path: '/cafe', name: 'Cafe', component: CafeView },
  { path: '/board', name: 'Board', component: BoardView }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
