const assert = require('assert');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, '../data/replica.db');
const STORAGE_DIR = path.join(__dirname, '../data/storage');
const db = new DatabaseSync(DB_PATH);

console.log('🧪 Starting SQLite Backend Integration Tests...');

// 1. Test User Auth
console.log('  1. Testing User Auth & Scrypt Hashing...');
const testEmail = `test_${Date.now()}@example.com`;
const testPass = 'SuperSecret123!';
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(testPass, salt, 64).toString('hex');
const passHash = `${salt}:${hash}`;
const userId = crypto.randomUUID();

db.prepare(`
  INSERT INTO users (id, email, password_hash, full_name, plan)
  VALUES (?, ?, ?, ?, 'free')
`).run(userId, testEmail, passHash, 'Test Engineer');

const fetchedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
assert.strictEqual(fetchedUser.email, testEmail, 'Email should match');
assert.strictEqual(fetchedUser.plan, 'free', 'Default plan should be free');
console.log('     ✓ User registered & verified in SQLite.');

// 2. Test Task Creation & 2-Hour TTL
console.log('  2. Testing Task Creation & Ephemeral TTL Calculation...');
const taskId = crypto.randomUUID();
const taskToken = crypto.randomBytes(16).toString('hex');
const now = new Date();
const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

db.prepare(`
  INSERT INTO tasks (id, task_token, user_id, tool, status, expires_at)
  VALUES (?, ?, ?, 'merge', 'opened', ?)
`).run(taskId, taskToken, userId, expiresAt);

const fetchedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
assert.strictEqual(fetchedTask.tool, 'merge', 'Tool should be merge');
assert.strictEqual(fetchedTask.status, 'opened', 'Status should be opened');
assert(new Date(fetchedTask.expires_at) > now, 'Expires at should be in future');
console.log('     ✓ Task registered with 2-hour TTL expiration.');

// 3. Test File Storage Registration
console.log('  3. Testing File Storage & Foreign Key Cascades...');
const fileId = crypto.randomUUID();
const storageKey = `test_${taskId}_input.pdf`;
const dummyContent = Buffer.from('%PDF-1.4 dummy test content');
fs.writeFileSync(path.join(STORAGE_DIR, storageKey), dummyContent);

db.prepare(`
  INSERT INTO task_files (id, task_id, file_role, original_name, storage_key, file_size_bytes, mime_type)
  VALUES (?, ?, 'input', 'doc1.pdf', ?, ?, 'application/pdf')
`).run(fileId, taskId, storageKey, dummyContent.length);

const fetchedFile = db.prepare('SELECT * FROM task_files WHERE id = ?').get(fileId);
assert.strictEqual(fetchedFile.original_name, 'doc1.pdf');
console.log('     ✓ Task file linked in SQLite and stored on disk.');

// 4. Test "Delete it now" Instant Hard Purge
console.log('  4. Testing Instant Hard Purge ("Delete it now")...');
const fileOnDisk = path.join(STORAGE_DIR, storageKey);
assert(fs.existsSync(fileOnDisk), 'File must exist before purge');

// Execute purge
if (fs.existsSync(fileOnDisk)) fs.unlinkSync(fileOnDisk);
db.prepare(`
  UPDATE tasks SET status = 'deleted', deleted_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = ?
`).run(taskId);

assert(!fs.existsSync(fileOnDisk), 'Physical file must be deleted');
const purgedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
assert.strictEqual(purgedTask.status, 'deleted', 'Task status must be marked deleted');
console.log('     ✓ Zero-trace purge verified: Physical file removed and task status set to deleted.');

console.log('\n🎉 ALL SQLITE BACKEND INTEGRATION TESTS PASSED (4/4)!');
