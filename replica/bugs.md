# Bug Log: Replica PDF Suite

Tracks all reproduced bugs, severity ratings (S1–S4), reproduction steps, and fix commits.

---

### BUG-001: Storage directory missing on fresh environment causes write error
- **Severity**: S2
- **Flow / case**: Backend task file write & storage
- **Screen**: S02 / S03
- **Build**: c9d9a09  Browser / device: Node.js runtime / server
- **Steps**:
  1. Initialize fresh clone of codebase without prior file operations.
  2. Attempt to upload a document to `data/storage/`.
- **Expected**: Storage directory is created automatically if absent, allowing file write to succeed.
- **Actual**: `ENOENT: no such file or directory` thrown when writing file.
- **Evidence**: `scripts/test-backend.js` stack trace.
- **Suspected cause**: `data/storage` directory was not auto-initialized on cold start.
- **Status**: Fixed (Added `fs.mkdirSync(STORAGE_DIR, { recursive: true })` on initialization).

---

### BUG-002: Non-existent `pdf-lib` version specified in package.json
- **Severity**: S2
- **Flow / case**: F01 PDF Engine setup
- **Screen**: Server / runtime
- **Build**: c9d9a09  Browser / device: npm v11
- **Steps**:
  1. Run `npm install` with `"pdf-lib": "^1.17.9"`.
- **Expected**: Dependencies install cleanly.
- **Actual**: npm failed with `ETARGET: No matching version found for pdf-lib@^1.17.9`.
- **Evidence**: npm log `npm error code ETARGET`.
- **Suspected cause**: Typo in patch version; npm registry latest release is `1.17.1`.
- **Status**: Fixed in `package.json` by updating to `^1.17.1`.

---

## Open Bugs
- None (0 Open S1, 0 Open S2, 0 Open S3, 0 Open S4).
