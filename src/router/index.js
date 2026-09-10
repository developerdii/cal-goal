import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/week', name: 'week', component: () => import('@/views/WeekView.vue') },
  { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
  { path: '/foods', name: 'foods', component: () => import('@/views/FoodsView.vue') },
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
  { path: '/signup', name: 'signup', component: () => import('@/views/SignupView.vue') },
  { path: '/forgot-password', name: 'forgot-password', component: () => import('@/views/ForgotPasswordView.vue') },
  { path: '/reset-password', name: 'reset-password', component: () => import('@/views/ResetPasswordView.vue') },
]

// Hash history is used so deep links (e.g. /week) work on static hosting like
// GitHub Pages, which has no server-side SPA fallback.
export default createRouter({
  history: createWebHashHistory(),
  routes,
})
