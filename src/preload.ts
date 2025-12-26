import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Categories
  getCategories: () => ipcRenderer.invoke('get-categories'),
  createCategory: (category: any) => ipcRenderer.invoke('create-category', category),
  updateCategory: (id: number, category: any) => ipcRenderer.invoke('update-category', id, category),
  deleteCategory: (id: number) => ipcRenderer.invoke('delete-category', id),

  // Category Preferences
  getUserCategoryPreferences: () => ipcRenderer.invoke('get-user-category-preferences'),
  getCategoriesWithPreferences: () => ipcRenderer.invoke('get-categories-with-preferences'),
  updateCategoryPreference: (categoryId: number, updates: any) => ipcRenderer.invoke('update-category-preference', categoryId, updates),
  bulkUpdateCategoryPreferences: (preferences: any[]) => ipcRenderer.invoke('bulk-update-category-preferences', preferences),
  getCategoryViewMode: () => ipcRenderer.invoke('get-category-view-mode'),
  setCategoryViewMode: (mode: string) => ipcRenderer.invoke('set-category-view-mode', mode),

  // Assets
  getAssets: (filters?: any) => ipcRenderer.invoke('get-assets', filters),
  getAssetsPaginated: (filters?: any, pagination?: any) => ipcRenderer.invoke('get-assets-paginated', filters, pagination),
  getAsset: (id: number) => ipcRenderer.invoke('get-asset', id),
  createAsset: (asset: any) => ipcRenderer.invoke('create-asset', asset),
  updateAsset: (id: number, asset: any) => ipcRenderer.invoke('update-asset', id, asset),
  deleteAsset: (id: number) => ipcRenderer.invoke('delete-asset', id),
  bulkDeleteAssets: (ids: number[]) => ipcRenderer.invoke('bulk-delete-assets', ids),
  getAssetStats: () => ipcRenderer.invoke('get-asset-stats'),
  getLocations: () => ipcRenderer.invoke('get-locations'),

  // Maintenance
  getMaintenanceRecords: (assetId?: number) => ipcRenderer.invoke('get-maintenance-records', assetId),
  createMaintenanceRecord: (record: any) => ipcRenderer.invoke('create-maintenance-record', record),
  updateMaintenanceRecord: (id: number, record: any) => ipcRenderer.invoke('update-maintenance-record', id, record),
  deleteMaintenanceRecord: (id: number) => ipcRenderer.invoke('delete-maintenance-record', id),

  // Custom Field Definitions
  getCustomFields: (categoryId: number) => ipcRenderer.invoke('get-custom-fields', categoryId),
  createCustomField: (field: any) => ipcRenderer.invoke('create-custom-field', field),
  updateCustomField: (id: number, field: any) => ipcRenderer.invoke('update-custom-field', id, field),
  deleteCustomField: (id: number) => ipcRenderer.invoke('delete-custom-field', id),

  // Inventory Items
  getInventoryItems: (assetId: number) => ipcRenderer.invoke('get-inventory-items', assetId),
  createInventoryItems: (assetId: number, quantity: number) => ipcRenderer.invoke('create-inventory-items', assetId, quantity),
  updateInventoryItem: (id: number, updates: any) => ipcRenderer.invoke('update-inventory-item', id, updates),

  // Assignments
  getAssignments: (filters?: any) => ipcRenderer.invoke('get-assignments', filters),
  createAssignment: (assignment: any) => ipcRenderer.invoke('create-assignment', assignment),
  checkInAsset: (assignmentId: number, notes?: string) => ipcRenderer.invoke('check-in-asset', assignmentId, notes),

  // Activity Log
  getRecentActivity: (limit?: number) => ipcRenderer.invoke('get-recent-activity', limit),
  logActivity: (activity: any) => ipcRenderer.invoke('log-activity', activity),

  // Settings
  getSetting: (key: string) => ipcRenderer.invoke('get-setting', key),
  setSetting: (key: string, value: any) => ipcRenderer.invoke('set-setting', key, value),

  // Inventory Transactions
  getInventoryTransactions: (filters?: any) => ipcRenderer.invoke('get-inventory-transactions', filters),
  createInventoryTransaction: (transaction: any) => ipcRenderer.invoke('create-inventory-transaction', transaction),

  // Business Profile
  getBusinessProfile: () => ipcRenderer.invoke('get-business-profile'),
  updateBusinessProfile: (profile: any) => ipcRenderer.invoke('update-business-profile', profile),

  // Database Optimization
  optimizeDatabase: () => ipcRenderer.invoke('optimize-database'),
  getDatabaseStats: () => ipcRenderer.invoke('get-database-stats'),
};

contextBridge.exposeInMainWorld('api', api);
