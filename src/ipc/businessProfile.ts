import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'

export function setupBusinessProfileHandlers(): void {
  ipcMain.handle('get-business-profile', () => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM business_profile WHERE id = 1').get()
  })

  ipcMain.handle('update-business-profile', (_event, profile: any) => {
    const db = getDatabase()

    const fields: string[] = []
    const values: any[] = []

    if (profile.company_name !== undefined) {
      fields.push('company_name = ?')
      values.push(profile.company_name)
    }
    if (profile.business_type !== undefined) {
      fields.push('business_type = ?')
      values.push(profile.business_type)
    }
    if (profile.logo_path !== undefined) {
      fields.push('logo_path = ?')
      values.push(profile.logo_path)
    }
    if (profile.default_location !== undefined) {
      fields.push('default_location = ?')
      values.push(profile.default_location)
    }
    if (profile.setup_completed !== undefined) {
      fields.push('setup_completed = ?')
      values.push(profile.setup_completed)
    }

    if (fields.length === 0) {
      return
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(1) // WHERE id = 1

    const sql = `UPDATE business_profile SET ${fields.join(', ')} WHERE id = ?`
    db.prepare(sql).run(...values)
  })
}
