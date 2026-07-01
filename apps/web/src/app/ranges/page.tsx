import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getPublishedRanges, mediaUrl } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ranges — porcelain and ceramic tile families',
  description:
    'Browse the McCartney Tiles ranges. Each range is a tile family with its colours and sizes, held in stock and supplied across Ireland.',
}

export default async function RangesPage() {
  const ranges = await getPublishedRanges()

  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Ranges</h1>
          <p className="mt-2 max-w-2xl text-slate">
            Each range is a tile family. Open one to see its colours and the sizes they come in, or
            search every colour on the{' '}
            <Link href="/products" className="font-medium text-brand-blue hover:underline">
              Products
            </Link>{' '}
            page.
          </p>

          {ranges.length === 0 ? (
            <p className="mt-12 rounded border border-border bg-white p-6 text-slate">
              Ranges are being published. Once the catalogue is seeded they appear here.
            </p>
          ) : (
            <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {ranges.map((range) => {
                const hero = mediaUrl(range.heroImage, 'card')
                return (
                  <li key={range.id}>
                    <Link
                      href={`/ranges/${range.slug}`}
                      className="group block overflow-hidden rounded border border-border bg-white transition-colors hover:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <div className="relative aspect-square bg-mist">
                        {hero ? (
                          <Image
                            src={hero}
                            alt=""
                            fill
                            sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 50vw"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="p-4">
                        <p className="font-display font-semibold text-ink">{range.name}</p>
                        {range.description ? (
                          <p className="mt-1 line-clamp-2 text-sm text-slate">{range.description}</p>
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
