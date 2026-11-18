const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.DATABASE_URL || path.join(__dirname, '../data/replica.db');
const STORAGE_DIR = process.env.STORAGE_LOCAL_DIR || path.join(__dirname, '../data/storage');

console.log(`[cron-purge] Running scheduled 2-hour TTL cleanup on SQLite...`);
const db = new DatabaseSync(DB_PATH);

const nowIso = new Date().toISOString();

// Select all tasks that have exceeded their 2-hour expiration and are not yet marked deleted
const expiredTasks = db.prepare(`
  SELECT id FROM tasks
  WHERE expires_at <= ? AND status != 'deleted'
`).all(nowIso);

console.log(`[cron-purge] Found ${expiredTasks.length} expired task(s) to purge.`);

let purgedCount = 0;
for (const task of expiredTasks) {
  // 1. Remove associated files from storage
  const files = db.prepare('SELECT storage_key FROM task_files WHERE task_id = ?').all(task.id);
  for (const f of files) {
    const filePath = path.join(STORAGE_DIR, f.storage_key);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`[cron-purge] Failed to unlink ${filePath}:`, err.message);
      }
    }
  }

  // 2. Mark task record as deleted
  db.prepare(`
    UPDATE tasks
    SET status = 'deleted', deleted_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = ?
  `).run(task.id);

  purgedCount++;
}

console.log(`[cron-purge] Successfully purged ${purgedCount} task(s) and their physical storage files.`);
