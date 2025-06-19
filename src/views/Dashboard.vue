<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-brand" @click="resetView" style="cursor:pointer">
        <div class="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
          </svg>
        </div>
      </div>
      <div class="nav-tabs">
        <button v-for="cat in categories" :key="cat" @click="fetchList(cat)"
          :class="['nav-tab', { active: activeCategory === cat }]">
          <span>{{ cat.charAt(0).toUpperCase() + cat.slice(1) }}</span>
        </button>
      </div>
      <div class="nav-actions">
        <button @click="addNewItem" class="add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add Item</span>
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
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading {{ activeCategory }}...</p>
      </div>
      <div v-else-if="error" class="error">
        <div class="error-icon">⚠️</div>
        <h3>Oops! Something went wrong</h3>
        <p>{{ error }}</p>
        <button @click="fetchList(activeCategory)" class="retry-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          Try Again
        </button>
      </div>
      <div v-else-if="activeCategory" class="list-section">
        <div class="section-header">
          <input v-model="filterText" @input="handleFilter" class="filter-input" placeholder="Search by Title..." />
          <flat-pickr
            v-model="dateRange"
            :config="flatpickrConfig"
            placeholder="Search by Created..."
            class="date-picker"
          />
          <div>
            <button @click="sortList('title')" class="sort-btn">
              Sort by Title &nbsp; {{ sortKey === 'title' ? sortLabel : '' }}
            </button>
            <button @click="sortList('updatedAt')" class="sort-btn">
              Sort by Updated &nbsp; {{ sortKey === 'updatedAt' ? sortLabel : '' }}
            </button>
          </div>
        </div>
        <div v-if="list.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>No items yet for your query</h3>
          <p>Get started by adding your first {{ activeCategory }} item</p>
          <button @click="addNewItem" class="empty-add-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add First Item
          </button>
        </div>
        <div v-else class="items-container">
          <div v-for="(item, index) in list" :key="item.id || index" class="list-item">
            <div class="item-content">
              <span class="row-no">{{ (pageNumber - 1) * pageSize + index + 1 }}</span>
              <div class="item-indicator"></div>
              <span class="item-title">{{ item.title }}</span>
              <span class="item-date">{{ formatDate(item.createdAt) }}</span>
              <span class="item-date">{{ formatDate(item.updatedAt) }}</span>
            </div>
            <div class="item-actions">
              <button @click="editItem(item, index)" class="action-btn edit-btn" title="Edit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
                <span>Edit</span>
              </button>
              <button @click="deleteItem(item, index)" class="action-btn delete-btn" title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
        <div class="section-header">
          Total {{ totalElements }} Item{{ totalElements > 1 ? 's' : '' }} Found
          <div>
            <button v-if="pageNumber > 1" @click="pageNumber--; fetchList(activeCategory)" class="sort-btn">
              Prev
            </button>
            Page {{ pageNumber }} / {{ totalPages }}
            <button v-if="pageNumber < totalPages" @click="pageNumber++; fetchList(activeCategory)"
              class="sort-btn">
              Next
            </button>
          </div>
          <select v-model.number="pageSize" @change="handlePageSizeChange" class="page-size-select">
            <option :value="3">3 Items per Page</option>
            <option :value="5">5 Items per Page</option>
            <option :value="10">10 Items per Page</option>
            <option :value="15">15 Items per Page</option>
            <option :value="20">20 Items per Page</option>
          </select>
        </div>
      </div>
      <div v-else class="welcome-state">
        <div class="welcome-content">
          <h2>Welcome to Dashboard</h2>
          <p>Select any category to see list of items</p>
          <div class="category-preview">
            <div v-for="cat in categories" :key="cat" @click="fetchList(cat)" class="category-card">
              <div class="category-icon">
                {{ cat === 'task' ? '✅' : cat === 'read' ? '📚' : '⏳' }}
              </div>
              <span>{{ cat.charAt(0).toUpperCase() + cat.slice(1) }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import FlatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import 'flatpickr/dist/themes/dark.css';
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
const sortDirection = ref('asc');
const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const pageNumber = ref(1);
const pageSize = ref(5);
const sortKey = ref('createdAt');
const totalElements = ref(0);
const totalPages = computed(() => {
  if (!pageSize.value || pageSize.value <= 0 || !totalElements.value || totalElements.value <= 0) {
    return 1;
  }
  return Math.ceil(totalElements.value / pageSize.value);
});
const filterText = ref('');
const dateRange = ref([]);
const startDate = ref(null);
const endDate = ref(null);

// Reset View
function resetView() {
  activeCategory.value = '';
  list.value = [];
  error.value = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle Filter
function handleFilter() {
  pageNumber.value = 1;
  fetchList(activeCategory.value);
}

// Date Range Filter
const flatpickrConfig = {
  mode: 'range',
  dateFormat: 'M j, Y',
  altFormat: 'M j, Y',
  onClose: (selectedDates, dateStr, instance) => {
    if (selectedDates.length === 2) {
      startDate.value = selectedDates[0];
      endDate.value = selectedDates[1];
      pageNumber.value = 1;
      fetchList(activeCategory.value);
    } else {
      instance.clear();
      startDate.value = null;
      endDate.value = null;
      pageNumber.value = 1;
      fetchList(activeCategory.value);
    }
  }
};

// Fetch Items
async function fetchList(category) {
  activeCategory.value = category;
  loading.value = true;
  error.value = null;
  try {
    const params = {
      page: pageNumber.value,
      size: pageSize.value,
      sort: `${sortKey.value},${sortDirection.value}`,
      q: filterText.value.trim().toLowerCase()
    };
    if (startDate.value)
      params.startDate = new Date(startDate.value).toISOString();
    if (endDate.value)
      params.endDate = new Date(endDate.value).toISOString();
    const response = await axios.get(`${apiBase}/list/category/${category}`, {
      params
    });
    totalElements.value = response.data.totalElements || 0;
    list.value = response.data.content || [];
  } catch (err) {
    error.value = 'Failed to Fetch Items';
    list.value = [];
  } finally {
    loading.value = false;
  }
}

// Add New Item
async function addNewItem() {
  const { value: title } = await Swal.fire({
    title: 'Enter Title',
    input: 'textarea',
    inputPlaceholder: 'Enter Item Title',
    showCancelButton: true,
    confirmButtonText: 'Next',
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return 'Please Enter a Title';
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
      inputPlaceholder: 'Choose a Category',
      showCancelButton: true,
      confirmButtonText: 'Add',
      inputValidator: (value) => {
        if (!value) {
          return 'Please Select a Category';
        }
      }
    });
    if (category) {
      try {
        const response = await axios.post(`${apiBase}/list`, {
          title: title.trim(),
          category: category
        });
        if (response.data.success) {
          list.value.push({
            id: response.data.id,
            title: title.trim()
          });
          activeCategory.value = category;
          Swal.fire({
            title: 'Success!',
            text: response.data.message,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        } else {
          throw new Error('Failed to Add Item');
        }
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.message,
          icon: 'error'
        });
      }
    }
  }
}

// Edit Item
async function editItem(item, index) {
  const { value: title } = await Swal.fire({
    title: 'Edit Item',
    input: 'text',
    inputValue: item.title,
    showCancelButton: true,
    confirmButtonText: 'Update',
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return 'Please Enter a Title';
      }
    }
  });
  if (title && title.trim() !== item.title) {
    try {
      const response = await axios.put(`${apiBase}/list/${item.id}`, {
        title: title.trim(),
        category: activeCategory.value
      });
      if (response.data.success) {
        list.value[index] = { ...list.value[index], title: title.trim() };
        Swal.fire({
          title: 'Success!',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        throw new Error('Failed to Update Item');
      }
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error'
      });
    }
  }
}

// Delete Item
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
      const response = await axios.delete(`${apiBase}/list/${item.id}`);
      if (response.data.success) {
        list.value.splice(index, 1);
        Swal.fire({
          title: 'Deleted!',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        throw new Error('Failed to Delete Item');
      }
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error'
      });
    }
  }
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

// Sort List
function sortList(key) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDirection.value = 'asc';
  }
  pageNumber.value = 1;
  fetchList(activeCategory.value);
}
const sortLabel = computed(() =>
  sortDirection.value === 'asc' ? '↑ ' : '↓ '
);

// Format Date
function formatDate(isoString) {
  if (!isoString)
    return '';
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    day: '2-digit', month: 'short'
  }) + ', ' + date.toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit'
  });
}

// Handle Page Size Change
function handlePageSizeChange() {
  pageNumber.value = 1;
  fetchList(activeCategory.value);
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  width: 100vw;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

.navbar h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
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

.nav-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.nav-tab:hover::before {
  left: 100%;
}

.nav-tab:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
  transform: translateY(-2px);
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error h3 {
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.error p {
  color: #718096;
  margin-bottom: 2rem;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.sort-btn {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.sort-btn:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
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

.section-header div {
  display: flex;
  align-items: center;
  gap: 0.8rem;
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
  width: 200px;
}

.filter-input:focus,
.filter-input:focus-visible {
  outline: none;
}

.filter-input::placeholder,
.filter-input::-webkit-input-placeholder {
  color: #fff;
  opacity: 0.8;
}

.filter-input:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
}

input.date-picker.flatpickr-input {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
  width: 240px;
}

input.date-picker.flatpickr-input:focus,
input.date-picker.flatpickr-input:focus-visible {
  outline: none;
}

input.date-picker.flatpickr-input::placeholder,
input.date-picker.flatpickr-input::-webkit-input-placeholder {
  color: #fff;
  opacity: 0.8;
}

input.date-picker.flatpickr-input:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
}

.page-size-select {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.25rem 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
  cursor: pointer;
}

.page-size-select:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
}

.page-size-select option {
  background: #fff;
  color: #2d3748;
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
  gap: 1.6rem;
  flex: 1;
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
}

.item-actions {
  display: flex;
  gap: 0.5rem;
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

.welcome-state {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 4rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.welcome-content {
  max-width: 800px;
  margin: 0 auto;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.welcome-state h2 {
  color: #2d3748;
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.welcome-state p {
  color: #718096;
  font-size: 1.1rem;
  margin-bottom: 3rem;
}

.category-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 4rem;
  margin-top: 2rem;
}

.category-card {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 2rem 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.category-icon {
  font-size: 2rem;
}

.category-card span {
  font-weight: 600;
  color: #2d3748;
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

  .category-preview {
    grid-template-columns: 1fr;
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

  .welcome-state {
    padding: 2rem;
  }

  .welcome-icon {
    font-size: 3rem;
  }

  .welcome-state h2 {
    font-size: 1.5rem;
  }

  .welcome-state p {
    font-size: 1rem;
  }
}
</style>