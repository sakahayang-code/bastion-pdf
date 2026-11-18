# Architecture: Replica PDF Suite (a rebuild of iLovePDF's core features)

## Stack

| layer | choice | why |
| --- | --- | --- |
| web | Next.js (App Router) + TypeScript + Tailwind CSS | Fast SSR for SEO tool pages, clean API route handlers, React 19 client components for interactive canvas |
| database | PostgreSQL on Supabase | Managed Postgres with built-in Row Level Security (RLS), JSONB support for tool options, and real-time triggers |
| ORM | Drizzle ORM | High-performance type-safe SQL query builder with zero runtime bloat and seamless migration workflows |
| auth | Supabase Auth (or Auth.js) | First-class anonymous session handling, email/password, Google OAuth, and optional TOTP 2FA |
| payments | Stripe Checkout + Billing + Customer Portal | Industry standard for monthly/annual recurring subscriptions, volume seat pricing, and EU VAT/reverse-charge tax support |
| files / storage | Cloudflare R2 (S3-compatible) | Zero egress fees for high-bandwidth document downloads, pre-signed upload URLs, and automated bucket lifecycle rules |
| jobs / queue | Inngest + Vercel Cron (or BullMQ on Redis) | Durable event-driven workflow execution for multi-step pipelines and scheduled 10-minute automated file purges |
| pdf engine (in-process) | `pdf-lib` + `pdfjs-dist` + `canvas` | Lightweight client/server JS manipulation for Merge, Split, Reorder, Page Numbers, and Watermark |
| document converter | Headless LibreOffice + Poppler + Tesseract (Docker worker on Fly.io) | Sandboxed worker container for high-fidelity Word/Excel/PPT round-trip conversion and OCR text recognition |
| email | Resend | Reliable transactional email delivery for magic links, billing receipts, and team invitation notices |
| hosting | Vercel (Web / Frontend / Edge API) + Fly.io (Heavy Conversion Worker) | Serverless fast delivery for web clients paired with an isolated autoscaling container worker for CPU-intensive document processing |

## Schema

Tables: 11 (`users`, `teams`, `team_members`, `tasks`, `task_files`, `workflows`, `workflow_runs`, `subscriptions`, `processed_events`, `api_keys`, `share_links`, `webhook_endpoints`).
Access rules: PostgreSQL Row Level Security (RLS) enabled on all tables, with token-scoped access for anonymous tasks and user ID ownership for logged-in accounts. Full DDL available in [schema.sql](file:///home/antigravity/replica/schema.sql).

```sql
-- Core task & file schema excerpt (see replica/schema.sql for complete DDL)
create table tasks (
  id uuid primary key default gen_random_uuid(),
  task_token text unique not null default encode(gen_random_bytes(16), 'hex'),
  user_id uuid references users(id) on delete set null,
  tool text not null,
  status text not null default 'opened' check (status in ('opened','uploading','processing','completed','failed','deleted')),
  input_file_count integer not null default 0,
  output_file_count integer not null default 0,
  tool_options jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null default (now() + interval '2 hours'),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);
create index on tasks (expires_at) where status != 'deleted';
```

## API

| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| `POST /api/tasks/start` | Initializes a task session for a given tool | Public / Auth | `{ tool: string }` | `{ task_id, task_token, upload_url }` | F01–F04 |
| `POST /api/tasks/:id/upload` | Ingests file multipart or issues presigned S3/R2 direct upload | Public / Auth | multipart file or `{ filename, size, mime }` | `{ file_id, filename, pages }` | F01–F04 |
| `POST /api/tasks/:id/process` | Enqueues processing job with tool parameters | Public / Auth | `{ tool_options: object, file_order: uuid[], password?: string }` | `{ status: "queued", task_id }` | F01–F04 |
| `GET /api/tasks/:id/status` | Polling / SSE endpoint returning processing progress | Public / Auth | none | `{ status, progress_percent, message }` | F01–F04 |
| `GET /api/tasks/:id/download` | Serves final processed file or presigned download URL | Public / Auth | none | Binary stream or `{ download_url, filename }` | F01–F04 |
| `DELETE /api/tasks/:id` | Instantly purges files and task records ("Delete it now") | Public / Auth | none | `{ success: true, deleted_at }` | F07 |
| `POST /api/tasks/:id/share` | Generates short link and mobile QR code payload | Public / Auth | none | `{ short_code, qr_code_url, share_url }` | F06 |
| `GET /d/:short_code` | Resolves mobile web landing page to download file directly | Public | none | HTML / redirect to presigned file | F06 |
| `GET /api/workflows` | Fetches saved workflow automation recipes | Auth required | none | `{ workflows: Workflow[] }` | F05 |
| `POST /api/workflows` | Creates and saves a multi-step workflow recipe | Auth required | `{ title, description, steps }` | `Workflow` | F05 |
| `POST /api/workflows/:id/run` | Triggers sequential execution of a workflow pipeline | Auth required | `{ file_ids: uuid[] }` | `{ workflow_run_id, initial_task_id }` | F05 |
| `POST /api/billing/checkout` | Creates Stripe Checkout session for Premium/Team subscription | Auth required | `{ plan_tier, billing_cycle, seats }` | `{ checkout_url }` | F08 |
| `POST /api/billing/portal` | Creates Stripe Customer Portal session to manage invoices/cards | Auth required | none | `{ portal_url }` | F08 |
| `GET /api/v1/user/keys` | Generates or rotates developer REST API keys | Auth required | none | `{ public_key, secret_key }` | Dev API |

**Webhooks in**:
- `POST /api/webhooks/stripe`: Ingests `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Recorded in `processed_events` table for strict idempotency.

**Webhooks out**:
- `POST {endpoint_url}`: Dispatches `task.completed` and `task.failed` payloads with HMAC-SHA256 signatures to customer-configured endpoints.

**Background Jobs**:
- `purge-expired-files`: Runs every 10 minutes (`*/10 * * * *`) via Vercel Cron / Inngest. Queries `tasks` where `expires_at <= now() AND status != 'deleted'`. Deletes raw and processed files from Cloudflare R2 bucket, sets `status = 'deleted'`, records `deleted_at = now()`.
- `reset-api-credits`: Runs at midnight on the 1st of every month (`0 0 1 * *`). Resets `credits_used = 0` for all active `api_keys`.

## The parts that bite

- **Time zones & UTC Enforcing**: All file expirations (`expires_at`), token lifetimes, and audit logs are strictly stored in UTC with PostgreSQL `timestamptz`. Cleanup jobs query against `now() AT TIME ZONE 'UTC'` to eliminate daylight saving shifts.
- **Idempotency**: Webhook events from Stripe must verify signatures and check `processed_events` before altering user subscriptions or crediting accounts to prevent double-crediting on retries.
- **Race conditions**: A user clicking "Delete it now" simultaneously with an in-progress auto-download or cron purge. Resolved via optimistic concurrency: `UPDATE tasks SET status = 'deleted', deleted_at = now() WHERE id = $1 AND status != 'deleted'` returning row count.
- **Serverless File Size & Timeout Limits**: Vercel/Next.js serverless functions have a 4.5MB request body limit. Direct client-to-R2 presigned URL uploads bypass the web server entirely. Heavy conversions (>15MB) run on an asynchronous Fly.io worker pool communicating over Redis/Inngest.
- **Untrusted File Sandboxing**: Processing user-uploaded PDFs (which may harbor malicious PostScript exploit payloads or recursive decompression bombs) runs inside an isolated container with strict resource constraints (2GB RAM max, 60s CPU timeout, non-root user).
- **GDPR Zero-Trace Compliance**: Once a file is deleted (either manually or after the 2-hour TTL), both the original upload and output artifact are permanently purged from R2 and marked purged in the database.

## Build order

1. **Vertical slice**:
   - Screens: S01 (Homepage & Tool Hub), S02 (Universal Ingestion Dropzone), S03 (Staging & Reordering), S06 (Processing State), S07 (Download & Action Hub).
   - Tables: `tasks`, `task_files`.
   - Routes: `POST /api/tasks/start`, `POST /api/tasks/:id/upload`, `POST /api/tasks/:id/process`, `GET /api/tasks/:id/status`, `GET /api/tasks/:id/download`, `DELETE /api/tasks/:id`.
   - Result: Users can drag two PDFs onto the browser, click "Merge PDF", preview thumbnail order, download the merged output, and immediately hard-delete it.

2. **Must-haves**:
   - S03 In-browser PDF operations: Compress PDF (presets: extreme/recommended/low), Page Numbers, Watermark (Text/Image), Rotate, Split & Remove pages, Protect/Unlock AES encryption.
   - Background 2-hour automated file TTL cleanup cron (`purge-expired-files`).
   - S14 Mobile QR hand-off generator (`POST /api/tasks/:id/share` and `GET /d/:short_code`).
   - User authentication (Supabase Auth) with session persistence.

3. **Should-haves**:
   - Headless LibreOffice + Poppler worker container for Word/Excel/PPT to PDF and PDF to Word.
   - S04 Interactive PDF Editor canvas with Fabric.js + PDF.js text, shapes, and drawing tools.
   - Tesseract.js / OCR worker integration for scanned PDFs.
   - S08 Workflows automation engine to chain multi-tool sequences.
   - S11 Pricing & Stripe Checkout for monthly/annual subscriptions.

4. **Could-haves**:
   - S09 Side-by-side Compare PDF viewer.
   - S10 Interactive PDF Forms filler and builder.
   - S01 AI Summarizer & PDF-to-Markdown tools.
   - Developer REST API keys & outgoing webhook subscriptions.
