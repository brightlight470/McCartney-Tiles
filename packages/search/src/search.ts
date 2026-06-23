import { createSearchClient } from './client'
import { FACET_ATTRIBUTES, PRODUCTS_INDEX } from './index-config'
import type { ProductDocument } from './product-document'

export interface SearchParams {
  query?: string
  /** Facet → selected values (combinable, OR within a facet, AND across facets). */
  filters?: Partial<Record<(typeof FACET_ATTRIBUTES)[number], string[]>>
  sort?: string[]
  page?: number
  hitsPerPage?: number
}

export interface SearchResult {
  hits: ProductDocument[]
  total: number
  page: number
  totalPages: number
  facetDistribution: Record<string, Record<string, number>>
}

function buildFilter(filters: SearchParams['filters']): string[] {
  if (!filters) return []
  const clauses: string[] = []
  for (const [attr, values] of Object.entries(filters)) {
    if (!values || values.length === 0) continue
    const ors = values.map((v) => {
      // Booleans (e.g. inStock) must be emitted unquoted for Meilisearch.
      const literal = v === 'true' || v === 'false' ? v : JSON.stringify(v)
      return `${attr} = ${literal}`
    })
    clauses.push(`(${ors.join(' OR ')})`)
  }
  return clauses
}

/** Faceted search over published products with live per-facet counts. */
export async function searchProducts(params: SearchParams = {}): Promise<SearchResult> {
  const index = createSearchClient().index<ProductDocument>(PRODUCTS_INDEX)
  const page = params.page ?? 1
  const hitsPerPage = params.hitsPerPage ?? 24

  const res = await index.search(params.query ?? '', {
    filter: buildFilter(params.filters),
    facets: [...FACET_ATTRIBUTES],
    sort: params.sort,
    page,
    hitsPerPage,
  })

  return {
    hits: res.hits,
    total: res.totalHits ?? res.hits.length,
    page: res.page ?? page,
    totalPages: res.totalPages ?? 1,
    facetDistribution: res.facetDistribution ?? {},
  }
}
