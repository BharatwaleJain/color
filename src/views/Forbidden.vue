<template>
  <div class="forbidden">
    <h1>403 Forbidden</h1>
    <p>You do not have permission to access this page.</p>
    <router-link to="/" class="white-button">Returning in {{ countdown }} seconds...</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const countdown = ref(5);
onMounted(() => {
  const interval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(interval);
    }
  }, 1000);
  setTimeout(() => {
    window.location.href = '/';
  }, 5000);
});
</script>

<style scoped>
.forbidden {
  text-align: center;
}

h1 {
  color: #fff;
}

.white-button {
  display: inline-flex;
  margin-top: 1rem;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #f3f3f3, #a1a1a1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.10), 0 1.5px 4px rgba(0, 0, 0, 0.08);
  color: #474747;
  border: none;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  font-size: 1rem;
}

.white-button:hover {
  background: linear-gradient(135deg, #a1a1a1, #f3f3f3);
  color: #000;
}
</style>