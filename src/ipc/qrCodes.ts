import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'
import { QRCodeGenerator } from '../utils/qrCodeGenerator'

export interface QRCode {
  id: number
  qr_code_id: string
  qr_type: 'asset' | 'inventory_item'
  entity_id: number
  asset_id: number
  data_payload: string
  verification_hash: string
  is_active: number
  generated_at: string
  expires_at: string | null
  last_scanned_at: string | null
  scan_count: number
}

export interface QRScanRecord {
  id: number
  qr_code_id: string
  scan_action: string
  scanned_by: string | null
  location: string | null
  device_info: string | null
  notes: string | null
  metadata: string | null
  created_at: string
}

export function setupQRCodeHandlers(): void {
  // Generate QR code for an asset
  ipcMain.handle('generate-asset-qr-code', async (_event, assetId: number) => {
    const db = getDatabase()

    return db.transaction(() => {
      // Get asset details
      const asset = db
        .prepare(
          `
        SELECT a.*, c.name as category_name
        FROM assets a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.id = ?
      `
        )
        .get(assetId) as any

      if (!asset) {
        throw new Error(`Asset with ID ${assetId} not found`)
      }

      // Check if QR code already exists
      const existing = db.prepare('SELECT * FROM qr_codes WHERE qr_type = ? AND entity_id = ?').get('asset', assetId) as QRCode | undefined

      if (existing) {
        return existing
      }

      // Generate QR code ID
      const qrCodeId = QRCodeGenerator.generateAssetQRId(assetId)

      // Create payload
      const payload = QRCodeGenerator.createQRPayload({
        qr_code_id: qrCodeId,
        type: 'asset',
        asset_id: assetId,
        asset_tag: asset.asset_tag,
        asset_name: asset.name,
        serial_number: asset.serial_number,
        category: asset.category_name,
      })

      // Store in database
      const result = db
        .prepare(
          `
        INSERT INTO qr_codes (qr_code_id, qr_type, entity_id, asset_id, data_payload, verification_hash, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
        )
        .run(qrCodeId, 'asset', assetId, assetId, payload, '', 1)

      return db.prepare('SELECT * FROM qr_codes WHERE id = ?').get(result.lastInsertRowid) as QRCode
    })()
  })

  // Generate QR code for an inventory item
  ipcMain.handle('generate-item-qr-code', async (_event, assetId: number, itemNumber: number) => {
    const db = getDatabase()

    return db.transaction(() => {
      // Get asset and item details
      const asset = db
        .prepare(
          `
        SELECT a.*, c.name as category_name
        FROM assets a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.id = ?
      `
        )
        .get(assetId) as any

      if (!asset) {
        throw new Error(`Asset with ID ${assetId} not found`)
      }

      // Get inventory item
      const item = db.prepare('SELECT * FROM inventory_items WHERE asset_id = ? AND item_number = ?').get(assetId, itemNumber) as any

      if (!item) {
        throw new Error(`Inventory item #${itemNumber} not found for asset ${assetId}`)
      }

      // Check if QR code already exists
      const existing = db.prepare('SELECT * FROM qr_codes WHERE qr_type = ? AND entity_id = ?').get('inventory_item', item.id) as QRCode | undefined

      if (existing) {
        return existing
      }

      // Generate QR code ID
      const qrCodeId = QRCodeGenerator.generateItemQRId(assetId, itemNumber)

      // Create payload
      const payload = QRCodeGenerator.createQRPayload({
        qr_code_id: qrCodeId,
        type: 'inventory_item',
        asset_id: assetId,
        asset_tag: asset.asset_tag,
        asset_name: asset.name,
        item_number: itemNumber,
        serial_number: item.serial_number || asset.serial_number,
        category: asset.category_name,
      })

      // Store in database
      const result = db
        .prepare(
          `
        INSERT INTO qr_codes (qr_code_id, qr_type, entity_id, asset_id, data_payload, verification_hash, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
        )
        .run(qrCodeId, 'inventory_item', item.id, assetId, payload, '', 1)

      return db.prepare('SELECT * FROM qr_codes WHERE id = ?').get(result.lastInsertRowid) as QRCode
    })()
  })

  // Get QR code by ID
  ipcMain.handle('get-qr-code', async (_event, qrCodeId: string) => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM qr_codes WHERE qr_code_id = ?').get(qrCodeId) as QRCode | undefined
  })

  // Get all QR codes for an asset
  ipcMain.handle('get-asset-qr-codes', async (_event, assetId: number) => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM qr_codes WHERE asset_id = ? AND is_active = 1 ORDER BY generated_at DESC').all(assetId) as QRCode[]
  })

  // Record a QR code scan
  ipcMain.handle('record-qr-scan', async (_event, scanData: { qr_code_id: string; scan_action: string; scanned_by?: string; location?: string; device_info?: string; notes?: string; metadata?: any }) => {
    const db = getDatabase()

    return db.transaction(() => {
      // Verify QR code exists
      const qrCode = db.prepare('SELECT * FROM qr_codes WHERE qr_code_id = ?').get(scanData.qr_code_id) as QRCode | undefined

      if (!qrCode) {
        throw new Error(`QR code ${scanData.qr_code_id} not found`)
      }

      if (!qrCode.is_active) {
        throw new Error(`QR code ${scanData.qr_code_id} is inactive`)
      }

      // Update QR code scan statistics
      db.prepare(
        `
        UPDATE qr_codes
        SET last_scanned_at = CURRENT_TIMESTAMP,
            scan_count = scan_count + 1
        WHERE qr_code_id = ?
      `
      ).run(scanData.qr_code_id)

      // Record scan in history
      const result = db
        .prepare(
          `
        INSERT INTO qr_scan_history (qr_code_id, scan_action, scanned_by, location, device_info, notes, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
        )
        .run(scanData.qr_code_id, scanData.scan_action, scanData.scanned_by || null, scanData.location || null, scanData.device_info || null, scanData.notes || null, scanData.metadata ? JSON.stringify(scanData.metadata) : null)

      return db.prepare('SELECT * FROM qr_scan_history WHERE id = ?').get(result.lastInsertRowid) as QRScanRecord
    })()
  })

  // Get scan history for a QR code
  ipcMain.handle('get-qr-scan-history', async (_event, qrCodeId: string, limit: number = 50) => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM qr_scan_history WHERE qr_code_id = ? ORDER BY created_at DESC LIMIT ?').all(qrCodeId, limit) as QRScanRecord[]
  })

  // Get recent scans across all QR codes
  ipcMain.handle('get-recent-scans', async (_event, limit: number = 100) => {
    const db = getDatabase()
    return db
      .prepare(
        `
      SELECT
        qsh.*,
        qc.qr_type,
        qc.asset_id,
        a.asset_tag,
        a.name as asset_name
      FROM qr_scan_history qsh
      JOIN qr_codes qc ON qsh.qr_code_id = qc.qr_code_id
      JOIN assets a ON qc.asset_id = a.id
      ORDER BY qsh.created_at DESC
      LIMIT ?
    `
      )
      .all(limit)
  })

  // Deactivate a QR code
  ipcMain.handle('deactivate-qr-code', async (_event, qrCodeId: string) => {
    const db = getDatabase()

    db.prepare(
      `
      UPDATE qr_codes
      SET is_active = 0
      WHERE qr_code_id = ?
    `
    ).run(qrCodeId)

    return { success: true, qr_code_id: qrCodeId }
  })

  // Batch generate QR codes for multiple assets
  ipcMain.handle('batch-generate-qr-codes', async (_event, assetIds: number[]) => {
    const db = getDatabase()

    return db.transaction(() => {
      const results = []

      for (const assetId of assetIds) {
        try {
          // Get asset details
          const asset = db
            .prepare(
              `
            SELECT a.*, c.name as category_name
            FROM assets a
            LEFT JOIN categories c ON a.category_id = c.id
            WHERE a.id = ?
          `
            )
            .get(assetId) as any

          if (!asset) {
            results.push({ assetId, success: false, error: 'Asset not found' })
            continue
          }

          // Check if QR code already exists
          const existing = db.prepare('SELECT qr_code_id FROM qr_codes WHERE qr_type = ? AND entity_id = ?').get('asset', assetId) as { qr_code_id: string } | undefined

          if (existing) {
            results.push({ assetId, success: true, qr_code_id: existing.qr_code_id, existed: true })
            continue
          }

          // Generate QR code ID
          const qrCodeId = QRCodeGenerator.generateAssetQRId(assetId)

          // Create payload
          const payload = QRCodeGenerator.createQRPayload({
            qr_code_id: qrCodeId,
            type: 'asset',
            asset_id: assetId,
            asset_tag: asset.asset_tag,
            asset_name: asset.name,
            serial_number: asset.serial_number,
            category: asset.category_name,
          })

          // Store in database
          db.prepare(
            `
            INSERT INTO qr_codes (qr_code_id, qr_type, entity_id, asset_id, data_payload, verification_hash, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `
          ).run(qrCodeId, 'asset', assetId, assetId, payload, '', 1)

          results.push({ assetId, success: true, qr_code_id: qrCodeId, existed: false })
        } catch (error) {
          results.push({ assetId, success: false, error: error.message })
        }
      }

      return {
        total: assetIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      }
    })()
  })
}
