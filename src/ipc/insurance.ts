import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'
import { logActivity } from './activityLog'

export function setupInsuranceHandlers(): void {
  // Get insurance policies with optional filtering
  ipcMain.handle('get-insurance-policies', (_event, filters?: { assetId?: number; status?: string }) => {
    const db = getDatabase()

    let query = `
      SELECT i.*, a.name as asset_name, a.asset_tag
      FROM insurance_policies i
      LEFT JOIN assets a ON i.asset_id = a.id
      WHERE 1=1
    `
    const params: any[] = []

    if (filters?.assetId) {
      query += ' AND i.asset_id = ?'
      params.push(filters.assetId)
    }

    if (filters?.status) {
      query += ' AND i.status = ?'
      params.push(filters.status)
    }

    query += ' ORDER BY i.start_date DESC'

    return db.prepare(query).all(...params)
  })

  // Get single insurance policy by ID
  ipcMain.handle('get-insurance-policy', (_event, id: number) => {
    const db = getDatabase()
    return db.prepare(`
      SELECT i.*, a.name as asset_name, a.asset_tag
      FROM insurance_policies i
      LEFT JOIN assets a ON i.asset_id = a.id
      WHERE i.id = ?
    `).get(id)
  })

  // Create new insurance policy
  ipcMain.handle('create-insurance-policy', (_event, policy) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO insurance_policies (
        asset_id, policy_number, provider, policy_type, coverage_amount,
        premium_amount, premium_frequency, start_date, end_date,
        renewal_date, auto_renewal, deductible, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      policy.asset_id,
      policy.policy_number,
      policy.provider,
      policy.policy_type || null,
      policy.coverage_amount || null,
      policy.premium_amount || null,
      policy.premium_frequency || null,
      policy.start_date,
      policy.end_date,
      policy.renewal_date || null,
      policy.auto_renewal || 0,
      policy.deductible || null,
      policy.status || 'active',
      policy.notes || null
    )

    const policyId = result.lastInsertRowid as number

    // Get asset name for logging
    const asset = db.prepare('SELECT name FROM assets WHERE id = ?').get(policy.asset_id) as any

    // Log activity
    logActivity(
      db,
      'create',
      'asset',
      policy.asset_id,
      asset?.name,
      `Created insurance policy ${policy.policy_number} with ${policy.provider}`
    )

    return { id: policyId, ...policy }
  })

  // Update insurance policy
  ipcMain.handle('update-insurance-policy', (_event, id: number, updates) => {
    const db = getDatabase()

    // Get current policy data
    const currentPolicy = db.prepare('SELECT * FROM insurance_policies WHERE id = ?').get(id) as any
    if (!currentPolicy) {
      throw new Error('Insurance policy not found')
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
      UPDATE insurance_policies SET ${fields.join(', ')} WHERE id = ?
    `)

    stmt.run(...params)

    // Get asset info for logging
    const asset = db.prepare('SELECT name FROM assets WHERE id = ?').get(currentPolicy.asset_id) as any

    // Log activity
    logActivity(
      db,
      'update',
      'asset',
      currentPolicy.asset_id,
      asset?.name,
      `Updated insurance policy ${currentPolicy.policy_number}`
    )

    return { success: true }
  })

  // Cancel insurance policy
  ipcMain.handle('cancel-insurance-policy', (_event, id: number) => {
    const db = getDatabase()

    // Get policy info for logging
    const policy = db.prepare(`
      SELECT i.*, a.name as asset_name
      FROM insurance_policies i
      LEFT JOIN assets a ON i.asset_id = a.id
      WHERE i.id = ?
    `).get(id) as any

    if (!policy) {
      throw new Error('Insurance policy not found')
    }

    db.prepare(`
      UPDATE insurance_policies
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id)

    // Log activity
    logActivity(
      db,
      'update',
      'asset',
      policy.asset_id,
      policy.asset_name,
      `Cancelled insurance policy ${policy.policy_number}`
    )

    return { success: true }
  })

  // Delete insurance policy
  ipcMain.handle('delete-insurance-policy', (_event, id: number) => {
    const db = getDatabase()

    // Get policy info for logging
    const policy = db.prepare(`
      SELECT i.*, a.name as asset_name
      FROM insurance_policies i
      LEFT JOIN assets a ON i.asset_id = a.id
      WHERE i.id = ?
    `).get(id) as any

    if (!policy) {
      throw new Error('Insurance policy not found')
    }

    db.prepare('DELETE FROM insurance_policies WHERE id = ?').run(id)

    // Log activity
    logActivity(
      db,
      'delete',
      'asset',
      policy.asset_id,
      policy.asset_name,
      `Deleted insurance policy ${policy.policy_number}`
    )

    return { success: true }
  })
}
