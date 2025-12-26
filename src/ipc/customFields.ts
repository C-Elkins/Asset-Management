import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'

export function setupCustomFieldHandlers(): void {
  // Get custom fields for a category
  ipcMain.handle('get-custom-fields', (_event, categoryId: number) => {
    const db = getDatabase()
    return db.prepare(`
      SELECT * FROM custom_field_definitions
      WHERE category_id = ?
      ORDER BY sort_order ASC, id ASC
    `).all(categoryId)
  })

  // Create custom field definition
  ipcMain.handle('create-custom-field', (_event, field: any) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO custom_field_definitions (
        category_id, field_name, field_label, field_type,
        required, options, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      field.category_id,
      field.field_name,
      field.field_label,
      field.field_type,
      field.required || 0,
      field.options || null,
      field.sort_order || 0
    )

    return { id: result.lastInsertRowid, ...field }
  })

  // Update custom field definition
  ipcMain.handle('update-custom-field', (_event, id: number, field: any) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      UPDATE custom_field_definitions SET
        field_name = ?,
        field_label = ?,
        field_type = ?,
        required = ?,
        options = ?,
        sort_order = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    stmt.run(
      field.field_name,
      field.field_label,
      field.field_type,
      field.required || 0,
      field.options || null,
      field.sort_order || 0,
      id
    )

    return { success: true }
  })

  // Delete custom field definition
  ipcMain.handle('delete-custom-field', (_event, id: number) => {
    const db = getDatabase()
    const stmt = db.prepare('DELETE FROM custom_field_definitions WHERE id = ?')
    stmt.run(id)
    return { success: true }
  })
}
