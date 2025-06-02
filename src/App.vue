<template>
  <div class="app">
    <div v-if="!isLoggedIn" class="login-form">
      <h2>Login</h2>
      <input v-model="username" type="text" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="login">Login</button>
    </div>
    <div v-else class="color-buttons">
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
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
      colors: ['Black', 'Red', 'Blue', 'Green', 'Purple', 'Orange', 'White'],
    };
  },
  methods: {
    async login() {
      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('username', '==', this.username),
          where('password', '==', this.password)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          alert('Login successful!');
          this.isLoggedIn = true;
        } else {
          alert('Incorrect username or password.');
        }
      } catch (error) {
        console.error(error);
        alert('Error connecting to Firebase.');
      }
    },
    setBackgroundColor(color) {
      document.body.style.backgroundColor = color;
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
  gap: 1rem;
}
</style>