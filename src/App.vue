<template>
  <div class="app">
    <div v-if="!isLoggedIn" class="login-form">
      <h2>Login</h2>
      <input v-model="username" type="text" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="login">Login</button>
    </div>
    <div v-else class="router-container">
      <!-- <div class="logout-container">
        <button class="logout-button" @click="confirmLogout">Logout</button>
      </div> -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
const router = useRouter();
const toast = useToast();
const toastOptions = {
  position: 'top-right',
  timeout: 3000,
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
const username = ref('');
const password = ref('');
const isLoggedIn = ref(false);
onMounted(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    isLoggedIn.value = false;
    router.push('/');
    return;
  }
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
  fetch(`${apiBase}/api/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        toast.success('Session Authenticated!', toastOptions);
        isLoggedIn.value = true;
      } else {
        toast.error('Session Expired!', toastOptions);
        localStorage.removeItem('token');
        router.push('/');
      }
    })
    .catch(() => {
      toast.error('Error Verifying Session', toastOptions);
    });
});
async function login() {
  try {
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    const response = await fetch(`${apiBase}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });
    const data = await response.json();
    console.log(`User ${username.value} attempted to login.`);
    if (data.success) {
      toast.success(data.message || 'Login Successful!', toastOptions);
      isLoggedIn.value = true;
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } else {
      toast.error(data.message || 'Login Failed, Please Try Again!', toastOptions);
    }
  } catch (error) {
    console.error(error);
    toast.error(`Error Connecting to Server.`, toastOptions);
  }
}
function confirmLogout() {
  Swal.fire({
    title: '',
    text: 'Are you sure you want to logout?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, logout',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
    confirmButtonColor: '#41b882',
    cancelButtonColor: '#ff7674',
  }).then((result) => {
    if (result.isConfirmed) {
      logout();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      toast.error('Logout cancelled.', toastOptions);
    }
  });
}
async function logout() {
  try {
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    const response = await fetch(`${apiBase}/api/logout`, {
      method: 'POST',
    });
    const data = await response.json();
    if (data.success) {
      toast.success(data.message || 'Logged Out Successfully!', toastOptions);
      isLoggedIn.value = false;
      username.value = '';
      password.value = '';
      document.body.style.backgroundColor = 'Black';
      localStorage.removeItem('token');
      router.push('/');
    } else {
      toast.error(data.message || 'Logout Failed, Please Try Again!', toastOptions);
    }
  } catch (error) {
    console.error(error);
    toast.error('Error connecting to server.', toastOptions);
  }
}
</script>

<style scoped>
.app {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 2rem;
}
.login-form {
  display: flex;
  flex-direction: column;
  width: 320px;
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
.login-form h2 {
  margin-bottom: 1rem;
  text-align: center;
  color: #333;
}
.login-form input {
  margin: 10px 0;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.login-form input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 8px rgba(74, 144, 226, 0.2);
}
.login-form button {
  margin-top: 1rem;
  padding: 12px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.login-form button:hover {
  background-color: #357abd;
}
.router-container {
  height: 100vh;
  padding: 1rem;
  justify-content: center;
}
.logout-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}
.logout-button {
  padding: 8px 16px;
  background-color: #e74c3c;
  border: none;
  color: white;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 1rem;
}
.logout-button:hover {
  background-color: #c0392b;
}
</style>