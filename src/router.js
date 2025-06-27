import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import Admin from './views/Admin.vue';
import Color from './views/Color.vue';
import Forbidden from './views/Forbidden.vue';
const routes = [
  { path: '/', component: Dashboard, name: 'dashboard' },
  { path: '/dashboard', component: Dashboard, name: 'dashboard' },
  { path: '/admin', component: Admin, name: 'admin' },
  { path: '/color', component: Color, name: 'color' },
  { path: '/forbidden', component: Forbidden, name: 'forbidden' }
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('token') !== null;
  if (to.path === '/color' || to.path === '/forbidden') {
    next();
    return;
  }
  if (to.path === '/') {
    if (isLoggedIn) {
      next('/dashboard');
      return;
    } else {
      next();
      return;
    }
  }
  if (to.path === '/admin') {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
      next();
    } else {
      next('/forbidden');
    }
    return;
  }
  if (to.path.startsWith('/dashboard')) {
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const url = new URL(window.location.origin + to.fullPath);
    const category = url.searchParams.get('category');
    if (!category || permissions.includes(category)) {
      next();
    } else {
      next('/forbidden');
    }
    return;
  }
  next();
});
router.beforeEach((to, from, next) => {
  if (to.path === '/color' || to.path === '/forbidden' || to.path === '/') {
    next();
    return;
  }
  if (to.path === '/admin') {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
      next();
    } else {
      next('/forbidden');
    }
    return;
  }
  if (to.path.startsWith('/dashboard')) {
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const url = new URL(window.location.origin + to.fullPath);
    const category = url.searchParams.get('category');
    if (!category || permissions.includes(category)) {
      next();
    } else {
      next('/forbidden');
    }
    return;
  }
  next();
});
export default router;