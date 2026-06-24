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
        {/* Full-bleed hero. Drop a 16:9 master at public/hero/hero.{webm,mp4} + hero-poster.jpg.
            object-cover makes the exact source ratio forgiving; bg-ink shows until assets land.
            Video is suppressed for prefers-reduced-motion (poster/ink shown instead). */}
        <section className="relative isolate overflow-hidden bg-ink">
          <video
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            poster="/hero/hero-poster.jpg"
            aria-hidden="true"
          >
            <source src="/hero/hero.webm" type="video/webm" />
            <source src="/hero/hero.mp4" type="video/mp4" />
          </video>
          {/* Scrim for text contrast (WCAG AA over imagery). */}
          <div className="absolute inset-0 bg-ink/55" aria-hidden="true" />

          <Container className="relative max-w-3xl py-32 sm:py-44">
            <p className="mb-4 text-sm font-semibold tracking-wide text-white/80 uppercase">
              Randalstown · serving all of Ireland
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Tiles, specified to the millimetre.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/85">
              Porcelain and ceramic ranges held in stock and supplied across Ireland. Search every
              range by size, finish, effect, colour and availability.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/ranges"
                className="inline-flex h-12 items-center justify-center rounded bg-white px-6 font-display font-semibold text-ink transition-colors duration-150 hover:bg-mist focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink focus-visible:outline-none"
              >
                Browse the ranges
              </Link>
              <Link
                href="/showrooms"
                className="inline-flex h-12 items-center justify-center rounded border border-white/70 px-6 font-display font-semibold text-white transition-colors duration-150 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink focus-visible:outline-none"
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
