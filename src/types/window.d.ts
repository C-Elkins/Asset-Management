declare global {
  interface Window {
    api: {
      // Categories
      getCategories: () => Promise<any[]>
      getAllCategories: () => Promise<any[]>
      createCategory: (category: any) => Promise<any>
      updateCategory: (id: number, category: any) => Promise<any>
      deleteCategory: (id: number) => Promise<{ success: boolean }>
      reactivateCategory: (id: number) => Promise<{ success: boolean }>

      // Category Preferences
      getUserCategoryPreferences: () => Promise<any[]>
      getCategoriesWithPreferences: () => Promise<any[]>
      updateCategoryPreference: (categoryId: number, updates: any) => Promise<{ success: boolean }>
      bulkUpdateCategoryPreferences: (preferences: any[]) => Promise<{ success: boolean }>
      getCategoryViewMode: () => Promise<string>
      setCategoryViewMode: (mode: string) => Promise<{ success: boolean }>

      // Assets
      getAssets: (filters?: any) => Promise<any[]>
      getAssetsPaginated: (filters?: any, pagination?: any) => Promise<{
        data: any[]
        pagination: {
          page: number
          pageSize: number
          totalItems: number
          totalPages: number
          hasNext: boolean
          hasPrevious: boolean
        }
      }>
      getAsset: (id: number) => Promise<any>
      createAsset: (asset: any) => Promise<any>
      updateAsset: (id: number, asset: any) => Promise<any>
      deleteAsset: (id: number) => Promise<{ success: boolean }>
      bulkUpdateAssets: (ids: number[], updates: any) => Promise<{ success: boolean; count: number }>
      bulkDeleteAssets: (ids: number[]) => Promise<{ success: boolean; count: number }>
      getAssetStats: () => Promise<any>
      getLocations: () => Promise<any[]>

      // Maintenance
      getMaintenanceRecords: (assetId?: number) => Promise<any[]>
      createMaintenanceRecord: (record: any) => Promise<any>
      updateMaintenanceRecord: (id: number, record: any) => Promise<any>
      deleteMaintenanceRecord: (id: number) => Promise<{ success: boolean }>

      // Custom Fields
      getCustomFields: (categoryId: number) => Promise<any[]>
      createCustomField: (field: any) => Promise<any>
      updateCustomField: (id: number, field: any) => Promise<any>
      deleteCustomField: (id: number) => Promise<{ success: boolean }>

      // Inventory Items
      getInventoryItems: (assetId: number) => Promise<any[]>
      createInventoryItems: (assetId: number, quantity: number) => Promise<any>
      updateInventoryItem: (id: number, updates: any) => Promise<any>

      // Assignments
      getAssignments: (filters?: any) => Promise<any[]>
      createAssignment: (assignment: any) => Promise<any>
      checkInAsset: (assignmentId: number, notes?: string) => Promise<any>

      // Activity Log
      getRecentActivity: (limit?: number) => Promise<any[]>
      logActivity: (activity: any) => Promise<any>
      clearActivityLog: () => Promise<{ success: boolean }>

      // Settings
      getSetting: (key: string) => Promise<any>
      setSetting: (key: string, value: any) => Promise<any>

      // Inventory Transactions
      getInventoryTransactions: (filters?: any) => Promise<any[]>
      createInventoryTransaction: (transaction: any) => Promise<any>

      // Business Profile
      getBusinessProfile: () => Promise<any>
      updateBusinessProfile: (profile: any) => Promise<any>

      // Database Optimization
      optimizeDatabase: () => Promise<{ success: boolean; message: string; sizeMB?: number }>
      getDatabaseStats: () => Promise<{
        success: boolean
        stats?: {
          databaseSizeMB: string
          totalAssets: number
          ftsRecords: number
          totalIndexes: number
        }
      }>

      // QR Codes
      generateAssetQRCode: (assetId: number) => Promise<any>
      generateItemQRCode: (assetId: number, itemNumber: number) => Promise<any>
      getQRCode: (qrCodeId: string) => Promise<any>
      getAssetQRCodes: (assetId: number) => Promise<any[]>
      recordQRScan: (scanData: any) => Promise<any>
      getQRScanHistory: (qrCodeId: string, limit?: number) => Promise<any[]>
      getRecentScans: (limit?: number) => Promise<any[]>
      deactivateQRCode: (qrCodeId: string) => Promise<{ success: boolean; qr_code_id: string }>
      batchGenerateQRCodes: (assetIds: number[]) => Promise<{
        total: number
        successful: number
        failed: number
        results: any[]
      }>

      // Filter Presets
      getFilterPresets: () => Promise<any[]>
      getFilterPreset: (id: number) => Promise<any>
      saveFilterPreset: (preset: any) => Promise<any>
      updateFilterPreset: (id: number, preset: any) => Promise<{ success: boolean }>
      deleteFilterPreset: (id: number) => Promise<{ success: boolean }>
      recordPresetUsage: (id: number) => Promise<{ success: boolean }>
      togglePresetFavorite: (id: number) => Promise<{ success: boolean }>

      // Authentication & Users
      login: (credentials: any) => Promise<any>
      logout: () => Promise<{ success: boolean }>
      getCurrentUser: () => Promise<any>
      createUser: (user: any) => Promise<any>
      getAllUsers: () => Promise<any[]>
      updateUser: (id: number, updates: any) => Promise<{ success: boolean }>
      deleteUser: (id: number) => Promise<{ success: boolean }>
      changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean }>

      // Attachments
      getAttachments: (assetId: number) => Promise<any[]>
      uploadAttachment: (assetId: number, description?: string) => Promise<any>
      deleteAttachment: (id: number) => Promise<{ success: boolean }>
      openAttachment: (id: number) => Promise<{ success: boolean }>

      // Barcodes
      getBarcodes: (assetId: number) => Promise<any[]>
      generateBarcode: (input: any) => Promise<any>
      deleteBarcode: (id: number) => Promise<{ success: boolean }>
      printBarcode: (id: number) => Promise<{ success: boolean }>
      batchGenerateBarcodes: (assetIds: number[], format: string) => Promise<{
        total: number
        successful: number
        failed: number
        results: any[]
      }>
    }
  }
}

export {}
