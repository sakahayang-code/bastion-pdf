const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.DATABASE_URL || path.join(__dirname, '../data/replica.db');
const db = new DatabaseSync(DB_PATH);

console.log('[seed] Seeding database with realistic demonstration data...');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// 1. Users
const userFreeId = crypto.randomUUID();
const userPremiumId = crypto.randomUUID();
const userBusinessId = crypto.randomUUID();

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, email, password_hash, full_name, plan, stripe_customer_id, ai_credits_balance)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertUser.run(userFreeId, 'alex.free@example.com', hashPassword('Passw0rdFree!'), 'Alex Rivera', 'free', null, 0);
insertUser.run(userPremiumId, 'sarah.pro@example.com', hashPassword('Passw0rdPro!'), 'Sarah Chen', 'premium', 'cus_test_12345', 2000);
insertUser.run(userBusinessId, 'marcus.biz@example.com', hashPassword('Passw0rdBiz!'), 'Marcus Vance', 'business', 'cus_test_67890', 10000);

// 2. Teams
const teamId = crypto.randomUUID();
const insertTeam = db.prepare(`
  INSERT OR IGNORE INTO teams (id, owner_user_id, name, seats_total, seats_used)
  VALUES (?, ?, ?, ?, ?)
`);
insertTeam.run(teamId, userBusinessId, 'Vance Legal Advisory', 10, 3);

// 3. Workflows
const wfId1 = crypto.randomUUID();
const wfId2 = crypto.randomUUID();

const insertWf = db.prepare(`
  INSERT OR IGNORE INTO workflows (id, user_id, title, description, steps_definition, run_count)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertWf.run(
  wfId1,
  userPremiumId,
  'HR Onboarding Pack',
  'Combines contract and policy docs, compresses for email, stamps Confidential',
  JSON.stringify([
    { tool: 'merge', options: { reorder: 'default' } },
    { tool: 'compress', options: { level: 'recommended' } },
    { tool: 'watermark', options: { text: 'CONFIDENTIAL', opacity: 0.3 } }
  ]),
  18
);

insertWf.run(
  wfId2,
  userBusinessId,
  'Tax Invoices Archive',
  'Merges monthly receipts and converts to PDF/A for compliance archiving',
  JSON.stringify([
    { tool: 'merge', options: {} },
    { tool: 'pdf_to_pdfa', options: { conformance: '2b' } }
  ]),
  42
);

// 4. Sample Completed Task
const taskId = crypto.randomUUID();
const now = new Date();
const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

const insertTask = db.prepare(`
  INSERT OR IGNORE INTO tasks (
    id, task_token, user_id, tool, status, input_file_count, output_file_count,
    input_bytes_total, output_bytes_total, timer_seconds, download_filename, download_token, expires_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertTask.run(
  taskId,
  'demo_task_token_abc123',
  userPremiumId,
  'merge',
  'completed',
  2,
  1,
  2450000,
  2100000,
  0.420,
  'replica_merged_onboarding_pack.pdf',
  'demo_dl_token_xyz987',
  expiresAt
);

console.log('[seed] Seeding completed successfully!');
