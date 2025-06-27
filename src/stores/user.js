import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useUserStore = defineStore('user', () => {
  const isAdmin = ref(false);
  const permissions = ref([]);
  return {
    isAdmin,
    permissions,
  };
});