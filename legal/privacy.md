# Privacy Policy: BastionPDF

**Effective Date: November 19, 2026**

## 1. Core Commitment: Sovereign In-Browser Processing
BastionPDF is engineered with a strict **Zero-Knowledge Architecture**:
- For standard document operations (Merge, Split, Rotate, Watermark, Number, Encrypt, Decrypt), **documents never leave your browser**.
- Processing is performed locally on your device using WebAssembly and JavaScript memory buffers.
- Zero document bytes are transmitted across the internet to our servers or third-party cloud infrastructure.

## 2. Ephemeral Storage & The 2-Hour TTL
If you explicitly opt into cloud sharing or background processing:
- Files are encrypted at rest using AES-256 and assigned a strict **2-Hour Time-to-Live (TTL)**.
- At the expiration of 2 hours, automated cron workers execute a permanent physical unlinking from disk storage.
- You may trigger immediate destruction at any time using the **Instant Hard Purge** button, which purges memory buffers and unlinks disk files instantly.

## 3. Sub-Processors
We minimize external dependencies to zero for document processing:
- **Hosting & CDN**: Cloudflare (Static edge distribution of JS/CSS/HTML assets only; no file inspection).
- **Payment Processing (Pro Tiers Only)**: Stripe, Inc. (Credit card processing, billing management; Stripe receives zero document payloads or metadata).
- **Advertising Trackers**: **NONE**. We do not use Google Analytics, Meta Pixel, Hotjar, or advertising cookie networks.

## 4. Cookies & Local Storage
- BastionPDF does not use tracking or advertising cookies.
- We utilize browser `localStorage` solely to preserve your UI preferences (e.g., dark/light theme, recent tool selections) locally on your device.

## 5. Contact & Data Deletion
To request immediate deletion of any associated account data or support inquiries, contact `privacy@bastionpdf.com`.
