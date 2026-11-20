# Strategic Pricing: BastionPDF

> Competitive market benchmark, user review sentiment analysis, packaging architecture, and Stripe configuration for BastionPDF.

---

## 1. Competitive Pricing Benchmark

Captured on **November 19, 2026**:

| Provider | Plan | Pricing (Monthly) | Pricing (Annual) | Cloud Upload Required? | Ad Trackers | Source URL |
| --- | --- | --- | --- | --- | --- |
| **iLovePDF** | Free | $0 | $0 | **Yes** (All files uploaded) | **Yes** (600+ cookies) | [ilovepdf.com/pricing](https://www.ilovepdf.com/pricing) |
| **iLovePDF** | Premium | $7.00 / mo | $48.00 / yr ($4.00/mo) | **Yes** (Cloud processing) | No (Logged in) | [ilovepdf.com/pricing](https://www.ilovepdf.com/pricing) |
| **Smallpdf** | Pro | $12.00 / mo | $108.00 / yr ($9.00/mo) | **Yes** (Server upload) | Minimal | [smallpdf.com/pricing](https://smallpdf.com/pricing) |
| **Adobe Acrobat** | Pro | $29.99 / mo | $239.88 / yr ($19.99/mo) | Partial / Cloud | No | [adobe.com/acrobat/pricing](https://www.adobe.com/acrobat/pricing.html) |
| **PDF24** | Free Web | $0 | $0 | **Yes** (Server upload) | Ad supported | [tools.pdf24.org](https://tools.pdf24.org) |

---

## 2. Reviewer Feedback on Pricing & Billing

From `replica/feedback.md` and `replica/reviews.csv`:
- **5 verbatim reviews** specifically complained about aggressive paywalls on everyday tasks:
  - Daily artificial caps (2 files per day on free tier).
  - Gated batch size (cannot merge more than 5 files without paying).
  - Sudden paywalls appearing after users invested time uploading multiple documents.
- **3 complaints** regarding dark billing patterns:
  - Difficult annual auto-renewal cancellation flows.
  - Unexpected per-seat subscription price escalations.

---

## 3. BastionPDF Commercial Model & Tiers

We do not use artificial file quotas or tracking ads. Core operations execute locally in the client browser, so our infrastructure costs for free users are virtually zero (only static asset CDN delivery).

### Tier 1: Sovereign Free
*For individuals handling sensitive documents who want immediate, zero-knowledge processing.*
- **Price**: **$0 forever**
- **Architecture**: 100% In-Browser Execution via WebAssembly / PDF-Lib
- **Limits**: Unlimited merges, splits, watermarks, and page numbers
- **Privacy**: Zero server uploads, zero trackers, zero account required
- **Included**:
  - Merge & Reorder PDF
  - Split & Extract Pages
  - Page Numbering & Custom Stamping
  - Text & Image Watermarking
  - Instant Zero-Trace Hard Purge

### Tier 2: Pro Workstation
*For legal practitioners, accountants, consultants, and power users.*
- **Price**: **$6 / month** (or **$48 / year** — 2 months free)
- **Included** (Everything in Free, plus):
  - Advanced Multi-Range Batch Split (`1-4, 5-8, 9-12` in one click)
  - Custom SVG Watermark presets & branding templates
  - Multi-file automated macro workflows
  - Client-side cryptographic SHA-256 destruction audit certificates
  - High-priority background worker for massive 500MB+ documents
  - 1-click subscription management with instant self-service cancel

### Tier 3: Enterprise Self-Hosted
*For hospitals, law firms, financial institutions, and enterprise IT teams.*
- **Price**: **$24 / seat / month** (billed annually at $240 / seat / year)
- **Included**:
  - 1-Click Containerized Docker Deployment (`docker compose up`)
  - Runs fully behind corporate firewall / air-gapped environments
  - Local SQLite / PostgreSQL database persistence
  - SAML 2.0 / Okta / Azure AD Single Sign-On
  - Dedicated compliance SLA & SOC 2 audit logs

---

## 4. Billing Pain Points Fixed in BastionPDF

1. **No Artificial Daily Quotas**: Free users are never cut off mid-task; local compute uses their machine's CPU.
2. **One-Click Instant Cancellation**: Manage or cancel subscription directly in the app navigation without calling support or navigating 6 retention pages.
3. **Transparent Advance Renewal Notices**: Automatic email reminders 7 days before any annual renewal charge.
4. **No Per-Seat Surprise Jumps**: Flat predictable team seat tiers.

---

## 5. Stripe Production Configuration

The following product and price structures are prepared for Stripe setup:

| Product Name | Stripe Product ID | Billing Interval | Unit Amount (USD) | Stripe Price ID (Example) |
| --- | --- | --- | --- | --- |
| **BastionPDF Pro (Monthly)** | `prod_bastion_pro` | Monthly | $6.00 | `price_bastion_pro_monthly` |
| **BastionPDF Pro (Annual)** | `prod_bastion_pro` | Yearly | $48.00 | `price_bastion_pro_annual` |
| **BastionPDF Team (Annual)** | `prod_bastion_team` | Yearly (Per Seat) | $240.00 | `price_bastion_team_annual` |
