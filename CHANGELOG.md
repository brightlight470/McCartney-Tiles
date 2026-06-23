# Changelog

All notable changes to the McCartney Tiles Phase-1 build are recorded here.
Versioning follows the client convention: **minor = 1.x**, **major = x.1**.

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
