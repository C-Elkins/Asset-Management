// Enhanced Local Database with Dexie (IndexedDB) - Advanced Features
import Dexie, { Table, Transaction } from 'dexie';

// Database Interfaces
export interface Asset {
  id?: number;
  name: string;
  assetTag: string;
  category: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'IN_MAINTENANCE' | 'RETIRED';
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  assignedTo?: string;
  location?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  description?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface User {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  jobTitle?: string;
  phone?: string;
  role: 'USER' | 'MANAGER' | 'SUPER_ADMIN';
  active: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface MaintenanceRecord {
  id?: number;
  assetId: number;
  maintenanceDate: string;
  maintenanceType: string;
  description: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  performedBy?: string;
  cost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface AuditLog {
  id?: number;
  entityType: 'asset' | 'user' | 'maintenance' | 'category';
  entityId: number;
  action: 'create' | 'update' | 'delete';
  changes: Record<string, { old: any; new: any }>;
  userId?: number;
  timestamp: string;
}

// Advanced database operations interface
export interface BulkOperationResult<T> {
  inserted: T[];
  updated: T[];
  errors: Array<{ item: T; error: string }>;
}

// Database Class
export class AssetDatabase extends Dexie {
  assets!: Table<Asset>;
  users!: Table<User>;
  maintenanceRecords!: Table<MaintenanceRecord>;
  categories!: Table<Category>;
  auditLogs!: Table<AuditLog>;

  constructor() {
    super('AssetManagementDB');
    
    // Version 1: Initial schema
    this.version(1).stores({
      assets: '++id, name, assetTag, category, status, condition, assignedTo, location, createdAt, syncStatus',
      users: '++id, username, email, role, department, active, createdAt, syncStatus',
      maintenanceRecords: '++id, assetId, maintenanceDate, status, priority, createdAt, syncStatus',
      categories: '++id, name, active, createdAt, syncStatus'
    });

    // Version 2: Add full-text search indices
    this.version(2).stores({
      assets: '++id, name, assetTag, category, status, condition, assignedTo, location, createdAt, syncStatus, [name+assetTag], [category+status]',
      users: '++id, username, email, role, department, active, createdAt, syncStatus, [firstName+lastName]',
      maintenanceRecords: '++id, assetId, maintenanceDate, status, priority, createdAt, syncStatus, [assetId+status]',
      categories: '++id, name, active, createdAt, syncStatus'
    }).upgrade(async (trans) => {
      console.log('Upgrading database to version 2...');
      // Add any data migration logic here
      const assetsTable = (trans as any).table('assets');
      return await assetsTable.toCollection().modify((asset: any) => {
        if (!asset.updatedAt) {
          asset.updatedAt = asset.createdAt;
        }
      });
    });

    // Version 3: Add audit log table
    this.version(3).stores({
      assets: '++id, name, assetTag, category, status, condition, assignedTo, location, createdAt, syncStatus, [name+assetTag], [category+status]',
      users: '++id, username, email, role, department, active, createdAt, syncStatus, [firstName+lastName]',
      maintenanceRecords: '++id, assetId, maintenanceDate, status, priority, createdAt, syncStatus, [assetId+status]',
      categories: '++id, name, active, createdAt, syncStatus',
      auditLogs: '++id, entityType, entityId, action, changes, userId, timestamp'
    });

    // Auto-populate timestamps
    this.assets.hook('creating', function (_primKey: any, obj: any, _trans: any) {
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
      obj.syncStatus = 'pending';
    });

    this.assets.hook('updating', function (modifications: any) {
      modifications.updatedAt = new Date().toISOString();
      modifications.syncStatus = 'pending';
    });

    this.users.hook('creating', function (_primKey: any, obj: any, _trans: any) {
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
      obj.syncStatus = 'pending';
    });

    this.users.hook('updating', function (modifications: any) {
      modifications.updatedAt = new Date().toISOString();
      modifications.syncStatus = 'pending';
    });

    this.maintenanceRecords.hook('creating', function (_primKey: any, obj: any, _trans: any) {
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
      obj.syncStatus = 'pending';
    });

    this.maintenanceRecords.hook('updating', function (modifications: any) {
      modifications.updatedAt = new Date().toISOString();
      modifications.syncStatus = 'pending';
    });

    this.categories.hook('creating', function (_primKey: any, obj: any, _trans: any) {
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
      obj.syncStatus = 'pending';
    });

    this.categories.hook('updating', function (modifications: any) {
      modifications.updatedAt = new Date().toISOString();
      modifications.syncStatus = 'pending';
    });
  }
}

// Create database instance
export const db = new AssetDatabase();

// Database Service Functions
export class DatabaseService {
  
  // Asset Operations
  static async createAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>): Promise<number> {
    return await db.assets.add(asset as Asset);
  }

  static async getAsset(id: number): Promise<Asset | undefined> {
    return await db.assets.get(id);
  }

  static async updateAsset(id: number, changes: Partial<Asset>): Promise<number> {
    return await db.assets.update(id, changes);
  }

  static async deleteAsset(id: number): Promise<void> {
    await db.assets.delete(id);
    // Also delete associated maintenance records
    await db.maintenanceRecords.where('assetId').equals(id).delete();
  }

  static async getAllAssets(): Promise<Asset[]> {
    return await db.assets.orderBy('name').toArray();
  }

  static async searchAssets(query: string): Promise<Asset[]> {
    const normalizedQuery = query.toLowerCase();
    return await db.assets
      .filter(asset => 
        asset.name.toLowerCase().includes(normalizedQuery) ||
        asset.assetTag.toLowerCase().includes(normalizedQuery) ||
        asset.category.toLowerCase().includes(normalizedQuery) ||
        (asset.brand?.toLowerCase().includes(normalizedQuery) ?? false) ||
        (asset.model?.toLowerCase().includes(normalizedQuery) ?? false) ||
        (asset.serialNumber?.toLowerCase().includes(normalizedQuery) ?? false) ||
        (asset.description?.toLowerCase().includes(normalizedQuery) ?? false)
      )
      .toArray();
  }

  static async getAssetsByStatus(status: Asset['status']): Promise<Asset[]> {
    return await db.assets.where('status').equals(status).toArray();
  }

  static async getAssetsByCategory(category: string): Promise<Asset[]> {
    return await db.assets.where('category').equals(category).toArray();
  }

  // User Operations
  static async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>): Promise<number> {
    return await db.users.add(user as User);
  }

  static async getUser(id: number): Promise<User | undefined> {
    return await db.users.get(id);
  }

  static async getUserByUsername(username: string): Promise<User | undefined> {
    return await db.users.where('username').equals(username).first();
  }

  static async updateUser(id: number, changes: Partial<User>): Promise<number> {
    return await db.users.update(id, changes);
  }

  static async getAllUsers(): Promise<User[]> {
    return await db.users.orderBy('lastName').toArray();
  }

  static async getActiveUsers(): Promise<User[]> {
    return await db.users.filter(user => user.active === true).toArray();
  }

  // Maintenance Record Operations
  static async createMaintenanceRecord(record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>): Promise<number> {
    return await db.maintenanceRecords.add(record as MaintenanceRecord);
  }

  static async getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined> {
    return await db.maintenanceRecords.get(id);
  }

  static async updateMaintenanceRecord(id: number, changes: Partial<MaintenanceRecord>): Promise<number> {
    return await db.maintenanceRecords.update(id, changes);
  }

  static async getMaintenanceRecordsForAsset(assetId: number): Promise<MaintenanceRecord[]> {
    return await db.maintenanceRecords.where('assetId').equals(assetId).reverse().toArray();
  }

  static async getUpcomingMaintenance(days: number = 30): Promise<MaintenanceRecord[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return await db.maintenanceRecords
      .where('status').equals('SCHEDULED')
      .and(record => new Date(record.maintenanceDate) <= futureDate)
      .sortBy('maintenanceDate');
  }

  // Category Operations
  static async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>): Promise<number> {
    return await db.categories.add(category as Category);
  }

  static async getCategory(id: number): Promise<Category | undefined> {
    return await db.categories.get(id);
  }

  static async updateCategory(id: number, changes: Partial<Category>): Promise<number> {
    return await db.categories.update(id, changes);
  }

  static async getAllCategories(): Promise<Category[]> {
    return await db.categories.filter(category => category.active === true).toArray();
  }

  // Sync Operations
  static async getPendingSyncItems(): Promise<{
    assets: Asset[];
    users: User[];
    maintenanceRecords: MaintenanceRecord[];
    categories: Category[];
  }> {
    const [assets, users, maintenanceRecords, categories] = await Promise.all([
      db.assets.where('syncStatus').equals('pending').toArray(),
      db.users.where('syncStatus').equals('pending').toArray(),
      db.maintenanceRecords.where('syncStatus').equals('pending').toArray(),
      db.categories.where('syncStatus').equals('pending').toArray()
    ]);

    return { assets, users, maintenanceRecords, categories };
  }

  static async markAsSynced(table: 'assets' | 'users' | 'maintenanceRecords' | 'categories', id: number): Promise<void> {
    await db[table].update(id, { syncStatus: 'synced' });
  }

  // Statistics
  static async getStatistics(): Promise<{
    totalAssets: number;
    assetsByStatus: Record<string, number>;
    assetsByCategory: Record<string, number>;
    upcomingMaintenance: number;
  }> {
    const assets = await db.assets.toArray();
    const upcomingMaintenance = await this.getUpcomingMaintenance();

    const assetsByStatus = assets.reduce((acc, asset) => {
      acc[asset.status] = (acc[asset.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const assetsByCategory = assets.reduce((acc, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAssets: assets.length,
      assetsByStatus,
      assetsByCategory,
      upcomingMaintenance: upcomingMaintenance.length
    };
  }

  // Advanced Bulk Operations
  static async bulkCreateAssets(assets: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>[]): Promise<BulkOperationResult<Asset>> {
    const result: BulkOperationResult<Asset> = {
      inserted: [],
      updated: [],
      errors: []
    };

    try {
      const ids = await db.assets.bulkAdd(assets as Asset[], { allKeys: true });
      result.inserted = assets.map((asset, index) => ({
        ...asset,
        id: ids[index] as number,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending' as const
      }));
    } catch (error) {
      result.errors = assets.map(asset => ({ 
        item: asset as Asset, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }

    return result;
  }

  static async bulkUpdateAssets(updates: Array<{ id: number; changes: Partial<Asset> }>): Promise<BulkOperationResult<Asset>> {
    const result: BulkOperationResult<Asset> = {
      inserted: [],
      updated: [],
      errors: []
    };

    for (const update of updates) {
      try {
        await db.assets.update(update.id, update.changes);
        const updatedAsset = await db.assets.get(update.id);
        if (updatedAsset) {
          result.updated.push(updatedAsset);
        }
      } catch (error) {
        result.errors.push({
          item: { id: update.id, ...update.changes } as Asset,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return result;
  }

  // Transaction-based operations
  static async transferAsset(assetId: number, fromUser: string, toUser: string, notes?: string): Promise<void> {
    await db.transaction('rw', db.assets, db.maintenanceRecords, db.auditLogs, async () => {
      const asset = await db.assets.get(assetId);
      if (!asset) {
        throw new Error('Asset not found');
      }

      const oldAssignedTo = asset.assignedTo;
      
      // Update asset assignment
      await db.assets.update(assetId, {
        assignedTo: toUser,
        status: toUser ? 'ASSIGNED' : 'AVAILABLE'
      });

      // Create audit log
      await db.auditLogs.add({
        entityType: 'asset',
        entityId: assetId,
        action: 'update',
        changes: {
          assignedTo: { old: oldAssignedTo, new: toUser }
        },
        timestamp: new Date().toISOString()
      });

      // Create maintenance record for transfer
      if (notes || fromUser !== toUser) {
        await db.maintenanceRecords.add({
          assetId: assetId,
          maintenanceDate: new Date().toISOString(),
          maintenanceType: 'Transfer',
          description: `Asset transferred from ${fromUser || 'unassigned'} to ${toUser || 'unassigned'}`,
          status: 'COMPLETED',
          priority: 'LOW',
          notes: notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncStatus: 'pending'
        });
      }
    });
  }

  // Data Export/Import
  static async exportData(): Promise<{
    assets: Asset[];
    users: User[];
    categories: Category[];
    maintenanceRecords: MaintenanceRecord[];
    auditLogs: AuditLog[];
    exportedAt: string;
  }> {
    const [assets, users, categories, maintenanceRecords, auditLogs] = await Promise.all([
      db.assets.toArray(),
      db.users.toArray(), 
      db.categories.toArray(),
      db.maintenanceRecords.toArray(),
      db.auditLogs.toArray()
    ]);

    return {
      assets,
      users,
      categories,
      maintenanceRecords,
      auditLogs,
      exportedAt: new Date().toISOString()
    };
  }

  static async importData(data: {
    assets?: Asset[];
    users?: User[];
    categories?: Category[];
    maintenanceRecords?: MaintenanceRecord[];
  }, options: { clearExisting?: boolean; skipDuplicates?: boolean } = {}): Promise<{
    imported: { assets: number; users: number; categories: number; maintenanceRecords: number };
    errors: Array<{ table: string; error: string }>;
  }> {
    const result = {
      imported: { assets: 0, users: 0, categories: 0, maintenanceRecords: 0 },
      errors: [] as Array<{ table: string; error: string }>
    };

    try {
      await db.transaction('rw', db.assets, db.users, db.categories, db.maintenanceRecords, async () => {
        if (options.clearExisting) {
          await Promise.all([
            db.assets.clear(),
            db.users.clear(),
            db.categories.clear(),
            db.maintenanceRecords.clear()
          ]);
        }

        // Import categories first (dependencies)
        if (data.categories) {
          try {
            await db.categories.bulkPut(data.categories);
            result.imported.categories = data.categories.length;
          } catch (error) {
            result.errors.push({ 
              table: 'categories', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
          }
        }

        // Import users
        if (data.users) {
          try {
            await db.users.bulkPut(data.users);
            result.imported.users = data.users.length;
          } catch (error) {
            result.errors.push({ 
              table: 'users', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
          }
        }

        // Import assets
        if (data.assets) {
          try {
            await db.assets.bulkPut(data.assets);
            result.imported.assets = data.assets.length;
          } catch (error) {
            result.errors.push({ 
              table: 'assets', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
          }
        }

        // Import maintenance records
        if (data.maintenanceRecords) {
          try {
            await db.maintenanceRecords.bulkPut(data.maintenanceRecords);
            result.imported.maintenanceRecords = data.maintenanceRecords.length;
          } catch (error) {
            result.errors.push({ 
              table: 'maintenanceRecords', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
          }
        }
      });
    } catch (error) {
      result.errors.push({ 
        table: 'transaction', 
        error: error instanceof Error ? error.message : 'Transaction failed' 
      });
    }

    return result;
  }

  // Performance optimization methods
  static async optimizeDatabase(): Promise<void> {
    // Cleanup old audit logs (keep only last 1000)
    const auditCount = await db.auditLogs.count();
    if (auditCount > 1000) {
      const oldestLogs = await db.auditLogs.orderBy('timestamp').limit(auditCount - 1000).toArray();
      const idsToDelete = oldestLogs.map(log => log.id!);
      await db.auditLogs.bulkDelete(idsToDelete);
    }

    // Cleanup completed maintenance records older than 2 years
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    await db.maintenanceRecords
      .where('status').equals('COMPLETED')
      .and(record => new Date(record.maintenanceDate) < twoYearsAgo)
      .delete();

    console.log('Database optimization completed');
  }

  // Enhanced Search with Scoring
  static async advancedSearch(query: string, options: {
    includeInactive?: boolean;
    categoryFilter?: string;
    statusFilter?: Asset['status'];
    limit?: number;
  } = {}): Promise<Array<Asset & { searchScore: number }>> {
    const normalizedQuery = query.toLowerCase();
    const terms = normalizedQuery.split(' ').filter(term => term.length > 0);
    
    let assets = await db.assets.toArray();
    
    if (!options.includeInactive) {
      // Assuming we only want active assets by default
      assets = assets.filter(asset => asset.status !== 'RETIRED');
    }
    
    if (options.categoryFilter) {
      assets = assets.filter(asset => asset.category === options.categoryFilter);
    }
    
    if (options.statusFilter) {
      assets = assets.filter(asset => asset.status === options.statusFilter);
    }

    // Score each asset based on search relevance
    const scoredAssets = assets.map(asset => {
      let score = 0;
      const searchableText = `${asset.name} ${asset.assetTag} ${asset.category} ${asset.brand || ''} ${asset.model || ''} ${asset.description || ''}`.toLowerCase();
      
      terms.forEach(term => {
        // Exact matches in name get highest score
        if (asset.name.toLowerCase().includes(term)) {
          score += asset.name.toLowerCase() === term ? 10 : 5;
        }
        // Asset tag matches
        if (asset.assetTag.toLowerCase().includes(term)) {
          score += asset.assetTag.toLowerCase() === term ? 8 : 4;
        }
        // Brand/model matches
        if (asset.brand?.toLowerCase().includes(term) || asset.model?.toLowerCase().includes(term)) {
          score += 3;
        }
        // General text matches
        if (searchableText.includes(term)) {
          score += 1;
        }
      });
      
      return { ...asset, searchScore: score };
    });

    // Filter out assets with no matches and sort by score
    const relevantAssets = scoredAssets
      .filter(asset => asset.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore);

    return options.limit ? relevantAssets.slice(0, options.limit) : relevantAssets;
  }

  // Data Validation
  static validateAsset(asset: Partial<Asset>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!asset.name || asset.name.trim().length === 0) {
      errors.push('Asset name is required');
    }

    if (!asset.assetTag || asset.assetTag.trim().length === 0) {
      errors.push('Asset tag is required');
    }

    if (!asset.category || asset.category.trim().length === 0) {
      errors.push('Category is required');
    }

    if (asset.purchasePrice !== undefined && asset.purchasePrice < 0) {
      errors.push('Purchase price cannot be negative');
    }

    if (asset.purchaseDate && new Date(asset.purchaseDate) > new Date()) {
      errors.push('Purchase date cannot be in the future');
    }

    if (asset.warrantyExpiry && asset.purchaseDate && 
        new Date(asset.warrantyExpiry) < new Date(asset.purchaseDate)) {
      errors.push('Warranty expiry cannot be before purchase date');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Database Health Check
  static async getHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    details: {
      totalRecords: number;
      tables: Record<string, number>;
      lastOptimization?: string;
      warnings: string[];
    };
  }> {
    const warnings: string[] = [];
    
    try {
      const [assetCount, userCount, categoryCount, maintenanceCount, auditCount] = await Promise.all([
        db.assets.count(),
        db.users.count(),
        db.categories.count(), 
        db.maintenanceRecords.count(),
        db.auditLogs.count()
      ]);

      const totalRecords = assetCount + userCount + categoryCount + maintenanceCount + auditCount;

      // Check for potential issues
      if (auditCount > 5000) {
        warnings.push('Large number of audit logs - consider optimization');
      }

      if (assetCount === 0) {
        warnings.push('No assets found in database');
      }

      if (categoryCount === 0) {
        warnings.push('No categories configured');
      }

      const status = warnings.length === 0 ? 'healthy' : 'warning';

      return {
        status,
        details: {
          totalRecords,
          tables: {
            assets: assetCount,
            users: userCount,
            categories: categoryCount,
            maintenanceRecords: maintenanceCount,
            auditLogs: auditCount
          },
          warnings
        }
      };
    } catch (error) {
      return {
        status: 'error',
        details: {
          totalRecords: 0,
          tables: {},
          warnings: [`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`]
        }
      };
    }
  }
}

// Seed initial data
export const seedDatabase = async (): Promise<void> => {
  try {
    // Check if data already exists
    const existingAssets = await db.assets.count();
    if (existingAssets > 0) return;

    console.log('Seeding database with initial data...');

    // Seed categories
    await db.categories.bulkAdd([
      {
        name: 'Laptops & Computers',
        description: 'Portable and desktop computers',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced'
      },
      {
        name: 'Mobile Devices',
        description: 'Phones and tablets',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced'
      },
      {
        name: 'Network Equipment',
        description: 'Routers, switches, and network devices',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced'
      },
      {
        name: 'Monitors & Displays',
        description: 'Computer monitors and display devices',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced'
      }
    ]);

    // Seed users
    await db.users.bulkAdd([
      {
        username: 'admin',
        email: 'admin@company.com',
        firstName: 'System',
        lastName: 'Administrator',
        department: 'IT',
        jobTitle: 'IT Manager',
        phone: '555-0001',
        role: 'SUPER_ADMIN',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced'
      },
      {
        username: 'jdoe',
        email: 'john.doe@company.com',
        firstName: 'John',
        lastName: 'Doe',
        department: 'Engineering',
        jobTitle: 'Software Engineer',
        phone: '555-0002',
        role: 'USER',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced'
      }
    ]);

    // Seed assets
    const assetIds = await db.assets.bulkAdd([
      {
        name: 'MacBook Pro 16"',
        assetTag: 'MBP-2024-001',
        category: 'Laptops & Computers',
        status: 'ASSIGNED',
        condition: 'EXCELLENT',
        assignedTo: 'John Doe',
        location: 'Office 2A',
        purchaseDate: '2024-01-15',
        purchasePrice: 2999.99,
        warrantyExpiry: '2027-01-15',
        description: '16-inch MacBook Pro with M3 chip',
        brand: 'Apple',
        model: 'MacBook Pro 16" 2024',
        serialNumber: 'MB240001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced'
      },
      {
        name: 'Dell Ultrasharp 4K Monitor',
        assetTag: 'MON-2024-001',
        category: 'Monitors & Displays',
        status: 'AVAILABLE',
        condition: 'GOOD',
        location: 'Storage Room',
        purchaseDate: '2024-02-01',
        purchasePrice: 599.99,
        warrantyExpiry: '2026-02-01',
        description: '27-inch 4K UltraSharp monitor',
        brand: 'Dell',
        model: 'U2723QE',
        serialNumber: 'DL240001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced'
      },
      {
        name: 'Cisco Switch 24-Port',
        assetTag: 'NET-2024-001',
        category: 'Network Equipment',
        status: 'IN_MAINTENANCE',
        condition: 'FAIR',
        location: 'Server Room',
        purchaseDate: '2023-06-01',
        purchasePrice: 899.99,
        warrantyExpiry: '2026-06-01',
        description: '24-port Gigabit managed switch',
        brand: 'Cisco',
        model: 'SG250-24',
        serialNumber: 'CS230001',
        notes: 'Port 12 needs repair',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced'
      }
    ], { allKeys: true });

    // Seed maintenance records
    await db.maintenanceRecords.bulkAdd([
      {
        assetId: assetIds[2] as number, // Cisco Switch
        maintenanceDate: '2024-09-30',
        maintenanceType: 'Repair',
        description: 'Fix faulty port 12',
        status: 'SCHEDULED',
        priority: 'HIGH',
        performedBy: 'IT Team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced'
      },
      {
        assetId: assetIds[0] as number, // MacBook Pro
        maintenanceDate: '2024-10-15',
        maintenanceType: 'Cleaning',
        description: 'Routine cleaning and inspection',
        status: 'SCHEDULED',
        priority: 'LOW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced'
      }
    ]);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Initialize database when module loads
db.open().then(() => {
  console.log('Asset Management Database initialized');
  seedDatabase();
}).catch(error => {
  console.error('Failed to open database:', error);
});
