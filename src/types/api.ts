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
  depreciation_method: 'none' | 'straight-line' | 'declining-balance' | 'sum-of-years';
  useful_life_years: number | null;
  salvage_value: number | null;
  depreciation_start_date: string | null;
  disposal_date: string | null;
  disposal_reason: string | null;
  disposal_method: 'sold' | 'donated' | 'recycled' | 'discarded' | 'transferred' | 'returned' | null;
  disposal_value: number | null;
  disposed_by: string | null;
  disposal_notes: string | null;
  parent_asset_id: number | null;
  parent_asset_name?: string;
  parent_asset_tag?: string;
  children_count?: number;
  low_stock_threshold: number;
  critical_stock_threshold: number;
  enable_stock_alerts: number;
  custom_fields: string | null;
  notes: string | null;
  lease_count?: number;
  insurance_count?: number;
  reservation_count?: number;
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
  depreciation_method?: 'none' | 'straight-line' | 'declining-balance' | 'sum-of-years';
  useful_life_years?: number;
  salvage_value?: number;
  depreciation_start_date?: string;
  disposal_date?: string;
  disposal_reason?: string;
  disposal_method?: 'sold' | 'donated' | 'recycled' | 'discarded' | 'transferred' | 'returned';
  disposal_value?: number;
  disposed_by?: string;
  disposal_notes?: string;
  parent_asset_id?: number;
  low_stock_threshold?: number;
  critical_stock_threshold?: number;
  enable_stock_alerts?: number;
  custom_fields?: any;
  notes?: string;
}

export interface AssetFilters {
  categoryId?: number;
  status?: string;
  location?: string;
  searchQuery?: string;
  // Advanced filters
  condition?: string;
  brand?: string;
  model?: string;
  purchaseDateFrom?: string;
  purchaseDateTo?: string;
  priceMin?: number;
  priceMax?: number;
  warrantyExpiring?: boolean;
}

export interface AssetStats {
  total: number;
  available: number;
  assigned: number;
  maintenance: number;
  totalValue?: number;
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

export interface FilterPreset {
  id: number;
  name: string;
  description: string | null;
  filters: string;
  is_favorite: number;
  use_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FilterPresetInput {
  name: string;
  description?: string;
  filters: any;
}

export interface MaintenanceRecord {
  id: number;
  asset_id: number;
  maintenance_type: string;
  description: string;
  performed_by: string | null;
  performed_at: string;
  cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecordInput {
  asset_id: number;
  maintenance_type: string;
  description: string;
  performed_by?: string;
  performed_at?: string;
  cost?: number;
  notes?: string;
}

export interface QRCode {
  qr_code_id: string;
  asset_id: number;
  item_number: number | null;
  qr_data: string;
  is_active: number;
  created_at: string;
  deactivated_at: string | null;
}

export interface QRScanRecord {
  id: number;
  qr_code_id: string;
  scanned_at: string;
  scanned_by: string | null;
  location: string | null;
  notes: string | null;
}

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: 'admin' | 'user';
  is_active: number;
  created_at: string;
  last_login_at: string | null;
  updated_at: string;
}

export interface UserInput {
  username: string;
  password: string;
  full_name: string;
  role?: 'admin' | 'user';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  user: User;
  loggedIn: boolean;
}

export interface Attachment {
  id: number;
  asset_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string | null;
  uploaded_by: string | null;
  description: string | null;
  created_at: string;
}

export interface AttachmentInput {
  asset_id: number;
  file_name: string;
  file_type?: string;
  description?: string;
}

export type BarcodeFormat = 'CODE39' | 'CODE128' | 'EAN13' | 'UPCA' | 'ITF14';

export interface Barcode {
  id: number;
  asset_id: number;
  barcode_value: string;
  barcode_format: BarcodeFormat;
  generated_at: string;
  is_active: number;
}

export interface BarcodeInput {
  asset_id: number;
  barcode_value: string;
  barcode_format: BarcodeFormat;
}

export interface Reservation {
  id: number;
  asset_id: number;
  asset_name?: string;
  asset_tag?: string;
  reserved_by: string;
  reserved_for: string | null;
  reservation_start: string;
  reservation_end: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  purpose: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReservationInput {
  asset_id: number;
  reserved_by: string;
  reserved_for?: string;
  reservation_start: string;
  reservation_end: string;
  status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  purpose?: string;
  notes?: string;
}

export interface Lease {
  id: number;
  asset_id: number;
  asset_name?: string;
  asset_tag?: string;
  contract_number: string | null;
  lease_type: 'operating' | 'finance' | 'rent';
  lessor: string;
  lessee: string;
  start_date: string;
  end_date: string;
  renewal_date: string | null;
  auto_renewal: number;
  monthly_payment: number | null;
  payment_frequency: 'monthly' | 'quarterly' | 'annually' | null;
  next_payment_date: string | null;
  total_value: number | null;
  deposit_amount: number | null;
  status: 'active' | 'expired' | 'cancelled' | 'renewed';
  terms: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaseInput {
  asset_id: number;
  contract_number?: string;
  lease_type: 'operating' | 'finance' | 'rent';
  lessor: string;
  lessee: string;
  start_date: string;
  end_date: string;
  renewal_date?: string;
  auto_renewal?: number;
  monthly_payment?: number;
  payment_frequency?: 'monthly' | 'quarterly' | 'annually';
  next_payment_date?: string;
  total_value?: number;
  deposit_amount?: number;
  status?: 'active' | 'expired' | 'cancelled' | 'renewed';
  terms?: string;
  notes?: string;
}

export interface Location {
  id: number;
  name: string;
  parent_location_id: number | null;
  parent_location_name?: string;
  location_type: 'building' | 'floor' | 'room' | 'area' | 'custom' | null;
  address: string | null;
  description: string | null;
  notes: string | null;
  active: number;
  full_path?: string;
  asset_count?: number;
  created_at: string;
  updated_at: string;
}

export interface LocationInput {
  name: string;
  parent_location_id?: number;
  location_type?: 'building' | 'floor' | 'room' | 'area' | 'custom';
  address?: string;
  description?: string;
  notes?: string;
  active?: number;
}

export interface InsurancePolicy {
  id: number;
  asset_id: number;
  asset_name?: string;
  asset_tag?: string;
  policy_number: string;
  provider: string;
  policy_type: 'property' | 'liability' | 'comprehensive' | 'other' | null;
  coverage_amount: number | null;
  premium_amount: number | null;
  premium_frequency: 'monthly' | 'quarterly' | 'annually' | null;
  start_date: string;
  end_date: string;
  renewal_date: string | null;
  auto_renewal: number;
  deductible: number | null;
  status: 'active' | 'expired' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsurancePolicyInput {
  asset_id: number;
  policy_number: string;
  provider: string;
  policy_type?: 'property' | 'liability' | 'comprehensive' | 'other';
  coverage_amount?: number;
  premium_amount?: number;
  premium_frequency?: 'monthly' | 'quarterly' | 'annually';
  start_date: string;
  end_date: string;
  renewal_date?: string;
  auto_renewal?: number;
  deductible?: number;
  status?: 'active' | 'expired' | 'cancelled';
  notes?: string;
}

export interface StockAlert {
  id: number;
  asset_id: number;
  asset_name?: string;
  asset_tag?: string;
  alert_type: 'low_stock' | 'critical_stock' | 'out_of_stock';
  threshold_value: number | null;
  current_quantity: number | null;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface CheckoutRequest {
  id: number;
  asset_id: number;
  asset_name?: string;
  asset_tag?: string;
  requested_by: string;
  requested_for: string | null;
  checkout_purpose: string | null;
  expected_return_date: string | null;
  quantity: number;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  workflow_id: number | null;
  created_at: string;
  updated_at: string;
  approval_steps?: ApprovalStep[];
  current_step?: number;
  pending_approver?: string;
}

export interface CheckoutRequestInput {
  asset_id: number;
  requested_by: string;
  requested_for?: string;
  checkout_purpose?: string;
  expected_return_date?: string;
  quantity?: number;
  notes?: string;
}

export interface ApprovalStep {
  id: number;
  request_id: number;
  step_order: number;
  approver_name: string;
  approver_role: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  decision_notes: string | null;
  decided_at: string | null;
  created_at: string;
}

export interface ApprovalDecision {
  approve: boolean;
  notes?: string;
}

export interface ApprovalWorkflow {
  id: number;
  name: string;
  description: string | null;
  is_active: number;
  apply_to_all: number;
  category_ids: string | null;
  min_value: number | null;
  max_value: number | null;
  approval_chain: string; // JSON string of approvers array
  auto_approve_conditions: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalWorkflowInput {
  name: string;
  description?: string;
  is_active?: number;
  apply_to_all?: number;
  category_ids?: string;
  min_value?: number;
  max_value?: number;
  approval_chain: string; // JSON string
  auto_approve_conditions?: string;
}

export interface API {
  // Categories
  getCategories: () => Promise<Category[]>;
  getAllCategories: () => Promise<Category[]>;
  createCategory: (category: CategoryInput) => Promise<Category>;
  updateCategory: (id: number, category: Partial<CategoryInput>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  reactivateCategory: (id: number) => Promise<{ success: boolean }>;

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

  // Maintenance
  getMaintenanceRecords: (assetId?: number) => Promise<MaintenanceRecord[]>;
  createMaintenanceRecord: (record: MaintenanceRecordInput) => Promise<MaintenanceRecord>;
  updateMaintenanceRecord: (id: number, record: Partial<MaintenanceRecordInput>) => Promise<void>;
  deleteMaintenanceRecord: (id: number) => Promise<{ success: boolean }>;

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

  // Settings
  getSetting: (key: string) => Promise<any>;
  setSetting: (key: string, value: any) => Promise<void>;

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

  // QR Codes
  generateAssetQRCode: (assetId: number) => Promise<QRCode>;
  generateItemQRCode: (assetId: number, itemNumber: number) => Promise<QRCode>;
  getQRCode: (qrCodeId: string) => Promise<QRCode>;
  getAssetQRCodes: (assetId: number) => Promise<QRCode[]>;
  recordQRScan: (scanData: { qr_code_id: string; scanned_by?: string; location?: string; notes?: string }) => Promise<QRScanRecord>;
  getQRScanHistory: (qrCodeId: string, limit?: number) => Promise<QRScanRecord[]>;
  getRecentScans: (limit?: number) => Promise<QRScanRecord[]>;
  deactivateQRCode: (qrCodeId: string) => Promise<{ success: boolean; qr_code_id: string }>;
  batchGenerateQRCodes: (assetIds: number[]) => Promise<{
    total: number;
    successful: number;
    failed: number;
    results: Array<{ assetId: number; success: boolean; qrCode?: QRCode; error?: string }>;
  }>;

  // Filter Presets
  getFilterPresets: () => Promise<FilterPreset[]>;
  getFilterPreset: (id: number) => Promise<FilterPreset>;
  saveFilterPreset: (preset: FilterPresetInput) => Promise<FilterPreset>;
  updateFilterPreset: (id: number, preset: Partial<FilterPresetInput>) => Promise<{ success: boolean }>;
  deleteFilterPreset: (id: number) => Promise<{ success: boolean }>;
  recordPresetUsage: (id: number) => Promise<{ success: boolean }>;
  togglePresetFavorite: (id: number) => Promise<{ success: boolean }>;

  // Authentication & Users
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  logout: () => Promise<{ success: boolean }>;
  getCurrentUser: () => Promise<User | null>;
  createUser: (user: UserInput) => Promise<User>;
  getAllUsers: () => Promise<User[]>;
  updateUser: (id: number, updates: Partial<UserInput>) => Promise<{ success: boolean }>;
  deleteUser: (id: number) => Promise<{ success: boolean }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean }>;

  // Attachments
  getAttachments: (assetId: number) => Promise<Attachment[]>;
  uploadAttachment: (assetId: number, description?: string) => Promise<Attachment>;
  deleteAttachment: (id: number) => Promise<{ success: boolean }>;
  openAttachment: (id: number) => Promise<{ success: boolean }>;

  // Barcodes
  getBarcodes: (assetId: number) => Promise<Barcode[]>;
  generateBarcode: (input: BarcodeInput) => Promise<Barcode>;
  deleteBarcode: (id: number) => Promise<{ success: boolean }>;
  printBarcode: (id: number) => Promise<{ success: boolean }>;
  batchGenerateBarcodes: (assetIds: number[], format: BarcodeFormat) => Promise<{
    total: number;
    successful: number;
    failed: number;
    results: Array<{ assetId: number; success: boolean; barcode?: Barcode; error?: string }>;
  }>;

  // Reservations
  getReservations: (filters?: { assetId?: number; status?: string }) => Promise<Reservation[]>;
  getReservation: (id: number) => Promise<Reservation>;
  createReservation: (reservation: ReservationInput) => Promise<Reservation>;
  updateReservation: (id: number, updates: Partial<ReservationInput>) => Promise<{ success: boolean }>;
  cancelReservation: (id: number) => Promise<{ success: boolean }>;
  deleteReservation: (id: number) => Promise<{ success: boolean }>;
  checkReservationConflicts: (assetId: number, start: string, end: string, excludeId?: number) => Promise<{ hasConflict: boolean; conflicts: Reservation[] }>;

  // Leases
  getLeases: (filters?: { assetId?: number; status?: string }) => Promise<Lease[]>;
  getLease: (id: number) => Promise<Lease>;
  createLease: (lease: LeaseInput) => Promise<Lease>;
  updateLease: (id: number, updates: Partial<LeaseInput>) => Promise<{ success: boolean }>;
  cancelLease: (id: number) => Promise<{ success: boolean }>;
  renewLease: (id: number, newEndDate: string) => Promise<{ success: boolean }>;
  deleteLease: (id: number) => Promise<{ success: boolean }>;

  // Parent-Child Asset Relationships
  getChildAssets: (parentId: number) => Promise<Asset[]>;
  setParentAsset: (assetId: number, parentId: number | null) => Promise<{ success: boolean }>;

  // Locations
  getLocations: () => Promise<Location[]>;
  getLocation: (id: number) => Promise<Location>;
  createLocation: (location: LocationInput) => Promise<Location>;
  updateLocation: (id: number, updates: Partial<LocationInput>) => Promise<{ success: boolean }>;
  deleteLocation: (id: number) => Promise<{ success: boolean }>;
  getLocationHierarchy: () => Promise<Location[]>;

  // Insurance Policies
  getInsurancePolicies: (filters?: { assetId?: number; status?: string }) => Promise<InsurancePolicy[]>;
  getInsurancePolicy: (id: number) => Promise<InsurancePolicy>;
  createInsurancePolicy: (policy: InsurancePolicyInput) => Promise<InsurancePolicy>;
  updateInsurancePolicy: (id: number, updates: Partial<InsurancePolicyInput>) => Promise<{ success: boolean }>;
  deleteInsurancePolicy: (id: number) => Promise<{ success: boolean }>;
  getExpiringPolicies: (days: number) => Promise<InsurancePolicy[]>;

  // Stock Alerts
  getStockAlerts: (filters?: { status?: string; alertType?: string }) => Promise<StockAlert[]>;
  acknowledgeAlert: (id: number, acknowledgedBy: string) => Promise<{ success: boolean }>;
  resolveAlert: (id: number) => Promise<{ success: boolean }>;
  checkStockLevels: () => Promise<{ newAlerts: number; alerts: StockAlert[] }>;

  // Checkout Approval Workflows
  getCheckoutRequests: (filters?: { status?: string; requestedBy?: string; approverId?: string }) => Promise<CheckoutRequest[]>;
  getCheckoutRequest: (id: number) => Promise<CheckoutRequest>;
  createCheckoutRequest: (request: CheckoutRequestInput) => Promise<CheckoutRequest>;
  approveCheckoutRequest: (requestId: number, decision: ApprovalDecision, approverName: string) => Promise<{ success: boolean; message: string }>;
  rejectCheckoutRequest: (requestId: number, decision: ApprovalDecision, approverName: string) => Promise<{ success: boolean; message: string }>;
  cancelCheckoutRequest: (requestId: number) => Promise<{ success: boolean }>;
  getPendingApprovalsFor: (approverName: string) => Promise<CheckoutRequest[]>;

  // Approval Workflows Management
  getApprovalWorkflows: () => Promise<ApprovalWorkflow[]>;
  getActiveWorkflow: (assetId: number) => Promise<ApprovalWorkflow | null>;
  createApprovalWorkflow: (workflow: ApprovalWorkflowInput) => Promise<ApprovalWorkflow>;
  updateApprovalWorkflow: (id: number, workflow: Partial<ApprovalWorkflowInput>) => Promise<{ success: boolean }>;
  deleteApprovalWorkflow: (id: number) => Promise<{ success: boolean }>;
  toggleWorkflowActive: (id: number) => Promise<{ success: boolean }>;
}

declare global {
  interface Window {
    api: API;
  }
}

export {};
