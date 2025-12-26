import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'

export interface UserCategoryPreference {
  id: number
  category_id: number
  is_selected: number
  is_favorite: number
  custom_order: number
  created_at: string
  updated_at: string
}

export function setupCategoryPreferenceHandlers(): void {
  // Get all user category preferences
  ipcMain.handle('get-user-category-preferences', () => {
    const db = getDatabase()
    return db.prepare(`
      SELECT * FROM user_category_preferences
      ORDER BY custom_order ASC, id ASC
    `).all() as UserCategoryPreference[]
  })

  // Get categories with preference data joined
  ipcMain.handle('get-categories-with-preferences', () => {
    const db = getDatabase()
    return db.prepare(`
      SELECT
        c.*,
        COALESCE(ucp.is_selected, 0) as is_selected,
        COALESCE(ucp.is_favorite, 0) as is_favorite,
        COALESCE(ucp.custom_order, c.sort_order) as custom_order
      FROM categories c
      LEFT JOIN user_category_preferences ucp ON c.id = ucp.category_id
      WHERE c.active = 1
      ORDER BY custom_order ASC, c.name ASC
    `).all()
  })

  // Update category preference
  ipcMain.handle('update-category-preference', (_event, categoryId: number, updates: Partial<UserCategoryPreference>) => {
    const db = getDatabase()

    // Check if preference exists
    const existing = db.prepare(
      'SELECT id FROM user_category_preferences WHERE category_id = ?'
    ).get(categoryId)

    if (existing) {
      // Update existing
      const fields = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'category_id' && key !== 'created_at')
        .map(key => `${key} = ?`)
        .join(', ')

      const values = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'category_id' && key !== 'created_at')
        .map(key => updates[key as keyof UserCategoryPreference])

      db.prepare(`
        UPDATE user_category_preferences
        SET ${fields}, updated_at = CURRENT_TIMESTAMP
        WHERE category_id = ?
      `).run(...values, categoryId)
    } else {
      // Insert new
      db.prepare(`
        INSERT INTO user_category_preferences
        (category_id, is_selected, is_favorite, custom_order)
        VALUES (?, ?, ?, ?)
      `).run(
        categoryId,
        updates.is_selected ?? 1,
        updates.is_favorite ?? 0,
        updates.custom_order ?? 0
      )
    }

    return db.prepare(
      'SELECT * FROM user_category_preferences WHERE category_id = ?'
    ).get(categoryId)
  })

  // Bulk update preferences (for setup wizard)
  ipcMain.handle('bulk-update-category-preferences', (_event, preferences: Array<{ category_id: number; is_selected: number }>) => {
    const db = getDatabase()

    return db.transaction(() => {
      for (const pref of preferences) {
        const existing = db.prepare(
          'SELECT id FROM user_category_preferences WHERE category_id = ?'
        ).get(pref.category_id)

        if (existing) {
          db.prepare(`
            UPDATE user_category_preferences
            SET is_selected = ?, updated_at = CURRENT_TIMESTAMP
            WHERE category_id = ?
          `).run(pref.is_selected, pref.category_id)
        } else {
          db.prepare(`
            INSERT INTO user_category_preferences (category_id, is_selected)
            VALUES (?, ?)
          `).run(pref.category_id, pref.is_selected)
        }
      }

      return { success: true, count: preferences.length }
    })()
  })

  // Get category view mode
  ipcMain.handle('get-category-view-mode', () => {
    const db = getDatabase()
    const result = db.prepare(
      "SELECT value FROM app_settings WHERE key = 'category_view_mode'"
    ).get() as { value: string } | undefined

    return result?.value || 'selected'
  })

  // Set category view mode
  ipcMain.handle('set-category-view-mode', (_event, mode: string) => {
    const db = getDatabase()

    // Validate mode
    if (!['selected', 'all', 'favorites'].includes(mode)) {
      throw new Error(`Invalid view mode: ${mode}`)
    }

    db.prepare(`
      INSERT OR REPLACE INTO app_settings (key, value, updated_at)
      VALUES ('category_view_mode', ?, CURRENT_TIMESTAMP)
    `).run(mode)

    return { success: true, mode }
  })
}
