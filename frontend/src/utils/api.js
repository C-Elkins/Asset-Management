// API Utility for backend connectivity
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if user is logged in
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Asset Management API calls
export const assetAPI = {
  // Get all assets
  getAll: () => apiCall('/assets'),
  
  // Get asset by ID
  getById: (id) => apiCall(`/assets/${id}`),
  
  // Create new asset
  create: (assetData) => apiCall('/assets', {
    method: 'POST',
    body: JSON.stringify(assetData),
  }),
  
  // Update asset
  update: (id, assetData) => apiCall(`/assets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(assetData),
  }),
  
  // Delete asset
  delete: (id) => apiCall(`/assets/${id}`, {
    method: 'DELETE',
  }),
  
  // Export assets
  export: async (format = 'csv') => {
    try {
      const response = await fetch(`${API_BASE_URL}/assets/export?format=${format}`, {
        headers: {
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }),
        },
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assets-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }
};

// User management API calls  
export const userAPI = {
  // Get current user profile
  getProfile: () => apiCall('/users/profile'),
  
  // Update user profile
  updateProfile: (profileData) => apiCall('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
  
  // Get all users (admin only)
  getAll: () => apiCall('/users'),
  
  // Create new user
  create: (userData) => apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
};

// System API calls
export const systemAPI = {
  // Get system status
  getStatus: () => apiCall('/system/status'),
  
  // Get system info
  getInfo: () => apiCall('/system/info'),
  
  // Backup system
  backup: () => apiCall('/system/backup', { method: 'POST' }),
  
  // Get backup history
  getBackups: () => apiCall('/system/backups')
};

// Reports API calls
export const reportsAPI = {
  // Get dashboard metrics
  getDashboard: () => apiCall('/reports/dashboard'),
  
  // Generate asset report
  getAssetReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/reports/assets${queryString ? `?${queryString}` : ''}`);
  },
  
  // Generate maintenance report
  getMaintenanceReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/reports/maintenance${queryString ? `?${queryString}` : ''}`);
  }
};

// Test API connectivity
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/assets`);
    if (response.ok) {
      return { connected: true, message: 'Backend connected successfully' };
    } else {
      return { connected: false, message: `Backend responded with status: ${response.status}` };
    }
  } catch (error) {
    return { connected: false, message: 'Backend connection failed', error: error.message };
  }
};

export default {
  assetAPI,
  userAPI,
  systemAPI,
  reportsAPI,
  testConnection
};
