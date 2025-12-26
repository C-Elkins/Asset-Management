import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'

export function setupActivityLogHandlers(): void {
  // Get recent activity
  ipcMain.handle('get-recent-activity', (_event, limit = 50) => {
    const db = getDatabase()
    return db.prepare(`
      SELECT * FROM activity_log
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit)
  })

  // Log activity
  ipcMain.handle('log-activity', (_event, activity: any) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO activity_log (
        activity_type, entity_type, entity_id, entity_name,
        description, user_name, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      activity.activity_type,
      activity.entity_type,
      activity.entity_id,
      activity.entity_name || null,
      activity.description,
      activity.user_name || null,
      activity.metadata ? JSON.stringify(activity.metadata) : null
    )

    return { success: true }
  })
}

// Helper function to log activity (can be used by other IPC handlers)
export function logActivity(
  db: any,
  activityType: string,
  entityType: string,
  entityId: number,
  entityName: string | null,
  description: string,
  userName?: string,
  metadata?: any
): void {
  try {
    const stmt = db.prepare(`
      INSERT INTO activity_log (
        activity_type, entity_type, entity_id, entity_name,
        description, user_name, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      activityType,
      entityType,
      entityId,
      entityName,
      description,
      userName || null,
      metadata ? JSON.stringify(metadata) : null
    )
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}
