# Test plan: Replica PDF Suite

Build: c9d9a09  Date: 2026-11-18  Env: local, SQLite seed data

| case | flow | type | steps | expected | auto | result |
| --- | --- | --- | --- | --- | --- | --- |
| F01-H1 | Quick Merge PDFs | happy | Upload Doc1 (1p) and Doc2 (1p), click "Merge PDF Documents", click "Download" | Merged PDF produced with 2 pages, auto-download triggered | auto | PASS |
| F01-E1 | Quick Merge PDFs | edge: single file uploaded | Upload only 1 PDF, inspect action state | Action prompts to add at least 2 files or warns user | auto | PASS |
| F01-E2 | Quick Merge PDFs | edge: reorder documents | Move Doc2 before Doc1 in staging gallery, trigger merge | Output PDF contains Doc2 pages followed by Doc1 pages | auto | PASS |
| F01-N1 | Quick Merge PDFs | negative: corrupt file | Upload non-PDF binary file renamed as .pdf | Error handled gracefully, user notified of unparseable file | auto | PASS |
| F02-H1 | Compress PDF | happy | Upload PDF, select "Recommended", trigger compression | PDF saved with object stream compression and reduced bytes | auto | PASS |
| F02-E1 | Compress PDF | edge: already optimized PDF | Upload pre-optimized PDF | File saved without corruption, user informed of size status | auto | PASS |
| F03-H1 | Convert PDF with OCR | happy | Upload scanned document, select OCR | Output text layer generated or converted to target format | manual | PASS |
| F03-E1 | Convert PDF with OCR | edge: free tier gating | Free user clicks OCR Premium | Triggers pricing upgrade prompt (S11) without crashing | manual | PASS |
| F04-H1 | Edit & Watermark PDF | happy | Upload PDF, enter "CONFIDENTIAL", trigger watermark | Watermark text rendered at 45° angle with 0.35 opacity on all pages | auto | PASS |
| F04-E1 | Edit & Watermark PDF | edge: empty watermark text | Submit watermark with blank input | Defaults to standard stamp or prevents empty transformation | auto | PASS |
| F05-H1 | Workflows Automation | happy | Select "HR Document Pack" preset, trigger execution | Multi-step pipeline runs sequentially (Merge -> Compress -> Stamp) | auto | PASS |
| F05-E1 | Workflows Automation | edge: pipeline abort | Error simulated at step 2 | Pipeline stops safely, reports exact failing step, preserves inputs | auto | PASS |
| F06-H1 | Mobile Hand-Off QR Code | happy | Click "Mobile QR" on download screen | Generates clean SVG QR code containing short link token | auto | PASS |
| F06-E1 | Mobile Hand-Off QR Code | edge: expired token scan | Scan QR code after 2-hour TTL expiration | Mobile view displays "File Expired" screen instead of broken 404 | auto | PASS |
| F07-H1 | Instant Purge ("Delete it now") | happy | Click "Delete it now" trash button on download hub | Physical file immediately deleted from disk, status set to 'deleted' | auto | PASS |
| F07-E1 | Instant Purge ("Delete it now") | edge: download attempt after purge | User attempts to download after clicking purge | Download button disabled, Blob URL revoked, zero trace in memory | auto | PASS |
| F08-H1 | Pricing & Stripe Checkout | happy | Visit /pricing, toggle Annual Billing (-42%), inspect calculations | Yearly pricing displays $5/mo ($60/yr), Stripe checkout trigger wired | manual | PASS |
| F08-N1 | Pricing & Stripe Checkout | negative: card declined | Submit test card 4000 0000 0000 0002 in checkout | Stripe error caught, subscription not activated in SQLite | manual | PASS |
