import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'

export function setupInventoryItemHandlers(): void {
  // Get inventory items for an asset
  ipcMain.handle('get-inventory-items', (_event, assetId: number) => {
    const db = getDatabase()
    return db.prepare(`
      SELECT * FROM inventory_items
      WHERE asset_id = ?
      ORDER BY item_number ASC
    `).all(assetId)
  })

  // Create inventory items for an asset
  ipcMain.handle('create-inventory-items', (_event, assetId: number, quantity: number) => {
    const db = getDatabase()

    // Get asset info for generating unique identifiers
    const asset = db.prepare('SELECT asset_tag FROM assets WHERE id = ?').get(assetId) as any
    if (!asset) {
      throw new Error('Asset not found')
    }

    const items: any[] = []

    // Create individual items
    for (let i = 1; i <= quantity; i++) {
      const uniqueIdentifier = `${asset.asset_tag}-${String(i).padStart(3, '0')}`

      const stmt = db.prepare(`
        INSERT INTO inventory_items (
          asset_id, item_number, unique_identifier, status
        ) VALUES (?, ?, ?, 'available')
      `)

      const result = stmt.run(assetId, i, uniqueIdentifier)

      items.push({
        id: result.lastInsertRowid,
        asset_id: assetId,
        item_number: i,
        unique_identifier: uniqueIdentifier,
        status: 'available'
      })
    }

    return items
  })

  // Update inventory item
  ipcMain.handle('update-inventory-item', (_event, id: number, updates: any) => {
    const db = getDatabase()

    const fields: string[] = []
    const values: any[] = []

    if (updates.serial_number !== undefined) {
      fields.push('serial_number = ?')
      values.push(updates.serial_number)
    }
    if (updates.status !== undefined) {
      fields.push('status = ?')
      values.push(updates.status)
    }
    if (updates.current_assignment_id !== undefined) {
      fields.push('current_assignment_id = ?')
      values.push(updates.current_assignment_id)
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?')
      values.push(updates.notes)
    }

    if (fields.length === 0) {
      return { success: true }
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    const stmt = db.prepare(`
      UPDATE inventory_items SET ${fields.join(', ')}
      WHERE id = ?
    `)

    stmt.run(...values)
    return { success: true }
  })
}
