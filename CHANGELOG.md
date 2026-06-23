# Changelog

All notable changes to the McCartney Tiles Phase-1 build are recorded here.
Versioning follows the client convention: **minor = 1.x**, **major = x.1**.

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
