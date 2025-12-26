export interface Category {
  id: number
  name: string
  description?: string
  icon: string
  color_code: string
  category_type: string
  custom_field_definitions?: string
  active: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Asset {
  id: number
  asset_tag: string
  name: string
  description?: string
  category_id: number
  brand?: string
  model?: string
  serial_number?: string
  purchase_price?: number
  purchase_date?: string
  vendor?: string
  location?: string
  status: string
  condition: string
  warranty_expiry?: string
  next_maintenance?: string
  custom_fields?: string
  notes?: string
  created_at: string
  updated_at: string
}

declare global {
  interface Window {
    api: {
      getCategories: () => Promise<Category[]>
      createCategory: (category: Partial<Category>) => Promise<Category>
      updateCategory: (id: number, category: Partial<Category>) => Promise<Category>
      deleteCategory: (id: number) => Promise<{ success: boolean }>

      getAssets: (filters?: any) => Promise<Asset[]>
      getAssetsPaginated: (filters?: any, pagination?: any) => Promise<{
        data: Asset[]
        pagination: {
          page: number
          pageSize: number
          totalItems: number
          totalPages: number
          hasNext: boolean
          hasPrevious: boolean
        }
      }>
      getAssetById: (id: number) => Promise<Asset>
      createAsset: (asset: Partial<Asset>) => Promise<Asset>
      updateAsset: (id: number, asset: Partial<Asset>) => Promise<Asset>
      deleteAsset: (id: number) => Promise<{ success: boolean }>

      getMaintenanceRecords: (assetId?: number) => Promise<any[]>
      createMaintenanceRecord: (record: any) => Promise<any>
      updateMaintenanceRecord: (id: number, record: any) => Promise<any>
      deleteMaintenanceRecord: (id: number) => Promise<{ success: boolean }>

      getAssignments: (filters?: any) => Promise<any[]>
      createAssignment: (assignment: any) => Promise<any>
      checkInAsset: (assignmentId: number, notes?: string) => Promise<any>

      getSetting: (key: string) => Promise<any>
      setSetting: (key: string, value: any) => Promise<any>

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
