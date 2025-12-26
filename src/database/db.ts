import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { createSchema } from './schema'
import { runMigrations } from './migrations'

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}

export async function initDatabase(): Promise<void> {
  const userDataPath = app.getPath('userData')
  const dbDir = join(userDataPath, 'data')

  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }

  const dbPath = join(dbDir, 'assets.db')
  console.log('Database path:', dbPath)

  db = new Database(dbPath)

  // Essential pragmas
  db.pragma('journal_mode = WAL')     // Write-Ahead Logging for concurrency
  db.pragma('foreign_keys = ON')      // Enforce foreign key constraints

  // PERFORMANCE OPTIMIZATIONS

  // Synchronous mode: NORMAL is safe and much faster than FULL
  // FULL: fsync after every write (very slow, ultra-safe)
  // NORMAL: fsync at critical moments (fast, safe enough)
  // OFF: no fsync (very fast, data loss risk on crash)
  db.pragma('synchronous = NORMAL')

  // Cache size: 64MB (default is only 2MB)
  // Negative value means KB, so -64000 = 64MB
  db.pragma('cache_size = -64000')

  // Temp store: Keep temporary tables/indexes in memory
  db.pragma('temp_store = MEMORY')

  // Memory-mapped I/O: Map database to memory for faster reads
  // 30GB limit (won't actually use this much, just allows mmap)
  db.pragma('mmap_size = 30000000000')

  // Auto-vacuum: Incremental mode prevents database bloat
  db.pragma('auto_vacuum = INCREMENTAL')

  // Analysis: Update query planner statistics
  db.pragma('optimize')

  console.log('Database optimization pragmas applied')

  createSchema(db)
  runMigrations(db)

  console.log('Database schema created/verified')
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
