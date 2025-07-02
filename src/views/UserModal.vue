<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h2>{{ isEdit ? 'Edit User' : 'Add User' }}</h2>
      <form @submit.prevent="submitForm">
        <div class="form-row">
          <label for="name">Username</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Enter Unique Username"
            required
            maxlength="25"
            @input="onNameInput"
            @blur="form.name = form.name.trim()"
            autocomplete="username"
          />
        </div>
        <div class="form-row">
          <label for="email">Mail ID</label>
          <input
            id="email"
            v-model="form.username"
            type="email"
            placeholder="Enter Valid Mail ID"
            required
            maxlength="50"
            autocomplete="email"
          />
        </div>
        <div class="form-row">
          <label for="password">
            Password
            <span
              ref="passwordHelp"
              class="help-tooltip"
              tabindex="0"
              aria-label="Password requirements"
              role="tooltip"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <circle cx="12" cy="8" r="1" />
              </svg>
            </span>
          </label>
          <div class="input-with-icon">
            <input
              id="password"
              v-model="form.password"
              :disabled="isEdit"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter Strong Password"
              required
              @input="validatePassword"
              maxlength="100"
              autocomplete="password"
            />
            <span
              v-if="!isEdit"
              @click="togglePasswordVisibility"
              class="view-password-icon"
              tabindex="0"
              aria-label="Toggle password visibility"
            >
              <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </span>
          </div>
        </div>
        <div class="permissions-section">
          <div class="permissions-label">Permissions</div>
          <div class="perm-list">
            <label v-for="perm in permissionOptions" :key="perm" class="permission-item">
              <input type="checkbox" :value="perm" v-model="form.permission" />
              <span class="permission-text">{{ perm.charAt(0).toUpperCase() + perm.slice(1) }}</span>
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button type="submit" class="btn-primary">{{ isEdit ? 'Save Changes' : 'Create User' }}</button>
          <button type="button" @click="close" class="btn-secondary">Cancel</button>
        </div>
        <div v-if="error" class="modal-error">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted, onUpdated, onUnmounted, nextTick } from 'vue'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

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
const passwordHelp = ref(null)
const showPassword = ref(false)
let tippyInstance = null

function onNameInput(e) {
  form.name = e.target.value
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '');
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

function setupTippy() {
  if (tippyInstance) tippyInstance.destroy()
  if (passwordHelp.value) {
    tippyInstance = tippy(passwordHelp.value, {
      content: 'Password must contain lowercase, uppercase, number, symbol, min length 8',
      placement: 'right',
      theme: 'light-border'
    })
  }
}

onMounted(setupTippy)
onUpdated(setupTippy)
onUnmounted(() => {
  if (tippyInstance) tippyInstance.destroy()
})

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
      nextTick(setupTippy)
    }
  },
  { immediate: true }
)

function isStrongPassword(pw) {
  return (
    pw.length >= 8 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /\d/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  );
}

function validatePassword() {
  if (!props.isEdit && form.password && !isStrongPassword(form.password)) {
    error.value = 'Password must be at least 8 characters and include lowercase, uppercase, number, and symbol';
  } else {
    error.value = '';
  }
}

function submitForm() {
  error.value = '';

  // Username max 25 chars
  if (!form.name || form.name.length > 25) {
    error.value = 'Username is required and must be at most 25 characters';
    return;
  }
  if (!/^[a-z0-9]+$/.test(form.name)) {
    error.value = 'Username can only contain lowercase letters and numbers, no spaces or special characters';
    return;
  }


  // Must be a valid email
  if (!form.username || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.username)) {
    error.value = 'Username must be a valid email';
    return;
  }

  // Password validation (if not editing)
  if (!props.isEdit) {
    if (!form.password) {
      error.value = 'Password is required';
      return;
    }
    if (!isStrongPassword(form.password)) {
      error.value = 'Password must be at least 8 characters and include lowercase, uppercase, number and symbol';
      return;
    }
  }

  emit('save', { ...form });
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
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: #fff;
  border-radius: 20px;
  padding: 1.6rem 3.2rem;
  max-width: fit-content;
  width: 90vw;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  justify-content: center;
}

.modal-content::-webkit-scrollbar {
  display: none;
}

.modal-content h2 {
  margin: 0 0 1.2rem 0;
  color: #1a202c;
  font-size: 1.75rem;
  font-weight: 600;
  text-align: center;
}

.form-row {
  display: flex;
  align-content: end;
  align-items: end;
  margin-bottom: 1rem;
  width: 100%;
}

.form-row label {
  width: 150px;
  padding: 0.875rem 0rem;
  text-align: left;
  font-weight: 500;
  color: #4a5568;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.form-row input[type="text"],
.form-row input[type="email"],
.form-row input[type="password"] {
  width: 500px;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #fafafa;
}

.form-row input[type="text"]:focus,
.form-row input[type="email"]:focus,
.form-row input[type="password"]:focus {
  outline: none;
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-row input:disabled {
  background: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
}

.input-with-icon {
  display: flex;
  align-items: center;
  max-width: 500px;
  position: relative;
}

.view-password-icon {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  color: #667eea;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  z-index: 1;
}

.view-password-icon:hover {
  opacity: 1;
}

.help-tooltip {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  color: #667eea;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  vertical-align: middle;
}

.help-tooltip:hover {
  opacity: 1;
}

.permissions-section {
  margin-bottom: 1.8em;
  padding: 1rem 2rem;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.permissions-label {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.perm-list {
  display: flex;
  gap: 4rem;
  flex-wrap: nowrap;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.permission-item:hover {
  background: rgba(102, 126, 234, 0.05);
}

.permission-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
  cursor: pointer;
}

.permission-text {
  color: #4a5568;
  font-weight: 500;
  font-size: 0.95rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.2rem;
}

.btn-primary {
  padding: 0.875rem 2rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  padding: 0.875rem 2rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  background: #fff;
  color: #4a5568;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.modal-error {
  margin: auto;
  margin-top: 1.2rem;
  text-wrap: wrap;
  padding: 0.5rem;
  max-width: 600px;
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 12px;
  color: #c53030;
  font-weight: 500;
  text-align: center;
}
</style>