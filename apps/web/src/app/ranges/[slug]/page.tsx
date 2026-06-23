import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getProductsForRange, getRangeBySlug } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const range = await getRangeBySlug(slug)
  if (!range) return { title: 'Range not found' }
  return {
    title: range.seo?.title ?? range.name,
    description: range.seo?.description ?? range.description ?? undefined,
  }
}

export default async function RangePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const range = await getRangeBySlug(slug)
  if (!range) notFound()
  const products = await getProductsForRange(range.id)

  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container>
          <nav aria-label="Breadcrumb" className="text-sm text-slate">
            <Link href="/ranges" className="hover:text-brand-blue">
              Ranges
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-ink">{range.name}</span>
          </nav>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink">{range.name}</h1>
          {range.description ? (
            <p className="mt-4 max-w-2xl text-slate">{range.description}</p>
          ) : null}

          <h2 className="mt-12 font-display text-lg font-semibold text-ink">
            Products in this range
          </h2>
          {products.length === 0 ? (
            <p className="mt-4 text-slate">Product details are being added.</p>
          ) : (
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/product/${product.slug}`}
                    className="block rounded border border-border bg-white p-4 transition-colors hover:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <p className="font-display font-semibold text-ink">{product.name}</p>
                    {product.sizeMm ? (
                      <p className="tabular mt-1 text-sm text-slate">{product.sizeMm} mm</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
