import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'

export function setupAssignmentHandlers(): void {
  // Get assignments with optional filters
  ipcMain.handle('get-assignments', (_event, filters?: { assetId?: number; status?: string }) => {
    const db = getDatabase()

    let query = `
      SELECT a.*, ast.name as asset_name, ast.asset_tag
      FROM assignments a
      LEFT JOIN assets ast ON a.asset_id = ast.id
      WHERE 1=1
    `
    const params: any[] = []

    if (filters?.assetId) {
      query += ' AND a.asset_id = ?'
      params.push(filters.assetId)
    }

    if (filters?.status) {
      query += ' AND a.status = ?'
      params.push(filters.status)
    }

    query += ' ORDER BY a.checked_out_at DESC'

    return db.prepare(query).all(...params)
  })

  // Create assignment (checkout)
  ipcMain.handle('create-assignment', (_event, assignment: any) => {
    const db = getDatabase()

    const stmt = db.prepare(`
      INSERT INTO assignments (
        asset_id, inventory_item_id, quantity, assigned_to, assigned_by,
        location, checked_out_at, expected_return_at, checkout_notes
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
    `)

    const result = stmt.run(
      assignment.asset_id,
      assignment.inventory_item_id || null,
      assignment.quantity || 1,
      assignment.assigned_to,
      assignment.assigned_by || null,
      assignment.location || null,
      assignment.expected_return_at || null,
      assignment.checkout_notes || null
    )

    // If inventory item is specified, update its status
    if (assignment.inventory_item_id) {
      db.prepare(`
        UPDATE inventory_items
        SET status = 'assigned', current_assignment_id = ?
        WHERE id = ?
      `).run(result.lastInsertRowid, assignment.inventory_item_id)
    } else if (assignment.asset_id) {
      // Update asset available quantity
      db.prepare(`
        UPDATE assets
        SET available_quantity = available_quantity - ?,
            status = CASE
              WHEN available_quantity - ? <= 0 THEN 'assigned'
              ELSE status
            END
        WHERE id = ?
      `).run(assignment.quantity || 1, assignment.quantity || 1, assignment.asset_id)
    }

    return { id: result.lastInsertRowid, ...assignment }
  })

  // Check in asset
  ipcMain.handle('check-in-asset', (_event, assignmentId: number, notes?: string) => {
    const db = getDatabase()

    // Get assignment details
    const assignment = db.prepare(`
      SELECT * FROM assignments WHERE id = ?
    `).get(assignmentId) as any

    if (!assignment) {
      throw new Error('Assignment not found')
    }

    // Update assignment
    db.prepare(`
      UPDATE assignments SET
        checked_in_at = CURRENT_TIMESTAMP,
        checkin_notes = ?,
        status = 'returned'
      WHERE id = ?
    `).run(notes || null, assignmentId)

    // If inventory item was assigned, update its status
    if (assignment.inventory_item_id) {
      db.prepare(`
        UPDATE inventory_items
        SET status = 'available', current_assignment_id = NULL
        WHERE id = ?
      `).run(assignment.inventory_item_id)
    } else {
      // Update asset available quantity
      db.prepare(`
        UPDATE assets
        SET available_quantity = available_quantity + ?,
            status = CASE
              WHEN is_tracked_inventory = 1 AND available_quantity + ? >= total_quantity THEN 'available'
              WHEN is_tracked_inventory = 0 THEN 'available'
              ELSE status
            END
        WHERE id = ?
      `).run(assignment.quantity, assignment.quantity, assignment.asset_id)
    }

    return { success: true }
  })
}
