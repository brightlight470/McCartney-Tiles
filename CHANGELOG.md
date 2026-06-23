# Changelog

All notable changes to the McCartney Tiles Phase-1 build are recorded here.
Versioning follows the client convention: **minor = 1.x**, **major = x.1**.

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
