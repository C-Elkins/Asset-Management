import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'

export function setupFilterPresetHandlers(): void {
  // Get all filter presets
  ipcMain.handle('get-filter-presets', () => {
    const db = getDatabase()
    return db.prepare(`
      SELECT * FROM filter_presets
      ORDER BY is_favorite DESC, last_used_at DESC NULLS LAST, name
    `).all()
  })

  // Get a single filter preset by ID
  ipcMain.handle('get-filter-preset', (_event, id: number) => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM filter_presets WHERE id = ?').get(id)
  })

  // Save a new filter preset
  ipcMain.handle('save-filter-preset', (_event, preset: {
    name: string
    description?: string
    filters: any
  }) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO filter_presets (name, description, filters)
      VALUES (?, ?, ?)
    `)

    const result = stmt.run(
      preset.name,
      preset.description || null,
      JSON.stringify(preset.filters)
    )

    return { id: result.lastInsertRowid as number, ...preset }
  })

  // Update an existing filter preset
  ipcMain.handle('update-filter-preset', (_event, id: number, preset: {
    name?: string
    description?: string
    filters?: any
    is_favorite?: number
  }) => {
    const db = getDatabase()

    // Build dynamic update query based on provided fields
    const updates: string[] = []
    const params: any[] = []

    if (preset.name !== undefined) {
      updates.push('name = ?')
      params.push(preset.name)
    }
    if (preset.description !== undefined) {
      updates.push('description = ?')
      params.push(preset.description)
    }
    if (preset.filters !== undefined) {
      updates.push('filters = ?')
      params.push(JSON.stringify(preset.filters))
    }
    if (preset.is_favorite !== undefined) {
      updates.push('is_favorite = ?')
      params.push(preset.is_favorite)
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    params.push(id)

    const stmt = db.prepare(`
      UPDATE filter_presets SET ${updates.join(', ')}
      WHERE id = ?
    `)

    stmt.run(...params)
    return { success: true }
  })

  // Delete a filter preset
  ipcMain.handle('delete-filter-preset', (_event, id: number) => {
    const db = getDatabase()
    const stmt = db.prepare('DELETE FROM filter_presets WHERE id = ?')
    stmt.run(id)
    return { success: true }
  })

  // Record preset usage (increment use count and update last used)
  ipcMain.handle('record-preset-usage', (_event, id: number) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      UPDATE filter_presets
      SET use_count = use_count + 1,
          last_used_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    stmt.run(id)
    return { success: true }
  })

  // Toggle favorite status
  ipcMain.handle('toggle-preset-favorite', (_event, id: number) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      UPDATE filter_presets
      SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    stmt.run(id)
    return { success: true }
  })
}
