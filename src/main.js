import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import router from './router';
import { createPinia } from 'pinia';
const app = createApp(App);
app.use(Toast, {
  transition: 'Vue-Toastification__bounce',
  maxToasts: 3,
  newestOnTop: true,
});
app.use(VueSweetalert2);
app.use(router);
app.use(createPinia());
app.mount('#app');