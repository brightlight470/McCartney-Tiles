/**
 * Build the Meilisearch products index from the database (Handover §7).
 * Indexes products whose parent range is published (showOnWebsite). Set INDEX_ALL=1 to
 * index regardless of publish state (local verification only). Never indexes raw price.
 *
 * Run: pnpm --filter @mccartney/cms reindex   (needs MEILISEARCH_HOST + a seeded DB).
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import {
  configureIndex,
  searchProducts,
  toProductDocument,
  upsertProducts,
  type IndexableProduct,
} from '@mccartney/search'
import {
  classifyColour,
  classifyEffect,
  classifyFinish,
  classifyFormat,
  classifySizeBand,
} from '@mccartney/ingestion'

const dirname = path.dirname(fileURLToPath(import.meta.url))

interface StockRow {
  product: string | number | { id: string | number }
  status?: string | null
}
interface RangeRef {
  name?: string
  slug?: string
  showOnWebsite?: boolean
}
interface ProductRow {
  id: string | number
  name: string
  slug: string
  range?: RangeRef | string | number | null
  sizeMm?: string | null
  sizeBand?: string | null
  application?: string | null
  colourGroup?: string | null
  finish?: string | null
  effect?: string | null
  material?: string | null
  edge?: string | null
  format?: string | null
}

const idOf = (rel: StockRow['product']): string =>
  typeof rel === 'object' ? String(rel.id) : String(rel)

function deriveStock(rows: StockRow[]): { inStock: boolean; status: string | null } {
  if (rows.length === 0) return { inStock: false, status: null }
  const hasInStock = rows.some((r) => r.status === 'in_stock')
  return { inStock: hasInStock, status: hasInStock ? 'in_stock' : (rows[0]!.status ?? null) }
}

async function main(): Promise<void> {
  try {
    process.loadEnvFile?.(path.resolve(dirname, '../../../.env'))
  } catch {
    /* rely on ambient env */
  }
  if (!process.env.MEILISEARCH_HOST) {
    throw new Error('MEILISEARCH_HOST is not set — start Meilisearch and set the env first')
  }
  const indexAll = process.env.INDEX_ALL === '1'

  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  await configureIndex()

  // Group stock by product to derive availability.
  const stockRes = await payload.find({ collection: 'stock', limit: 5000, depth: 0 })
  const stockByProduct = new Map<string, StockRow[]>()
  for (const row of stockRes.docs as unknown as StockRow[]) {
    const key = idOf(row.product)
    if (!stockByProduct.has(key)) stockByProduct.set(key, [])
    stockByProduct.get(key)!.push(row)
  }

  const productRes = await payload.find({ collection: 'products', limit: 5000, depth: 1 })
  const docs = []
  let skipped = 0
  for (const p of productRes.docs as unknown as ProductRow[]) {
    const range = p.range && typeof p.range === 'object' ? p.range : null
    const published = Boolean(range?.showOnWebsite)
    if (!published && !indexAll) {
      skipped++
      continue
    }
    const stock = deriveStock(stockByProduct.get(String(p.id)) ?? [])
    // Fall back to name-hint classification for taxonomy the seed didn't carry. Index-only
    // (derived); staff confirmation still governs the canonical DB values via ingestion.
    const doc: IndexableProduct = {
      id: String(p.id),
      name: p.name,
      slug: p.slug,
      rangeName: range?.name ?? '',
      rangeSlug: range?.slug ?? '',
      sizeMm: p.sizeMm,
      sizeBand: p.sizeBand ?? classifySizeBand(p.sizeMm ?? null).value,
      application: p.application,
      colourGroup: p.colourGroup ?? classifyColour(p.name).value,
      finish: p.finish ?? classifyFinish(p.name).value,
      effect: p.effect ?? classifyEffect(p.name).value,
      material: p.material ?? 'porcelain',
      edge: p.edge,
      format: p.format ?? classifyFormat(p.name).value,
      inStock: stock.inStock,
      stockStatus: stock.status,
    }
    docs.push(toProductDocument(doc))
  }

  await upsertProducts(docs)
  payload.logger.info(
    `Indexed ${docs.length} products (skipped ${skipped} unpublished${indexAll ? '' : '; set INDEX_ALL=1 to include'})`,
  )

  // Wait for Meilisearch to process, then sample.
  let total = 0
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1000))
    const res = await searchProducts({ hitsPerPage: 1 })
    total = res.total
    if (total >= docs.length && docs.length > 0) break
  }
  const sample = await searchProducts({ filters: { effect: ['wood'] }, hitsPerPage: 3 })
  payload.logger.info(`Searchable now: ${total} products`)
  payload.logger.info(
    `Sample (effect=wood): ${sample.total} hits; facet colours: ${JSON.stringify(
      sample.facetDistribution.colourGroup ?? {},
    ).slice(0, 200)}`,
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
