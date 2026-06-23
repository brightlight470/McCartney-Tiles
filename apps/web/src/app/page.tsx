import Link from 'next/link'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { JsonLd, LOCAL_BUSINESS_LD, ORGANISATION_LD } from '@/components/JsonLd'

export default function HomePage() {
  return (
    <>
      <JsonLd data={ORGANISATION_LD} />
      <JsonLd data={LOCAL_BUSINESS_LD} />
      <SiteHeader />

      <main>
        <section className="py-24 sm:py-32">
          <Container className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold tracking-wide text-slate uppercase">
              Randalstown · serving all of Ireland
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Tiles, specified to the millimetre.
            </h1>
            <p className="mt-6 text-lg text-slate">
              Porcelain and ceramic ranges held in stock and supplied across Ireland. Search every
              range by size, finish, effect, colour and availability.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/ranges"
                className="inline-flex h-12 items-center justify-center rounded bg-brand-blue px-6 font-display font-semibold text-white transition-colors duration-150 hover:bg-ink focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Browse the ranges
              </Link>
              <Link
                href="/showrooms"
                className="inline-flex h-12 items-center justify-center rounded border border-brand-blue px-6 font-display font-semibold text-brand-blue transition-colors duration-150 hover:bg-mist focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Book a showroom visit
              </Link>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
