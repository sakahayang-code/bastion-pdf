# Recon map: iLovePDF (Web)

Scope: Core PDF Suite (Organize, Optimize, Convert, Edit/Annotate, Security, Workflows, and Delivery Hub)
For: Independent developers, teams, and SaaS founders building a fast, privacy-first, web-native document utility
Date: 2026-11-18

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | Marketing & Landing Site | https://www.ilovepdf.com/ | Full inventory of 25+ PDF utilities, category grouping, workflow builder teasers |
| 2 | Pricing & Feature Tiering | https://www.ilovepdf.com/pricing | Freemium limits (15MB-4GB, 1-500 files/task), OCR paywall, AI credits, team plans |
| 3 | Developer API Documentation | https://developer.ilovepdf.com/docs/api-reference | 4-step processing pipeline (start, upload, process, download), task model, webhooks, error formats |
| 4 | Security & Compliance Center | https://www.ilovepdf.com/help/security | ISO 27001, GDPR compliance, eIDAS, Stripe billing, 2-hour TTL auto-deletion policy |
| 5 | Help Center & FAQ | https://www.ilovepdf.com/help/faq | File upload methods, cloud integrations (Google Drive, Dropbox), mobile download via QR code |
| 6 | Product Tutorials & Knowledgebase | https://www.ilovepdf.com/blog/ | PDF Editor canvas mechanics, Workflows chaining automation, instant purge ("Delete it now") |

## Core loop

Upload any document, apply one or more transformations in seconds without software installation, and securely download or send the result.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Homepage & Tool Hub | `/` | Central discovery hub listing all PDF tools categorized by function | TopNav with mega-menu dropdowns, Category filter tabs, Tool card grid with badges, Workflows promotional banner, Footer | default, mobile drawer open, language switch modal |
| S02 | Universal Tool Ingestion Canvas | `/{tool_name}` (e.g. `/merge_pdf`, `/compress_pdf`) | Ingest files for a selected tool via local filesystem or cloud storage | Large drag-and-drop dropzone, "Select PDF files" button, Google Drive & Dropbox buttons, Tool description & SEO guides | empty, drag-over active, file type invalid, upload quota warning |
| S03 | Tool Staging & Option Configurator | `/{tool_name}#configure` | Preview uploaded files, reorder/rotate pages, adjust tool parameters, trigger action | File/Page thumbnail grid with grab handles, Right options sidebar (compression levels, watermark settings, sort order), Sticky action button | single file, batch files, reordering, options modified, action disabled during upload |
| S04 | Interactive PDF Editor Canvas | `/edit-pdf` (post-upload) | Direct visual annotation, text stamping, freehand drawing, and shapes | Top annotation toolbar (Pointer, Text, Image, Draw, Shape), Page thumbnail left strip, Central high-DPI canvas (PDF.js + Fabric.js), Property inspector | canvas loading, object selected with transform handles, drawing active, text editing active |
| S05 | Interactive Page Organizer & Splitter | `/organize-pdf`, `/split_pdf` | Visual page-level manipulation: reorder, delete, split into range sets, extract | Range rule creator, Page thumbnail grid with selection checkmarks, Select all / deselect all, Reset button, Action button | all selected, custom range highlighted, pages deleted/dimmed, invalid range error |
| S06 | Real-Time Processing Modal | `/{tool}#processing` | Visual feedback while files upload, process on worker queue, and assemble | Circular/linear progress bar, Stage indicator ("Uploading...", "Compressing...", "Converting..."), Transfer speed & ETA, Cancel button | uploading, processing on server, error/timeout modal |
| S07 | Universal Download & Action Hub | `/download/{task_id}` | Delivery hub to download results, save to cloud, hand off to mobile, or chain tools | Result hero with compression stats, Primary "Download" CTA with auto-timer, Cloud save buttons (Drive, Dropbox), Share/QR modal trigger, "Continue in..." tool rail, Red "Delete it now" purge button | download ready, file expired (>2h), file manually purged, copied link toast |
| S08 | Workflows Builder & Manager | `/workflows` | Multi-step pipeline builder to chain sequential tools into automated recipes | Workflow recipe cards, "Add a workflow" node canvas, Step configurator modal, Input dropzone, Run workflow button | empty (no saved workflows), builder node view, sequential execution progress |
| S09 | Side-by-Side Compare PDF Viewer | `/compare-pdf` | Visually and textually diff two versions of a PDF document | Dual file dropzones (Original vs Modified), Split-pane synchronous viewer, Diff mode toggle (Visual overlay vs Text diff), Change count chips | waiting for second file, computing diff, synchronized scroll active |
| S10 | PDF Form Filler & Builder | `/pdf-forms` | Interactive filling of detected form fields or placing new form inputs | Form field toolbar (Text, Checkbox, Radio, Dropdown, Signature), Interactive field overlay highlights, Field properties panel, Export button | auto-detected fields highlighted, filling mode, builder mode |
| S11 | Pricing & Subscription Plans | `/pricing` | Transparent tier comparison, billing cycle toggle, user seat calculator | Monthly / Yearly billing toggle (-42% badge), Tier cards (Free, Premium, Business), Seat slider stepper (1-25), Detailed feature matrix table, Stripe checkout CTA | monthly view, annual view, multi-seat slider adjusted |
| S12 | User Auth & Profile Dashboard | `/login`, `/register`, `/user/profile` | Account creation, authentication, plan status, AI credits, security, billing | Login/Signup tabbed card, Social OAuth (Google), Usage & AI credits balance meter, Subscription billing info (Stripe portal), 2FA setup panel | login form, signup form, 2FA challenge, dashboard with active plan |
| S13 | Decryption & Unlock Gateway | `/unlock_pdf#modal` | Decrypt password-protected PDFs before processing or remove security | Password input with visibility toggle, Decrypt button, Security warning callout | password prompt, decrypting spinner, invalid password alert |
| S14 | Mobile Hand-Off Download View | `/d/{short_id}` | Mobile-optimized landing page opened after scanning desktop QR code | Document icon with filename and byte size, Large "Download File" button, Open in Mobile App smart banner | ready to download, link expired |

## Flows

```
F01 Quick Merge PDFs
    S01 Homepage -> S02 Ingestion (/merge_pdf) -> S03 Staging & Reorder -> S06 Processing -> S07 Download Hub
    happy path clicks: 3 (Select Files -> Click Merge PDF -> Click Download)
    edge: Only 1 file uploaded (prompts to add more), password-protected file (prompts S13 Decrypt), file size exceeds tier limit (prompts S11 Upgrade)

F02 Compress PDF & Evaluate File Size Savings
    S01 Homepage -> S02 Ingestion (/compress_pdf) -> S03 Configurator (Select compression level) -> S06 Processing -> S07 Download Hub (Shows reduction percentage)
    happy path clicks: 3 (Select File -> Click Compress PDF -> Click Download)
    edge: File is already optimized (0% savings warning, allows downloading untouched original)

F03 Convert PDF to Word with OCR Tier Escalation
    S01 Homepage -> S02 Ingestion (/pdf_to_word) -> S03 Configurator (Detects scanned text -> prompts "No OCR (Free)" vs "OCR Premium") -> S06 Processing -> S07 Download Hub
    happy path clicks: 3 (Select File -> Click Convert to Word -> Click Download)
    edge: Scanned text requires OCR language selection; Free tier user selecting OCR Premium is routed to S11 Checkout

F04 Edit PDF: Annotate and Stamp
    S01 Homepage -> S02 Ingestion (/edit-pdf) -> S04 Editor Canvas (Select Text tool -> Add note -> Add shape -> Arrange) -> Click "Edit PDF" -> S06 Processing -> S07 Download Hub
    happy path clicks: 4 (Upload File -> Place Annotation -> Click Edit PDF -> Click Download)
    edge: Multi-page navigation, high-DPI zoom re-render, undo/redo history stack

F05 Automate Multi-Step Workflow
    S01 Homepage -> S08 Workflows -> Click "Add a workflow" -> Chain tools [Merge -> Compress -> Watermark] -> Drop files -> S06 Sequential Processing -> S07 Download Hub
    happy path clicks: 4 (Select Workflow -> Drop Files -> Run Workflow -> Click Download)
    edge: Intermediate step failure (reports exact failed node), incompatible file output type

F06 Secure Mobile File Hand-Off via QR Code
    S07 Download Hub -> Click "Share download link or scan QR" -> Scan QR code with smartphone -> S14 Mobile View -> Tap "Download File"
    happy path clicks: 2 (Click QR Share -> Tap Download on Phone)
    edge: File TTL expired (>2 hours) or file deleted by desktop user before scan (shows "File Expired" screen)

F07 Instant Manual Data Purge ("Delete it now")
    S07 Download Hub -> Click red "Delete it now" trash button -> Confirmation alert -> S07 purged state ("Your file was deleted permanently")
    happy path clicks: 2 (Click Delete -> Confirm purge)
    edge: User triggers purge before downloading (displays safeguard warning modal)

F08 Upgrade to Premium via Stripe Checkout
    S11 Pricing Page -> Toggle Annual Billing -> Select "Get Premium" -> Redirect to Stripe Checkout -> Complete Payment -> S12 Dashboard (Active Premium status)
    happy path clicks: 3 (Toggle Annual -> Click Get Premium -> Pay on Stripe)
    edge: Payment failed, multi-user license seat adjustment
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| TopNavigation | default, logged-in, transparent-sticky | default, dropdown open, mobile menu open | all |
| ToolCard | standard, compact, featured | default, hover, focus | S01 |
| FileDropzone | standard, mini, multi-file | idle, drag-over, uploading, disabled | S02, S08, S09 |
| FileThumbnailCard | document, page-strip, reorderable | idle, dragging, rotating, selected, error | S03, S04, S05 |
| ToolbarActionGroup | sticky-bottom, floating, inline | default, disabled, loading | S03, S04, S05 |
| OptionSelectorCard | radio-card, pill-selector | default, selected, disabled | S03 |
| WatermarkConfigurator | text-mode, image-mode | default, active, validation-error | S03 |
| PageNumberConfigurator | standard | default, active | S03 |
| EditorCanvasToolbar | sticky-top | default, tool-active, disabled | S04 |
| EditorPropertyDrawer | floating, docked | closed, open, editing | S04 |
| FormFieldToolbar | horizontal-bar | default, tool-selected | S10 |
| ProgressBar | linear, circular | indeterminate, determinate (0-100%), error | S06 |
| DownloadHero | single-file, multi-file-zip | ready, auto-download-triggered, expired | S07 |
| CloudActionButtons | drive, dropbox | idle, connecting, success, failed | S02, S07 |
| ShareQRModal | dialog-centered | closed, open, url-copied | S07 |
| PurgeButton | danger-ghost, danger-solid | idle, hover, confirming, disabled | S07 |
| PricingTierCard | standard, highlighted-featured | default, hover, active-plan | S11 |
| Modal | centered, bottom-sheet (mobile) | closed, open | S01, S06, S07, S13 |
| ToastNotification | success, info, warning, error | entering, visible, exiting | all |

## Inferred data model

```
User          id (uuid, pk), email (unique), password_hash (nullable for SSO), full_name,
              plan (free | premium | business), stripe_customer_id, stripe_subscription_id,
              ai_credits_balance (integer, default 0), two_factor_enabled (boolean),
              created_at (timestamptz), updated_at (timestamptz)
              evidence: S11 pricing tiers, S12 user profile, security docs (2FA, Stripe)
              confidence: high

Team          id (uuid, pk), owner_user_id (fk -> User.id), name, seats_total (integer),
              seats_used (integer), sso_provider (nullable), created_at (timestamptz)
              evidence: S11 pricing business tier (25+ users, SSO, centralized billing)
              confidence: high

TeamMember    id (uuid, pk), team_id (fk -> Team.id), user_id (fk -> User.id, nullable),
              role (admin | member), invited_email, status (pending | active),
              created_at (timestamptz)
              evidence: Pricing FAQ on team member emails and license management
              confidence: high

Task          id (uuid, pk), task_token (text, unique), user_id (fk -> User.id, nullable for anonymous),
              tool (text: merge | compress | pdf_to_word | edit | protect | ...),
              status (opened | uploading | processing | completed | failed | deleted),
              server_worker_node (text), input_file_count (int), output_file_count (int),
              input_bytes_total (bigint), output_bytes_total (bigint), timer_seconds (numeric),
              download_filename (text), download_token (text),
              expires_at (timestamptz, default now() + 2 hours), deleted_at (timestamptz, nullable),
              created_at (timestamptz)
              evidence: iLoveAPI REST API reference (/start, /upload, /process, /download, /task), FAQ 2-hour retention
              confidence: high

TaskFile      id (uuid, pk), task_id (fk -> Task.id on delete cascade),
              original_name (text), storage_key (text), file_size_bytes (bigint),
              mime_type (text), page_count (integer), order_index (integer),
              status (uploaded | processed | failed), created_at (timestamptz)
              evidence: iLoveAPI file upload response, multi-file merge staging order
              confidence: high

Workflow      id (uuid, pk), user_id (fk -> User.id on delete cascade),
              title (text), description (text), steps_definition (jsonb array of tools and options),
              run_count (integer, default 0), is_active (boolean, default true),
              created_at (timestamptz), updated_at (timestamptz)
              evidence: S08 Workflows builder, Workflows blog post ("Add a workflow, chain tools")
              confidence: high

WorkflowRun   id (uuid, pk), workflow_id (fk -> Workflow.id on delete cascade),
              user_id (fk -> User.id, nullable), status (running | completed | failed),
              current_step_index (integer), initial_task_id (fk -> Task.id),
              final_task_id (fk -> Task.id), created_at (timestamptz)
              evidence: Workflows execution pipeline
              confidence: medium

Subscription  id (uuid, pk), user_id (fk -> User.id), team_id (fk -> Team.id, nullable),
              stripe_subscription_id (text, unique), plan_id (text), billing_cycle (monthly | yearly),
              seats_count (integer), status (active | past_due | canceled),
              current_period_start (timestamptz), current_period_end (timestamptz)
              evidence: S11 pricing billing intervals, Stripe webhook subscription lifecycle
              confidence: high

ApiKey        id (uuid, pk), user_id (fk -> User.id on delete cascade),
              project_name (text), public_key (text, unique), secret_key_hash (text),
              allowed_ips (text array), allowed_domains (text array),
              monthly_credit_limit (integer), credits_used (integer),
              created_at (timestamptz)
              evidence: iLoveAPI developer portal, API key headers vs JWT authentication
              confidence: high

ShareLink     id (uuid, pk), task_id (fk -> Task.id on delete cascade),
              short_code (text, unique), qr_code_payload (text),
              download_count (integer, default 0), expires_at (timestamptz),
              created_at (timestamptz)
              evidence: S07 "Share download link or scan QR" feature, S14 mobile view
              confidence: high
```

Relationships:
- `User 1-n Task`
- `User 1-n Workflow`
- `User 1-n ApiKey`
- `User 1-1 Subscription`
- `User 1-n TeamMember`
- `Team 1-n TeamMember`
- `Team 1-n Task`
- `Task 1-n TaskFile`
- `Task 1-1 ShareLink`
- `Workflow 1-n WorkflowRun`

## Feature matrix

See `replica/features.csv`.
- Must: 22
- Should: 15
- Could: 12
- Skip: 5

## Out of scope (cannot or should not be cloned)

- **Proprietary Third-Party Conversion SDKs**: Solid Documents proprietary conversion engine (licensed commercial engine used by iLovePDF for high-precision PDF-to-Word/Excel/PowerPoint). Clone uses open-source headless LibreOffice / Poppler / MuPDF / docx libraries.
- **Qualified Trust Service Provider (QTSP) eIDAS Compliance**: iLoveSign eIDAS Qualified Electronic Signatures (AES/QES) require governmental certification and accredited certificate authorities. Clone provides Standard Electronic Signatures (SES) with cryptographic hash audit log.
- **Proprietary Mobile & Desktop Native Installers**: Native macOS/Windows desktop binaries and iOS/Android native app store bundles. Clone focuses on a responsive Progressive Web App (PWA) with offline web workers.
- **Global Multi-Region Cloud Datacenter Infrastructure**: iLovePDF's proprietary 11-region dedicated server processing cluster. Clone deploys on managed serverless / containerized infrastructure (Cloudflare / Fly.io / AWS ECS).
- **Third-Party Partner Network Marketplace**: Proprietary partner ecosystem deals and custom affiliate agreements.

## Size

Screens: 14, Flows: 8, Entities: 10.
Hard parts:
1. High-fidelity document conversion and manipulation engine (LibreOffice, Poppler, Ghostscript, pdf-lib worker pipeline).
2. Browser-native interactive PDF canvas (PDF.js rendering + Fabric.js annotation overlays with coordinate translation).
3. Secure ephemeral file lifecycle with automated 2-hour TTL expiration and instant zero-trace purging.

Size: **M (a few weeks)** for the complete web utility suite, workflows, and account system.
