<template>
  <div class="app">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>
    <div v-else-if="!isLoggedIn" class="login-container">
      <div class="login-form">
        <div class="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>
        <div class="form-group">
          <div class="input-container">
            <input v-model="username" type="text" placeholder="Username" class="form-input" required />
            <div class="input-line"></div>
          </div>

          <div class="input-container">
            <input v-model="password" type="password" placeholder="Password" class="form-input" required />
            <div class="input-line"></div>
          </div>
        </div>
        <button @click="login" class="login-btn">
          <span>Sign In</span>
          <div class="btn-ripple"></div>
        </button>
      </div>
    </div>
    <div v-else class="router-container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
const userStore = useUserStore();
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
const router = useRouter();
const toast = useToast();
const toastOptions = {
  position: 'top-right',
  timeout: 2000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: "button",
  icon: true,
  rtl: false,
};
const loading = ref(false);
const username = ref('');
const password = ref('');
const isLoggedIn = ref(false);
const isAdmin = ref(false);
onMounted(() => {
  loading.value = true;
  const token = localStorage.getItem('token');
  if (!token) {
    loading.value = false;
    isLoggedIn.value = false;
    router.push('/');
    return;
  }
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
  fetch(`${apiBase}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        isLoggedIn.value = true;
        isAdmin.value = data.admin || false;
        loading.value = false;
        userStore.isAdmin = data.admin || false;
        userStore.permissions = data.permission || [];
        toast.success(data.message, toastOptions);
      } else {
        loading.value = false;
        toast.error(data.message, toastOptions);
        localStorage.removeItem('token');
        router.push('/');
      }
    })
    .catch(() => {
      loading.value = false;
      toast.error('Error Verifying Session', toastOptions);
    });
});
async function login() {
  try {
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    const response = await fetch(`${apiBase}/login2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: username.value,
        password: password.value,
      }),
    });
    const data = await response.json();
    console.log(`User ${username.value} attempted to login.`);
    if (data.success) {
      toast.success(data.message, toastOptions);
      isLoggedIn.value = true;
      isAdmin.value = data.admin || false;
      userStore.isAdmin = data.admin || false;
      userStore.permissions = data.permission || [];
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } else {
      toast.error(data.message, toastOptions);
    }
  } catch (error) {
    console.log(error);
    toast.error('Error Connecting to Server', toastOptions);
  }
}
</script>

<style scoped>
.app {
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

.app::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: white;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.login-container {
  animation: fadeInUp 0.8s ease-out;
  width: 80%;
  max-width: 500px;
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 3rem 2.5rem;
  border-radius: 24px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.login-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  animation: shimmer 2s infinite;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-circle {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
  animation: pulse 2s infinite;
}

.login-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.login-header p {
  color: #718096;
  font-size: 0.9rem;
  margin: 0;
}

.form-group {
  margin-bottom: 2rem;
}

.input-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.form-input {
  width: 100%;
  padding: 1rem 0 1rem 0;
  font-size: 1rem;
  border: none;
  border-bottom: 2px solid #e2e8f0;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #2d3748;
}

.form-input:focus {
  outline: none;
  border-bottom-color: #667eea;
}

.form-input::placeholder {
  color: #a0aec0;
  transition: all 0.3s ease;
}

.form-input:focus::placeholder {
  transform: translateY(-2px);
  font-size: 0.85rem;
  color: #667eea;
}

.input-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-input:focus+.input-line {
  width: 100%;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.login-btn span {
  position: relative;
  z-index: 2;
}

.btn-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.login-btn:active .btn-ripple {
  width: 300px;
  height: 300px;
}

.router-container {
  padding: 1rem;
  justify-content: center;
  flex-direction: column;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 40px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

@media (max-width: 768px) {
  .login-form {
    padding: 2rem 1.5rem;
    width: 95%;
    max-width: none;
  }

  .login-header h2 {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .login-form {
    padding: 2rem 1.25rem;
    width: 95%;
  }

  .login-header h2 {
    font-size: 1.5rem;
  }
}
</style>