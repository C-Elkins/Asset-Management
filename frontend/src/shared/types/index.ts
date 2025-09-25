// Core entity types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  jobTitle?: string;
  phoneNumber?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  assetTag: string;
  description?: string;
  category: Category;
  status: AssetStatus;
  condition: AssetCondition;
  location?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  vendor?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  nextMaintenance?: string;
  notes?: string;
  assignedUsers?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  colorCode?: string;
  sortOrder?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  asset: Asset;
  maintenanceType: string;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  maintenanceDate: string;
  completedDate?: string;
  nextMaintenanceDate?: string;
  performedBy?: string;
  vendor?: string;
  cost?: number;
  downtimeHours?: number;
  partsUsed?: string;
  notes?: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

// Enums
export enum UserRole {
  USER = 'USER',
  IT_ADMIN = 'IT_ADMIN', 
  MANAGER = 'MANAGER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  RETIRED = 'RETIRED',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED'
}

export enum AssetCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  BROKEN = 'BROKEN'
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE'
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

// Form types
export interface LoginForm {
  username: string;
  password: string;
}

export interface AssetForm {
  name: string;
  assetTag: string;
  description?: string;
  categoryId: string;
  status: AssetStatus;
  condition: AssetCondition;
  location?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  vendor?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  notes?: string;
}

export interface CategoryForm {
  name: string;
  description?: string;
  icon?: string;
  colorCode?: string;
  active: boolean;
}

export interface MaintenanceForm {
  assetId: string;
  maintenanceType: string;
  description: string;
  priority: MaintenancePriority;
  maintenanceDate: string;
  performedBy?: string;
  vendor?: string;
  estimatedCost?: number;
  notes?: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface FilterState {
  search?: string;
  category?: string;
  status?: AssetStatus;
  condition?: AssetCondition;
  assignedUser?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TableState {
  filters: FilterState;
  sort: SortState;
  pagination: {
    page: number;
    size: number;
  };
}

// Dashboard types
export interface DashboardStats {
  totalAssets: number;
  availableAssets: number;
  assignedAssets: number;
  maintenanceAssets: number;
  totalUsers: number;
  totalCategories: number;
  upcomingMaintenance: number;
  overdueAssets: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  createdAt: string;
}

// Theme types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  children?: NavItem[];
  requiredRole?: UserRole;
}
