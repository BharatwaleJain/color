<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h2 style="color: black; font-weight: bold;">{{ isEdit ? 'Edit User' : 'Add User' }}</h2>
      <form @submit.prevent="submitForm">
        <label>
          Email
          <input
            v-model="form.username"
            :disabled="isEdit"
            type="email"
            placeholder="Email"
            required
          />
        </label>
        <label>
          Name
          <input v-model="form.name" type="text" placeholder="Name" required />
        </label>
        <label>
          Password
          <input
            v-model="form.password"
            :disabled="isEdit"
            type="password"
            placeholder="Password"
            required
          />
        </label>
        <div>
          <div style="font-weight:600; margin-bottom: 0.5rem;">Permissions:</div>
          <div class="perm-list">
            <label v-for="perm in permissionOptions" :key="perm">
              <input
                type="checkbox"
                :value="perm"
                v-model="form.permission"
              />
              {{ perm.charAt(0).toUpperCase() + perm.slice(1) }}
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button type="submit">{{ isEdit ? 'Save' : 'Add' }}</button>
          <button type="button" @click="close">Cancel</button>
        </div>
        <div v-if="error" class="modal-error">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'

const props = defineProps({
  visible: Boolean,
  isEdit: Boolean,
  user: Object,
  permissionOptions: Array
})
const emit = defineEmits(['close', 'save'])

const form = reactive({
  username: '',
  name: '',
  password: '',
  permission: []
})
const error = ref('')

watch(
  () => props.visible,
  (v) => {
    if (v) {
      if (props.isEdit && props.user) {
        form.username = props.user.username
        form.name = props.user.name
        form.password = 'password'
        form.permission = [...(props.user.permission || [])]
      } else {
        form.username = ''
        form.name = ''
        form.password = ''
        form.permission = []
      }
      error.value = ''
    }
  },
  { immediate: true }
)

function submitForm() {
  error.value = ''
  if (!form.username || !form.name || !form.password) {
    error.value = 'All fields are required'
    return
  }
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.username)) {
    error.value = 'Invalid email'
    return
  }
  emit('save', { ...form })
}

function close() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  color: #888;
  background: #fff;
  border-radius: 16px;
  padding: 2rem 2.5rem;
  min-width: 320px;
  box-shadow: 0 10px 32px rgba(0,0,0,0.12);
  position: relative;
}
.modal-content h2 {
  margin-bottom: 1.5rem;
}
.modal-content label {
  display: block;
  margin-bottom: 1rem;
  font-weight: 500;
}
.modal-content input[type="text"],
.modal-content input[type="email"],
.modal-content input[type="password"] {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.25rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
}
.perm-list {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}
.modal-actions button {
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  transition: background 0.2s;
}
.modal-actions button[type="button"] {
  background: #e2e8f0;
  color: #2d3748;
}
.modal-error {
  margin-top: 1rem;
  color: #e53e3e;
  font-weight: 500;
}
</style>