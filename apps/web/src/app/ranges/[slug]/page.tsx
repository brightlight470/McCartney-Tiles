import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getProductsForRange, getRangeBySlug, mediaUrl } from '@/lib/catalog'

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
  const hero = mediaUrl(range.heroImage, 'hero')

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

          {hero ? (
            <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded border border-border bg-mist">
              <Image
                src={hero}
                alt={range.name}
                fill
                sizes="(min-width: 1280px) 1100px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          ) : null}

          <h2 className="mt-12 font-display text-lg font-semibold text-ink">
            Products in this range
          </h2>
          {products.length === 0 ? (
            <p className="mt-4 text-slate">Product details are being added.</p>
          ) : (
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const thumb =
                  mediaUrl(product.images?.[0], 'card') ?? mediaUrl(range.heroImage, 'card')
                return (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.slug}`}
                      className="group block overflow-hidden rounded border border-border bg-white transition-colors hover:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <div className="relative aspect-square bg-mist">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt=""
                            fill
                            sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 50vw"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="p-4">
                        <p className="font-display font-semibold text-ink">{product.name}</p>
                        {product.sizeMm ? (
                          <p className="tabular mt-1 text-sm text-slate">{product.sizeMm} mm</p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
