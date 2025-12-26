import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'
import { logActivity } from './activityLog'

export function setupInventoryTransactionHandlers(): void {
  ipcMain.handle('get-inventory-transactions', (_event, filters?: { assetId?: number; transactionType?: string }) => {
    const db = getDatabase()

    let query = `
      SELECT
        t.*,
        a.name as asset_name,
        a.asset_tag
      FROM inventory_transactions t
      LEFT JOIN assets a ON t.asset_id = a.id
      WHERE 1=1
    `

    const params: any[] = []

    if (filters?.assetId) {
      query += ' AND t.asset_id = ?'
      params.push(filters.assetId)
    }

    if (filters?.transactionType) {
      query += ' AND t.transaction_type = ?'
      params.push(filters.transactionType)
    }

    query += ' ORDER BY t.created_at DESC LIMIT 100'

    return db.prepare(query).all(...params)
  })

  ipcMain.handle('create-inventory-transaction', async (_event, transaction: any) => {
    const db = getDatabase()

    try {
      // Get current asset quantities
      const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(transaction.asset_id) as any
      if (!asset) {
        throw new Error('Asset not found')
      }

      const quantityBefore = asset.available_quantity
      let quantityAfter = quantityBefore

      // Calculate new quantity based on transaction type
      switch (transaction.transaction_type) {
        case 'receive':
          // Adding inventory
          quantityAfter = quantityBefore + transaction.quantity_change
          break
        case 'checkout':
          // Removing inventory (handled by assignments normally)
          quantityAfter = quantityBefore - transaction.quantity_change
          break
        case 'checkin':
          // Returning inventory
          quantityAfter = quantityBefore + transaction.quantity_change
          break
        case 'adjustment':
        case 'writeoff':
          // Manual adjustment - quantity_change can be positive or negative
          quantityAfter = quantityBefore + transaction.quantity_change
          break
      }

      // Ensure quantity doesn't go negative
      if (quantityAfter < 0) {
        throw new Error('Insufficient inventory')
      }

      // Begin transaction
      db.exec('BEGIN TRANSACTION')

      try {
        // Insert the transaction record
        const stmt = db.prepare(`
          INSERT INTO inventory_transactions (
            transaction_type, asset_id, inventory_item_id, quantity_change,
            quantity_before, quantity_after, reason, purpose, supplier_vendor,
            po_number, invoice_number, unit_cost, performed_by, authorized_by,
            condition_on_return, notes, metadata
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)

        const result = stmt.run(
          transaction.transaction_type,
          transaction.asset_id,
          transaction.inventory_item_id || null,
          transaction.quantity_change,
          quantityBefore,
          quantityAfter,
          transaction.reason || null,
          transaction.purpose || null,
          transaction.supplier_vendor || null,
          transaction.po_number || null,
          transaction.invoice_number || null,
          transaction.unit_cost || null,
          transaction.performed_by,
          transaction.authorized_by || null,
          transaction.condition_on_return || null,
          transaction.notes || null,
          null // metadata
        )

        const transactionId = result.lastInsertRowid

        // Update asset quantities
        if (transaction.transaction_type === 'receive') {
          // For receive, update both total and available
          db.prepare(`
            UPDATE assets
            SET total_quantity = total_quantity + ?,
                available_quantity = available_quantity + ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(transaction.quantity_change, transaction.quantity_change, transaction.asset_id)
        } else {
          // For other types, just update available
          db.prepare(`
            UPDATE assets
            SET available_quantity = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(quantityAfter, transaction.asset_id)
        }

        // Log activity
        let description = ''
        switch (transaction.transaction_type) {
          case 'receive':
            description = `Received ${transaction.quantity_change} units from ${transaction.supplier_vendor || 'supplier'}`
            break
          case 'adjustment':
            description = `Adjusted inventory by ${transaction.quantity_change > 0 ? '+' : ''}${transaction.quantity_change} units`
            break
          case 'writeoff':
            description = `Wrote off ${Math.abs(transaction.quantity_change)} units`
            break
          default:
            description = `${transaction.transaction_type} transaction: ${transaction.quantity_change} units`
        }

        logActivity(
          db,
          transaction.transaction_type,
          'asset',
          transaction.asset_id,
          asset.name,
          description,
          transaction.performed_by
        )

        db.exec('COMMIT')

        // Return the created transaction
        return db.prepare('SELECT * FROM inventory_transactions WHERE id = ?').get(transactionId)
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    } catch (error) {
      console.error('Failed to create inventory transaction:', error)
      throw error
    }
  })
}
