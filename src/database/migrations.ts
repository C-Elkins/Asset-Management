import type Database from 'better-sqlite3'

export function runMigrations(db: Database.Database): void {
  console.log('Running database migrations...')

  // Check if we need to add new columns to assets table
  const tableInfo = db.pragma('table_info(assets)') as Array<{ name: string }>
  const existingColumns = tableInfo.map(col => col.name)

  // Migration 1: Add quantity tracking columns to assets
  if (!existingColumns.includes('is_tracked_inventory')) {
    console.log('Adding is_tracked_inventory column to assets table')
    db.exec('ALTER TABLE assets ADD COLUMN is_tracked_inventory INTEGER DEFAULT 0')
  }

  if (!existingColumns.includes('total_quantity')) {
    console.log('Adding total_quantity column to assets table')
    db.exec('ALTER TABLE assets ADD COLUMN total_quantity INTEGER DEFAULT 1')
  }

  if (!existingColumns.includes('available_quantity')) {
    console.log('Adding available_quantity column to assets table')
    db.exec('ALTER TABLE assets ADD COLUMN available_quantity INTEGER DEFAULT 1')
  }

  // Check if inventory_items table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='inventory_items'").all()
  if (tables.length === 0) {
    console.log('Creating inventory_items table')
    db.exec(`
      CREATE TABLE inventory_items (
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
      CREATE INDEX IF NOT EXISTS idx_inventory_items_asset ON inventory_items(asset_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
    `)
  }

  // Check if activity_log table exists
  const activityLogTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='activity_log'").all()
  if (activityLogTables.length === 0) {
    console.log('Creating activity_log table')
    db.exec(`
      CREATE TABLE activity_log (
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
      CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
    `)
  }

  // Check if custom_field_definitions table exists
  const customFieldTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='custom_field_definitions'").all()
  if (customFieldTables.length === 0) {
    console.log('Creating custom_field_definitions table')
    db.exec(`
      CREATE TABLE custom_field_definitions (
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
    `)
  }

  // Migration 2: Add inventory_item_id and quantity columns to assignments if they don't exist
  const assignmentTableInfo = db.pragma('table_info(assignments)') as Array<{ name: string }>
  const assignmentColumns = assignmentTableInfo.map(col => col.name)

  if (!assignmentColumns.includes('inventory_item_id')) {
    console.log('Adding inventory_item_id column to assignments table')
    db.exec('ALTER TABLE assignments ADD COLUMN inventory_item_id INTEGER REFERENCES inventory_items(id)')
  }

  if (!assignmentColumns.includes('quantity')) {
    console.log('Adding quantity column to assignments table')
    db.exec('ALTER TABLE assignments ADD COLUMN quantity INTEGER DEFAULT 1')
  }

  // Migration 3: Create inventory_transactions table
  const transactionTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='inventory_transactions'").all()
  if (transactionTables.length === 0) {
    console.log('Creating inventory_transactions table')
    db.exec(`
      CREATE TABLE inventory_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_type TEXT NOT NULL,
        asset_id INTEGER NOT NULL,
        inventory_item_id INTEGER,
        quantity_change INTEGER NOT NULL,
        quantity_before INTEGER NOT NULL,
        quantity_after INTEGER NOT NULL,
        reason TEXT,
        purpose TEXT,
        supplier_vendor TEXT,
        po_number TEXT,
        invoice_number TEXT,
        unit_cost REAL,
        performed_by TEXT NOT NULL,
        authorized_by TEXT,
        condition_on_return TEXT,
        notes TEXT,
        metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
        FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id)
      );
      CREATE INDEX IF NOT EXISTS idx_inventory_transactions_asset ON inventory_transactions(asset_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
      CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(created_at DESC);
    `)
  }

  // Migration 4: Create business_profile table
  const businessProfileTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='business_profile'").all()
  if (businessProfileTables.length === 0) {
    console.log('Creating business_profile table')
    db.exec(`
      CREATE TABLE business_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        company_name TEXT,
        business_type TEXT,
        logo_path TEXT,
        default_location TEXT,
        setup_completed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO business_profile (id, setup_completed) VALUES (1, 0);
    `)
  }

  // Migration 5: Create FTS5 full-text search virtual table
  const ftsTablesCount = db.prepare(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='assets_fts'"
  ).get() as { count: number }

  if (ftsTablesCount.count === 0) {
    console.log('Creating FTS5 full-text search table for assets')

    // Create FTS5 virtual table
    db.exec(`
      CREATE VIRTUAL TABLE assets_fts USING fts5(
        asset_tag,
        name,
        description,
        brand,
        model,
        serial_number,
        location,
        notes,
        custom_fields_text,
        content='assets',
        content_rowid='id'
      );
    `)

    // Populate FTS table from existing assets
    db.exec(`
      INSERT INTO assets_fts(rowid, asset_tag, name, description, brand, model, serial_number, location, notes, custom_fields_text)
      SELECT
        id,
        asset_tag,
        name,
        COALESCE(description, ''),
        COALESCE(brand, ''),
        COALESCE(model, ''),
        COALESCE(serial_number, ''),
        COALESCE(location, ''),
        COALESCE(notes, ''),
        COALESCE(custom_fields, '')
      FROM assets;
    `)

    // Create triggers to keep FTS in sync
    db.exec(`
      -- Insert trigger
      CREATE TRIGGER assets_fts_insert AFTER INSERT ON assets BEGIN
        INSERT INTO assets_fts(rowid, asset_tag, name, description, brand, model, serial_number, location, notes, custom_fields_text)
        VALUES (
          new.id,
          new.asset_tag,
          new.name,
          COALESCE(new.description, ''),
          COALESCE(new.brand, ''),
          COALESCE(new.model, ''),
          COALESCE(new.serial_number, ''),
          COALESCE(new.location, ''),
          COALESCE(new.notes, ''),
          COALESCE(new.custom_fields, '')
        );
      END;

      -- Update trigger
      CREATE TRIGGER assets_fts_update AFTER UPDATE ON assets BEGIN
        UPDATE assets_fts SET
          asset_tag = new.asset_tag,
          name = new.name,
          description = COALESCE(new.description, ''),
          brand = COALESCE(new.brand, ''),
          model = COALESCE(new.model, ''),
          serial_number = COALESCE(new.serial_number, ''),
          location = COALESCE(new.location, ''),
          notes = COALESCE(new.notes, ''),
          custom_fields_text = COALESCE(new.custom_fields, '')
        WHERE rowid = new.id;
      END;

      -- Delete trigger
      CREATE TRIGGER assets_fts_delete AFTER DELETE ON assets BEGIN
        DELETE FROM assets_fts WHERE rowid = old.id;
      END;
    `)

    console.log('FTS5 table created and populated with triggers')
  }

  // Migration 6: Comprehensive performance indexes
  console.log('Creating performance indexes...')

  const performanceIndexes = [
    // Text search fallback indexes
    'CREATE INDEX IF NOT EXISTS idx_assets_asset_tag ON assets(asset_tag)',
    'CREATE INDEX IF NOT EXISTS idx_assets_serial_number ON assets(serial_number)',
    'CREATE INDEX IF NOT EXISTS idx_assets_location ON assets(location)',

    // Composite indexes for multi-filter queries
    'CREATE INDEX IF NOT EXISTS idx_assets_category_status ON assets(category_id, status)',
    'CREATE INDEX IF NOT EXISTS idx_assets_status_location ON assets(status, location)',
    'CREATE INDEX IF NOT EXISTS idx_assets_category_status_location ON assets(category_id, status, location)',

    // Date-based indexes for reports
    'CREATE INDEX IF NOT EXISTS idx_assets_purchase_date ON assets(purchase_date DESC)',
    'CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_assets_updated_at ON assets(updated_at DESC)',

    // Partial indexes for common filtered queries
    'CREATE INDEX IF NOT EXISTS idx_assets_warranty_expiry ON assets(warranty_expiry) WHERE warranty_expiry IS NOT NULL',
    'CREATE INDEX IF NOT EXISTS idx_assets_next_maintenance ON assets(next_maintenance) WHERE next_maintenance IS NOT NULL',
    'CREATE INDEX IF NOT EXISTS idx_assets_tracked_inventory ON assets(id, is_tracked_inventory, total_quantity, available_quantity) WHERE is_tracked_inventory = 1',

    // Assignment indexes
    'CREATE INDEX IF NOT EXISTS idx_assignments_active ON assignments(asset_id, assigned_to, checked_out_at) WHERE status = \'active\'',
    'CREATE INDEX IF NOT EXISTS idx_assignments_overdue ON assignments(asset_id, expected_return_at) WHERE status = \'active\' AND expected_return_at < CURRENT_TIMESTAMP',

    // Custom field definitions index
    'CREATE INDEX IF NOT EXISTS idx_custom_field_defs_category ON custom_field_definitions(category_id, sort_order)',

    // Covering index for asset list view (reduces table lookups)
    'CREATE INDEX IF NOT EXISTS idx_assets_list_covering ON assets(id, asset_tag, name, category_id, status, location, available_quantity, created_at)',

    // Inventory items indexes for quick lookups
    'CREATE INDEX IF NOT EXISTS idx_inventory_items_unique_id ON inventory_items(unique_identifier)',
    'CREATE INDEX IF NOT EXISTS idx_inventory_items_serial ON inventory_items(serial_number) WHERE serial_number IS NOT NULL',

    // Maintenance records indexes
    'CREATE INDEX IF NOT EXISTS idx_maintenance_type_status ON maintenance_records(maintenance_type, status)',
    'CREATE INDEX IF NOT EXISTS idx_maintenance_next_due ON maintenance_records(next_due_date) WHERE next_due_date IS NOT NULL',
  ];

  for (const indexSQL of performanceIndexes) {
    try {
      db.exec(indexSQL);
    } catch (error) {
      // Index might already exist, ignore error
      console.log(`Index already exists or error: ${error.message}`);
    }
  }

  console.log(`Created ${performanceIndexes.length} performance indexes`)

  // Migration 7: Category preferences and view mode
  const categoryPrefsTableCount = db.prepare(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='user_category_preferences'"
  ).get() as { count: number }

  if (categoryPrefsTableCount.count === 0) {
    console.log('Creating user_category_preferences table')

    db.exec(`
      CREATE TABLE user_category_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        is_selected INTEGER DEFAULT 1,
        is_favorite INTEGER DEFAULT 0,
        custom_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_user_prefs_category ON user_category_preferences(category_id);
      CREATE INDEX idx_user_prefs_selected ON user_category_preferences(is_selected, custom_order);
    `)

    // Populate with existing categories (mark all as selected by default)
    const existingCategories = db.prepare('SELECT id, sort_order FROM categories WHERE active = 1').all() as Array<{ id: number; sort_order: number }>

    if (existingCategories.length > 0) {
      const insertStmt = db.prepare(`
        INSERT INTO user_category_preferences (category_id, is_selected, custom_order)
        VALUES (?, 1, ?)
      `)

      for (const category of existingCategories) {
        insertStmt.run(category.id, category.sort_order)
      }

      console.log(`Populated user_category_preferences with ${existingCategories.length} categories`)
    }

    // Add category view mode setting
    db.exec(`
      INSERT OR IGNORE INTO app_settings (key, value)
      VALUES ('category_view_mode', 'selected')
    `)

    console.log('Category preferences table created and initialized')
  }

  console.log('Database migrations completed')
}
