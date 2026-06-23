import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container, StockBadge, type StockStatus } from '@mccartney/ui'
import { labelFor } from '@mccartney/db'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { RoomvoVisualiser } from '@/components/RoomvoVisualiser'
import { JsonLd } from '@/components/JsonLd'
import { getProductBySlug, getStockForProduct, type Product, type Range } from '@/lib/catalog'
import { getCurrentUser, getProductPrice } from '@/lib/auth'

const VALID_STATUS: ReadonlySet<string> = new Set<StockStatus>([
  'in_stock',
  'out_of_stock',
  'on_order',
  'special_offer',
  'clearance',
])

const money = (n: number, currency: string) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(n)

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product not found' }
  return {
    title: product.name,
    description: `${product.name} — porcelain and ceramic tile supplied by McCartney Tiles across Ireland.`,
  }
}

function rangeOf(product: Product): Range | null {
  return product.range && typeof product.range === 'object' ? (product.range as Range) : null
}

function specRows(product: Product): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = []
  const push = (label: string, value?: string | number | null) => {
    if (value !== null && value !== undefined && value !== '')
      rows.push({ label, value: String(value) })
  }
  push('Size', product.sizeMm ? `${product.sizeMm} mm` : null)
  push('Application', product.application ? labelFor('application', product.application) : null)
  push('Colour', product.colourGroup ? labelFor('colourGroup', product.colourGroup) : null)
  push('Finish', product.finish ? labelFor('finish', product.finish) : null)
  push('Effect', product.effect ? labelFor('effect', product.effect) : null)
  push('Material', product.material ? labelFor('material', product.material) : null)
  push('Edge', product.edge ? labelFor('edge', product.edge) : null)
  push('Format', product.format ? labelFor('format', product.format) : null)
  push('Thickness', product.thicknessMm ? `${product.thicknessMm} mm` : null)
  push('Tiles per box', product.tilesPerBox)
  push('m² per box', product.m2PerBox)
  return rows
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()
  const range = rangeOf(product)
  const rows = specRows(product)

  const [user, price, stock] = await Promise.all([
    getCurrentUser(),
    getProductPrice(product.id),
    getStockForProduct(product.id),
  ])
  const canSeePrice = user?.role === 'trade' || user?.role === 'staff'
  const stockStatus =
    stock.status && VALID_STATUS.has(stock.status) ? (stock.status as StockStatus) : null

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    category: product.effect ? labelFor('effect', product.effect) : 'Tile',
    material: product.material ? labelFor('material', product.material) : 'Porcelain',
    brand: { '@type': 'Brand', name: 'McCartney Tiles' },
  }

  return (
    <>
      <JsonLd data={productLd} />
      <SiteHeader />
      <main className="py-12">
        <Container>
          <nav aria-label="Breadcrumb" className="text-sm text-slate">
            <Link href="/ranges" className="hover:text-brand-blue">
              Ranges
            </Link>
            {range ? (
              <>
                <span aria-hidden="true"> / </span>
                <Link href={`/ranges/${range.slug}`} className="hover:text-brand-blue">
                  {range.name}
                </Link>
              </>
            ) : null}
            <span aria-hidden="true"> / </span>
            <span className="text-ink">{product.name}</span>
          </nav>

          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="aspect-square rounded border border-border bg-mist" />

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-ink">{product.name}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {stockStatus ? <StockBadge status={stockStatus} /> : null}
                {stock.inStock && stock.totalM2 ? (
                  <span className="tabular text-sm text-slate">{stock.totalM2} m² in stock</span>
                ) : null}
              </div>

              <div className="mt-6 rounded border border-border bg-white p-4">
                {canSeePrice ? (
                  price && (price.retailPerM2 != null || price.tradePerM2 != null) ? (
                    <dl className="space-y-1">
                      {price.retailPerM2 != null ? (
                        <div className="flex justify-between text-sm">
                          <dt className="text-slate">Retail</dt>
                          <dd className="tabular font-medium text-ink">
                            {money(price.retailPerM2, price.currency)}/m²
                          </dd>
                        </div>
                      ) : null}
                      {price.tradePerM2 != null ? (
                        <div className="flex justify-between text-sm">
                          <dt className="text-slate">Trade</dt>
                          <dd className="tabular font-semibold text-brand-blue">
                            {money(price.tradePerM2, price.currency)}/m²
                          </dd>
                        </div>
                      ) : null}
                      {user?.role === 'staff' && price.costPerM2 != null ? (
                        <div className="flex justify-between text-sm">
                          <dt className="text-slate">Cost (staff)</dt>
                          <dd className="tabular text-ink">
                            {money(price.costPerM2, price.currency)}/m²
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : (
                    <p className="text-sm text-slate">Price on request.</p>
                  )
                ) : (
                  <p className="text-sm text-slate">
                    <Link
                      href="/account/login"
                      className="font-medium text-brand-blue hover:underline"
                    >
                      Sign in
                    </Link>{' '}
                    to a trade account for pricing, or{' '}
                    <Link
                      href="/contact?type=trade-account-application"
                      className="font-medium text-brand-blue hover:underline"
                    >
                      apply
                    </Link>
                    .
                  </p>
                )}
              </div>

              <table className="mt-8 w-full text-sm">
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label} className="border-b border-border">
                      <th scope="row" className="py-2 pr-4 text-left font-medium text-slate">
                        {row.label}
                      </th>
                      <td className="tabular py-2 text-right text-ink">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={`/contact?type=sample-request&product=${product.slug}`}
                  className="inline-flex h-12 items-center justify-center rounded bg-brand-blue px-6 font-display font-semibold text-white hover:bg-ink focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Request a sample
                </Link>
                <Link
                  href={`/contact?product=${product.slug}`}
                  className="inline-flex h-12 items-center justify-center rounded border border-brand-blue px-6 font-display font-semibold text-brand-blue hover:bg-mist focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Make an enquiry
                </Link>
              </div>

              <div className="mt-8">
                <RoomvoVisualiser productSlug={product.slug} />
              </div>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
