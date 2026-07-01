import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@mccartney/ui'
import { searchProducts, type SearchResult } from '@mccartney/search'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { FacetSidebar } from '@/components/search/FacetSidebar'
import { FilterDrawer } from '@/components/search/FilterDrawer'
import { ActiveFilters } from '@/components/search/ActiveFilters'
import { Pagination } from '@/components/search/Pagination'
import { SearchBox } from '@/components/search/SearchBox'
import { ProductCard } from '@/components/search/ProductCard'
import {
  activeFilters,
  isActive,
  parseSearchParams,
  sortHref,
  type RawParams,
} from '@/lib/search-facets'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Products — every colour, faceted tile search',
  description:
    'Search the full McCartney Tiles catalogue by colour, size, finish, effect, material, application, edge and stock. One card per colour; sizes shown on each.',
}

const EMPTY: SearchResult = {
  hits: [],
  total: 0,
  page: 1,
  totalPages: 1,
  facetDistribution: {},
}

const SORTS: { key: string | undefined; label: string }[] = [
  { key: undefined, label: 'Relevance' },
  { key: 'name', label: 'Name A–Z' },
  { key: 'price', label: 'Price band' },
]

export default async function ProductsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const sp = await searchParams
  const { q, page, sort, filters } = parseSearchParams(sp)

  let result = EMPTY
  let unavailable = false
  try {
    result = await searchProducts({ query: q, filters, sort, page, hitsPerPage: 24 })
  } catch {
    unavailable = true
  }

  const activeSort = typeof sp.sort === 'string' ? sp.sort : undefined
  const activeCount = activeFilters(sp).length + (isActive(sp, 'stock', 'in') ? 1 : 0)

  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Products</h1>
          <p className="mt-2 text-slate">
            Every colour across the catalogue — one card per colour, with the sizes it comes in.
            Combine filters; results update live.
          </p>

          <div className="mt-8 max-w-2xl">
            <SearchBox sp={sp} />
          </div>

          <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-[16rem_1fr]">
            <FilterDrawer activeCount={activeCount}>
              <FacetSidebar sp={sp} distribution={result.facetDistribution} />
            </FilterDrawer>

            <section aria-label="Results">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="tabular text-sm text-slate">
                  {result.total} {result.total === 1 ? 'colour' : 'colours'}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-slate">Sort:</span>
                  {SORTS.map((s) => {
                    const isActiveSort = activeSort === s.key || (!activeSort && !s.key)
                    return (
                      <Link
                        key={s.label}
                        href={sortHref(sp, s.key)}
                        className={`rounded-sm px-2 py-1 ${
                          isActiveSort ? 'font-semibold text-brand-blue' : 'text-slate hover:text-ink'
                        }`}
                      >
                        {s.label}
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="mt-4">
                <ActiveFilters sp={sp} />
              </div>

              {unavailable ? (
                <p className="mt-12 rounded border border-border bg-white p-6 text-slate">
                  Search is starting up. The catalogue index is not yet available — once Meilisearch
                  is running and the catalogue is seeded, results appear here.
                </p>
              ) : result.hits.length === 0 ? (
                <p className="mt-12 rounded border border-border bg-white p-6 text-slate">
                  No tiles match these filters. Try removing a filter or widening your search.
                </p>
              ) : (
                <>
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {result.hits.map((hit) => (
                      <ProductCard key={hit.id} product={hit} />
                    ))}
                  </div>
                  <Pagination sp={sp} page={result.page} totalPages={result.totalPages} />
                </>
              )}
            </section>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
