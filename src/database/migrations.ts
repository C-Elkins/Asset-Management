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

  // Migration 8: QR Code System
  const qrCodesTableCount = db.prepare(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='qr_codes'"
  ).get() as { count: number }

  if (qrCodesTableCount.count === 0) {
    console.log('Creating qr_codes table')

    db.exec(`
      CREATE TABLE qr_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        qr_code_id TEXT UNIQUE NOT NULL,
        qr_type TEXT NOT NULL CHECK (qr_type IN ('asset', 'inventory_item')),
        entity_id INTEGER NOT NULL,
        asset_id INTEGER NOT NULL,
        data_payload TEXT NOT NULL,
        verification_hash TEXT,
        is_active INTEGER DEFAULT 1,
        generated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        expires_at TEXT,
        last_scanned_at TEXT,
        scan_count INTEGER DEFAULT 0,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      );

      CREATE UNIQUE INDEX idx_qr_code_id ON qr_codes(qr_code_id);
      CREATE INDEX idx_qr_entity ON qr_codes(qr_type, entity_id);
      CREATE INDEX idx_qr_asset ON qr_codes(asset_id);
      CREATE INDEX idx_qr_active ON qr_codes(is_active) WHERE is_active = 1;
    `)

    console.log('qr_codes table created with indexes')
  }

  // Create QR scan history table
  const qrScanHistoryTableCount = db.prepare(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='qr_scan_history'"
  ).get() as { count: number }

  if (qrScanHistoryTableCount.count === 0) {
    console.log('Creating qr_scan_history table')

    db.exec(`
      CREATE TABLE qr_scan_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        qr_code_id TEXT NOT NULL,
        scan_action TEXT NOT NULL,
        scanned_by TEXT,
        location TEXT,
        device_info TEXT,
        notes TEXT,
        metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (qr_code_id) REFERENCES qr_codes(qr_code_id)
      );

      CREATE INDEX idx_scan_history_qr ON qr_scan_history(qr_code_id);
      CREATE INDEX idx_scan_history_date ON qr_scan_history(created_at DESC);
      CREATE INDEX idx_scan_history_action ON qr_scan_history(scan_action);
    `)

    console.log('qr_scan_history table created with indexes')
  }

  // Migration 9: Fix qr_scan_history foreign key constraint
  // Add ON DELETE CASCADE to allow asset deletion when scan history exists
  const qrScanHistoryFKCheck = db.prepare(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='qr_scan_history'"
  ).get() as { sql: string } | undefined

  if (qrScanHistoryFKCheck && !qrScanHistoryFKCheck.sql.includes('ON DELETE CASCADE')) {
    console.log('Recreating qr_scan_history table with ON DELETE CASCADE constraint')

    db.exec(`
      -- Create temporary table
      CREATE TABLE qr_scan_history_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        qr_code_id TEXT NOT NULL,
        scan_action TEXT NOT NULL,
        scanned_by TEXT,
        location TEXT,
        device_info TEXT,
        notes TEXT,
        metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (qr_code_id) REFERENCES qr_codes(qr_code_id) ON DELETE CASCADE
      );

      -- Copy data if any exists
      INSERT INTO qr_scan_history_new
      SELECT * FROM qr_scan_history;

      -- Drop old table
      DROP TABLE qr_scan_history;

      -- Rename new table
      ALTER TABLE qr_scan_history_new RENAME TO qr_scan_history;

      -- Recreate indexes
      CREATE INDEX idx_scan_history_qr ON qr_scan_history(qr_code_id);
      CREATE INDEX idx_scan_history_date ON qr_scan_history(created_at DESC);
      CREATE INDEX idx_scan_history_action ON qr_scan_history(scan_action);
    `)

    console.log('qr_scan_history table recreated with ON DELETE CASCADE')
  }

  // Migration 10: Fix FTS5 table structure - remove content='assets' to fix column mismatch
  // The issue was FTS5's content='assets' expected column names to match, causing T.custom_fields_text error
  const ftsMigrationCheck = db.prepare(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='assets_fts'"
  ).get() as { sql: string } | undefined

  if (ftsMigrationCheck && ftsMigrationCheck.sql.includes("content='assets'")) {
    console.log('Recreating FTS5 table without content directive to fix column mismatch')

    db.exec(`
      -- Drop existing triggers and table
      DROP TRIGGER IF EXISTS assets_fts_insert;
      DROP TRIGGER IF EXISTS assets_fts_update;
      DROP TRIGGER IF EXISTS assets_fts_delete;
      DROP TABLE IF EXISTS assets_fts;

      -- Create FTS5 table WITHOUT content directive (external content)
      CREATE VIRTUAL TABLE assets_fts USING fts5(
        asset_tag,
        name,
        description,
        brand,
        model,
        serial_number,
        location,
        notes,
        custom_fields_text
      );
    `)

    // Populate FTS table from existing assets
    const existingAssets = db.prepare('SELECT * FROM assets').all()
    const insertStmt = db.prepare(`
      INSERT INTO assets_fts(rowid, asset_tag, name, description, brand, model, serial_number, location, notes, custom_fields_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const asset of existingAssets as any[]) {
      insertStmt.run(
        asset.id,
        asset.asset_tag,
        asset.name,
        asset.description || '',
        asset.brand || '',
        asset.model || '',
        asset.serial_number || '',
        asset.location || '',
        asset.notes || '',
        asset.custom_fields || ''
      )
    }

    // Create new triggers
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
        DELETE FROM assets_fts WHERE rowid = old.id;
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

      -- Delete trigger
      CREATE TRIGGER assets_fts_delete BEFORE DELETE ON assets BEGIN
        DELETE FROM assets_fts WHERE rowid = old.id;
      END;
    `)

    console.log('FTS5 table and triggers recreated successfully without content directive')
  }

  // Migration 11: Create filter_presets table for saving/loading advanced filter combinations
  const filterPresetsTableCount = db.prepare(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='filter_presets'"
  ).get() as { count: number }

  if (filterPresetsTableCount.count === 0) {
    console.log('Creating filter_presets table')

    db.exec(`
      CREATE TABLE filter_presets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        filters TEXT NOT NULL,
        is_favorite INTEGER DEFAULT 0,
        use_count INTEGER DEFAULT 0,
        last_used_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_filter_presets_name ON filter_presets(name);
      CREATE INDEX idx_filter_presets_favorite ON filter_presets(is_favorite) WHERE is_favorite = 1;
      CREATE INDEX idx_filter_presets_last_used ON filter_presets(last_used_at DESC);
    `)

    console.log('filter_presets table created with indexes')
  }

  // Migration 12: Fix user_category_preferences to add UNIQUE constraint on category_id
  const userPrefsCheck = db.prepare(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='user_category_preferences'"
  ).get() as { sql: string } | undefined

  if (userPrefsCheck && !userPrefsCheck.sql.includes('UNIQUE')) {
    console.log('Adding UNIQUE constraint to user_category_preferences.category_id')

    db.exec(`
      -- Create new table with UNIQUE constraint
      CREATE TABLE user_category_preferences_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL UNIQUE,
        is_selected INTEGER DEFAULT 1,
        is_favorite INTEGER DEFAULT 0,
        custom_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );

      -- Copy existing data
      INSERT INTO user_category_preferences_new (id, category_id, is_selected, is_favorite, custom_order, created_at, updated_at)
      SELECT id, category_id, is_selected, is_favorite, custom_order, created_at, updated_at
      FROM user_category_preferences;

      -- Drop old table
      DROP TABLE user_category_preferences;

      -- Rename new table
      ALTER TABLE user_category_preferences_new RENAME TO user_category_preferences;

      -- Recreate indexes
      CREATE INDEX idx_user_prefs_category ON user_category_preferences(category_id);
      CREATE INDEX idx_user_prefs_selected ON user_category_preferences(is_selected, custom_order);
    `)

    console.log('user_category_preferences UNIQUE constraint added successfully')
  }

  // Migration 13: Create users table for authentication
  const usersTableCount = db.prepare(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='users'"
  ).get() as { count: number }

  if (usersTableCount.count === 0) {
    console.log('Creating users table')

    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'user')) DEFAULT 'user',
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_login_at TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX idx_users_username ON users(username);
      CREATE INDEX idx_users_role ON users(role);
      CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = 1;
    `)

    // Create default admin user (username: admin, password: admin123)
    // Password hash for 'admin123' using a simple hash (will be replaced with bcrypt in production)
    const crypto = require('crypto')
    const defaultPassword = 'admin123'
    const passwordHash = crypto.createHash('sha256').update(defaultPassword).digest('hex')

    db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin', passwordHash, 'Administrator', 'admin', 1)

    console.log('users table created with default admin user (username: admin, password: admin123)')
  }

  // Migration 14: Create attachments table for document uploads
  const attachmentsTableCount = db.prepare(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='attachments'"
  ).get() as { count: number }

  if (attachmentsTableCount.count === 0) {
    console.log('Creating attachments table')

    db.exec(`
      CREATE TABLE attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_type TEXT,
        uploaded_by TEXT,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_attachments_asset_id ON attachments(asset_id);
      CREATE INDEX idx_attachments_created_at ON attachments(created_at DESC);
    `)

    console.log('attachments table created')
  }

  // Migration 15: Create barcodes table for barcode generation
  const barcodesTableCount = db.prepare(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='barcodes'"
  ).get() as { count: number }

  if (barcodesTableCount.count === 0) {
    console.log('Creating barcodes table')

    db.exec(`
      CREATE TABLE barcodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER NOT NULL,
        barcode_value TEXT NOT NULL,
        barcode_format TEXT NOT NULL CHECK(barcode_format IN ('CODE39', 'CODE128', 'EAN13', 'UPCA', 'ITF14')),
        generated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_barcodes_asset_id ON barcodes(asset_id);
      CREATE INDEX idx_barcodes_value ON barcodes(barcode_value);
      CREATE INDEX idx_barcodes_active ON barcodes(is_active) WHERE is_active = 1;
    `)

    console.log('barcodes table created')
  }

  // Migration 16: Add depreciation tracking fields to assets table
  const assetsTableInfo2 = db.pragma('table_info(assets)') as Array<{ name: string }>
  const existingColumns2 = assetsTableInfo2.map(col => col.name)

  if (!existingColumns2.includes('depreciation_method')) {
    console.log('Adding depreciation tracking fields to assets table')

    db.exec(`
      ALTER TABLE assets ADD COLUMN depreciation_method TEXT DEFAULT 'none' CHECK(depreciation_method IN ('none', 'straight-line', 'declining-balance', 'sum-of-years'));
      ALTER TABLE assets ADD COLUMN useful_life_years INTEGER;
      ALTER TABLE assets ADD COLUMN salvage_value REAL DEFAULT 0;
      ALTER TABLE assets ADD COLUMN depreciation_start_date TEXT;
    `)

    console.log('Depreciation tracking fields added to assets table')
  }

  // Migration 17: Add disposal tracking fields to assets table
  const assetsTableInfo3 = db.pragma('table_info(assets)') as Array<{ name: string }>
  const existingColumns3 = assetsTableInfo3.map(col => col.name)

  if (!existingColumns3.includes('disposal_date')) {
    console.log('Adding disposal tracking fields to assets table')

    db.exec(`
      ALTER TABLE assets ADD COLUMN disposal_date TEXT;
      ALTER TABLE assets ADD COLUMN disposal_reason TEXT;
      ALTER TABLE assets ADD COLUMN disposal_method TEXT CHECK(disposal_method IN ('sold', 'donated', 'recycled', 'discarded', 'transferred', 'returned'));
      ALTER TABLE assets ADD COLUMN disposal_value REAL;
      ALTER TABLE assets ADD COLUMN disposed_by TEXT;
      ALTER TABLE assets ADD COLUMN disposal_notes TEXT;
    `)

    console.log('Disposal tracking fields added to assets table')
  }

  // Migration 18: Create reservations table for asset booking system
  const tablesInfo = db.pragma('table_list') as Array<{ name: string }>
  const tableExists = tablesInfo.some(table => table.name === 'reservations')

  if (!tableExists) {
    console.log('Creating reservations table')

    db.exec(`
      CREATE TABLE reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER NOT NULL,
        reserved_by TEXT NOT NULL,
        reserved_for TEXT,
        reservation_start TEXT NOT NULL,
        reservation_end TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
        purpose TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_reservations_asset_id ON reservations(asset_id);
      CREATE INDEX idx_reservations_status ON reservations(status);
      CREATE INDEX idx_reservations_dates ON reservations(reservation_start, reservation_end);
    `)

    console.log('Reservations table created')
  }

  // Migration 19: Create leases table for lease & contract management
  const tablesInfo2 = db.pragma('table_list') as Array<{ name: string }>
  const leaseTableExists = tablesInfo2.some(table => table.name === 'leases')

  if (!leaseTableExists) {
    console.log('Creating leases table')

    db.exec(`
      CREATE TABLE leases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER NOT NULL,
        contract_number TEXT,
        lease_type TEXT NOT NULL CHECK(lease_type IN ('operating', 'finance', 'rent')),
        lessor TEXT NOT NULL,
        lessee TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        renewal_date TEXT,
        auto_renewal INTEGER DEFAULT 0,
        monthly_payment REAL,
        payment_frequency TEXT CHECK(payment_frequency IN ('monthly', 'quarterly', 'annually')),
        next_payment_date TEXT,
        total_value REAL,
        deposit_amount REAL,
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'expired', 'cancelled', 'renewed')),
        terms TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_leases_asset_id ON leases(asset_id);
      CREATE INDEX idx_leases_status ON leases(status);
      CREATE INDEX idx_leases_dates ON leases(start_date, end_date);
      CREATE INDEX idx_leases_next_payment ON leases(next_payment_date);
    `)

    console.log('Leases table created')
  }

  // Migration 20: Add parent-child asset relationships
  const assetsTableInfo4 = db.pragma('table_info(assets)') as Array<{ name: string }>
  const existingColumns4 = assetsTableInfo4.map(col => col.name)

  if (!existingColumns4.includes('parent_asset_id')) {
    console.log('Adding parent-child relationship field to assets table')

    db.exec(`
      ALTER TABLE assets ADD COLUMN parent_asset_id INTEGER REFERENCES assets(id) ON DELETE SET NULL;
      CREATE INDEX idx_assets_parent ON assets(parent_asset_id) WHERE parent_asset_id IS NOT NULL;
    `)

    console.log('Parent-child relationship field added to assets table')
  }

  // Migration 21: Create locations table for hierarchical location management
  const tablesInfo3 = db.pragma('table_list') as Array<{ name: string }>
  const locationTableExists = tablesInfo3.some(table => table.name === 'locations')

  if (!locationTableExists) {
    console.log('Creating locations table')

    db.exec(`
      CREATE TABLE locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        parent_location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE,
        location_type TEXT CHECK(location_type IN ('building', 'floor', 'room', 'area', 'custom')),
        address TEXT,
        description TEXT,
        notes TEXT,
        active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_locations_parent ON locations(parent_location_id);
      CREATE INDEX idx_locations_active ON locations(active) WHERE active = 1;
    `)

    console.log('Locations table created')
  }

  // Migration 22: Create insurance_policies table
  const tablesInfo4 = db.pragma('table_list') as Array<{ name: string }>
  const insuranceTableExists = tablesInfo4.some(table => table.name === 'insurance_policies')

  if (!insuranceTableExists) {
    console.log('Creating insurance_policies table')

    db.exec(`
      CREATE TABLE insurance_policies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER NOT NULL,
        policy_number TEXT NOT NULL,
        provider TEXT NOT NULL,
        policy_type TEXT CHECK(policy_type IN ('property', 'liability', 'comprehensive', 'other')),
        coverage_amount REAL,
        premium_amount REAL,
        premium_frequency TEXT CHECK(premium_frequency IN ('monthly', 'quarterly', 'annually')),
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        renewal_date TEXT,
        auto_renewal INTEGER DEFAULT 0,
        deductible REAL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'cancelled')),
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_insurance_asset_id ON insurance_policies(asset_id);
      CREATE INDEX idx_insurance_status ON insurance_policies(status);
      CREATE INDEX idx_insurance_renewal ON insurance_policies(renewal_date);
    `)

    console.log('Insurance policies table created')
  }

  // Migration 23: Add stock alert thresholds and create alerts table
  const assetsTableInfo5 = db.pragma('table_info(assets)') as Array<{ name: string }>
  const existingColumns5 = assetsTableInfo5.map(col => col.name)

  if (!existingColumns5.includes('low_stock_threshold')) {
    console.log('Adding stock alert fields to assets table')

    db.exec(`
      ALTER TABLE assets ADD COLUMN low_stock_threshold INTEGER DEFAULT 0;
      ALTER TABLE assets ADD COLUMN critical_stock_threshold INTEGER DEFAULT 0;
      ALTER TABLE assets ADD COLUMN enable_stock_alerts INTEGER DEFAULT 0;
    `)

    console.log('Stock alert fields added to assets table')
  }

  const tablesInfo5 = db.pragma('table_list') as Array<{ name: string }>
  const alertsTableExists = tablesInfo5.some(table => table.name === 'stock_alerts')

  if (!alertsTableExists) {
    console.log('Creating stock_alerts table')

    db.exec(`
      CREATE TABLE stock_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER NOT NULL,
        alert_type TEXT NOT NULL CHECK(alert_type IN ('low_stock', 'critical_stock', 'out_of_stock')),
        threshold_value INTEGER,
        current_quantity INTEGER,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'acknowledged', 'resolved')),
        acknowledged_by TEXT,
        acknowledged_at TEXT,
        resolved_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_alerts_asset_id ON stock_alerts(asset_id);
      CREATE INDEX idx_alerts_status ON stock_alerts(status);
      CREATE INDEX idx_alerts_type ON stock_alerts(alert_type);
    `)

    console.log('Stock alerts table created')
  }

  // Migration 24: Create checkout approval workflow tables
  const tablesInfo6 = db.pragma('table_list') as Array<{ name: string }>
  const checkoutRequestsTableExists = tablesInfo6.some(table => table.name === 'checkout_requests')

  if (!checkoutRequestsTableExists) {
    console.log('Creating checkout approval workflow tables')

    db.exec(`
      -- Checkout Requests table
      CREATE TABLE checkout_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER NOT NULL,
        requested_by TEXT NOT NULL,
        requested_for TEXT,
        checkout_purpose TEXT,
        expected_return_date TEXT,
        quantity INTEGER DEFAULT 1,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
        workflow_id INTEGER,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      );

      -- Approval Steps table (tracks each approval in the chain)
      CREATE TABLE approval_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER NOT NULL,
        step_order INTEGER NOT NULL,
        approver_name TEXT NOT NULL,
        approver_role TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'skipped')),
        decision_notes TEXT,
        decided_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES checkout_requests(id) ON DELETE CASCADE
      );

      -- Approval Workflows table (defines approval requirements)
      CREATE TABLE approval_workflows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        apply_to_all INTEGER DEFAULT 0,
        category_ids TEXT,
        min_value REAL,
        max_value REAL,
        approval_chain TEXT NOT NULL,
        auto_approve_conditions TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_checkout_requests_asset ON checkout_requests(asset_id);
      CREATE INDEX idx_checkout_requests_status ON checkout_requests(status);
      CREATE INDEX idx_checkout_requests_requested_by ON checkout_requests(requested_by);
      CREATE INDEX idx_approval_steps_request ON approval_steps(request_id);
      CREATE INDEX idx_approval_steps_approver ON approval_steps(approver_name);
      CREATE INDEX idx_approval_steps_status ON approval_steps(status);
      CREATE INDEX idx_approval_workflows_active ON approval_workflows(is_active) WHERE is_active = 1;
    `)

    console.log('Checkout approval workflow tables created')

    // Insert default approval workflow
    db.prepare(`
      INSERT INTO approval_workflows (name, description, is_active, apply_to_all, approval_chain)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'Default Approval',
      'Single-level approval required for all asset checkouts',
      1,
      1,
      JSON.stringify([{ role: 'admin', name: 'Administrator' }])
    )

    console.log('Default approval workflow created')
  }

  console.log('Database migrations completed')
}
