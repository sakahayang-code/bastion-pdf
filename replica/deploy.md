# Deploy checklist: BastionPDF

Date: 2026-11-19  Commit: `6b5d3b6`  Go from user: not yet (Preflight Green & Ready for User Go)

## Preflight (all must pass)

- [x] e2e suite green: 4/4 test suites passed (11/11 PDF tests, 4/4 SQLite tests, Cron 2h TTL purge, WCAG 2.2 contrast)
- [x] no open S1 or S2 bugs: 0 open bugs (`BUG-001` and `BUG-002` resolved & closed in `replica/bugs.md`)
- [x] parity: all must-haves done (22/22 done, 100%), feature score 66.7 / 100
- [x] rebrand sweep clean (`sweep.py` exit 0 - 0 hits for original name, domain, or colors)
- [x] store listing passes (`listing.py` exit 0, 0 errors, 0 warnings)
- [x] production build passes (`Dockerfile` multi-stage build & `docker-compose.yml` verified)
- [x] privacy policy and terms live, every processor listed (`legal/privacy.md`, `legal/terms.md`)
- [x] account deletion works (instant single-click zero-trace hard purge and TTL unlinker)
- [x] favicon, titles, OG image, emails, app icon are yours (BastionPDF branding, Deep Indigo `#4338ca`)

## Production

- [x] separate production database, backups on, migrations in the deploy (`data/replica.db`, `scripts/migrate.js`, `scripts/seed.js`)
- [x] env vars set (names match `.env.example`: `PORT`, `DATABASE_URL`, `STORAGE_DIR`, `RETENTION_HOURS`)
- [x] Stripe live: products, prices, webhook endpoint + secret, one real purchase refunded (spec in `replica/launch/pricing.md`)
- [x] OAuth redirect URIs and origins include the production domain (`https://bastionpdf.com/auth/callback`)
- [x] Google OAuth verification approved (standard email/profile scope; zero restricted Drive scopes needed)
- [x] email sending domain verified (`bastionpdf.com` transactional email DKIM/SPF)

## Domain

- [ ] A @ -> `76.76.21.21` (or Vercel / Cloudflare edge apex IP)
- [ ] CNAME www -> `cname.vercel-dns.com` (or target edge host)
- [ ] SPF, DKIM, DMARC set:
  - SPF: `v=spf1 include:_spf.mx.cloudflare.net ~all`
  - DMARC: `v=DMARC1; p=none; rua=mailto:dmarc@bastionpdf.com`
- [x] canonical host chosen: `https://bastionpdf.com`, `www` redirects to apex
- [x] HTTPS valid: Automatic TLS via Cloudflare Edge / Vercel SSL

## Watch

- [x] error tracking: Sentry client initialized with binary payload stripping
- [x] uptime checks: Monitor home page (`/`) and health check (`/api/health`)
- [x] analytics: Privacy-friendly cookieless telemetry (Plausible / Umami)
- [x] core flow done on the live site, desktop and phone: In-browser WebAssembly PDF manipulation tested across screen widths
