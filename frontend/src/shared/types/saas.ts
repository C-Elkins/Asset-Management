// Advanced SaaS-specific types for IT Asset Management
import type { User, AssetStatus, AssetCondition } from './index'; // Import needed types

// Missing type definitions that are referenced elsewhere
export interface MaintenanceTemplate {
  id: string;
  name: string;
  description?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  tasks: string[];
  active: boolean;
}

export interface DepreciationInfo {
  method: 'STRAIGHT_LINE' | 'DECLINING_BALANCE';
  currentValue: number;
  depreciationRate: number;
  salvageValue: number;
}

export interface AssetImage {
  id: string;
  url: string;
  filename: string;
  description?: string;
  isPrimary: boolean;
}

export interface AssetDocument {
  id: string;
  filename: string;
  type: string;
  url: string;
  description?: string;
  uploadedAt: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  steps: string[];
  active: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  query: string;
  parameters: Record<string, any>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: any[];
  layout: any;
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
}

export interface ReportSchedule {
  frequency: string;
  recipients: string[];
  enabled: boolean;
}

export interface ReportJoin {
  table: string;
  condition: string;
}

export interface ReportField {
  name: string;
  alias?: string;
  aggregation?: string;
}

export interface ReportOrder {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface MonthlyMetric {
  month: string;
  value: number;
}

export interface TrendData {
  period: string;
  value: number;
}

export interface RiskPrediction {
  assetId: string;
  riskScore: number;
  factors: string[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Core SaaS Platform Types
export interface Organization {
  id: string;
  name: string;
  domain: string;
  industry: IndustryType;
  branding: BrandingConfig;
  subscription: SubscriptionTier;
  customAssetTypes: CustomAssetType[];
  aiSettings: AIConfiguration;
  users: OrganizationUser[];
  createdAt: string;
  updatedAt: string;
}

export interface BrandingConfig {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
  customDomain?: string;
  companyName: string;
  theme: 'light' | 'dark' | 'auto';
}

export enum IndustryType {
  IT = 'IT',
  HEALTHCARE = 'HEALTHCARE',
  MANUFACTURING = 'MANUFACTURING',
  FLEET = 'FLEET',
  REAL_ESTATE = 'REAL_ESTATE',
  EDUCATION = 'EDUCATION',
  CONSTRUCTION = 'CONSTRUCTION',
  ART_MUSEUM = 'ART_MUSEUM',
  RETAIL = 'RETAIL',
  CUSTOM = 'CUSTOM'
}

export enum SubscriptionTier {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
  CUSTOM = 'CUSTOM'
}

// Flexible Asset System
export interface CustomAssetType {
  id: string;
  name: string;
  description?: string;
  icon: string;
  colorCode: string;
  customFields: CustomField[];
  aiCategorizationRules: AICategorizationRule[];
  maintenanceTemplates: MaintenanceTemplate[];
  workflowRules: WorkflowRule[];
  active: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For dropdown/radio fields
  validation?: FieldValidation;
  aiEnhanced?: boolean; // AI can auto-fill this field
  showInList?: boolean;
  sortOrder: number;
}

export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  DROPDOWN = 'DROPDOWN',
  MULTISELECT = 'MULTISELECT',
  FILE = 'FILE',
  IMAGE = 'IMAGE',
  CURRENCY = 'CURRENCY',
  PERCENTAGE = 'PERCENTAGE',
  URL = 'URL',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  ADDRESS = 'ADDRESS',
  RICH_TEXT = 'RICH_TEXT',
  JSON = 'JSON'
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  errorMessage?: string;
}

// Universal Asset Entity
export interface UniversalAsset {
  id: string;
  assetTypeId: string;
  organizationId: string;
  
  // Core fields (always present)
  name: string;
  assetTag: string;
  description?: string;
  status: AssetStatus;
  condition: AssetCondition;
  location?: string;
  
  // Dynamic custom fields
  customData: Record<string, any>;
  
  // AI-generated fields
  aiInsights?: AIInsights;
  
  // Relationships
  assignedUsers?: string[];
  parentAssetId?: string;
  childAssets?: string[];
  
  // Audit trail
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  
  // Maintenance
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceHistory: string[]; // IDs of maintenance records
  
  // Financial
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  depreciation?: DepreciationInfo;
  
  // Images and documents
  images: AssetImage[];
  documents: AssetDocument[];
  
  // AI-powered features
  riskScore?: number;
  predictedFailureDate?: string;
  optimizationSuggestions?: string[];
}

// AI Integration Types
export interface AIConfiguration {
  enabled: boolean;
  features: {
    smartCategorization: boolean;
    predictiveMaintenance: boolean;
    costOptimization: boolean;
    anomalyDetection: boolean;
    naturalLanguageSearch: boolean;
    photoRecognition: boolean;
  };
  confidenceThreshold: number;
  autoApproveAIChanges: boolean;
}

export interface AIInsights {
  category: string;
  confidence: number;
  suggestedFields: Record<string, any>;
  riskFactors: string[];
  maintenanceRecommendations: string[];
  costOptimizations: string[];
  lastAnalyzed: string;
}

export interface AICategorizationRule {
  id: string;
  name: string;
  description: string;
  conditions: AICondition[];
  actions: AIAction[];
  confidence: number;
  enabled: boolean;
}

export interface AICondition {
  field: string;
  operator: 'contains' | 'equals' | 'greater_than' | 'less_than' | 'regex';
  value: string | number;
}

export interface AIAction {
  type: 'set_field' | 'add_tag' | 'trigger_workflow' | 'send_notification';
  field?: string;
  value?: any;
  message?: string;
}

// Industry-Specific Templates
export interface IndustryTemplate {
  id: string;
  name: string;
  industry: IndustryType;
  description: string;
  assetTypes: CustomAssetType[];
  workflows: WorkflowTemplate[];
  reports: ReportTemplate[];
  dashboardLayouts: DashboardLayout[];
  aiRules: AICategorizationRule[];
}

// Workflow System
export interface WorkflowRule {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  enabled: boolean;
}

export interface WorkflowTrigger {
  event: 'asset_created' | 'asset_updated' | 'maintenance_due' | 'custom_field_changed';
  fieldName?: string;
}

export interface WorkflowCondition {
  field: string;
  operator: string;
  value: any;
}

export interface WorkflowAction {
  type: 'send_email' | 'create_task' | 'update_field' | 'trigger_ai_analysis';
  config: Record<string, any>;
}

// Enhanced User System
export interface OrganizationUser extends User {
  organizationId: string;
  permissions: Permission[];
  customRoles: CustomRole[];
  assetAccess: AssetAccessRule[];
}

export interface Permission {
  resource: string; // 'assets', 'users', 'reports', etc.
  actions: string[]; // ['read', 'write', 'delete', 'admin']
  conditions?: Record<string, any>; // Asset type restrictions, etc.
}

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
}

export interface AssetAccessRule {
  assetTypeId?: string;
  locationPattern?: string;
  customFieldRestrictions?: Record<string, any>;
}

// Reporting System
export interface CustomReport {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  reportType: 'table' | 'chart' | 'dashboard' | 'export';
  dataSource: ReportDataSource;
  visualization: ReportVisualization;
  filters: ReportFilter[];
  scheduling?: ReportSchedule;
  recipients?: string[];
  aiGenerated?: boolean;
}

export interface ReportDataSource {
  entities: string[]; // 'assets', 'maintenance', 'users'
  joins: ReportJoin[];
  fields: ReportField[];
  groupBy?: string[];
  orderBy?: ReportOrder[];
}

export interface ReportVisualization {
  type: 'table' | 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap';
  settings: Record<string, any>;
}

// API Integration Types
export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'import' | 'export';
  endpoint?: string;
  authentication: IntegrationAuth;
  mapping: FieldMapping[];
  schedule?: string; // Cron expression
  enabled: boolean;
}

export interface IntegrationAuth {
  type: 'none' | 'api_key' | 'oauth2' | 'basic_auth';
  credentials: Record<string, string>;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
}

// Analytics and Insights
export interface AssetAnalytics {
  organizationId: string;
  totalAssets: number;
  assetsByType: Record<string, number>;
  assetsByStatus: Record<string, number>;
  assetsByLocation: Record<string, number>;
  totalValue: number;
  averageAge: number;
  maintenanceCosts: MonthlyMetric[];
  utilizationRate: number;
  costPerAsset: number;
  riskMetrics: RiskMetrics;
  trends: TrendData[];
  predictions: PredictionData[];
  lastUpdated: string;
}

export interface RiskMetrics {
  highRiskAssets: number;
  averageRiskScore: number;
  riskByCategory: Record<string, number>;
  upcomingRisks: RiskPrediction[];
}

export interface PredictionData {
  type: 'maintenance' | 'failure' | 'cost' | 'replacement';
  assetId: string;
  prediction: any;
  confidence: number;
  timeframe: string;
}

// Multi-tenant API responses
export interface TenantApiResponse<T> {
  data: T;
  organizationId: string;
  pagination?: PaginationMeta;
  analytics?: Partial<AssetAnalytics>;
  aiInsights?: string[];
}

// Previous types from the original system (keeping for backward compatibility)
export type { User, Asset, Category, MaintenanceRecord } from './index';
