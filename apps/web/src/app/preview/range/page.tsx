import Image from 'next/image'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { AccordionFilters } from '../_components/AccordionFilters'
import { MockProductCard } from '../_components/MockProductCard'
import { RANGE_BLOKA as range } from '../_data'

export default function PreviewRange() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* 1 — Hero */}
        <section className="relative isolate overflow-hidden bg-ink">
          <div className="absolute inset-0">
            <Image src={range.feature[0]!} alt="" fill className="object-cover opacity-70" priority />
          </div>
          <div className="absolute inset-0 bg-ink/45" aria-hidden="true" />
          <Container className="relative py-24 sm:py-32">
            <p className="text-sm font-semibold tracking-wide text-white/80 uppercase">
              {range.supplier} · {range.effect}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {range.name}
            </h1>
          </Container>
        </section>

        <Container>
          {/* 2 — Feature images */}
          <section className="mt-12" aria-label="Range gallery">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {range.feature.map((src, i) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden rounded border border-border bg-mist">
                  <Image src={src} alt={`${range.name} feature ${i + 1}`} fill className="object-cover" sizes="(min-width: 640px) 33vw, 100vw" />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate">
              Production uses room/lifestyle photography here; swatches stand in for the mockup.
            </p>
          </section>

          {/* 3 — Short description (~2 lines) */}
          <section className="mt-12 max-w-2xl">
            <h2 className="font-display text-lg font-semibold text-ink">About {range.name}</h2>
            <p className="mt-2 text-slate">{range.blurb}</p>
          </section>

          {/* 4 — Products in the range (with filters, change #6) */}
          <section className="mt-12 mb-16" aria-label="Products in this range">
            <h2 className="font-display text-lg font-semibold text-ink">Colours in this range</h2>
            <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[16rem_1fr]">
              <AccordionFilters />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {range.products.map((p) => (
                  <MockProductCard key={p.slug} product={p} />
                ))}
              </div>
            </div>
          </section>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
