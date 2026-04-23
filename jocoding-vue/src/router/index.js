import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import KidsView from '../views/KidsView.vue'
import FoodView from '../views/FoodView.vue'
import CafeView from '../views/CafeView.vue'
import BoardView from '../views/BoardView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/kids', name: 'Kids', component: KidsView },
  { path: '/food', name: 'Food', component: FoodView },
  { path: '/cafe', name: 'Cafe', component: CafeView },
  { path: '/board', name: 'Board', component: BoardView }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
