import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getDb } from '../lib/sqlite-db';
import { ToolId } from '../lib/types';

const STORAGE_DIR = process.env.STORAGE_LOCAL_DIR || path.join(process.cwd(), 'data/storage');

// Ensure local storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export interface TaskRow {
  id: string;
  task_token: string;
  user_id: string | null;
  tool: ToolId;
  status: 'opened' | 'uploading' | 'processing' | 'completed' | 'failed' | 'deleted';
  input_file_count: number;
  output_file_count: number;
  input_bytes_total: number;
  output_bytes_total: number;
  timer_seconds: number | null;
  download_filename: string | null;
  download_token: string | null;
  tool_options: string;
  error_message: string | null;
  expires_at: string;
  deleted_at: string | null;
  created_at: string;
}

export class TaskService {
  static startTask(tool: ToolId, userId: string | null = null): TaskRow {
    const db = getDb();
    const id = crypto.randomUUID();
    const taskToken = crypto.randomBytes(16).toString('hex');
    const downloadToken = crypto.randomBytes(24).toString('hex');
    
    // 2-hour TTL expiration
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

    const stmt = db.prepare(`
      INSERT INTO tasks (
        id, task_token, user_id, tool, status,
        download_filename, download_token, expires_at
      ) VALUES (?, ?, ?, ?, 'opened', ?, ?, ?)
    `);

    const defaultFilename = `replica_${tool}_${Date.now()}.pdf`;
    stmt.run(id, taskToken, userId, tool, defaultFilename, downloadToken, expiresAt);

    return this.getTaskById(id)!;
  }

  static getTaskById(id: string): TaskRow | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
    if (!row || row.status === 'deleted') return null;

    // Check expiration
    if (new Date(row.expires_at).getTime() < Date.now()) {
      this.hardDeleteTask(id);
      return null;
    }

    return row;
  }

  static addFileToTask(
    taskId: string,
    originalName: string,
    buffer: Buffer,
    mimeType: string,
    orderIndex: number = 0
  ) {
    const db = getDb();
    const fileId = crypto.randomUUID();
    const storageKey = `${taskId}_${fileId}_${path.basename(originalName)}`;
    const fullPath = path.join(STORAGE_DIR, storageKey);

    fs.writeFileSync(fullPath, buffer);

    const stmt = db.prepare(`
      INSERT INTO task_files (
        id, task_id, file_role, original_name, storage_key,
        file_size_bytes, mime_type, order_index, status
      ) VALUES (?, ?, 'input', ?, ?, ?, ?, ?, 'uploaded')
    `);

    stmt.run(fileId, taskId, originalName, storageKey, buffer.length, mimeType, orderIndex);

    // Update task totals
    db.prepare(`
      UPDATE tasks
      SET input_file_count = input_file_count + 1,
          input_bytes_total = input_bytes_total + ?
      WHERE id = ?
    `).run(buffer.length, taskId);

    return { fileId, storageKey, size: buffer.length };
  }

  static completeTask(
    taskId: string,
    outputBuffer: Buffer,
    outputFilename: string,
    timerSeconds: number
  ) {
    const db = getDb();
    const outputId = crypto.randomUUID();
    const storageKey = `${taskId}_out_${outputId}_${path.basename(outputFilename)}`;
    const fullPath = path.join(STORAGE_DIR, storageKey);

    fs.writeFileSync(fullPath, outputBuffer);

    db.prepare(`
      INSERT INTO task_files (
        id, task_id, file_role, original_name, storage_key,
        file_size_bytes, mime_type, order_index, status
      ) VALUES (?, ?, 'output', ?, ?, ?, 'application/pdf', 0, 'processed')
    `).run(outputId, taskId, outputFilename, storageKey, outputBuffer.length);

    db.prepare(`
      UPDATE tasks
      SET status = 'completed',
          output_file_count = 1,
          output_bytes_total = ?,
          timer_seconds = ?,
          download_filename = ?
      WHERE id = ?
    `).run(outputBuffer.length, timerSeconds, outputFilename, taskId);

    return this.getTaskById(taskId);
  }

  static hardDeleteTask(taskId: string): boolean {
    const db = getDb();
    
    // Find files to unlink from filesystem
    const files = db.prepare('SELECT storage_key FROM task_files WHERE task_id = ?').all(taskId) as { storage_key: string }[];
    for (const f of files) {
      const filePath = path.join(STORAGE_DIR, f.storage_key);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore unlink error */ }
      }
    }

    // Set deleted status and delete timestamp (optimistic concurrency)
    const result = db.prepare(`
      UPDATE tasks
      SET status = 'deleted', deleted_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = ? AND status != 'deleted'
    `).run(taskId);

    return result.changes > 0;
  }

  static purgeExpiredTasks(): number {
    const db = getDb();
    const nowIso = new Date().toISOString();

    const expiredTasks = db.prepare(`
      SELECT id FROM tasks
      WHERE expires_at <= ? AND status != 'deleted'
    `).all(nowIso) as { id: string }[];

    let purgedCount = 0;
    for (const t of expiredTasks) {
      if (this.hardDeleteTask(t.id)) purgedCount++;
    }

    return purgedCount;
  }
}
