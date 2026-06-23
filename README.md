# McCartney Tiles — Phase 1

Website + PIM + CRM for McCartney Tiles, a 45-year family tile supplier in Randalstown, NI.
Built to the **Build Handover (Phase 1) v1.0** spec. Cowork owns strategy/brand/QA; this repo is the build.

## Hard rules (non-negotiable)

1. **No live deploy, no domain registration, no paid-service spend, no real customer comms.** Build and test on preview/staging only; stop at those gates and report back.
2. **The existing live site (WordPress 5.6.14) is read-only.** We migrate off it; never modify it.
3. **Version everything** in `CHANGELOG.md` (minor = `1.x`, major = `x.1`).
4. **Every feature ships with tests and must pass the audit gates** before "done".
5. **Price/stock gating is a security requirement** — enforced server-side on every path. Cost and trade prices must never reach a public response.

## Stack

| Concern   | Choice                                                                                 |
| --------- | -------------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, TypeScript), SSR/ISR                                           |
| CMS / PIM | Payload CMS 3 on PostgreSQL                                                            |
| Search    | Meilisearch (faceted, typo-tolerant)                                                   |
| Storage   | S3-class bucket + image CDN (WebP/AVIF)                                                |
| Auth      | Auth.js — roles: public / trade / staff                                                |
| CRM       | Lead Connect (GoHighLevel, whitelabelled) behind a driver interface (mock until keyed) |
| Hosting   | Vercel-class (NOT Krystal — Krystal is DNS/email only)                                 |

## Layout

```
apps/
  web/        Next.js public site + trade/staff portals
  cms/        Payload CMS (admin + PIM + ingestion)
packages/
  db/         shared types + seed (taxonomy, stock seed)
  search/     Meilisearch indexer + client
  ingestion/  Excel/PDF/URL/image adapters → review → publish
  ui/         design-system components + brand tokens
  crm/        Lead Connect client + form/webhook handlers
```

## Getting started

Prerequisites: Node ≥ 20.9, pnpm 10, and **Docker Desktop** (for local Postgres + Meilisearch).

```bash
pnpm install
cp .env.example .env            # fill local-only values
pnpm db:up                      # start Postgres + Meilisearch (needs Docker)
pnpm migrate                    # apply Payload schema
pnpm seed                       # load taxonomy + stock seed (seed-floors.csv)
pnpm dev                        # web on :3000
pnpm dev:cms                    # CMS/admin on :3001
```

> Without Docker, `pnpm db:up`/`migrate`/`seed` cannot run locally. `pnpm install`, `pnpm typecheck`, and `pnpm build:web` work without services.

## Audit gates (must pass before "done")

- **Performance/A-rating:** Lighthouse ≥ 90 (perf/SEO/best-practices/a11y) on key templates; Core Web Vitals "good".
- **SEO:** unique H1 per page; LocalBusiness + Product + Review schema; sitemap + robots; redirects in place.
- **Accessibility:** WCAG 2.1 AA.
- **Security:** no exposed secrets; server-side price/role gating; input validation; dependency scan clean of High/Critical; standard headers.
- **Bugs:** test suite green; no open High-severity issues.

CI runs install → typecheck → build → `pnpm audit` → Lighthouse CI / axe.

## Open inputs (request as reached)

GHL API token + location ID · brand web-font licence · price data source/format · transcribed testimonials + refined copy · original photography · Roomvo keys (Phase 3) · final hosting/region choice · **Docker** (or a managed dev Postgres/Meilisearch) to run services locally.
