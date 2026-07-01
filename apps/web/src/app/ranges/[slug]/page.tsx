import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@mccartney/ui'
import { labelFor } from '@mccartney/db'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { SuitabilityOverlay } from '@/components/SuitabilityOverlay'
import { SizeTiles } from '@/components/SizeTiles'
import {
  getProductsForRange,
  getRangeBySlug,
  mediaUrl,
  productSizesMm,
  type Product,
} from '@/lib/catalog'

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

  // Feature strip: the first image from up to three products in the range.
  const feature = products
    .map((p) => mediaUrl(p.images?.[0], 'card'))
    .filter((u): u is string => Boolean(u))
    .slice(0, 3)

  const effect = range.effect?.[0] ? labelFor('effect', range.effect[0]) : null

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-ink">
          {hero ? (
            <div className="absolute inset-0">
              <Image src={hero} alt="" fill className="object-cover opacity-70" priority />
            </div>
          ) : null}
          <div className="absolute inset-0 bg-ink/45" aria-hidden="true" />
          <Container className="relative py-24 sm:py-32">
            <nav aria-label="Breadcrumb" className="text-sm text-white/80">
              <Link href="/ranges" className="hover:text-white">
                Ranges
              </Link>
              <span aria-hidden="true"> / </span>
              <span className="text-white">{range.name}</span>
            </nav>
            {effect ? (
              <p className="mt-4 text-sm font-semibold tracking-wide text-white/80 uppercase">
                {effect}
              </p>
            ) : null}
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {range.name}
            </h1>
          </Container>
        </section>

        <Container>
          {/* Feature images */}
          {feature.length > 0 ? (
            <section className="mt-12" aria-label="Range gallery">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {feature.map((src, i) => (
                  <div
                    key={src}
                    className="relative aspect-[4/3] overflow-hidden rounded border border-border bg-mist"
                  >
                    <Image
                      src={src}
                      alt={`${range.name} feature ${i + 1}`}
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Short description */}
          {range.description ? (
            <section className="mt-12 max-w-2xl">
              <h2 className="font-display text-lg font-semibold text-ink">About {range.name}</h2>
              <p className="mt-2 text-slate">{range.description}</p>
            </section>
          ) : null}

          {/* Colours in this range */}
          <section className="mt-12 mb-16" aria-label="Colours in this range">
            <h2 className="font-display text-lg font-semibold text-ink">Colours in this range</h2>
            {products.length === 0 ? (
              <p className="mt-4 text-slate">Product details are being added.</p>
            ) : (
              <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <RangeColourCard key={product.id} product={product} rangeHero={hero} />
                ))}
              </ul>
            )}
          </section>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}

function RangeColourCard({ product, rangeHero }: { product: Product; rangeHero: string | null }) {
  const thumb = mediaUrl(product.images?.[0], 'card') ?? rangeHero
  const sizes = productSizesMm(product)
  return (
    <li>
      <Link
        href={`/product/${product.slug}`}
        className="group block overflow-hidden rounded border border-border bg-white transition-colors hover:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <div className="relative aspect-square bg-mist">
          {thumb ? (
            <Image
              src={thumb}
              alt={product.colour ?? product.name}
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          ) : null}
          <SuitabilityOverlay application={product.application} size={40} />
          {sizes.length ? <SizeTiles sizes={sizes} variant="card" /> : null}
        </div>
        <div className="p-4">
          <p className="font-display font-semibold text-ink">{product.colour || product.name}</p>
        </div>
      </Link>
    </li>
  )
}
