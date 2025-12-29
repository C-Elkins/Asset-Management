import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Categories
  getCategories: () => ipcRenderer.invoke('get-categories'),
  getAllCategories: () => ipcRenderer.invoke('get-all-categories'),
  createCategory: (category: any) => ipcRenderer.invoke('create-category', category),
  updateCategory: (id: number, category: any) => ipcRenderer.invoke('update-category', id, category),
  deleteCategory: (id: number) => ipcRenderer.invoke('delete-category', id),
  reactivateCategory: (id: number) => ipcRenderer.invoke('reactivate-category', id),

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
  bulkUpdateAssets: (ids: number[], updates: any) => ipcRenderer.invoke('bulk-update-assets', ids, updates),
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
  clearActivityLog: () => ipcRenderer.invoke('clear-activity-log'),

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

  // QR Codes
  generateAssetQRCode: (assetId: number) => ipcRenderer.invoke('generate-asset-qr-code', assetId),
  generateItemQRCode: (assetId: number, itemNumber: number) => ipcRenderer.invoke('generate-item-qr-code', assetId, itemNumber),
  getQRCode: (qrCodeId: string) => ipcRenderer.invoke('get-qr-code', qrCodeId),
  getAssetQRCodes: (assetId: number) => ipcRenderer.invoke('get-asset-qr-codes', assetId),
  recordQRScan: (scanData: any) => ipcRenderer.invoke('record-qr-scan', scanData),
  getQRScanHistory: (qrCodeId: string, limit?: number) => ipcRenderer.invoke('get-qr-scan-history', qrCodeId, limit),
  getRecentScans: (limit?: number) => ipcRenderer.invoke('get-recent-scans', limit),
  deactivateQRCode: (qrCodeId: string) => ipcRenderer.invoke('deactivate-qr-code', qrCodeId),
  batchGenerateQRCodes: (assetIds: number[]) => ipcRenderer.invoke('batch-generate-qr-codes', assetIds),

  // Filter Presets
  getFilterPresets: () => ipcRenderer.invoke('get-filter-presets'),
  getFilterPreset: (id: number) => ipcRenderer.invoke('get-filter-preset', id),
  saveFilterPreset: (preset: any) => ipcRenderer.invoke('save-filter-preset', preset),
  updateFilterPreset: (id: number, preset: any) => ipcRenderer.invoke('update-filter-preset', id, preset),
  deleteFilterPreset: (id: number) => ipcRenderer.invoke('delete-filter-preset', id),
  recordPresetUsage: (id: number) => ipcRenderer.invoke('record-preset-usage', id),
  togglePresetFavorite: (id: number) => ipcRenderer.invoke('toggle-preset-favorite', id),

  // Authentication & Users
  login: (credentials: any) => ipcRenderer.invoke('auth:login', credentials),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser'),
  createUser: (user: any) => ipcRenderer.invoke('auth:createUser', user),
  getAllUsers: () => ipcRenderer.invoke('auth:getAllUsers'),
  updateUser: (id: number, updates: any) => ipcRenderer.invoke('auth:updateUser', id, updates),
  deleteUser: (id: number) => ipcRenderer.invoke('auth:deleteUser', id),
  changePassword: (oldPassword: string, newPassword: string) => ipcRenderer.invoke('auth:changePassword', oldPassword, newPassword),

  // Attachments
  getAttachments: (assetId: number) => ipcRenderer.invoke('get-attachments', assetId),
  uploadAttachment: (assetId: number, description?: string) => ipcRenderer.invoke('upload-attachment', assetId, description),
  deleteAttachment: (id: number) => ipcRenderer.invoke('delete-attachment', id),
  openAttachment: (id: number) => ipcRenderer.invoke('open-attachment', id),

  // Barcodes
  getBarcodes: (assetId: number) => ipcRenderer.invoke('get-barcodes', assetId),
  generateBarcode: (input: any) => ipcRenderer.invoke('generate-barcode', input),
  deleteBarcode: (id: number) => ipcRenderer.invoke('delete-barcode', id),
  printBarcode: (id: number) => ipcRenderer.invoke('print-barcode', id),
  batchGenerateBarcodes: (assetIds: number[], format: string) => ipcRenderer.invoke('batch-generate-barcodes', assetIds, format),

  // Leases
  getLeases: (filters?: any) => ipcRenderer.invoke('get-leases', filters),
  getLease: (id: number) => ipcRenderer.invoke('get-lease', id),
  createLease: (lease: any) => ipcRenderer.invoke('create-lease', lease),
  updateLease: (id: number, updates: any) => ipcRenderer.invoke('update-lease', id, updates),
  cancelLease: (id: number) => ipcRenderer.invoke('cancel-lease', id),
  renewLease: (id: number, newEndDate: string) => ipcRenderer.invoke('renew-lease', id, newEndDate),
  deleteLease: (id: number) => ipcRenderer.invoke('delete-lease', id),

  // Reservations
  getReservations: (filters?: any) => ipcRenderer.invoke('get-reservations', filters),
  getReservation: (id: number) => ipcRenderer.invoke('get-reservation', id),
  createReservation: (reservation: any) => ipcRenderer.invoke('create-reservation', reservation),
  updateReservation: (id: number, updates: any) => ipcRenderer.invoke('update-reservation', id, updates),
  cancelReservation: (id: number) => ipcRenderer.invoke('cancel-reservation', id),
  deleteReservation: (id: number) => ipcRenderer.invoke('delete-reservation', id),
  checkReservationConflicts: (assetId: number, start: string, end: string, excludeId?: number) => ipcRenderer.invoke('check-reservation-conflicts', assetId, start, end, excludeId),

  // Locations
  getLocationsHierarchy: (filters?: any) => ipcRenderer.invoke('get-locations-hierarchy', filters),
  getLocation: (id: number) => ipcRenderer.invoke('get-location', id),
  createLocation: (location: any) => ipcRenderer.invoke('create-location', location),
  updateLocation: (id: number, updates: any) => ipcRenderer.invoke('update-location', id, updates),
  deleteLocation: (id: number) => ipcRenderer.invoke('delete-location', id),
  getLocationHierarchy: () => ipcRenderer.invoke('get-location-hierarchy'),

  // Insurance
  getInsurancePolicies: (filters?: any) => ipcRenderer.invoke('get-insurance-policies', filters),
  getInsurancePolicy: (id: number) => ipcRenderer.invoke('get-insurance-policy', id),
  createInsurancePolicy: (policy: any) => ipcRenderer.invoke('create-insurance-policy', policy),
  updateInsurancePolicy: (id: number, updates: any) => ipcRenderer.invoke('update-insurance-policy', id, updates),
  cancelInsurancePolicy: (id: number) => ipcRenderer.invoke('cancel-insurance-policy', id),
  deleteInsurancePolicy: (id: number) => ipcRenderer.invoke('delete-insurance-policy', id),

  // Stock Alerts
  getStockAlerts: (filters?: any) => ipcRenderer.invoke('get-stock-alerts', filters),
  createStockAlert: (alert: any) => ipcRenderer.invoke('create-stock-alert', alert),
  acknowledgeStockAlert: (id: number, acknowledgedBy: string) => ipcRenderer.invoke('acknowledge-stock-alert', id, acknowledgedBy),
  resolveStockAlert: (id: number) => ipcRenderer.invoke('resolve-stock-alert', id),

  // Parent-Child Assets
  getAssetChildren: (parentId: number) => ipcRenderer.invoke('get-asset-children', parentId),
  updateAssetParent: (assetId: number, parentAssetId: number | null) => ipcRenderer.invoke('update-asset-parent', assetId, parentAssetId),
};

// Window controls API
const windowAPI = {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
};

contextBridge.exposeInMainWorld('api', api);
contextBridge.exposeInMainWorld('windowAPI', windowAPI);
