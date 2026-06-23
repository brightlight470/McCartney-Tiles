/**
 * Seed Ranges/Products/Stock from the vendored stock seed (packages/db/seed/seed-floors.csv).
 * Mapping per data-model.md: distinct range_name → Range; (range_name, size_mm) → Product;
 * each row → Stock batch. Prices are NOT seeded — staff add them.
 *
 * Run: pnpm --filter @mccartney/cms seed   (requires DATABASE_URI + PAYLOAD_SECRET, i.e. `pnpm db:up` first).
 * Intended for an empty database; ranges/products upsert by slug, stock is appended.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import { mapSeedCsv } from '@mccartney/db'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const csvPath = path.resolve(dirname, '../../../packages/db/seed/seed-floors.csv')

async function main(): Promise<void> {
  // Load .env if present (Node ≥ 20.12).
  try {
    process.loadEnvFile?.(path.resolve(dirname, '../../../.env'))
  } catch {
    /* no .env — rely on ambient env */
  }

  // Seeding does per-row writes; skip per-row search indexing here. Bulk indexing is
  // handled separately by the reindex script (avoids hundreds of index round-trips).
  delete process.env.MEILISEARCH_HOST

  // Import the config AFTER env is loaded — buildConfig reads env (secret, adapter) at eval time.
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })
  const dataset = mapSeedCsv(readFileSync(csvPath, 'utf8'))

  const rangeIdBySlug = new Map<string, string | number>()
  for (const r of dataset.ranges) {
    const found = await payload.find({
      collection: 'ranges',
      where: { slug: { equals: r.slug } },
      limit: 1,
      depth: 0,
    })
    const existing = found.docs[0] as { id: string | number } | undefined
    let id: string | number
    if (existing) {
      id = existing.id
    } else {
      const created = await payload.create({
        collection: 'ranges',
        data: { name: r.name, slug: r.slug, showOnWebsite: false, status: 'active' },
      })
      id = created.id
    }
    rangeIdBySlug.set(r.slug, id)
  }
  payload.logger.info(`Seeded ${rangeIdBySlug.size} ranges`)

  const productIdBySlug = new Map<string, string | number>()
  for (const p of dataset.products) {
    const rangeId = rangeIdBySlug.get(p.rangeSlug)
    if (!rangeId) continue
    const found = await payload.find({
      collection: 'products',
      where: { slug: { equals: p.slug } },
      limit: 1,
      depth: 0,
    })
    const existing = found.docs[0] as { id: string | number } | undefined
    let id: string | number
    if (existing) {
      id = existing.id
    } else {
      const created = await payload.create({
        collection: 'products',
        data: {
          range: rangeId as number,
          name: p.name,
          slug: p.slug,
          sizeMm: p.sizeMm,
          tilesPerBox: p.tilesPerBox,
          m2PerBox: p.m2PerBox,
          tilesPerM2: p.tilesPerM2,
        },
      })
      id = created.id
    }
    productIdBySlug.set(p.slug, id)
  }
  payload.logger.info(`Seeded ${productIdBySlug.size} products`)

  let stockCount = 0
  for (const s of dataset.stock) {
    const productId = productIdBySlug.get(s.productSlug)
    if (!productId) continue
    await payload.create({
      collection: 'stock',
      data: {
        product: productId as number,
        status: s.status,
        statusRaw: s.statusRaw,
        batch: s.batch,
        boxes: s.boxes,
        looseTiles: s.looseTiles,
        qtyTiles: s.qtyTiles,
        m2: s.m2,
      },
    })
    stockCount++
  }
  payload.logger.info(`Seeded ${stockCount} stock records`)
  payload.logger.info('Seed complete.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
