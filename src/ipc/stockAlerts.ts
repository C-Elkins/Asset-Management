import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'
import { logActivity } from './activityLog'

export function setupStockAlertHandlers(): void {
  // Get stock alerts with optional filtering
  ipcMain.handle('get-stock-alerts', (_event, filters?: { assetId?: number; status?: string; alertType?: string }) => {
    const db = getDatabase()

    let query = `
      SELECT s.*, a.name as asset_name, a.asset_tag, a.available_quantity as current_asset_quantity
      FROM stock_alerts s
      LEFT JOIN assets a ON s.asset_id = a.id
      WHERE 1=1
    `
    const params: any[] = []

    if (filters?.assetId) {
      query += ' AND s.asset_id = ?'
      params.push(filters.assetId)
    }

    if (filters?.status) {
      query += ' AND s.status = ?'
      params.push(filters.status)
    }

    if (filters?.alertType) {
      query += ' AND s.alert_type = ?'
      params.push(filters.alertType)
    }

    query += ' ORDER BY s.created_at DESC'

    return db.prepare(query).all(...params)
  })

  // Create stock alert
  ipcMain.handle('create-stock-alert', (_event, alert: { asset_id: number; alert_type: string; threshold_value: number; current_quantity: number }) => {
    const db = getDatabase()

    // Check if there's already an active alert for this asset with the same type
    const existingAlert = db.prepare(`
      SELECT * FROM stock_alerts
      WHERE asset_id = ? AND alert_type = ? AND status = 'active'
    `).get(alert.asset_id, alert.alert_type) as any

    if (existingAlert) {
      // Update the existing alert
      db.prepare(`
        UPDATE stock_alerts
        SET current_quantity = ?, threshold_value = ?
        WHERE id = ?
      `).run(alert.current_quantity, alert.threshold_value, existingAlert.id)

      return { id: existingAlert.id, ...alert }
    }

    // Create new alert
    const stmt = db.prepare(`
      INSERT INTO stock_alerts (
        asset_id, alert_type, threshold_value, current_quantity, status
      ) VALUES (?, ?, ?, ?, 'active')
    `)

    const result = stmt.run(
      alert.asset_id,
      alert.alert_type,
      alert.threshold_value,
      alert.current_quantity
    )

    const alertId = result.lastInsertRowid as number

    // Get asset name for logging
    const asset = db.prepare('SELECT name FROM assets WHERE id = ?').get(alert.asset_id) as any

    // Log activity
    logActivity(
      db,
      'create',
      'asset',
      alert.asset_id,
      asset?.name,
      `Created ${alert.alert_type} alert (${alert.current_quantity} / ${alert.threshold_value})`
    )

    return { id: alertId, ...alert, status: 'active' }
  })

  // Acknowledge stock alert
  ipcMain.handle('acknowledge-alert', (_event, id: number, acknowledgedBy: string) => {
    const db = getDatabase()

    // Get alert info for logging
    const alert = db.prepare(`
      SELECT s.*, a.name as asset_name
      FROM stock_alerts s
      LEFT JOIN assets a ON s.asset_id = a.id
      WHERE s.id = ?
    `).get(id) as any

    if (!alert) {
      throw new Error('Stock alert not found')
    }

    db.prepare(`
      UPDATE stock_alerts
      SET status = 'acknowledged',
          acknowledged_by = ?,
          acknowledged_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(acknowledgedBy, id)

    // Log activity
    logActivity(
      db,
      'update',
      'asset',
      alert.asset_id,
      alert.asset_name,
      `Acknowledged ${alert.alert_type} alert`,
      acknowledgedBy
    )

    return { success: true }
  })

  // Resolve stock alert
  ipcMain.handle('resolve-alert', (_event, id: number) => {
    const db = getDatabase()

    // Get alert info for logging
    const alert = db.prepare(`
      SELECT s.*, a.name as asset_name
      FROM stock_alerts s
      LEFT JOIN assets a ON s.asset_id = a.id
      WHERE s.id = ?
    `).get(id) as any

    if (!alert) {
      throw new Error('Stock alert not found')
    }

    db.prepare(`
      UPDATE stock_alerts
      SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id)

    // Log activity
    logActivity(
      db,
      'update',
      'asset',
      alert.asset_id,
      alert.asset_name,
      `Resolved ${alert.alert_type} alert`
    )

    return { success: true }
  })
}
