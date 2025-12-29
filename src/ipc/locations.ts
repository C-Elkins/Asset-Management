import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'
import { logActivity } from './activityLog'

export function setupLocationHandlers(): void {
  // Get locations with optional filtering
  ipcMain.handle('get-locations-hierarchy', (_event, filters?: { parentId?: number; active?: boolean }) => {
    const db = getDatabase()

    let query = 'SELECT * FROM locations WHERE 1=1'
    const params: any[] = []

    if (filters?.parentId !== undefined) {
      if (filters.parentId === null) {
        query += ' AND parent_location_id IS NULL'
      } else {
        query += ' AND parent_location_id = ?'
        params.push(filters.parentId)
      }
    }

    if (filters?.active !== undefined) {
      query += ' AND active = ?'
      params.push(filters.active ? 1 : 0)
    }

    query += ' ORDER BY name ASC'

    return db.prepare(query).all(...params)
  })

  // Get single location by ID
  ipcMain.handle('get-location', (_event, id: number) => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM locations WHERE id = ?').get(id)
  })

  // Create new location
  ipcMain.handle('create-location', (_event, location) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO locations (
        name, parent_location_id, location_type, address,
        description, notes, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      location.name,
      location.parent_location_id || null,
      location.location_type || null,
      location.address || null,
      location.description || null,
      location.notes || null,
      location.active !== undefined ? location.active : 1
    )

    const locationId = result.lastInsertRowid as number

    // Log activity
    logActivity(
      db,
      'create',
      'system',
      null,
      null,
      `Created location: ${location.name}`
    )

    return { id: locationId, ...location }
  })

  // Update location
  ipcMain.handle('update-location', (_event, id: number, updates) => {
    const db = getDatabase()

    // Get current location data
    const currentLocation = db.prepare('SELECT * FROM locations WHERE id = ?').get(id) as any
    if (!currentLocation) {
      throw new Error('Location not found')
    }

    // Build dynamic update query
    const fields: string[] = []
    const params: any[] = []

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`)
        params.push(updates[key])
      }
    })

    if (fields.length === 0) {
      return { success: true }
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
    params.push(id)

    const stmt = db.prepare(`
      UPDATE locations SET ${fields.join(', ')} WHERE id = ?
    `)

    stmt.run(...params)

    // Log activity
    logActivity(
      db,
      'update',
      'system',
      null,
      null,
      `Updated location: ${currentLocation.name}`
    )

    return { success: true }
  })

  // Delete location
  ipcMain.handle('delete-location', (_event, id: number) => {
    const db = getDatabase()

    // Get location info for logging
    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(id) as any

    if (!location) {
      throw new Error('Location not found')
    }

    // Check if location has child locations
    const childCount = db.prepare('SELECT COUNT(*) as count FROM locations WHERE parent_location_id = ?').get(id) as any
    if (childCount.count > 0) {
      throw new Error('Cannot delete location with child locations. Please delete or reassign child locations first.')
    }

    // Check if location has assets assigned
    const assetCount = db.prepare('SELECT COUNT(*) as count FROM assets WHERE location = ?').get(location.name) as any
    if (assetCount.count > 0) {
      throw new Error(`Cannot delete location with ${assetCount.count} asset(s) assigned. Please reassign assets first.`)
    }

    db.prepare('DELETE FROM locations WHERE id = ?').run(id)

    // Log activity
    logActivity(
      db,
      'delete',
      'system',
      null,
      null,
      `Deleted location: ${location.name}`
    )

    return { success: true }
  })

  // Get complete location hierarchy with tree structure
  ipcMain.handle('get-location-hierarchy', () => {
    const db = getDatabase()

    // Get all locations
    const locations = db.prepare(`
      SELECT * FROM locations WHERE active = 1 ORDER BY name ASC
    `).all() as any[]

    // Build hierarchy tree
    const buildTree = (parentId: number | null): any[] => {
      return locations
        .filter(loc => loc.parent_location_id === parentId)
        .map(loc => ({
          ...loc,
          children: buildTree(loc.id)
        }))
    }

    return buildTree(null)
  })
}
