import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'
import { logActivity } from './activityLog'
import { updateAssetFTSCustomFields } from '../utils/customFieldsIndexer'

export function setupAssetHandlers(): void {
  // Get paginated assets with optional filters
  ipcMain.handle('get-assets-paginated', (_event, filters?: {
    categoryId?: number
    status?: string
    location?: string
    searchQuery?: string
    condition?: string
    brand?: string
    model?: string
    purchaseDateFrom?: string
    purchaseDateTo?: string
    priceMin?: number
    priceMax?: number
    warrantyExpiring?: boolean
  }, pagination?: {
    page: number
    pageSize: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
  }) => {
    const db = getDatabase()

    // Pagination defaults
    const page = pagination?.page || 1
    const pageSize = pagination?.pageSize || 50
    const sortBy = pagination?.sortBy || 'created_at'
    const sortOrder = pagination?.sortOrder || 'DESC'
    const offset = (page - 1) * pageSize

    // Validate sort column to prevent SQL injection
    const allowedSortColumns = [
      'asset_tag', 'name', 'category_id', 'status', 'location',
      'purchase_date', 'purchase_price', 'created_at', 'updated_at'
    ]
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at'
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC'

    // Build WHERE conditions
    const whereConditions: string[] = ['1=1']
    const params: any[] = []

    if (filters?.categoryId) {
      whereConditions.push('a.category_id = ?')
      params.push(filters.categoryId)
    }

    if (filters?.status) {
      whereConditions.push('a.status = ?')
      params.push(filters.status)
    }

    if (filters?.location) {
      whereConditions.push('a.location LIKE ?')
      params.push(`%${filters.location}%`)
    }

    if (filters?.searchQuery) {
      // Use FTS5 for fast text search
      whereConditions.push(`a.id IN (
        SELECT rowid FROM assets_fts WHERE assets_fts MATCH ?
      )`)
      params.push(filters.searchQuery)
    }

    // Advanced filters
    if (filters?.condition) {
      whereConditions.push('a.condition = ?')
      params.push(filters.condition)
    }

    if (filters?.brand) {
      whereConditions.push('a.brand LIKE ?')
      params.push(`%${filters.brand}%`)
    }

    if (filters?.model) {
      whereConditions.push('a.model LIKE ?')
      params.push(`%${filters.model}%`)
    }

    if (filters?.purchaseDateFrom) {
      whereConditions.push('a.purchase_date >= ?')
      params.push(filters.purchaseDateFrom)
    }

    if (filters?.purchaseDateTo) {
      whereConditions.push('a.purchase_date <= ?')
      params.push(filters.purchaseDateTo)
    }

    if (filters?.priceMin !== undefined) {
      whereConditions.push('a.purchase_price >= ?')
      params.push(filters.priceMin)
    }

    if (filters?.priceMax !== undefined) {
      whereConditions.push('a.purchase_price <= ?')
      params.push(filters.priceMax)
    }

    if (filters?.warrantyExpiring) {
      // Show assets with warranty expiring in next 30 days
      whereConditions.push(`a.warranty_expiry IS NOT NULL AND a.warranty_expiry <= date('now', '+30 days')`)
    }

    const whereClause = whereConditions.join(' AND ')

    // Count total items (for pagination metadata)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM assets a
      WHERE ${whereClause}
    `
    const countResult = db.prepare(countQuery).get(...params) as { total: number }
    const totalItems = countResult.total
    const totalPages = Math.ceil(totalItems / pageSize)

    // Fetch paginated data with counts
    const dataQuery = `
      SELECT
        a.*,
        c.name as category_name,
        c.color_code as category_color,
        c.icon as category_icon,
        COALESCE(lease_counts.count, 0) as lease_count,
        COALESCE(insurance_counts.count, 0) as insurance_count,
        COALESCE(reservation_counts.count, 0) as reservation_count
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN (
        SELECT asset_id, COUNT(*) as count
        FROM leases
        WHERE status = 'active'
        GROUP BY asset_id
      ) lease_counts ON a.id = lease_counts.asset_id
      LEFT JOIN (
        SELECT asset_id, COUNT(*) as count
        FROM insurance_policies
        WHERE status = 'active'
        GROUP BY asset_id
      ) insurance_counts ON a.id = insurance_counts.asset_id
      LEFT JOIN (
        SELECT asset_id, COUNT(*) as count
        FROM reservations
        WHERE status IN ('pending', 'confirmed', 'active')
        GROUP BY asset_id
      ) reservation_counts ON a.id = reservation_counts.asset_id
      WHERE ${whereClause}
      ORDER BY a.${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `

    const data = db.prepare(dataQuery).all(...params, pageSize, offset)

    // Return paginated result
    return {
      data,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    }
  })

  // Get all assets with optional filters (kept for backward compatibility)
  ipcMain.handle('get-assets', (_event, filters?: {
    categoryId?: number
    status?: string
    location?: string
    searchQuery?: string
  }) => {
    const db = getDatabase()

    let query = `
      SELECT
        a.*,
        c.name as category_name,
        c.color_code as category_color,
        COALESCE(lease_counts.count, 0) as lease_count,
        COALESCE(insurance_counts.count, 0) as insurance_count,
        COALESCE(reservation_counts.count, 0) as reservation_count
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN (
        SELECT asset_id, COUNT(*) as count
        FROM leases
        WHERE status = 'active'
        GROUP BY asset_id
      ) lease_counts ON a.id = lease_counts.asset_id
      LEFT JOIN (
        SELECT asset_id, COUNT(*) as count
        FROM insurance_policies
        WHERE status = 'active'
        GROUP BY asset_id
      ) insurance_counts ON a.id = insurance_counts.asset_id
      LEFT JOIN (
        SELECT asset_id, COUNT(*) as count
        FROM reservations
        WHERE status IN ('pending', 'confirmed', 'active')
        GROUP BY asset_id
      ) reservation_counts ON a.id = reservation_counts.asset_id
      WHERE 1=1
    `
    const params: any[] = []

    if (filters?.categoryId) {
      query += ' AND a.category_id = ?'
      params.push(filters.categoryId)
    }

    if (filters?.status) {
      query += ' AND a.status = ?'
      params.push(filters.status)
    }

    if (filters?.location) {
      query += ' AND a.location LIKE ?'
      params.push(`%${filters.location}%`)
    }

    if (filters?.searchQuery) {
      // Use FTS5 full-text search for fast text queries
      query += ` AND a.id IN (
        SELECT rowid FROM assets_fts WHERE assets_fts MATCH ?
      )`
      params.push(filters.searchQuery)
    }

    query += ' ORDER BY a.created_at DESC'

    return db.prepare(query).all(...params)
  })

  // Get single asset by ID
  ipcMain.handle('get-asset', (_event, id: number) => {
    const db = getDatabase()
    return db.prepare(`
      SELECT a.*, c.name as category_name
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = ?
    `).get(id)
  })

  // Create asset
  ipcMain.handle('create-asset', (_event, asset) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO assets (
        asset_tag, name, description, category_id, brand, model,
        serial_number, purchase_price, purchase_date, vendor,
        location, status, condition, warranty_expiry, next_maintenance,
        is_tracked_inventory, total_quantity, available_quantity,
        custom_fields, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const isTracked = asset.is_tracked_inventory || 0
    const totalQty = asset.total_quantity || 1
    const availableQty = asset.available_quantity || totalQty

    const result = stmt.run(
      asset.asset_tag,
      asset.name,
      asset.description || null,
      asset.category_id,
      asset.brand || null,
      asset.model || null,
      asset.serial_number || null,
      asset.purchase_price || null,
      asset.purchase_date || null,
      asset.vendor || null,
      asset.location || null,
      asset.status || 'available',
      asset.condition || 'good',
      asset.warranty_expiry || null,
      asset.next_maintenance || null,
      isTracked,
      totalQty,
      availableQty,
      asset.custom_fields ? JSON.stringify(asset.custom_fields) : null,
      asset.notes || null
    )

    const assetId = result.lastInsertRowid as number

    // Update FTS custom fields if present
    if (asset.custom_fields) {
      try {
        updateAssetFTSCustomFields(db, assetId, asset.category_id, asset.custom_fields)
      } catch (error) {
        console.error('Failed to update FTS custom fields:', error)
      }
    }

    // If tracked inventory, create individual inventory items
    if (isTracked && totalQty > 0) {
      for (let i = 1; i <= totalQty; i++) {
        const uniqueIdentifier = `${asset.asset_tag}-${String(i).padStart(3, '0')}`
        db.prepare(`
          INSERT INTO inventory_items (
            asset_id, item_number, unique_identifier, status
          ) VALUES (?, ?, ?, 'available')
        `).run(assetId, i, uniqueIdentifier)
      }
    }

    // Log activity
    logActivity(
      db,
      'create',
      'asset',
      assetId,
      asset.name,
      `Created asset: ${asset.name} (${asset.asset_tag})`
    )

    return { id: assetId, ...asset }
  })

  // Update asset
  ipcMain.handle('update-asset', (_event, id: number, asset) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      UPDATE assets SET
        asset_tag = ?, name = ?, description = ?, category_id = ?,
        brand = ?, model = ?, serial_number = ?, purchase_price = ?,
        purchase_date = ?, vendor = ?, location = ?, status = ?,
        condition = ?, warranty_expiry = ?, next_maintenance = ?,
        is_tracked_inventory = ?, total_quantity = ?, available_quantity = ?,
        custom_fields = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    stmt.run(
      asset.asset_tag,
      asset.name,
      asset.description || null,
      asset.category_id,
      asset.brand || null,
      asset.model || null,
      asset.serial_number || null,
      asset.purchase_price || null,
      asset.purchase_date || null,
      asset.vendor || null,
      asset.location || null,
      asset.status || 'available',
      asset.condition || 'good',
      asset.warranty_expiry || null,
      asset.next_maintenance || null,
      asset.is_tracked_inventory || 0,
      asset.total_quantity || 1,
      asset.available_quantity || (asset.total_quantity || 1),
      asset.custom_fields ? JSON.stringify(asset.custom_fields) : null,
      asset.notes || null,
      id
    )

    // Update FTS custom fields if present
    if (asset.custom_fields) {
      try {
        updateAssetFTSCustomFields(db, id, asset.category_id, asset.custom_fields)
      } catch (error) {
        console.error('Failed to update FTS custom fields:', error)
      }
    }

    // Log activity
    logActivity(
      db,
      'update',
      'asset',
      id,
      asset.name,
      `Updated asset: ${asset.name}`
    )

    return { id, ...asset }
  })

  // Delete asset
  ipcMain.handle('delete-asset', (_event, id: number) => {
    const db = getDatabase()

    // Get asset name for logging
    const asset = db.prepare('SELECT name FROM assets WHERE id = ?').get(id) as any

    const stmt = db.prepare('DELETE FROM assets WHERE id = ?')
    stmt.run(id)

    // Log activity
    if (asset) {
      logActivity(
        db,
        'delete',
        'asset',
        id,
        asset.name,
        `Deleted asset: ${asset.name}`
      )
    }

    return { success: true }
  })

  // Bulk update assets
  ipcMain.handle('bulk-update-assets', (_event, ids: number[], updates: any) => {
    const db = getDatabase()

    try {
      db.transaction(() => {
        const fields = Object.keys(updates).join(' = ?, ') + ' = ?'
        const values = [...Object.values(updates)]

        for (const id of ids) {
          db.prepare(`UPDATE assets SET ${fields} WHERE id = ?`).run(...values, id)
        }
      })()

      console.log(`Bulk updated ${ids.length} assets`)
      return { success: true, count: ids.length }
    } catch (error: any) {
      console.error('Bulk update error:', error)
      throw new Error(error.message || 'Failed to bulk update assets')
    }
  })

  // Bulk delete assets
  ipcMain.handle('bulk-delete-assets', (_event, ids: number[]) => {
    const db = getDatabase()

    // Get asset names for logging
    const placeholders = ids.map(() => '?').join(',')
    const assets = db.prepare(`SELECT id, name FROM assets WHERE id IN (${placeholders})`).all(...ids) as any[]

    const stmt = db.prepare(`DELETE FROM assets WHERE id IN (${placeholders})`)
    stmt.run(...ids)

    // Log activity for each deleted asset
    assets.forEach(asset => {
      logActivity(
        db,
        'delete',
        'asset',
        asset.id,
        asset.name,
        `Deleted asset: ${asset.name}`
      )
    })

    return { success: true, count: ids.length }
  })

  // Get asset statistics
  ipcMain.handle('get-asset-stats', () => {
    const db = getDatabase()

    const total = db.prepare('SELECT COUNT(*) as count FROM assets').get() as { count: number }
    const available = db.prepare('SELECT COUNT(*) as count FROM assets WHERE status = ?').get('available') as { count: number }
    const assigned = db.prepare('SELECT COUNT(*) as count FROM assets WHERE status = ?').get('assigned') as { count: number }
    const maintenance = db.prepare('SELECT COUNT(*) as count FROM assets WHERE status = ?').get('maintenance') as { count: number }

    return {
      total: total.count,
      available: available.count,
      assigned: assigned.count,
      maintenance: maintenance.count
    }
  })

  // Get unique locations
  ipcMain.handle('get-locations', () => {
    const db = getDatabase()
    return db.prepare(`
      SELECT DISTINCT location
      FROM assets
      WHERE location IS NOT NULL AND location != ''
      ORDER BY location
    `).all()
  })

  // Get child assets for a parent asset
  ipcMain.handle('get-asset-children', (_event, parentId: number) => {
    const db = getDatabase()
    return db.prepare(`
      SELECT a.*, c.name as category_name
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.parent_asset_id = ?
      ORDER BY a.name ASC
    `).all(parentId)
  })

  // Update asset parent relationship
  ipcMain.handle('update-asset-parent', (_event, assetId: number, parentAssetId: number | null) => {
    const db = getDatabase()

    // Get asset info for logging
    const asset = db.prepare('SELECT name FROM assets WHERE id = ?').get(assetId) as any

    if (!asset) {
      throw new Error('Asset not found')
    }

    // If setting a parent, validate it exists and prevent circular references
    if (parentAssetId !== null) {
      const parent = db.prepare('SELECT id, parent_asset_id FROM assets WHERE id = ?').get(parentAssetId) as any

      if (!parent) {
        throw new Error('Parent asset not found')
      }

      // Prevent setting self as parent
      if (parentAssetId === assetId) {
        throw new Error('Cannot set asset as its own parent')
      }

      // Prevent circular references (check if parent has this asset as its parent)
      let currentParentId = parent.parent_asset_id
      while (currentParentId !== null) {
        if (currentParentId === assetId) {
          throw new Error('Circular parent relationship detected')
        }
        const nextParent = db.prepare('SELECT parent_asset_id FROM assets WHERE id = ?').get(currentParentId) as any
        currentParentId = nextParent?.parent_asset_id || null
      }
    }

    db.prepare(`
      UPDATE assets
      SET parent_asset_id = ?
      WHERE id = ?
    `).run(parentAssetId, assetId)

    // Log activity
    const parentAsset = parentAssetId ? db.prepare('SELECT name FROM assets WHERE id = ?').get(parentAssetId) as any : null
    const message = parentAssetId
      ? `Set parent asset to: ${parentAsset?.name}`
      : 'Removed parent asset relationship'

    logActivity(
      db,
      'update',
      'asset',
      assetId,
      asset.name,
      message
    )

    return { success: true }
  })
}
