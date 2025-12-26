import type Database from 'better-sqlite3'

export function createSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT DEFAULT '📦',
      color_code TEXT DEFAULT '#6366f1',
      category_type TEXT DEFAULT 'custom',
      custom_field_definitions TEXT,
      active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_tag TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category_id INTEGER NOT NULL,
      brand TEXT,
      model TEXT,
      serial_number TEXT,
      purchase_price REAL,
      purchase_date TEXT,
      vendor TEXT,
      location TEXT,
      status TEXT NOT NULL DEFAULT 'available',
      condition TEXT DEFAULT 'good',
      warranty_expiry TEXT,
      next_maintenance TEXT,
      is_tracked_inventory INTEGER DEFAULT 0,
      total_quantity INTEGER DEFAULT 1,
      available_quantity INTEGER DEFAULT 1,
      custom_fields TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS maintenance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER NOT NULL,
      maintenance_type TEXT NOT NULL,
      description TEXT,
      scheduled_date TEXT,
      completed_date TEXT,
      next_maintenance_date TEXT,
      status TEXT NOT NULL DEFAULT 'scheduled',
      priority TEXT DEFAULT 'medium',
      performed_by TEXT,
      vendor TEXT,
      cost REAL,
      downtime_hours REAL,
      parts_used TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER NOT NULL,
      inventory_item_id INTEGER,
      quantity INTEGER DEFAULT 1,
      assigned_to TEXT NOT NULL,
      assigned_by TEXT,
      location TEXT,
      checked_out_at TEXT NOT NULL,
      expected_return_at TEXT,
      checked_in_at TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      checkout_notes TEXT,
      checkin_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
      FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id)
    );

    CREATE TABLE IF NOT EXISTS custom_field_definitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      field_name TEXT NOT NULL,
      field_label TEXT NOT NULL,
      field_type TEXT NOT NULL,
      required INTEGER DEFAULT 0,
      options TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER NOT NULL,
      item_number INTEGER NOT NULL,
      unique_identifier TEXT UNIQUE NOT NULL,
      serial_number TEXT,
      status TEXT NOT NULL DEFAULT 'available',
      current_assignment_id INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
      FOREIGN KEY (current_assignment_id) REFERENCES assignments(id)
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      entity_name TEXT,
      description TEXT NOT NULL,
      user_name TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category_id);
    CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
    CREATE INDEX IF NOT EXISTS idx_assignments_asset ON assignments(asset_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
    CREATE INDEX IF NOT EXISTS idx_maintenance_asset ON maintenance_records(asset_id);
    CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_records(status);
    CREATE INDEX IF NOT EXISTS idx_inventory_items_asset ON inventory_items(asset_id);
    CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
    CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
  `)

  console.log('Database tables and indexes created/verified')

  const existingCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }
  if (existingCategories.count === 0) {
    db.prepare(`
      INSERT INTO categories (name, description, icon, color_code, category_type, sort_order)
      VALUES
        ('IT Equipment', 'Computers, monitors, peripherals, and IT hardware', '💻', '#3b82f6', 'IT', 1),
        ('Tools & Machinery', 'Physical tools, equipment, and machinery', '🔧', '#10b981', 'Tools', 2),
        ('Vehicles', 'Cars, trucks, vans, and heavy equipment', '🚗', '#f59e0b', 'Vehicles', 3),
        ('Office Equipment', 'Furniture, printers, and office supplies', '🏢', '#8b5cf6', 'custom', 4)
    `).run()
    console.log('Inserted default categories')
  }
}
