import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'
import { logActivity } from './activityLog'

export function setupLeaseHandlers(): void {
  // Get leases with optional filtering
  ipcMain.handle('get-leases', (_event, filters?: { assetId?: number; status?: string }) => {
    const db = getDatabase()

    let query = `
      SELECT l.*, a.name as asset_name, a.asset_tag
      FROM leases l
      LEFT JOIN assets a ON l.asset_id = a.id
      WHERE 1=1
    `
    const params: any[] = []

    if (filters?.assetId) {
      query += ' AND l.asset_id = ?'
      params.push(filters.assetId)
    }

    if (filters?.status) {
      query += ' AND l.status = ?'
      params.push(filters.status)
    }

    query += ' ORDER BY l.start_date DESC'

    return db.prepare(query).all(...params)
  })

  // Get single lease by ID
  ipcMain.handle('get-lease', (_event, id: number) => {
    const db = getDatabase()
    return db.prepare(`
      SELECT l.*, a.name as asset_name, a.asset_tag
      FROM leases l
      LEFT JOIN assets a ON l.asset_id = a.id
      WHERE l.id = ?
    `).get(id)
  })

  // Create new lease
  ipcMain.handle('create-lease', (_event, lease) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO leases (
        asset_id, contract_number, lease_type, lessor, lessee,
        start_date, end_date, renewal_date, auto_renewal,
        monthly_payment, payment_frequency, next_payment_date,
        total_value, deposit_amount, status, terms, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      lease.asset_id,
      lease.contract_number || null,
      lease.lease_type,
      lease.lessor,
      lease.lessee,
      lease.start_date,
      lease.end_date,
      lease.renewal_date || null,
      lease.auto_renewal || 0,
      lease.monthly_payment || null,
      lease.payment_frequency || null,
      lease.next_payment_date || null,
      lease.total_value || null,
      lease.deposit_amount || null,
      lease.status || 'active',
      lease.terms || null,
      lease.notes || null
    )

    const leaseId = result.lastInsertRowid as number

    // Get asset name for logging
    const asset = db.prepare('SELECT name FROM assets WHERE id = ?').get(lease.asset_id) as any

    // Log activity
    logActivity(
      db,
      'create',
      'asset',
      lease.asset_id,
      asset?.name,
      `Created ${lease.lease_type} lease with ${lease.lessor}`
    )

    return { id: leaseId, ...lease }
  })

  // Update lease
  ipcMain.handle('update-lease', (_event, id: number, updates) => {
    const db = getDatabase()

    // Get current lease data
    const currentLease = db.prepare('SELECT * FROM leases WHERE id = ?').get(id) as any
    if (!currentLease) {
      throw new Error('Lease not found')
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
      UPDATE leases SET ${fields.join(', ')} WHERE id = ?
    `)

    stmt.run(...params)

    // Get asset info for logging
    const asset = db.prepare('SELECT name FROM assets WHERE id = ?').get(currentLease.asset_id) as any

    // Log activity
    logActivity(
      db,
      'update',
      'asset',
      currentLease.asset_id,
      asset?.name,
      `Updated lease agreement`
    )

    return { success: true }
  })

  // Cancel lease
  ipcMain.handle('cancel-lease', (_event, id: number) => {
    const db = getDatabase()

    // Get lease info for logging
    const lease = db.prepare(`
      SELECT l.*, a.name as asset_name
      FROM leases l
      LEFT JOIN assets a ON l.asset_id = a.id
      WHERE l.id = ?
    `).get(id) as any

    if (!lease) {
      throw new Error('Lease not found')
    }

    db.prepare(`
      UPDATE leases
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id)

    // Log activity
    logActivity(
      db,
      'update',
      'asset',
      lease.asset_id,
      lease.asset_name,
      `Cancelled lease with ${lease.lessor}`
    )

    return { success: true }
  })

  // Renew lease
  ipcMain.handle('renew-lease', (_event, id: number, newEndDate: string) => {
    const db = getDatabase()

    // Get lease info for logging
    const lease = db.prepare(`
      SELECT l.*, a.name as asset_name
      FROM leases l
      LEFT JOIN assets a ON l.asset_id = a.id
      WHERE l.id = ?
    `).get(id) as any

    if (!lease) {
      throw new Error('Lease not found')
    }

    db.prepare(`
      UPDATE leases
      SET end_date = ?, status = 'renewed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newEndDate, id)

    // Log activity
    logActivity(
      db,
      'update',
      'asset',
      lease.asset_id,
      lease.asset_name,
      `Renewed lease until ${newEndDate}`
    )

    return { success: true }
  })

  // Delete lease
  ipcMain.handle('delete-lease', (_event, id: number) => {
    const db = getDatabase()

    // Get lease info for logging
    const lease = db.prepare(`
      SELECT l.*, a.name as asset_name
      FROM leases l
      LEFT JOIN assets a ON l.asset_id = a.id
      WHERE l.id = ?
    `).get(id) as any

    if (!lease) {
      throw new Error('Lease not found')
    }

    db.prepare('DELETE FROM leases WHERE id = ?').run(id)

    // Log activity
    logActivity(
      db,
      'delete',
      'asset',
      lease.asset_id,
      lease.asset_name,
      `Deleted lease with ${lease.lessor}`
    )

    return { success: true }
  })
}
