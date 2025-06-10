import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import Color from './views/Color.vue';
const routes = [
  { path: '/', component: Dashboard},
  { path: '/dashboard', component: Dashboard },
  { path: '/color', component: Color }
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;