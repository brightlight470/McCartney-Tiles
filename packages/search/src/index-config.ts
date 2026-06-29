import type { Settings } from 'meilisearch'

export const PRODUCTS_INDEX = process.env.MEILISEARCH_INDEX ?? 'products'

/** Facets exposed in the public faceted-search UI (Handover §7). */
export const FACET_ATTRIBUTES = [
  'sizeMm',
  'sizeBand',
  'colourGroup',
  'finish',
  'effect',
  'material',
  'application',
  'applications',
  'edge',
  'design',
  'format',
  'inStock',
  'stockStatus',
  'brand',
  'priceBand',
] as const

/** Meilisearch index settings. Applied by configureIndex(). */
export const PRODUCTS_SETTINGS: Settings = {
  searchableAttributes: ['name', 'rangeName', 'brand', 'colourGroup', 'effect', 'finish'],
  filterableAttributes: [...FACET_ATTRIBUTES],
  sortableAttributes: ['name', 'priceBandOrder'],
  rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  faceting: { maxValuesPerFacet: 200 },
  pagination: { maxTotalHits: 5000 },
}
