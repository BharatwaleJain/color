<template>
  <div class="app">
    <nav class="navbar">
      <h1>Select Category &nbsp;</h1>
      <button v-for="cat in categories" :key="cat" @click="fetchList(cat)"
        :class="['nav-tab', { active: activeCategory === cat }]">
        {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
      </button>
      <button @click="addNewItem" class="add-btn">Add Item</button>
      <button @click="confirmLogout" class="logout-button">
        <svg width="16" height="16" viewBox="0 -2 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>

      </button>
    </nav>
    <main class="main-content">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading {{ activeCategory }}...</p>
      </div>
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="fetchList(activeCategory)" class="retry-btn">Retry</button>
      </div>
      <div v-else-if="activeCategory" class="list-section">
        <div v-if="list.length === 0" class="empty-state">
          <p>No items found</p>
        </div>
        <div v-else class="items-container">
          <div v-for="(item, index) in list" :key="item.id || index" class="list-item">
            <span class="item-title">{{ item.title }}</span>
            <div class="item-actions">
              <button @click="editItem(item, index)" class="action-btn edit-btn" title="Edit">
                Edit &nbsp;
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </button>
              <button @click="deleteItem(item, index)" class="action-btn delete-btn" title="Delete">
                Delete &nbsp;
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="welcome-state">
        <h2>Select any Category started</h2>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
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

const categories = ['task', 'read', 'pending'];
const list = ref([]);
const activeCategory = ref('');
const loading = ref(false);
const error = ref(null);

const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

// Fetch items for category
async function fetchList(category) {
  activeCategory.value = category;
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.get(`${apiBase}/api/list?category=${category}`);
    if (response.data.success) {
      list.value = response.data.data || [];
    } else {
      error.value = response.data.message || 'Failed to fetch items';
      list.value = [];
    }
  } catch (err) {
    error.value = 'Failed to connect to server';
    list.value = [];
    console.error('Fetch error:', err);
  } finally {
    loading.value = false;
  }
}

// Add new item
async function addNewItem() {
  const { value: title } = await Swal.fire({
    title: 'Enter Title',
    input: 'textarea',
    inputPlaceholder: 'Enter item title',
    showCancelButton: true,
    confirmButtonText: 'Next',
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return 'Please enter a title';
      }
    }
  });

  if (title) {
    const { value: category } = await Swal.fire({
      title: 'Select Category',
      input: 'select',
      inputOptions: {
        task: 'Task',
        read: 'Read',
        pending: 'Pending'
      },
      inputPlaceholder: 'Choose a category',
      showCancelButton: true,
      confirmButtonText: 'Add',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select a category';
        }
      }
    });

    if (category) {
      try {
        const response = await axios.post(`${apiBase}/api/list`, {
          title: title.trim(),
          category
        });

        if (response.data.success) {
          list.value.push({
            id: response.data.id,
            title: title.trim()
          });

          Swal.fire({
            title: 'Success!',
            text: 'Item added successfully',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        } else {
          throw new Error(response.data.message);
        }
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to add item',
          icon: 'error'
        });
        console.error('Add error:', err);
      }
    }
  }
}

// Edit item
async function editItem(item, index) {
  const { value: title } = await Swal.fire({
    title: 'Edit Item',
    input: 'text',
    inputValue: item.title,
    showCancelButton: true,
    confirmButtonText: 'Update',
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return 'Please enter a title';
      }
    }
  });
  if (title && title.trim() !== item.title) {
    try {
      const response = await axios.put(`${apiBase}/api/list`, {
        id: item.id,
        title: title.trim(),
        category: activeCategory.value
      });
      if (response.data.success) {
        list.value[index] = { ...list.value[index], title: title.trim() };
        Swal.fire({
          title: 'Success!',
          text: 'Item updated successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update item',
        icon: 'error'
      });
      console.error('Update error:', err);
    }
  }
}

// Delete item
async function deleteItem(item, index) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Delete "${item.title}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    confirmButtonColor: '#ef4444'
  });
  if (result.isConfirmed) {
    try {
      console.log('Deleting item:', item, activeCategory.value);
      const response = await axios.delete(`${apiBase}/api/list`, {
        data: {
          id: item.id,
          category: activeCategory.value
        }
      });
      if (response.data.success) {
        list.value.splice(index, 1);
        Swal.fire({
          title: 'Deleted!',
          text: 'Item deleted successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete item',
        icon: 'error'
      });
      console.error('Delete error:', err);
    }
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
    console.log('Logging out...');
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    const response = await fetch(`${apiBase}/api/logout`, {
      method: 'POST',
    });
    const data = await response.json();
    if (data.success) {
      toast.success(data.message || 'Logged Out Successfully!', toastOptions);
      document.body.style.backgroundColor = 'Black';
      localStorage.removeItem('token');
      router.push('/');
      window.location.reload();
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  width: 80vw;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.navbar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  color: black;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  padding: 1rem 2rem;
  gap: 1rem;
  position: sticky;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-tab {
  background: transparent;
  border: 1px solid #ddd;
  color: #666;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-tab:hover {
  background: #f8f9fa;
  border-color: #999;
}

.nav-tab.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.main-content {
  width: 80%;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error {
  text-align: center;
  padding: 2rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  color: #856404;
}

.retry-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #0056b3;
}

/* List Section */
.list-section {
  padding: 1rem;

}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.list-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.add-btn {
  padding: 0.4rem 1rem;
  background: #28a745;
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-btn:hover {
  background: #218838;
}

.logout-button {
  padding: 0.4rem 1rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: #c0392b;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #dee2e6;
  border-radius: 6px;
  transition: all 0.2s;
}

.list-item:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.item-title {
  font-size: 1rem;
  color: #333;
  flex: 1;
}

.item-actions {
  display: flex;
  gap: 2rem;
}

.action-btn {
  background: transparent;
  border: 1px solid #000000;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #e3f2fd;
  border-color: #2196f3;
}

.delete-btn:hover {
  background: #ffebee;
  border-color: #f44336;
}

.welcome-state {
  text-align: center;
  padding: 4rem;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav-tabs {
    width: 100%;
    justify-content: center;
  }

  .list-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .list-item {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .item-actions {
    justify-content: center;
  }
}
</style>