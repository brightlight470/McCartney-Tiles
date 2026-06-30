import type { Metadata } from 'next'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { BrochureDialog } from '@/components/BrochureDialog'

export const metadata: Metadata = {
  title: 'Bathroom tiles — porcelain and ceramic across Ireland',
  description:
    'Bathroom tile ranges from our two leading suppliers — walls, floors and wet areas. Download the bathrooms brochure by email or WhatsApp.',
}

// Placeholder slots until real photography arrives. Each names what asset belongs here so the
// swap-in is unambiguous; nothing here ships as a real product claim.
function PlaceholderImage({
  ratio = 'aspect-[4/3]',
  caption,
}: {
  ratio?: string
  caption: string
}) {
  return (
    <div
      className={`relative ${ratio} overflow-hidden rounded border border-dashed border-border bg-mist`}
    >
      <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
        <span className="text-xs font-medium tracking-wide text-slate uppercase">{caption}</span>
      </div>
    </div>
  )
}

// Two featured suppliers — names supplied by McCartney; using neutral labels until confirmed.
const SUPPLIERS = [
  {
    key: 'one',
    name: 'Featured supplier 1',
    blurb:
      'Large-format porcelain for walls and floors — through-body colour, rectified edges, slip ratings for wet areas.',
  },
  {
    key: 'two',
    name: 'Featured supplier 2',
    blurb:
      'Ceramic wall tiles and decor in matt and gloss — trims, mosaics and coordinating floor ranges.',
  },
]

export default function BathroomsPage() {
  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container>
          {/* Intro */}
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-wide text-brand-blue uppercase">
              Bathrooms
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Bathroom tiles, specified for wet areas.
            </h1>
            <p className="mt-4 text-lg text-slate">
              Porcelain and ceramic ranges for walls, floors and wet rooms — held in stock and
              supplied across Ireland. Two of our leading suppliers are featured below.
            </p>
          </div>

          {/* Hero bathroom image */}
          <div className="mt-8">
            <PlaceholderImage ratio="aspect-[16/9]" caption="Bathroom hero image — to be supplied" />
          </div>

          {/* Supplier feature blocks */}
          {SUPPLIERS.map((supplier, i) => (
            <section key={supplier.key} className="mt-16" aria-labelledby={`supplier-${supplier.key}`}>
              <div className="flex items-baseline justify-between gap-4">
                <h2
                  id={`supplier-${supplier.key}`}
                  className="font-display text-xl font-semibold text-ink"
                >
                  {supplier.name}
                </h2>
                <span className="text-xs text-slate">Supplier name to confirm</span>
              </div>
              <p className="mt-2 max-w-2xl text-slate">{supplier.blurb}</p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PlaceholderImage caption={`${supplier.name} — feature image ${i * 3 + 1}`} />
                <PlaceholderImage caption={`${supplier.name} — feature image ${i * 3 + 2}`} />
                <PlaceholderImage caption={`${supplier.name} — feature image ${i * 3 + 3}`} />
              </div>
            </section>
          ))}

          {/* Brochure CTA */}
          <section className="mt-20 rounded-lg border border-border bg-white p-8 text-center sm:p-12">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Get the bathrooms brochure
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate">
              Full ranges, sizes and finishes from both suppliers in one document. We will send it to
              your email or WhatsApp.
            </p>
            <div className="mt-6 flex justify-center">
              <BrochureDialog label="Download the brochure" />
            </div>
          </section>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
