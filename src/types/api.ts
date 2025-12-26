// Type definitions for the IPC API exposed to the renderer process

export interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  color_code: string | null;
  category_type: string;
  custom_field_definitions: string | null;
  active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryInput {
  name: string;
  description?: string;
  icon?: string;
  color_code?: string;
  category_type?: string;
  sort_order?: number;
  custom_field_definitions?: any;
}

export interface UserCategoryPreference {
  id: number;
  category_id: number;
  is_selected: number;
  is_favorite: number;
  custom_order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithPreference extends Category {
  is_selected?: number;
  is_favorite?: number;
  custom_order?: number;
}

export type CategoryViewMode = 'selected' | 'all' | 'favorites';

export interface Asset {
  id: number;
  asset_tag: string;
  name: string;
  description: string | null;
  category_id: number;
  category_name?: string;
  category_color?: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  vendor: string | null;
  location: string | null;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  warranty_expiry: string | null;
  next_maintenance: string | null;
  is_tracked_inventory: number;
  total_quantity: number;
  available_quantity: number;
  custom_fields: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetInput {
  asset_tag: string;
  name: string;
  description?: string;
  category_id: number;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_price?: number;
  purchase_date?: string;
  vendor?: string;
  location?: string;
  status?: 'available' | 'assigned' | 'maintenance' | 'retired';
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  warranty_expiry?: string;
  next_maintenance?: string;
  is_tracked_inventory?: number;
  total_quantity?: number;
  available_quantity?: number;
  custom_fields?: any;
  notes?: string;
}

export interface AssetFilters {
  categoryId?: number;
  status?: string;
  location?: string;
  searchQuery?: string;
}

export interface AssetStats {
  total: number;
  available: number;
  assigned: number;
  maintenance: number;
}

export interface CustomFieldDefinition {
  id: number;
  category_id: number;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'textarea';
  required: number;
  options: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CustomFieldInput {
  category_id: number;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'textarea';
  required?: number;
  options?: string;
  sort_order?: number;
}

export interface InventoryItem {
  id: number;
  asset_id: number;
  item_number: number;
  unique_identifier: string;
  serial_number: string | null;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  current_assignment_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: number;
  asset_id: number;
  inventory_item_id: number | null;
  quantity: number;
  assigned_to: string;
  assigned_by: string | null;
  location: string | null;
  checked_out_at: string;
  expected_return_at: string | null;
  checked_in_at: string | null;
  status: 'active' | 'returned' | 'overdue';
  checkout_notes: string | null;
  checkin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssignmentInput {
  asset_id: number;
  inventory_item_id?: number;
  quantity?: number;
  assigned_to: string;
  assigned_by?: string;
  location?: string;
  expected_return_at?: string;
  checkout_notes?: string;
}

export interface ActivityLog {
  id: number;
  activity_type: 'create' | 'update' | 'delete' | 'checkout' | 'checkin';
  entity_type: 'asset' | 'category' | 'assignment' | 'inventory_item';
  entity_id: number;
  entity_name: string | null;
  description: string;
  user_name: string | null;
  metadata: string | null;
  created_at: string;
}

export interface InventoryTransaction {
  id: number;
  transaction_type: 'receive' | 'checkout' | 'checkin' | 'adjustment' | 'writeoff';
  asset_id: number;
  asset_name?: string;
  asset_tag?: string;
  inventory_item_id: number | null;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reason: string | null;
  purpose: string | null;
  supplier_vendor: string | null;
  po_number: string | null;
  invoice_number: string | null;
  unit_cost: number | null;
  performed_by: string;
  authorized_by: string | null;
  condition_on_return: string | null;
  notes: string | null;
  metadata: string | null;
  created_at: string;
}

export interface InventoryTransactionInput {
  transaction_type: 'receive' | 'checkout' | 'checkin' | 'adjustment' | 'writeoff';
  asset_id: number;
  inventory_item_id?: number;
  quantity_change: number;
  reason?: string;
  purpose?: string;
  supplier_vendor?: string;
  po_number?: string;
  invoice_number?: string;
  unit_cost?: number;
  performed_by: string;
  authorized_by?: string;
  condition_on_return?: string;
  notes?: string;
}

export interface BusinessProfile {
  id: number;
  company_name: string | null;
  business_type: string | null;
  logo_path: string | null;
  default_location: string | null;
  setup_completed: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfileInput {
  company_name?: string;
  business_type?: string;
  logo_path?: string;
  default_location?: string;
  setup_completed?: number;
}

export interface API {
  // Categories
  getCategories: () => Promise<Category[]>;
  createCategory: (category: CategoryInput) => Promise<Category>;
  updateCategory: (id: number, category: Partial<CategoryInput>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  // Category Preferences
  getUserCategoryPreferences: () => Promise<UserCategoryPreference[]>;
  getCategoriesWithPreferences: () => Promise<CategoryWithPreference[]>;
  updateCategoryPreference: (categoryId: number, updates: Partial<UserCategoryPreference>) => Promise<UserCategoryPreference>;
  bulkUpdateCategoryPreferences: (preferences: Array<{ category_id: number; is_selected: number }>) => Promise<{ success: boolean; count: number }>;
  getCategoryViewMode: () => Promise<CategoryViewMode>;
  setCategoryViewMode: (mode: CategoryViewMode) => Promise<{ success: boolean; mode: CategoryViewMode }>;

  // Custom Field Definitions
  getCustomFields: (categoryId: number) => Promise<CustomFieldDefinition[]>;
  createCustomField: (field: CustomFieldInput) => Promise<CustomFieldDefinition>;
  updateCustomField: (id: number, field: Partial<CustomFieldInput>) => Promise<void>;
  deleteCustomField: (id: number) => Promise<void>;

  // Assets
  getAssets: (filters?: AssetFilters) => Promise<Asset[]>;
  getAssetsPaginated: (filters?: AssetFilters, pagination?: {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => Promise<{
    data: Asset[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }>;
  getAsset: (id: number) => Promise<Asset>;
  createAsset: (asset: AssetInput) => Promise<Asset>;
  updateAsset: (id: number, asset: Partial<AssetInput>) => Promise<Asset>;
  deleteAsset: (id: number) => Promise<void>;
  bulkDeleteAssets: (ids: number[]) => Promise<{ success: boolean; count: number }>;
  getAssetStats: () => Promise<AssetStats>;
  getLocations: () => Promise<{ location: string }[]>;

  // Inventory Items
  getInventoryItems: (assetId: number) => Promise<InventoryItem[]>;
  createInventoryItems: (assetId: number, quantity: number) => Promise<InventoryItem[]>;
  updateInventoryItem: (id: number, updates: Partial<InventoryItem>) => Promise<void>;

  // Assignments
  getAssignments: (filters?: { assetId?: number; status?: string }) => Promise<Assignment[]>;
  createAssignment: (assignment: AssignmentInput) => Promise<Assignment>;
  checkInAsset: (assignmentId: number, notes?: string) => Promise<void>;

  // Activity Log
  getRecentActivity: (limit?: number) => Promise<ActivityLog[]>;
  logActivity: (activity: Omit<ActivityLog, 'id' | 'created_at'>) => Promise<void>;

  // Inventory Transactions
  getInventoryTransactions: (filters?: { assetId?: number; transactionType?: string }) => Promise<InventoryTransaction[]>;
  createInventoryTransaction: (transaction: InventoryTransactionInput) => Promise<InventoryTransaction>;

  // Business Profile
  getBusinessProfile: () => Promise<BusinessProfile>;
  updateBusinessProfile: (profile: BusinessProfileInput) => Promise<void>;

  // Database Optimization
  optimizeDatabase: () => Promise<{ success: boolean; message: string; sizeMB?: number }>;
  getDatabaseStats: () => Promise<{
    success: boolean;
    stats?: {
      databaseSizeMB: string;
      totalAssets: number;
      ftsRecords: number;
      totalIndexes: number;
    };
  }>;
}

declare global {
  interface Window {
    api: API;
  }
}

export {};
