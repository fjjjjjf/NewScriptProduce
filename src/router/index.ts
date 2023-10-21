import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/lookgame',
      name: 'lookgame',
      component: () => import("@/views/GameScript.vue"),
    },
    {
      path: '/newScript',
      name: 'newScript',
      component: () => import("@/views/CreateNewScript.vue"),
    },
    {
      path: '/game',
      name: 'game',
      component: () => import("@/views/Game.vue"),
    }
  ]
})

export default router

