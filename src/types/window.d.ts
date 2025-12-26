declare global {
  interface Window {
    api: {
      // Categories
      getCategories: () => Promise<any[]>
      createCategory: (category: any) => Promise<any>
      updateCategory: (id: number, category: any) => Promise<any>
      deleteCategory: (id: number) => Promise<{ success: boolean }>

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
    }
  }
}

export {}
