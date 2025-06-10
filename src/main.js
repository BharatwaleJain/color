import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
const app = createApp(App);
app.use(Toast, {
  transition: 'Vue-Toastification__bounce',
  maxToasts: 5,
  newestOnTop: true,
});
app.use(VueSweetalert2);
app.mount('#app');