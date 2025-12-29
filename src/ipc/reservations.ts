import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'
import { logActivity } from './activityLog'

export function setupReservationHandlers(): void {
  // Get reservations with optional filtering
  ipcMain.handle('get-reservations', (_event, filters?: { assetId?: number; status?: string }) => {
    const db = getDatabase()

    let query = `
      SELECT r.*, a.name as asset_name, a.asset_tag
      FROM reservations r
      LEFT JOIN assets a ON r.asset_id = a.id
      WHERE 1=1
    `
    const params: any[] = []

    if (filters?.assetId) {
      query += ' AND r.asset_id = ?'
      params.push(filters.assetId)
    }

    if (filters?.status) {
      query += ' AND r.status = ?'
      params.push(filters.status)
    }

    query += ' ORDER BY r.reservation_start DESC'

    return db.prepare(query).all(...params)
  })

  // Get single reservation by ID
  ipcMain.handle('get-reservation', (_event, id: number) => {
    const db = getDatabase()
    return db.prepare(`
      SELECT r.*, a.name as asset_name, a.asset_tag
      FROM reservations r
      LEFT JOIN assets a ON r.asset_id = a.id
      WHERE r.id = ?
    `).get(id)
  })

  // Create new reservation
  ipcMain.handle('create-reservation', (_event, reservation) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO reservations (
        asset_id, reserved_by, reserved_for, reservation_start,
        reservation_end, status, purpose, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      reservation.asset_id,
      reservation.reserved_by,
      reservation.reserved_for || null,
      reservation.reservation_start,
      reservation.reservation_end,
      reservation.status || 'pending',
      reservation.purpose || null,
      reservation.notes || null
    )

    const reservationId = result.lastInsertRowid as number

    // Get asset name for logging
    const asset = db.prepare('SELECT name FROM assets WHERE id = ?').get(reservation.asset_id) as any

    // Log activity
    logActivity(
      db,
      'create',
      'asset',
      reservation.asset_id,
      asset?.name,
      `Created reservation for ${reservation.reserved_by}`,
      reservation.reserved_by
    )

    return { id: reservationId, ...reservation }
  })

  // Update reservation
  ipcMain.handle('update-reservation', (_event, id: number, updates) => {
    const db = getDatabase()

    // Get current reservation data
    const currentReservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as any
    if (!currentReservation) {
      throw new Error('Reservation not found')
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
      UPDATE reservations SET ${fields.join(', ')} WHERE id = ?
    `)

    stmt.run(...params)

    // Get asset info for logging
    const asset = db.prepare('SELECT name FROM assets WHERE id = ?').get(currentReservation.asset_id) as any

    // Log activity
    logActivity(
      db,
      'update',
      'asset',
      currentReservation.asset_id,
      asset?.name,
      `Updated reservation`
    )

    return { success: true }
  })

  // Cancel reservation
  ipcMain.handle('cancel-reservation', (_event, id: number) => {
    const db = getDatabase()

    // Get reservation info for logging
    const reservation = db.prepare(`
      SELECT r.*, a.name as asset_name
      FROM reservations r
      LEFT JOIN assets a ON r.asset_id = a.id
      WHERE r.id = ?
    `).get(id) as any

    if (!reservation) {
      throw new Error('Reservation not found')
    }

    db.prepare(`
      UPDATE reservations
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id)

    // Log activity
    logActivity(
      db,
      'update',
      'asset',
      reservation.asset_id,
      reservation.asset_name,
      `Cancelled reservation for ${reservation.reserved_by}`
    )

    return { success: true }
  })

  // Delete reservation
  ipcMain.handle('delete-reservation', (_event, id: number) => {
    const db = getDatabase()

    // Get reservation info for logging
    const reservation = db.prepare(`
      SELECT r.*, a.name as asset_name
      FROM reservations r
      LEFT JOIN assets a ON r.asset_id = a.id
      WHERE r.id = ?
    `).get(id) as any

    if (!reservation) {
      throw new Error('Reservation not found')
    }

    db.prepare('DELETE FROM reservations WHERE id = ?').run(id)

    // Log activity
    logActivity(
      db,
      'delete',
      'asset',
      reservation.asset_id,
      reservation.asset_name,
      `Deleted reservation for ${reservation.reserved_by}`
    )

    return { success: true }
  })

  // Check for reservation conflicts
  ipcMain.handle('check-reservation-conflicts', (_event, assetId: number, start: string, end: string, excludeId?: number) => {
    const db = getDatabase()

    let query = `
      SELECT r.*, a.name as asset_name, a.asset_tag
      FROM reservations r
      LEFT JOIN assets a ON r.asset_id = a.id
      WHERE r.asset_id = ?
        AND r.status NOT IN ('cancelled', 'completed')
        AND (
          (r.reservation_start <= ? AND r.reservation_end >= ?)
          OR (r.reservation_start <= ? AND r.reservation_end >= ?)
          OR (r.reservation_start >= ? AND r.reservation_end <= ?)
        )
    `
    const params: any[] = [assetId, start, start, end, end, start, end]

    if (excludeId) {
      query += ' AND r.id != ?'
      params.push(excludeId)
    }

    const conflicts = db.prepare(query).all(...params)

    return {
      hasConflict: conflicts.length > 0,
      conflicts
    }
  })
}
