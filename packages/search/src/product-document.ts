/**
 * The search document for a published product.
 * SECURITY: never include raw retail/trade/cost price. Only a coarse, public-safe
 * `priceBand` derived from retail price is indexed (Handover §7, §9).
 */
export interface ProductDocument {
  id: string
  rangeName: string
  rangeSlug: string
  name: string
  colour: string | null
  slug: string
  /** Sizes this colour comes in (multi-value — a product spans several sizes now). */
  sizesMm: string[]
  sizeBands: string[]
  application: string | null
  /** Suitability as a multi-value facet: any of 'wall' | 'floor' | 'outdoor'. */
  applications: string[]
  colourGroup: string | null
  finish: string | null
  effect: string | null
  material: string | null
  edge: string | null
  design: string[]
  format: string | null
  brand: string | null
  inStock: boolean
  stockStatus: string | null
  priceBand: PriceBand | null
  /** Sort key so price-band ordering is stable in the index. */
  priceBandOrder: number
  images: string[]
  thumbnail: string | null
}

export type PriceBand = '£' | '££' | '£££' | '££££'

const BANDS: { max: number; band: PriceBand; order: number }[] = [
  { max: 25, band: '£', order: 1 },
  { max: 45, band: '££', order: 2 },
  { max: 70, band: '£££', order: 3 },
  { max: Infinity, band: '££££', order: 4 },
]

/** Coarse, public-safe price band from a retail £/m² figure. Returns null if unpriced. */
export function priceBandFor(retailPerM2: number | null | undefined): {
  band: PriceBand | null
  order: number
} {
  if (retailPerM2 == null || !Number.isFinite(retailPerM2)) return { band: null, order: 0 }
  const hit = BANDS.find((b) => retailPerM2 <= b.max) ?? BANDS[BANDS.length - 1]!
  return { band: hit.band, order: hit.order }
}

/** Input shape the indexer maps from (decoupled from the Payload-generated types). */
export interface IndexableProduct {
  id: string
  rangeName: string
  rangeSlug: string
  name: string
  colour?: string | null
  slug: string
  sizesMm?: string[] | null
  sizeBands?: string[] | null
  application?: string | null
  applications?: string[] | null
  colourGroup?: string | null
  finish?: string | null
  effect?: string | null
  material?: string | null
  edge?: string | null
  design?: string[] | null
  format?: string | null
  brand?: string | null
  inStock?: boolean
  stockStatus?: string | null
  retailPerM2?: number | null
  images?: string[] | null
  thumbnail?: string | null
}

export function toProductDocument(p: IndexableProduct): ProductDocument {
  const { band, order } = priceBandFor(p.retailPerM2)
  return {
    id: p.id,
    rangeName: p.rangeName,
    rangeSlug: p.rangeSlug,
    name: p.name,
    colour: p.colour ?? null,
    slug: p.slug,
    sizesMm: p.sizesMm ?? [],
    sizeBands: p.sizeBands ?? [],
    application: p.application ?? null,
    applications: p.applications ?? [],
    colourGroup: p.colourGroup ?? null,
    finish: p.finish ?? null,
    effect: p.effect ?? null,
    material: p.material ?? null,
    edge: p.edge ?? null,
    design: p.design ?? [],
    format: p.format ?? null,
    brand: p.brand ?? null,
    inStock: p.inStock ?? false,
    stockStatus: p.stockStatus ?? null,
    priceBand: band,
    priceBandOrder: order,
    images: p.images ?? [],
    thumbnail: p.thumbnail ?? null,
  }
}
