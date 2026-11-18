-- SQLite DDL Schema for Replica PDF Suite
PRAGMA foreign_keys = ON;

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  full_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'business')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  ai_credits_balance INTEGER NOT NULL DEFAULT 0 CHECK (ai_credits_balance >= 0),
  two_factor_enabled INTEGER NOT NULL DEFAULT 0 CHECK (two_factor_enabled IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe ON users(stripe_customer_id);

-- 2. TEAMS (Business Organizations)
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  seats_total INTEGER NOT NULL DEFAULT 5 CHECK (seats_total >= 1),
  seats_used INTEGER NOT NULL DEFAULT 1 CHECK (seats_used <= seats_total),
  sso_provider TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_user_id);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(team_id, invited_email)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id, status);

-- 3. EPHEMERAL TASKS & PROCESSED FILES
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  task_token TEXT UNIQUE NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  tool TEXT NOT NULL CHECK (tool IN (
    'merge', 'split', 'compress', 'pdf_to_word', 'word_to_pdf',
    'pdf_to_excel', 'excel_to_pdf', 'pdf_to_powerpoint', 'powerpoint_to_pdf',
    'pdf_to_jpg', 'jpg_to_pdf', 'rotate', 'page_numbers', 'watermark',
    'protect', 'unlock', 'organize', 'edit', 'ocr', 'repair', 'crop',
    'compare', 'pdf_forms', 'ai_summarizer', 'pdf_to_markdown', 'workflow'
  )),
  status TEXT NOT NULL DEFAULT 'opened' CHECK (
    status IN ('opened', 'uploading', 'processing', 'completed', 'failed', 'deleted')
  ),
  server_worker_node TEXT,
  input_file_count INTEGER NOT NULL DEFAULT 0,
  output_file_count INTEGER NOT NULL DEFAULT 0,
  input_bytes_total INTEGER NOT NULL DEFAULT 0,
  output_bytes_total INTEGER NOT NULL DEFAULT 0,
  timer_seconds REAL,
  download_filename TEXT,
  download_token TEXT UNIQUE,
  tool_options TEXT NOT NULL DEFAULT '{}',
  error_message TEXT,
  expires_at TEXT NOT NULL, -- ISO timestamp in UTC: now + 2 hours
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_token ON tasks(task_token);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status_expires ON tasks(status, expires_at);

CREATE TABLE IF NOT EXISTS task_files (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_role TEXT NOT NULL DEFAULT 'input' CHECK (file_role IN ('input', 'output')),
  original_name TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  page_count INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'processed', 'failed')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_task_files_task ON task_files(task_id, file_role, order_index);

-- 4. WORKFLOWS (Multi-step tool chaining)
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  steps_definition TEXT NOT NULL DEFAULT '[]', -- JSON array of steps
  run_count INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_workflows_user ON workflows(user_id, is_active);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  current_step_index INTEGER NOT NULL DEFAULT 0,
  initial_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  final_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  error_details TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_wf ON workflow_runs(workflow_id, status);

-- 5. BILLING & SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,
  plan_tier TEXT NOT NULL CHECK (plan_tier IN ('premium', 'business')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  seats_count INTEGER NOT NULL DEFAULT 1 CHECK (seats_count >= 1),
  unit_amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete')),
  current_period_start TEXT NOT NULL,
  current_period_end TEXT NOT NULL,
  cancel_at_period_end INTEGER NOT NULL DEFAULT 0 CHECK (cancel_at_period_end IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id, status);

CREATE TABLE IF NOT EXISTS processed_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'stripe',
  processed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 6. DEVELOPER API KEYS & WEBHOOKS
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  public_key TEXT UNIQUE NOT NULL,
  secret_key_hash TEXT NOT NULL,
  allowed_ips TEXT DEFAULT '[]', -- JSON string array
  allowed_domains TEXT DEFAULT '[]',
  monthly_credit_limit INTEGER NOT NULL DEFAULT 2500,
  credits_used INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_api_keys_public ON api_keys(public_key);

-- 7. SHARE LINKS & QR CODES
CREATE TABLE IF NOT EXISTS share_links (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  short_code TEXT UNIQUE NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  max_downloads INTEGER DEFAULT 25,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_share_links_code ON share_links(short_code);
