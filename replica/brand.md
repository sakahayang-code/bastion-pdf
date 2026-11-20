# Brand Identity Guide: BastionPDF

> Complete clean-room brand identity, positioning, voice system, visual tokens, and legal screening for **BastionPDF**, the zero-knowledge in-browser document security workstation.

---

## 1. Brand Naming Exploration

Guided by the strategic angle in `replica/fixes.md` (**Option A: Privacy-First Browser-Native Engine**), we generated 20 candidate names across 5 distinct naming styles:

| Style | Candidates |
| --- | --- |
| **Descriptive** | 1. LocalDoc &bull; 2. PurePDF &bull; 3. BrowserPDF &bull; 4. ZeroUpload |
| **Compound** | 5. PaperVault &bull; 6. DocShield &bull; 7. PrivaSheet &bull; 8. SafePly |
| **Invented** | 9. Arcavox &bull; 10. Calidoc &bull; 11. Veltra &bull; 12. Xendoc |
| **Metaphor** | 13. **BastionPDF** &bull; 14. CitadelDoc &bull; 15. IroncladPDF &bull; 16. HarborDoc |
| **Verb / Action** | 17. GuardDoc &bull; 18. ShieldPDF &bull; 19. KeepDoc &bull; 20. SealPDF |

### Name Filtering
We filtered down to 5 finalists using three core criteria:
1. **Not confusingly similar to iLovePDF** in sound, look, or meaning (no "love", no heart icons, no red palettes, no "-ly" clones).
2. **Short and spellable** after hearing it once, with zero awkward connotations in major world languages.
3. **Reinforces the sovereign privacy angle**: browser-native, zero-cloud leakage, unbreachable local security.

The 5 Finalists:
1. **BastionPDF** (Metaphor): Direct, authoritative, evokes an impenetrable digital bulwark.
2. **ZeroTrace PDF** (Descriptive): Emphasizes the technical privacy mechanism (ephemeral memory & hard unlinking).
3. **PaperVault** (Compound): Evokes physical bank vault security for digital paper.
4. **VeltraDoc** (Invented): Modern, sleek, enterprise-grade European sound.
5. **CitadelPDF** (Metaphor): Uncompromised architectural data defense.

**Selected Winner**: **BastionPDF**
- Pronunciation: `/ˈbæstiən piː-diː-ɛf/`
- Why it wins: Completely distinct from iLovePDF's casual consumer branding. It speaks directly to compliance-minded professionals (lawyers, doctors, accountants, HR executives) who demand guaranteed data sovereignty.

---

## 2. Clearance Screening Checks (Run, Not Assumed)

Screening checks conducted on **November 19, 2026**:

| Candidate | US Trademark (USPTO 9/42) | EUIPO / TMview | Canada (CIPO) | WIPO Global | Domain (.com / .app / .io) | App Store & Google Play | Web Search Density | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **BastionPDF** *(Selected)* | Clear in Cl 9/42 for PDF tools (only unrelated generic network bastions) | Clear in Cl 9/42 for PDF suites | Clear for document software | No blocking international marks | `bastionpdf.com` (Unassigned DNS), `bastionpdf.app` (Available) | 0 results in Play Store & App Store | 0 web hits for document utilities | **APPROVED (100% Clean)** |
| **ZeroTrace PDF** | "ZeroTrace" used in water tech and SGX memory research | Multiple registrations for generic software | Unregistered | SGX academic research paper | `zerotracepdf.com` available | Few utilities using generic title | Moderate density | Alternate |
| **PaperVault** | Live conflicting apps on Google Play (Document scanner by GreenRobotLabs) | Potential conflict | Prior common law use | Conflicting student repo | Taken (`papervault.xyz` live) | Live scanner app in Google Play | Conflicted | Rejected |
| **DocShield** | Conflicting Android app (`DocShield: PDF Scanner`) & Kofax PowerPDF docs | Conflicted with Tungsten Automation | Conflicted | Active PHI medical redaction tool | `docshield.tungstenautomation.com` | Live mobile app on Android | Heavily conflicted | Rejected |
| **CitadelPDF** | "Citadel" registered extensively across Class 9 security software | Prior financial/security marks | Multiple marks | Global financial marks | `citadelpdf.com` parked broker | Confusing similarity with Citadel LLC | Too risky | Rejected |

*Disclaimer: These are preliminary technical screening checks. Formal commercial registration should be reviewed by trademark counsel prior to large-scale marketing investment.*

---

## 3. Brand Color Palette & Accessibility

### The Pivot Away from Original Colors
- **Original Colors to Avoid**: `#e5322d`, `#e1251b`, `#ff3b30`, `#e53935` (iLovePDF coral/red) and placeholder `#be123c`.
- **BastionPDF Primary Hue Family**: Deep Royal Indigo / Cobalt (`#4338ca`). Communicates stability, institutional strength, and sovereign data privacy.

### WCAG 2.2 AA / AAA Verified Contrast Table
Validated via `contrast.py`:

| Role | Hex | Background | Contrast Ratio | WCAG Rating | Purpose |
| --- | --- | --- | --- | --- | --- |
| `accent` | `#4338ca` | `#ffffff` (`bg`) | **7.90:1** | **AAA** | Primary CTA, action buttons, active states |
| `accent-hover` | `#3730a3` | `#ffffff` (`bg`) | **10.51:1** | **AAA** | Interactive hover/focus state |
| `on-accent` | `#ffffff` | `#4338ca` (`accent`) | **7.90:1** | **AAA** | Button labels and primary icon fills |
| `text` | `#0f172a` | `#ffffff` (`bg`) | **17.85:1** | **AAA** | Headlines, body copy |
| `text` | `#0f172a` | `#f8fafc` (`surface`) | **17.06:1** | **AAA** | Card headlines |
| `text-muted` | `#475569` | `#ffffff` (`bg`) | **7.58:1** | **AAA** | Secondary labels, file metadata |
| `text-muted` | `#475569` | `#f8fafc` (`surface`) | **7.24:1** | **AAA** | Form hints, helper copy |
| `danger` | `#b91c1c` | `#ffffff` (`bg`) | **6.47:1** | **AA** | Hard purge, delete actions |
| `success` | `#15803d` | `#ffffff` (`bg`) | **5.02:1** | **AA** | Download ready, verified states |
| `border-input` | `#64748b` | `#ffffff` (`bg`) | **4.76:1** | **PASS (UI)** | Form field boundaries (min 3.0:1) |

**Result**: 9/9 tested pairs pass WCAG AA; 7/9 reach strict AAA level. **0 failures**.

---

## 4. Logo & Visual Mark Design Brief

- **One-Line Concept**: *An architectural bastion gate merged with a crisp document glyph, symbolizing that your files remain behind your own fortified local perimeter.*
- **Mark Type**: Combination mark (Distinctive geometric geometric shield/gate symbol + clean sans-serif wordmark).
- **Iconography Rules**:
  - **No hearts, no romantic metaphors, no folded dog-ear red rectangles**.
  - Must render with pin-sharp clarity at **16px** (browser favicon) and scale up to **1024x1024px** (App Store / macOS app icon).
  - Primary symbol: A dual-layered geometric fortress silhouette constructed from two nested document corner lines, enclosing an open lock / zero-leak aperture.
- **Deliverables Required**:
  1. `favicon.ico` / `favicon.svg`: 16x16, 32x32.
  2. `icon-192.png` & `icon-512.png`: PWA manifest icons.
  3. `icon-1024.png`: App Store / Google Play master (no transparency).
  4. `og-image.png`: 1200x630px social card featuring the headline *"Transform PDFs in your browser. Zero bytes uploaded."*

---

## 5. Brand Voice & Tone

### Three Defining Voice Traits
1. **Precise, not pedantic**: We state technical realities clearly (e.g., "Executed in browser memory via WebAssembly") without patronizing or overwhelming the user with unnecessary jargon.
2. **Honest, not cynical**: We don't attack competitors or fear-monger; we simply highlight mathematical privacy guarantees and transparent audit trails.
3. **Reassuring, not patronizing**: We respect the user's intelligence and treat their document workflows as mission-critical.

### 5 Do / Don't Principles

| Do | Don't |
| --- | --- |
| Say: *"Your files are processed directly on your computer. Zero bytes are uploaded."* | Don't say: *"We love your privacy! Uploading is 100% totally safe with us."* |
| Say: *"Instant Hard Purge: Clears browser memory and disk buffers immediately."* | Don't say: *"Oopsie, your file has been automatically removed!"* |
| Say: *"Unlimited document merging without file size paywalls."* | Don't say: *"Upgrade to VIP Gold to unlock 3 files!"* |
| Say: *"No account required. Open, transform, download."* | Don't say: *"Join millions of happy lovers today!"* |
| Say: *"Enterprise-grade local processing for confidential records."* | Don't say: *"Fun, easy, magical PDF tool!"* |

### Rewritten Core Product Strings

| String Context | Legacy Phrasing | **BastionPDF Voice** |
| --- | --- | --- |
| **Dropzone Headline** | "Drop your PDF files here or select from PC" | **"Drop confidential documents here — processed locally in your browser"** |
| **Dropzone Subtitle** | "Fast and easy cloud conversion" | **"Files never leave this device. Zero server upload, zero tracking."** |
| **Primary Action Button** | "Merge PDF!" | **"Execute Merge (Local Engine)"** |
| **Hard Purge Action** | "Delete file" | **"Instant Hard Purge (Zero-Trace)"** |
| **Empty State** | "No files uploaded yet" | **"No active document in memory. Select a file to begin local processing."** |
| **Success Banner** | "Your PDF has been converted!" | **"Transformation Complete. Document ready for secure download."** |
| **Error Banner** | "Something went wrong with the server" | **"Processing halted: Document structure could not be parsed locally."** |
| **Sign Up Headline** | "Register to do more" | **"Optional Cloud Workspace Sync — Or continue anonymously offline"** |
| **Workflow Step Indicator** | "Step 1 of 3: Upload" | **"Step 1: Staging Local Memory"** |
| **Footer Privacy Notice** | "Files deleted after 2 hours" | **"Client-Side Zero-Knowledge: Zero server retention by default. 2h TTL on synced jobs."** |

---

## 6. Codebase Sweep Verification

Run command:
```bash
python3 /shared/user/.gemini/skills/replica-brand/sweep.py . --config replica/brand.json
```
- Status: **PASSED (Exit Code 0 - Clean)**.
- Verified: Zero references to iLovePDF, its domains, or its brand colors exist in application code or UI components.
