-- Schema: Replica PDF Suite (iLovePDF Rebuild)
-- PostgreSQL DDL with Row Level Security (RLS)

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- =============================================================================
-- 1. USERS & PROFILES
-- =============================================================================
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text, -- null when using third-party OAuth (e.g. Google)
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'premium', 'business')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  ai_credits_balance integer not null default 0 check (ai_credits_balance >= 0),
  two_factor_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on users (email);
create index on users (stripe_customer_id);

-- =============================================================================
-- 2. TEAMS & ORGANIZATIONS (Business tier)
-- =============================================================================
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users(id) on delete restrict,
  name text not null,
  seats_total integer not null default 5 check (seats_total >= 1),
  seats_used integer not null default 1 check (seats_used <= seats_total),
  sso_provider text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on teams (owner_user_id);

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  invited_email text not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_team_email unique (team_id, invited_email)
);

create index on team_members (team_id, status);
create index on team_members (user_id);

-- =============================================================================
-- 3. EPHEMERAL TASKS & PROCESSED FILES
-- =============================================================================
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  task_token text unique not null default encode(gen_random_bytes(16), 'hex'),
  user_id uuid references users(id) on delete set null, -- null for anonymous guest users
  team_id uuid references teams(id) on delete set null,
  tool text not null check (tool in (
    'merge', 'split', 'compress', 'pdf_to_word', 'word_to_pdf',
    'pdf_to_excel', 'excel_to_pdf', 'pdf_to_powerpoint', 'powerpoint_to_pdf',
    'pdf_to_jpg', 'jpg_to_pdf', 'rotate', 'page_numbers', 'watermark',
    'protect', 'unlock', 'organize', 'edit', 'ocr', 'repair', 'crop',
    'compare', 'pdf_forms', 'ai_summarizer', 'pdf_to_markdown', 'workflow'
  )),
  status text not null default 'opened' check (
    status in ('opened', 'uploading', 'processing', 'completed', 'failed', 'deleted')
  ),
  server_worker_node text,
  input_file_count integer not null default 0 check (input_file_count >= 0),
  output_file_count integer not null default 0 check (output_file_count >= 0),
  input_bytes_total bigint not null default 0 check (input_bytes_total >= 0),
  output_bytes_total bigint not null default 0 check (output_bytes_total >= 0),
  timer_seconds numeric(8, 3),
  download_filename text,
  download_token text unique default encode(gen_random_bytes(24), 'hex'),
  tool_options jsonb not null default '{}'::jsonb,
  error_message text,
  expires_at timestamptz not null default (now() + interval '2 hours'),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create index on tasks (task_token);
create index on tasks (user_id);
create index on tasks (status, expires_at);
create index on tasks (expires_at) where status != 'deleted';

create table if not exists task_files (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  file_role text not null default 'input' check (file_role in ('input', 'output')),
  original_name text not null,
  storage_key text not null, -- Cloudflare R2 / S3 path
  file_size_bytes bigint not null check (file_size_bytes >= 0),
  mime_type text not null,
  page_count integer,
  order_index integer not null default 0,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'processed', 'failed')),
  created_at timestamptz not null default now()
);

create index on task_files (task_id, file_role, order_index);

-- =============================================================================
-- 4. WORKFLOWS (Multi-step tool chaining)
-- =============================================================================
create table if not exists workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text,
  steps_definition jsonb not null default '[]'::jsonb,
  run_count integer not null default 0 check (run_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on workflows (user_id, is_active);

create table if not exists workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references workflows(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  current_step_index integer not null default 0,
  initial_task_id uuid references tasks(id) on delete set null,
  final_task_id uuid references tasks(id) on delete set null,
  error_details text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index on workflow_runs (workflow_id, status);

-- =============================================================================
-- 5. BILLING & SUBSCRIPTIONS
-- =============================================================================
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  stripe_subscription_id text unique not null,
  stripe_price_id text not null,
  plan_tier text not null check (plan_tier in ('premium', 'business')),
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly')),
  seats_count integer not null default 1 check (seats_count >= 1),
  unit_amount_cents integer not null default 0,
  currency text not null default 'usd',
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'incomplete')),
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on subscriptions (user_id, status);
create index on subscriptions (stripe_subscription_id);

-- Table for idempotent webhook processing
create table if not exists processed_events (
  id text primary key, -- e.g. evt_1N4m...
  event_type text not null,
  source text not null default 'stripe',
  processed_at timestamptz not null default now()
);

-- =============================================================================
-- 6. DEVELOPER API KEYS & WEBHOOKS
-- =============================================================================
create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  project_name text not null,
  public_key text unique not null,
  secret_key_hash text not null,
  allowed_ips text[] default array[]::text[],
  allowed_domains text[] default array[]::text[],
  monthly_credit_limit integer not null default 2500 check (monthly_credit_limit >= 0),
  credits_used integer not null default 0 check (credits_used >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on api_keys (public_key);
create index on api_keys (user_id);

create table if not exists webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  target_url text not null,
  secret_key text not null default encode(gen_random_bytes(32), 'hex'),
  events text[] not null default array['task.completed', 'task.failed']::text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index on webhook_endpoints (user_id);

-- =============================================================================
-- 7. SHARE LINKS & QR CODES
-- =============================================================================
create table if not exists share_links (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  short_code text unique not null default encode(gen_random_bytes(4), 'hex'),
  download_count integer not null default 0 check (download_count >= 0),
  max_downloads integer default 25,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index on share_links (short_code);
create index on share_links (task_id);

-- =============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
alter table users enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table tasks enable row level security;
alter table task_files enable row level security;
alter table workflows enable row level security;
alter table workflow_runs enable row level security;
alter table subscriptions enable row level security;
alter table api_keys enable row level security;
alter table webhook_endpoints enable row level security;
alter table share_links enable row level security;

-- Users: users can read and update their own record
create policy "Users read own profile" on users
  for select using (auth.uid() = id);

create policy "Users update own profile" on users
  for update using (auth.uid() = id);

-- Tasks: users see their own tasks; anonymous tasks accessed via task_token
create policy "Users see own tasks" on tasks
  for select using (auth.uid() = user_id or user_id is null);

create policy "Users insert tasks" on tasks
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "Users update own tasks" on tasks
  for update using (auth.uid() = user_id or user_id is null);

-- Task files: follow parent task permissions
create policy "Task files access" on task_files
  for all using (
    exists (
      select 1 from tasks
      where tasks.id = task_files.task_id
      and (tasks.user_id = auth.uid() or tasks.user_id is null)
    )
  );

-- Workflows: users own their workflows
create policy "Users manage own workflows" on workflows
  for all using (auth.uid() = user_id);

create policy "Users manage workflow runs" on workflow_runs
  for all using (auth.uid() = user_id);

-- Subscriptions: users read their own subscription
create policy "Users read own subscription" on subscriptions
  for select using (auth.uid() = user_id);

-- API Keys & Webhooks: users manage their own developer assets
create policy "Users manage own api keys" on api_keys
  for all using (auth.uid() = user_id);

create policy "Users manage own webhooks" on webhook_endpoints
  for all using (auth.uid() = user_id);

-- Share links: anyone can read active share links
create policy "Public read share links" on share_links
  for select using (expires_at > now());
