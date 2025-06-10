<template>
  <div class="app">
    <div v-if="!isLoggedIn" class="login-form">
      <h2>Login</h2>
      <input v-model="username" type="text" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="login">Login</button>
    </div>
    <div v-else class="color-buttons">
      <div class="logout-container">
        <button class="logout-button" @click="confirmLogout">Logout</button>
      </div>
      <ColorButton
        v-for="(color, index) in colors"
        :key="index"
        :color="color"
        @change-color="setBackgroundColor"
      >
        Change to {{ color }}
      </ColorButton>
    </div>
  </div>
</template>

<script>
import ColorButton from './components/ColorButton.vue';
import { useToast } from 'vue-toastification';
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
export default {
  name: 'App',
  components: {
    ColorButton,
  },
  data() {
    return {
      username: '',
      password: '',
      isLoggedIn: false,
      backgroundColor: 'Black',
      colors: ['Black', 'Red', 'Blue', 'Green', 'Purple', 'Orange', 'White'],
    };
  },
  methods: {
    async login() {
      try {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
        const response = await fetch(`${apiBase}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        });
        const data = await response.json();
        if (data.success) {
          toast.success(data.message || 'Login successful!', toastOptions);
          this.isLoggedIn = true;
        } else {
          toast.error(data.message || 'Login failed. Please try again.', toastOptions);
        }
      } catch (error) {
        console.error(error);
        toast.error(`Error connecting to server.`, toastOptions);
      }
    },
    setBackgroundColor(color) {
      document.body.style.backgroundColor = color;
      toast(`Switching background to ${color}`, toastOptions);
    },
    confirmLogout() {
      this.$swal({
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
          this.logout();
        } else if (result.dismiss === this.$swal.DismissReason.cancel) {
          toast.error('Logout cancelled.', toastOptions);
        }
      });
    },
    async logout() {
      try {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
        const response = await fetch(`${apiBase}/api/logout`, {
          method: 'POST',
        });
        const data = await response.json();
        if (data.success) {
          toast.success(data.message || 'Logged out successfully!', toastOptions);
          this.isLoggedIn = false;
          this.username = '';
          this.password = '';
          document.body.style.backgroundColor = 'Black';
        } else {
          toast.error(data.message || 'Logout failed. Please try again.', toastOptions);
        }
      } catch (error) {
        console.error(error);
        toast.error('Error connecting to server.', toastOptions);
      }
    },
  },
};
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
.color-buttons {
  display: flex;
  flex-direction: column;
  gap: .6rem;
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
}
.logout-button:hover {
  background-color: #c0392b;
}
</style>