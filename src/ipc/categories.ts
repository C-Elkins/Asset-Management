import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'

export function setupCategoryHandlers(): void {
  ipcMain.handle('get-categories', () => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM categories WHERE active = 1 ORDER BY sort_order, name').all()
  })

  ipcMain.handle('create-category', (_event, category) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO categories (name, description, icon, color_code, category_type, sort_order, custom_field_definitions)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(
      category.name,
      category.description || null,
      category.icon || '📦',
      category.color_code || '#6366f1',
      category.category_type || 'custom',
      category.sort_order || 0,
      category.custom_field_definitions ? JSON.stringify(category.custom_field_definitions) : null
    )
    return { id: result.lastInsertRowid, ...category }
  })

  ipcMain.handle('update-category', (_event, id, category) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      UPDATE categories
      SET name = ?, description = ?, icon = ?, color_code = ?, category_type = ?,
          sort_order = ?, custom_field_definitions = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    stmt.run(
      category.name,
      category.description || null,
      category.icon || '📦',
      category.color_code || '#6366f1',
      category.category_type || 'custom',
      category.sort_order || 0,
      category.custom_field_definitions ? JSON.stringify(category.custom_field_definitions) : null,
      id
    )
    return { id, ...category }
  })

  ipcMain.handle('delete-category', (_event, id) => {
    const db = getDatabase()
    const stmt = db.prepare('UPDATE categories SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    stmt.run(id)
    return { success: true }
  })
}
