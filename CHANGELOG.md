# Changelog

All notable changes to the McCartney Tiles Phase-1 build are recorded here.
Versioning follows the client convention: **minor = 1.x**, **major = x.1**.

## [1.10.0] — 2026-06-28

### Added — legacy size-page redirects

- Enumerated the 59 size category pages from the live `/tile-viewer/` and 301'd each to its
  category facet (porcelain → `material=porcelain`, wall → `application=wall`, wood-effect →
  `effect=wood`, outdoor → `application=outdoor`). The faceted search has no exact-dimension
  facet (`size` = `sizeBand`), so mapping to the category avoids empty exact-size results.
- The legacy redirect map is now ~131 rules (facets, colours, finishes, edges, formats, sizes,
  content). Tests cover the new size mappings.

## [1.9.0] — 2026-06-28

### Added — geolocation UI (Handover §8)

- **Region switcher** in the footer (Northern Ireland / Ireland / Rest of world) with the choice
  remembered in the `mc_region` cookie; a manual choice always overrides geo-IP.
- **Geo-IP seeding** in the proxy: first visit resolves the region from the edge country header
  (`x-vercel-ip-country` / `cf-ipcountry`) and seeds the cookie. Server `getRegion()` resolves
  capabilities per request.
- **Capability surface**: the footer states what the region can do (NI/IE — showroom + live stock;
  rest of world — showroom + enquiry). Gates commerce capability, never indexable content.
- **Cookie-consent banner** (necessary-cookies-only) with a remembered acknowledgement, plus a
  factual interim `/privacy` notice listing the three necessary cookies.
- Tests: `resolveActiveRegion` cookie-precedence + `isRegion` guard (region suite now 6).

## [1.8.0] — 2026-06-28

### Changed — image optimisation

- Catalogue imagery (search cards, range hero + thumbnails, product page) now renders through
  `next/image` — responsive `srcset`, lazy-loading, and AVIF/WebP negotiation — replacing the raw
  `<img>` tags from the migration. `remotePatterns` now allows the CMS media origin (built from
  `CMS_URL`, so production picks up the hosted CMS domain).
- `dangerouslyAllowLocalIP` is enabled only when the CMS origin is localhost (dev); production
  keeps Next's image-optimiser SSRF guard on.

## [1.7.0] — 2026-06-28

### Added — catalogue photography

- `pull-product-images.py --live` run against the WordPress REST API (brand aliases handled):
  **82 of 93 ranges** matched to feature swatches and downloaded.
- `migrate:images:manifest` ingests the authoritative Cowork manifest by exact range name → range
  `heroImage` + product images (media reused by filename). Supersedes the earlier heuristic match.
  The 11 unmatched ranges have no swatch on the legacy site and are left for the ingestion tool.
- `publish:all` — flips all seeded ranges to `showOnWebsite` so the catalogue populates from seed.

### Changed — logo + chrome

- Animated logo replays its entrance on a 10s cadence (`loopMs`); site header is now sticky.
- Range/product imagery self-hosted in Payload media; `img-src` CSP allows the CMS origin.

### Fixed — local stability

- CMS now runs from a production build (`next start`) to avoid the Windows `next dev` jest-worker
  crash that intermittently 500'd every API route.

## [1.6.0] — 2026-06-24

### Added — brand identity v1.0

- **Animated logo** (`AnimatedLogo`) — the "tiles set into place" entrance from Brand Identity
  v1.0: the eight emblem tiles drop into the 4×2 grid, then the wordmark fades in. Same geometry
  and locked colours as the static `Logo`. Wired into the site header.
- Static by default: the server renders the final lockup, so no-JS and search engines see the
  complete mark. The entrance is added after hydration and plays once per page load. Suppressed
  for `prefers-reduced-motion`. Keyframes live in the brand theme stylesheet.

## [1.5.0] — 2026-06-24

### Added — pre-launch hardening

- Web unit tests (vitest): faceted-search params/toggle/active-filters, legacy redirect map, region
  capability gating (12 tests; 28 across the workspace).
- **Content-Security-Policy** + security headers, verified live on responses.

### Fixed — accessibility (WCAG 2.1 AA)

- Facet filter links carried `aria-pressed` (invalid on links) → `aria-current`.
- Stock-badge label contrast raised to ≥4.5:1 (darker text on the status tint).
- Logo home-link accessible name now matches its content.

### Verified

- Lighthouse on home, `/ranges`, `/product/[slug]`: **Performance 97 · Accessibility 100 ·
  Best-practices 96 · SEO 100** — every category clears the ≥90 gate.

## [1.4.0] — 2026-06-24

### Added

- **301 redirect map** from legacy WordPress URLs (category → faceted search, info → content).
- **Staff ingestion pipeline** — `/staff/ingest`: upload/paste CSV → classifier-prefilled review
  grid → publish (upsert ranges/products, set showOnWebsite, reindex). CMS endpoint + proxy routes,
  all staff-gated. Verified end-to-end.
- **Catalogue migration** — `migrate:suppliers` (11 supplier logos → Payload media + Supplier
  records) and `migrate:taxonomy` (bootstrap product taxonomy from classifiers into the DB).
- **Trade project baskets** — owner-gated Baskets collection; "Add to project basket" on product
  pages; `/account/baskets` list with remove. Verified add/dedup/remove + owner isolation.

### Fixed

- Accounts `read`/`update` now allow self-access, so Payload `/me` works for trade users.
  Previously trade users appeared signed-out to the web app, which also hid trade pricing.

## [1.3.0] — 2026-06-23

### Added — auth + server-side price/stock gating

- **Payload-auth sign-in** for the web app: login/logout proxy routes that forward the
  `payload-token` cookie to the web origin, `/account/login` and `/account` pages, and a
  role-aware header link.
- **Price gating** on product pages enforced server-side by Payload access control — public sees
  no price, trade sees retail + trade, staff also sees cost. The web reflects the gate; it cannot
  bypass it (single enforcement point).
- Public **stock availability** (status + m² in stock) on product pages.
- Postgres + Meilisearch via **Docker** is now the running stack (WSL2 installed post-reboot);
  SQLite remains the no-Docker fallback. Postgres host port 5434.
- Dev helper `create:testdata` (staff/trade accounts + a price) for verification.

### Verified

- Price gating end-to-end: public → **403**; trade → retail £42.50 / trade £31.00, cost hidden;
  staff → cost £24.00 visible.

## [1.2.0] — 2026-06-23

### Added — local database + live faceted search (dev infrastructure)

- Env-switched **SQLite dev adapter** (`DATABASE_ADAPTER=sqlite`) so the CMS, seed and search run
  locally without Docker/Postgres. Postgres remains the production default — no schema change.
- Seeded the local DB from the stock sheet: **93 ranges, 101 products, 175 stock records**.
- **Reindex script** (`pnpm --filter @mccartney/cms reindex`) builds the Meilisearch products index
  from the DB. Name-hint classifiers fill taxonomy the stock seed omits (index-only; canonical
  values still come from staff-confirmed ingestion). `INDEX_ALL=1` indexes regardless of publish
  for local verification.
- Verified **live faceted search end-to-end** through the web app: 101 products indexed;
  `/ranges?effect=wood` returns 10 results with live colour facet counts; CMS REST serves the
  catalogue to range/product pages.

### Fixed

- Seed/reindex load `.env` and import the Payload config dynamically (`buildConfig` reads env at
  evaluation time, so the static import ran before env was loaded).

### Notes

- Docker is blocked on this machine: WSL2 is not installed and Windows 11 Home has no Hyper-V, so
  Docker Desktop's engine cannot start. For Postgres parity, run `wsl --install` (admin + reboot),
  then `pnpm db:up && pnpm migrate && pnpm seed`.

## [1.1.0] — 2026-06-23

### Added — Sprint 1 (public spine; DB-independent slice)

- Catalogue data layer over the Payload REST API with graceful fallback; shared site header/footer.
- **Faceted search** at `/ranges` — server-rendered, URL-synced facet sidebar (works without JS),
  keyword search, sort, pagination, active-filter chips; degrades to an empty state when
  Meilisearch is not yet running.
- Range (`/ranges/[slug]`) and product (`/product/[slug]`) pages with spec tables (tabular
  numerals), breadcrumb, Product JSON-LD, and sample/enquiry CTAs.
- Roomvo visualiser integration point (feature-flagged off until keyed).
- Content pages: showrooms (LocalBusiness JSON-LD), about/heritage, projects, FAQ (FAQPage
  JSON-LD), contact.
- `EnquiryForm` (contact / brochure / showroom visit / trade application / sample request) posting
  to `/api/forms` through the mock CRM, with honeypot.
- Organization + LocalBusiness JSON-LD on the home page.
- Image-crawl tool (`scripts/crawl-images.mjs`) + generated `packages/db/seed/image-manifest.json`
  — 2,633 images and 2,735 internal links inventoried from the legacy site for migration.
- search package: boolean-safe Meilisearch filter (e.g. `inStock`).

### Notes

- Auth/portals, the ingestion review UI, and the live DB seed remain gated on Docker/Postgres.

## [1.0.0] — 2026-06-23

### Added — Sprint 0 foundation

- Monorepo scaffold (`apps/web`, `apps/cms`, `packages/{db,search,ingestion,ui,crm}`) per Build Handover §4.
- Root tooling: pnpm workspace, shared TypeScript base config, Prettier, ESLint, EditorConfig.
- `docker-compose.yml` for local Postgres + Meilisearch.
- `.env.example` covering database, search, storage, auth, Lead Connect (CRM), Roomvo, geolocation, monitoring, feature flags.
- `packages/ui`: locked brand tokens (CSS + TypeScript + Tailwind v4 preset), logo SVGs, base primitives.
- `apps/web`: Next.js (App Router, TypeScript) skeleton with brand tokens applied.
- `apps/cms`: Payload CMS config (Postgres adapter) with the full data model from the data-model spec; taxonomy drives select options.
- `packages/search`, `packages/ingestion`, `packages/crm`, `packages/db`: interface skeletons; CRM ships a working mock client behind the Lead Connect interface.
- Canonical `taxonomy.json` and `seed-floors.csv` vendored into the repo; seed script mapping CSV → Range/Product/Stock.
- CI audit gates: install, typecheck, build, dependency audit, Lighthouse CI and axe configuration.
