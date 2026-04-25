import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import KidsView from '../views/KidsView.vue'
import FoodView from '../views/FoodView.vue'
import CafeView from '../views/CafeView.vue'
import HealthView from '../views/HealthView.vue'
import BoardView from '../views/BoardView.vue'
import AboutView from '../views/AboutView.vue'
import PrivacyView from '../views/PrivacyView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/kids', name: 'Kids', component: KidsView },
  { path: '/food', name: 'Food', component: FoodView },
  { path: '/cafe', name: 'Cafe', component: CafeView },
  { path: '/health', name: 'Health', component: HealthView },
  { path: '/board', name: 'Board', component: BoardView },
  { path: '/about', name: 'About', component: AboutView },
  { path: '/privacy', name: 'Privacy', component: PrivacyView }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
