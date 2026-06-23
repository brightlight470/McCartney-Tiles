import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { deleteProducts, toProductDocument, upsertProducts } from '@mccartney/search'

/** Narrow view of a Product doc used for indexing (avoids depending on generated types). */
interface ProductLike {
  id: string | number
  name: string
  slug: string
  range: string | number | { slug?: string; name?: string; showOnWebsite?: boolean }
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

/**
 * Index a product into search when its parent range is published (showOnWebsite),
 * otherwise remove it. No-op if Meilisearch is not configured (local/CI without services).
 * Price band is intentionally absent here — pricing sync happens via the Prices collection
 * in Sprint 1 and never exposes raw price.
 */
export const syncProductToSearch: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (!process.env.MEILISEARCH_HOST) return doc
  const p = doc as unknown as ProductLike
  try {
    let range = p.range
    if (typeof range !== 'object') {
      range = (await req.payload.findByID({ collection: 'ranges', id: range, depth: 0 })) as never
    }
    const published = typeof range === 'object' ? Boolean(range.showOnWebsite) : false
    const id = String(p.id)
    if (!published) {
      await deleteProducts([id])
      return doc
    }
    await upsertProducts([
      toProductDocument({
        id,
        name: p.name,
        slug: p.slug,
        rangeName: typeof range === 'object' ? (range.name ?? '') : '',
        rangeSlug: typeof range === 'object' ? (range.slug ?? '') : '',
        sizeMm: p.sizeMm,
        sizeBand: p.sizeBand,
        application: p.application,
        colourGroup: p.colourGroup,
        finish: p.finish,
        effect: p.effect,
        material: p.material,
        edge: p.edge,
        format: p.format,
      }),
    ])
  } catch (err) {
    req.payload.logger.error({ err }, 'search-sync: failed to index product')
  }
  return doc
}

export const removeProductFromSearch: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (!process.env.MEILISEARCH_HOST) return doc
  try {
    await deleteProducts([String((doc as unknown as ProductLike).id)])
  } catch (err) {
    req.payload.logger.error({ err }, 'search-sync: failed to remove product')
  }
  return doc
}
