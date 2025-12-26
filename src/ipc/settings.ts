import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'

export function setupSettingsHandlers(): void {
  // Get a setting value by key
  ipcMain.handle('get-setting', (_event, key: string) => {
    const db = getDatabase()
    const result = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(key) as any
    return result ? JSON.parse(result.value) : null
  })

  // Set a setting value
  ipcMain.handle('set-setting', (_event, key: string, value: any) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO app_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `)
    stmt.run(key, JSON.stringify(value))
    return { success: true }
  })

  // Get all settings
  ipcMain.handle('get-all-settings', () => {
    const db = getDatabase()
    const results = db.prepare('SELECT key, value FROM app_settings').all() as any[]
    const settings: Record<string, any> = {}
    results.forEach(row => {
      settings[row.key] = JSON.parse(row.value)
    })
    return settings
  })

  // Delete a setting
  ipcMain.handle('delete-setting', (_event, key: string) => {
    const db = getDatabase()
    db.prepare('DELETE FROM app_settings WHERE key = ?').run(key)
    return { success: true }
  })
}
