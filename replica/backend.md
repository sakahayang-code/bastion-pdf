# Backend Integration: Replica PDF Suite (SQLite Engine)

Integrated database, task lifecycle, and security controls using SQLite for zero-configuration, lightning-fast local and self-hosted execution.

---

## 1. Database Architecture (SQLite)

- **Engine**: SQLite 3.40+ using Node 24 native `node:sqlite` (`DatabaseSync`) and local file storage.
- **Database File**: `data/replica.db` (enforces `PRAGMA foreign_keys = ON;`).
- **DDL Schema**: Checked into [replica/schema-sqlite.sql](file:///home/antigravity/replica/schema-sqlite.sql).
- **Migrations Script**: [scripts/migrate.js](file:///home/antigravity/scripts/migrate.js) runs idempotent table setup.
- **Seed Script**: [scripts/seed.js](file:///home/antigravity/scripts/seed.js) loads realistic test users, teams, and sample workflows.

### Active Tables (11)
| Table | Purpose | Keys & Foreign Rules |
| --- | --- | --- |
| `users` | User accounts, plan tiers, AI credits, Stripe customer IDs | `id TEXT PRIMARY KEY`, unique `email` |
| `teams` | Business organizations for multi-seat licensing | `owner_user_id REFERENCES users(id)` |
| `team_members` | Org memberships (owner, admin, member) | `ON DELETE CASCADE` |
| `tasks` | Ephemeral document processing sessions with 2h TTL | `expires_at`, `status`, `task_token` |
| `task_files` | Ingested and transformed physical file metadata | `task_id REFERENCES tasks(id) ON DELETE CASCADE` |
| `workflows` | Chained multi-tool automation recipes | `user_id REFERENCES users(id) ON DELETE CASCADE` |
| `workflow_runs` | Execution logs of sequential workflow pipelines | Tracks initial and final tasks |
| `subscriptions` | Stripe subscription state, seats, and billing periods | `user_id`, `stripe_subscription_id` |
| `processed_events` | Idempotency log for webhook deduplication | `id TEXT PRIMARY KEY` (Stripe event ID) |
| `api_keys` | Developer programmatic REST access keys & quotas | `public_key`, `secret_key_hash` |
| `share_links` | Short codes and mobile QR download tracking | `task_id REFERENCES tasks(id) ON DELETE CASCADE` |

---

## 2. Ephemeral Storage & "Delete it now" Purge

- **Storage Driver**: Dual driver support configured via `.env` (`STORAGE_DRIVER=local` or `STORAGE_DRIVER=r2`).
- **Local Storage Path**: `data/storage/{task_id}_{file_id}_{filename}`.
- **2-Hour Automated TTL**: Tasks automatically calculate `expires_at = now() + 2 hours`. The background job [scripts/cron-purge.js](file:///home/antigravity/scripts/cron-purge.js) automatically deletes physical files and sets `status = 'deleted'`.
- **Instant Hard Purge ("Delete it now")**:
  - Unlinks all input and output files from disk immediately.
  - Revokes browser Blob URLs / presigned tokens.
  - Updates task record with `deleted_at = now()` and `status = 'deleted'`.
  - Tested and verified in [scripts/test-backend.js](file:///home/antigravity/scripts/test-backend.js).

---

## 3. Authentication & Security

- **Password Hashing**: Node native `crypto.scryptSync` with 16-byte random salts.
- **Anonymous Sessions**: Guest users can process files without login; tasks are identified by high-entropy unguessable `task_token`.
- **Account Upgrades**: Guest tasks can be retroactively linked to an authenticated user upon sign up.

---

## 4. Security Checklist

- [x] **Secrets in environment**: All keys stored in `.env`, `.env*` added to `.gitignore`.
- [x] **Input validation**: File types restricted to `.pdf` and supported document types, payload sizes capped.
- [x] **Authorisation checks**: Database queries check `user_id` or `task_token`; second user cannot view unauthorized tasks.
- [x] **Zero-trace file purging**: Hard delete permanently destroys physical file on disk.
- [x] **Idempotent webhooks**: `processed_events` table deduplicates incoming Stripe events.
- [x] **No user data in URLs**: File tokens and task IDs use high-entropy random UUIDs/hex tokens.
- [x] **TTL file cleanup**: Automated cron script purges expired documents.

---

## 5. Verification Commands

```bash
# Run schema migration
node --experimental-sqlite scripts/migrate.js

# Seed sample data
node --experimental-sqlite scripts/seed.js

# Run backend integration tests
node --experimental-sqlite scripts/test-backend.js

# Run scheduled 2-hour TTL cleanup
node --experimental-sqlite scripts/cron-purge.js
```
