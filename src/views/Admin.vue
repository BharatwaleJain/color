<template>
    <div class="app">
        <nav class="navbar">
            <div class="nav-brand" style="cursor:pointer" @click="redirectToDashboard">
                <div class="brand-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"
                            stroke-linejoin="round" />
                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                    </svg>
                </div>
            </div>
            <div class="nav-tabs">
                <button v-for="cat in categories" :key="cat" :class="['nav-tab', { active: activeCategory === cat }]"
                    @click="goToDashboardWithCategory(cat)">
                    <span>{{ cat.charAt(0).toUpperCase() + cat.slice(1) }}</span>
                </button>
            </div>
            <div class="nav-tabs">
                <button class="nav-tab active">
                    <span>Admin</span>
                </button>
            </div>
            <div class="nav-actions">
                <button @click="openAddModal" class="add-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Add User</span>
                </button>
                <button @click="confirmLogout" class="logout-button">
                    <svg width="16" height="16" viewBox="0 -2 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>
        </nav>
        <main class="main-content">
            <div class="list-section">
                <div class="section-header">
                    <input v-model="filterUser" class="filter-input" placeholder="Search by Name or Mail ID..." />
                    <span>Total {{ filteredUsers.length }} Users</span>
                </div>
                <div v-if="filteredUsers.length === 0" class="empty-state">
                    <div class="empty-icon">👤</div>
                    <h3>No users found</h3>
                    <p>Add your first user to get started</p>
                    <button @click="openAddModal" class="empty-add-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add First User
                    </button>
                </div>
                <div v-else class="items-container">
                    <div class="list-top">
                        <div class="item-content">
                            <span class="row-no">No</span>
                            <div class="item-indicator"></div>
                            <span class="item-title">Full Name</span>
                            <span class="item-mail">Mail ID</span>
                            <span>
                                Category Access
                            </span>
                        </div>
                    </div>
                    <div v-for="(user, index) in filteredUsers" :key="user.username" class="list-item">
                        <div class="item-content">
                            <span class="row-no">{{ index + 1 }}</span>
                            <div class="item-indicator"></div>
                            <span class="item-title">{{ user.name }}</span>
                            <span class="item-mail">{{ user.username }}</span>
                            <span>
                                {{ user.permission && user.permission.length > 0 ? user.permission.join(', ') : "Can't Access" }}
                            </span>
                        </div>
                        <div class="item-actions">
                            <label class="toggle-switch">
                                <input
                                    type="checkbox"
                                    :checked="user.status"
                                    @change="onStatusToggle($event, index)"
                                >
                                <span class="slider">
                                    {{ user.status ? 'Login Enabled' : 'Login Disabled' }}
                                </span>
                            </label>
                            <button @click="openEditModal(user, index)" class="action-btn edit-btn" title="Edit">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                </svg>
                                <span>Edit</span>
                            </button>
                            <button @click="deleteUser(index)" class="action-btn delete-btn" title="Delete">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <UserModal v-if="showModal" :visible="showModal" :isEdit="isEdit" :user="modalUser"
                :permissionOptions="permissionOptions" @close="closeModal" @save="handleModalSave" />
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import UserModal from './UserModal.vue'
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
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
const permissionOptions = ['task', 'read', 'pending']
const categories = ['task', 'read', 'pending']
const users = ref([])
const filterUser = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const modalUser = ref(null)
const editIndex = ref(-1)
import { useRouter } from 'vue-router'
const router = useRouter()

onMounted(async () => {
    try {
        const response = await fetch('http://localhost:3000/users')
        if (!response.ok) throw new Error('Failed to fetch users')
        users.value = await response.json()
    } catch (err) {
        users.value = []
    }
})

const filteredUsers = computed(() => {
    const q = filterUser.value.trim().toLowerCase()
    if (!q) return users.value
    return users.value.filter(u =>
        u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
    )
})

// Enable/Disable Login
async function onStatusToggle(event, idx) {
  const user = users.value[idx];
  const newStatus = event.target.checked;
  const actionText = newStatus ? 'enable login for' : 'disable login for';
  const confirmButtonColor = newStatus ? '#3182ce' : '#e53e3e';
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to ${actionText} "${user.name}"?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: `Yes, ${newStatus ? 'enable' : 'disable'}!`,
    confirmButtonColor,
  });
  if (result.isConfirmed) {
    try {
      const response = await fetch(`http://localhost:3000/users/${user.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status');
      user.status = newStatus;
      await Swal.fire({
        title: 'Updated!',
        text: `Login has been ${newStatus ? 'enabled' : 'disabled'} for "${user.name}".`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } catch (err) {
      event.target.checked = !newStatus;
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error'
      });
    }
  } else {
    event.target.checked = !newStatus;
  }
}

function openAddModal() {
    isEdit.value = false
    modalUser.value = {
        username: '',
        name: '',
        password: '',
        permission: []
    }
    showModal.value = true
}

function openEditModal(user, idx) {
    isEdit.value = true
    modalUser.value = { ...user }
    editIndex.value = idx
    showModal.value = true
}

function closeModal() {
    showModal.value = false
}

async function handleModalSave(form) {
    if (isEdit.value) {
        const idx = editIndex.value;
        if (idx !== -1) {
            try {
                const userId = users.value[idx].id;
                const response = await fetch(`http://localhost:3000/users/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form)
                });
                if (!response.ok) throw new Error('Failed to update user');
                const updatedUser = await response.json();
                users.value[idx] = updatedUser;
                showModal.value = false;
                await Swal.fire({
                    title: 'Success!',
                    text: 'User updated successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            } catch (err) {
                Swal.fire({
                    title: 'Error!',
                    text: err.message,
                    icon: 'error'
                });
            }
        }
    } else {
        try {
            const response = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (!response.ok) throw new Error('Failed to create user');
            const newUser = await response.json();
            users.value.unshift(newUser);
            showModal.value = false;
            await Swal.fire({
                title: 'Success!',
                text: 'User added successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (err) {
            Swal.fire({
                title: 'Error!',
                text: err.message,
                icon: 'error'
            });
        }
    }
}

async function deleteUser(idx) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Delete user "${users.value[idx].name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        confirmButtonColor: '#ef4444'
    });
    if (result.isConfirmed) {
        const userId = users.value[idx].id;
        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete user');
            users.value.splice(idx, 1);
            await Swal.fire({
                title: 'Deleted!',
                text: 'User deleted successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (err) {
            Swal.fire({
                title: 'Error!',
                text: err.message,
                icon: 'error'
            });
        }
    }
}

function redirectToDashboard() {
    router.push('/dashboard');
}

function goToDashboardWithCategory(cat) {
    console.log(`Redirecting to category: ${cat}`)
    if (!categories.includes(cat)) {
        console.error(`Invalid category: ${cat}`)
        return
    }
    console.log(`Redirecting to category: ${cat}`)
    router.push({ name: 'dashboard', query: { category: cat } })
}

// Logout Confirmation
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
        console.log('Logging out...');
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiBase}/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token
            })
        });
        const data = await response.json();
        if (data.success) {
            toast.success(data.message, toastOptions);
            localStorage.removeItem('token');
            router.push('/');
            window.location.reload();
        } else {
            toast.error('Error Logging Out', toastOptions);
        }
    } catch (error) {
        console.log(error);
        toast.error('Error Connecting to Server', toastOptions);
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Inter:400,500,700&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.app {
    width: 100vw;
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow-x: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.navbar {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 3rem;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    gap: 2.5rem;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.brand-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.nav-tabs {
    display: flex;
    gap: 1rem;
}

.nav-tab {
    background: transparent;
    border: 2px solid #e2e8f0;
    color: #4a5568;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.nav-tab.active {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}


.nav-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

.add-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, #48bb78, #38a169);
    color: white;
    border: none;
    font-weight: 600;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
}

.add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
}

.logout-button {
    padding: 0.75rem;
    background: linear-gradient(135deg, #f56565, #e53e3e);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(245, 101, 101, 0.3);
}

.logout-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(245, 101, 101, 0.4);
}

.main-content {
    padding: 2rem;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    flex: 1 1 auto;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(20px);
    padding: 1rem 1.5rem;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    font-size: 1.1rem;
    color: #2d3748;
    font-weight: 500;
}

.filter-input {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 0.25rem 0.5rem 1rem;
    font-size: 1rem;
    font-weight: 500;
    transition: background 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
    width: 250px;
}

.filter-input:focus {
    outline: none;
}

.filter-input::placeholder {
    color: #fff;
    opacity: 0.8;
}

.filter-input:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
}

.empty-state {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 4rem;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    margin: 1.5rem 0;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
}

.empty-state h3 {
    color: #2d3748;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.empty-state p {
    color: #718096;
    margin-bottom: 2rem;
    font-size: 1.1rem;
}

.empty-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #48bb78, #38a169);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 16px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 6px 20px rgba(72, 187, 120, 0.3);
}

.empty-add-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(72, 187, 120, 0.4);
}

.items-container {
    display: flex;
    flex-direction: column;
    color: rgba(74, 85, 104, 0.8);
    gap: 1rem;
    margin: 1.5rem 0;
}

.list-top {
    display: flex;
    color: #2d3748;
    justify-content: space-between;
    align-items: center;
    padding: 0.2rem 1.6rem;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem 1.6rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.list-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: rgba(102, 126, 234, 0.3);
}

.item-content {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex: 1;
    color: #555;
    font-size: 0.9rem;
}

.row-no {
    width: 1rem;
}

.item-indicator {
    margin-left: -1rem;
    margin-right: -0.6rem;
    width: 4px;
    height: 40px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 2px;
}

.item-title {
    font-size: 1.1rem;
    color: #2d3748;
    font-weight: 500;
    width: 8rem;
}

.item-mail {
    width: 12rem;
}

.item-actions {
    display: flex;
    gap: 1.5rem;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: 2px solid #e2e8f0;
    padding: 0.5rem 1rem;
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-switch {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch .slider {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0.5rem 1rem;
  transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  background: #e53e3e;
  border-radius: 10px;
  gap: 0.5rem;
}

.toggle-switch input:checked + .slider {
  background: #3182ce;
}

.edit-btn {
    color: #3182ce;
    border-color: #bee3f8;
}

.edit-btn:hover {
    background: #ebf8ff;
    border-color: #3182ce;
    transform: translateY(-1px);
}

.delete-btn {
    color: #e53e3e;
    border-color: #fed7d7;
}

.delete-btn:hover {
    background: #fed7d7;
    border-color: #e53e3e;
    transform: translateY(-1px);
}

@media (max-width: 1024px) {
    .main-content {
        padding: 1.5rem;
    }

    .navbar {
        padding: 1rem 1.5rem;
    }
}

@media (max-width: 768px) {
    .navbar {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
    }

    .nav-brand {
        order: 1;
    }

    .nav-tabs {
        order: 2;
        width: 100%;
        justify-content: center;
    }

    .nav-actions {
        order: 3;
        width: 100%;
        justify-content: center;
    }

    .main-content {
        padding: 1rem;
    }

    .section-header {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
    }

    .item-actions {
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .nav-tabs {
        flex-direction: column;
        width: 100%;
    }

    .nav-tab {
        width: 100%;
        text-align: center;
    }

    .action-btn span {
        display: none;
    }

    .action-btn {
        padding: 0.5rem;
    }

    .action-btn .icon {
        font-size: 1.2rem;
    }

    .empty-state {
        padding: 2rem;
    }
}
</style>