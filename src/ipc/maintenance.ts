import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'
import { logActivity } from './activityLog'
import { rebuildAllCustomFieldsFTS } from '../utils/customFieldsIndexer'

export function setupMaintenanceHandlers(): void {
  // Get maintenance records with optional filtering by asset
  ipcMain.handle('get-maintenance-records', (_event, assetId?: number) => {
    const db = getDatabase()

    if (assetId) {
      return db.prepare(`
        SELECT m.*, a.name as asset_name, a.asset_tag
        FROM maintenance_records m
        LEFT JOIN assets a ON m.asset_id = a.id
        WHERE m.asset_id = ?
        ORDER BY m.scheduled_date DESC
      `).all(assetId)
    }

    return db.prepare(`
      SELECT m.*, a.name as asset_name, a.asset_tag
      FROM maintenance_records m
      LEFT JOIN assets a ON m.asset_id = a.id
      ORDER BY m.scheduled_date DESC
    `).all()
  })

  // Create maintenance record
  ipcMain.handle('create-maintenance-record', (_event, record) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO maintenance_records (
        asset_id, maintenance_type, description, scheduled_date,
        completed_date, next_maintenance_date, status, priority,
        performed_by, vendor, cost, downtime_hours, parts_used, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      record.asset_id,
      record.maintenance_type,
      record.description || null,
      record.scheduled_date,
      record.completed_date || null,
      record.next_maintenance_date || null,
      record.status || 'scheduled',
      record.priority || 'medium',
      record.performed_by || null,
      record.vendor || null,
      record.cost || null,
      record.downtime_hours || null,
      record.parts_used || null,
      record.notes || null
    )

    const recordId = result.lastInsertRowid as number

    // Get asset name for logging
    const asset = db.prepare('SELECT name FROM assets WHERE id = ?').get(record.asset_id) as any

    // Log activity
    logActivity(
      db,
      'create',
      'asset',
      record.asset_id,
      asset?.name,
      `Created maintenance record: ${record.maintenance_type}`,
      record.performed_by
    )

    return { id: recordId, ...record }
  })

  // Update maintenance record
  ipcMain.handle('update-maintenance-record', (_event, id: number, record) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      UPDATE maintenance_records SET
        maintenance_type = ?, description = ?, scheduled_date = ?,
        completed_date = ?, next_maintenance_date = ?, status = ?,
        priority = ?, performed_by = ?, vendor = ?, cost = ?,
        downtime_hours = ?, parts_used = ?, notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    stmt.run(
      record.maintenance_type,
      record.description || null,
      record.scheduled_date,
      record.completed_date || null,
      record.next_maintenance_date || null,
      record.status || 'scheduled',
      record.priority || 'medium',
      record.performed_by || null,
      record.vendor || null,
      record.cost || null,
      record.downtime_hours || null,
      record.parts_used || null,
      record.notes || null,
      id
    )

    // Get asset info for logging
    const maintenanceRecord = db.prepare('SELECT asset_id FROM maintenance_records WHERE id = ?').get(id) as any
    const asset = db.prepare('SELECT name FROM assets WHERE id = ?').get(maintenanceRecord.asset_id) as any

    // Log activity
    logActivity(
      db,
      'update',
      'asset',
      maintenanceRecord.asset_id,
      asset?.name,
      `Updated maintenance record: ${record.maintenance_type}`,
      record.performed_by
    )

    return { success: true }
  })

  // Delete maintenance record
  ipcMain.handle('delete-maintenance-record', (_event, id: number) => {
    const db = getDatabase()

    // Get record info for logging
    const record = db.prepare(`
      SELECT m.*, a.name as asset_name
      FROM maintenance_records m
      LEFT JOIN assets a ON m.asset_id = a.id
      WHERE m.id = ?
    `).get(id) as any

    db.prepare('DELETE FROM maintenance_records WHERE id = ?').run(id)

    // Log activity
    if (record) {
      logActivity(
        db,
        'delete',
        'asset',
        record.asset_id,
        record.asset_name,
        `Deleted maintenance record: ${record.maintenance_type}`
      )
    }

    return { success: true }
  })

  // Database optimization handler
  ipcMain.handle('optimize-database', async () => {
    const db = getDatabase()

    console.log('Starting database optimization...')

    try {
      // Rebuild FTS5 index
      console.log('Rebuilding FTS5 index...')
      db.exec("INSERT INTO assets_fts(assets_fts) VALUES('rebuild')")

      // Rebuild custom fields FTS data
      console.log('Rebuilding custom fields FTS data...')
      rebuildAllCustomFieldsFTS(db)

      // Update SQLite query planner statistics
      console.log('Analyzing tables...')
      db.exec('ANALYZE')

      // Optimize query planner
      console.log('Optimizing query planner...')
      db.exec('PRAGMA optimize')

      // Incremental vacuum (reclaim deleted space)
      console.log('Running incremental vacuum...')
      db.exec('PRAGMA incremental_vacuum(1000)')

      // Get database size
      const sizeResult = db.prepare(`
        SELECT page_count * page_size as size
        FROM pragma_page_count(), pragma_page_size()
      `).get() as { size: number }
      const sizeMB = (sizeResult.size / 1024 / 1024).toFixed(2)

      console.log(`Database optimization complete. Size: ${sizeMB}MB`)

      return {
        success: true,
        message: `Database optimized successfully. Size: ${sizeMB}MB`,
        sizeMB: parseFloat(sizeMB),
      }
    } catch (error: any) {
      console.error('Database optimization failed:', error)
      return {
        success: false,
        message: `Optimization failed: ${error.message}`,
      }
    }
  })

  // Get database statistics
  ipcMain.handle('get-database-stats', () => {
    const db = getDatabase()

    try {
      // Database size
      const sizeResult = db.prepare(`
        SELECT page_count * page_size as size
        FROM pragma_page_count(), pragma_page_size()
      `).get() as { size: number }

      // Asset count
      const assetCount = db.prepare('SELECT COUNT(*) as count FROM assets').get() as { count: number }

      // FTS table size
      const ftsSize = db.prepare(`
        SELECT COUNT(*) as count FROM assets_fts
      `).get() as { count: number }

      // Index count
      const indexCount = db.prepare(`
        SELECT COUNT(*) as count FROM sqlite_master WHERE type='index'
      `).get() as { count: number }

      return {
        success: true,
        stats: {
          databaseSizeMB: (sizeResult.size / 1024 / 1024).toFixed(2),
          totalAssets: assetCount.count,
          ftsRecords: ftsSize.count,
          totalIndexes: indexCount.count,
        },
      }
    } catch (error: any) {
      console.error('Failed to get database stats:', error)
      return {
        success: false,
        message: `Failed to get stats: ${error.message}`,
      }
    }
  })
}

// Schedule automatic optimization
export function scheduleAutomaticOptimization(): void {
  const runAutoOptimization = async () => {
    console.log('Running scheduled database optimization...')
    try {
      const db = getDatabase()

      // Rebuild FTS5 index
      db.exec("INSERT INTO assets_fts(assets_fts) VALUES('optimize')")

      // Update query planner statistics
      db.exec('ANALYZE')
      db.exec('PRAGMA optimize')

      console.log('Scheduled optimization complete')
    } catch (error) {
      console.error('Scheduled optimization failed:', error)
    }
  }

  // Run on startup (after 30 seconds to not interfere with initial load)
  setTimeout(runAutoOptimization, 30000)

  // Run every 24 hours
  setInterval(runAutoOptimization, 24 * 60 * 60 * 1000)
}
