# Parity Report: Replica PDF Suite vs iLovePDF

Audit Date: 2026-11-18  
Build Commit: d25c5b8  
Evaluated via: `replica-diff` (Python standard library audit engine)

---

## 1. Executive Parity Score

| Metric | Score | Status |
| --- | --- | --- |
| **Overall Feature Parity** | **39.4 / 100** | Vertical Slice & Core Loop Established |
| **Must-Have Features** | **12 / 22 Completed (54.5%)** | 10 Must-haves Remaining |
| **Shippability Verdict** | **Not Shippable Yet** | Requires remaining 10 must-haves |

---

## 2. Parity by Product Area (Weakest First)

| Area | Score | Completed / Total Features |
| --- | --- | --- |
| `convert_to_pdf` | **0.0%** | 0 / 5 features |
| `convert_from_pdf` | **0.0%** | 0 / 5 features |
| `security` | **0.0%** | 0 / 5 features |
| `intelligence` | **0.0%** | 0 / 3 features |
| `developer_api` | **0.0%** | 0 / 2 features |
| `optimize` | **25.0%** | 1 / 3 features |
| `cloud_integrations` | **25.0%** | 1 / 2 features |
| `edit` | **37.5%** | 3 / 7 features |
| `workflows` | **50.0%** | 1 / 1 features (partial) |
| `organize` | **56.2%** | 4 / 6 features |
| `billing_pricing` | **60.0%** | 2 / 3 features |
| `delivery` | **100.0%** | 6 / 6 features (Full Parity) |
| `onboarding_auth` | **100.0%** | 1 / 1 features (Full Parity) |

---

## 3. Behavioural Diff (UX & Flow Comparison)

| Flow | Original iLovePDF | Clone Behavior | Decision |
| --- | --- | --- | --- |
| **Core Merge Loop (F01)** | 3 clicks (Upload -> Merge -> Download). Full-page ads shown to free users. Server upload required. | 3 clicks. Zero ads. Instant client-side merging via WebAssembly/JS (no server upload required for standard tasks). | **Keep** (Superior speed and user privacy). |
| **File Retention & Purge (F07)** | 2-hour retention on cloud servers before deletion. "Delete it now" button available. | Zero remote retention for client-side mode; strict 2-hour TTL cron purge on SQLite backend with instant hard unlink. | **Keep** (Zero-trace privacy advantage). |
| **Mobile Hand-off (F06)** | QR code opens download link on mobile browser. | Embedded clean SVG QR modal with short token link. | **Keep**. |
| **Pricing & Checkout (F08)** | Monthly and annual toggle (-42%), up to 25 seats with slider. | Exact pricing calculation ($0 Basic, $9/mo or $5/mo annual Premium) with responsive seat calculator. | **Keep**. |

---

## 4. Top 5 Missing Features to Build Next

To reach **80%+ parity and shippable status**, the following top 5 must-have features should be implemented in order:

1. **Split PDF & Extract Pages (`organize`)**: Visual range selector to extract custom page subsets into independent PDFs.
2. **JPG to PDF & PDF to JPG (`convert`)**: In-browser Canvas image to PDF and PDF page-to-JPG export.
3. **Protect & Unlock PDF (`security`)**: AES password encryption and decryption modal for secure document sharing.
4. **Add Page Numbers (`edit`)**: 3x3 position anchor matrix with custom page format templates (e.g. `Page {n} of {total}`).
5. **Word to PDF / PDF to Word (`convert`)**: Headless LibreOffice / Poppler conversion container worker integration.

---

## 5. Left Out on Purpose (Out of Scope)

- **Solid Documents Proprietary SDK**: Replaced with open-source LibreOffice / Poppler.
- **eIDAS Qualified Trust Service Provider (QES)**: Replaced with Standard Electronic Signatures (SES) cryptographic hash.
- **Native Desktop & Mobile Installers**: Replaced with responsive Progressive Web App (PWA).
- **Proprietary 11-Region Datacenter Cluster**: Replaced with SQLite self-hosted / serverless deployment.
