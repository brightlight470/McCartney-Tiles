import type { Payload } from 'payload'
import {
  configureIndex,
  deleteProducts,
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

interface StockRow {
  product: string | number | { id: string | number }
  status?: string | null
}
interface RangeRef {
  name?: string
  slug?: string
  showOnWebsite?: boolean
}
interface MediaSize {
  url?: string | null
}
interface MediaRef {
  url?: string | null
  sizes?: Record<string, MediaSize | undefined>
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
  images?: (MediaRef | string | number)[] | null
}

const idOf = (rel: StockRow['product']): string =>
  typeof rel === 'object' ? String(rel.id) : String(rel)

// Media is served by the CMS; relative Payload URLs are made absolute for the browser.
const MEDIA_BASE =
  process.env.CMS_URL ?? process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001'

function thumbnailFor(images: ProductRow['images']): string | null {
  const first = Array.isArray(images) ? images[0] : null
  if (!first || typeof first !== 'object') return null
  const rel = first.sizes?.card?.url ?? first.sizes?.thumbnail?.url ?? first.url
  if (!rel) return null
  return rel.startsWith('http') ? rel : `${MEDIA_BASE}${rel}`
}

function deriveStock(rows: StockRow[]): { inStock: boolean; status: string | null } {
  if (rows.length === 0) return { inStock: false, status: null }
  const hasInStock = rows.some((r) => r.status === 'in_stock')
  return { inStock: hasInStock, status: hasInStock ? 'in_stock' : (rows[0]!.status ?? null) }
}

export interface IndexResult {
  indexed: number
  removed: number
  skipped: number
}

/**
 * (Re)build the Meilisearch products index from the DB. Indexes products whose parent range
 * is published (showOnWebsite); unpublished are removed from the index. `all: true` indexes
 * regardless of publish (local verification). Name-hint classifiers fill taxonomy the record
 * lacks (index-only). Never indexes raw price.
 */
export async function indexProductsFromDb(
  payload: Payload,
  opts: { all?: boolean } = {},
): Promise<IndexResult> {
  await configureIndex()

  const stockRes = await payload.find({ collection: 'stock', limit: 5000, depth: 0 })
  const stockByProduct = new Map<string, StockRow[]>()
  for (const row of stockRes.docs as unknown as StockRow[]) {
    const key = idOf(row.product)
    if (!stockByProduct.has(key)) stockByProduct.set(key, [])
    stockByProduct.get(key)!.push(row)
  }

  const productRes = await payload.find({ collection: 'products', limit: 5000, depth: 1 })
  const docs = []
  const remove: string[] = []
  let skipped = 0

  for (const p of productRes.docs as unknown as ProductRow[]) {
    const range = p.range && typeof p.range === 'object' ? p.range : null
    const published = Boolean(range?.showOnWebsite)
    if (!published && !opts.all) {
      remove.push(String(p.id))
      skipped++
      continue
    }
    const stock = deriveStock(stockByProduct.get(String(p.id)) ?? [])
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
      thumbnail: thumbnailFor(p.images),
    }
    docs.push(toProductDocument(doc))
  }

  await upsertProducts(docs)
  await deleteProducts(remove)
  return { indexed: docs.length, removed: remove.length, skipped }
}
