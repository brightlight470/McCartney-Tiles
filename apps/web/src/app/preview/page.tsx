import Link from 'next/link'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

const MOCKS = [
  {
    href: '/preview/products',
    title: 'Products page',
    desc: 'All colours across every range, one card per colour (sizes collapsed). Suitability icon overlaid, size stack on the right, expandable filters.',
  },
  {
    href: '/preview/range',
    title: 'Range page',
    desc: 'Hero, feature images from the range, a two-line description, then the products (colours) in that range — with filters.',
  },
  {
    href: '/preview/product',
    title: 'Product page',
    desc: 'Feature images, full specification, and the sizes available for that product as black-outline tiles.',
  },
]

export default function PreviewIndex() {
  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container>
          <h1 className="text-3xl font-bold tracking-tight text-ink">v2.0.0 page mockups</h1>
          <p className="mt-3 max-w-2xl text-slate">
            Architecture mockups for the new Range → Product → size structure. Built with sample
            data so the layout can be approved before it is wired to live data and the backend is
            reworked. Review each, then approve or send changes.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {MOCKS.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="block rounded-lg border border-border bg-white p-6 transition-colors hover:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
              >
                <p className="font-display text-lg font-semibold text-ink">{m.title}</p>
                <p className="mt-2 text-sm text-slate">{m.desc}</p>
                <span className="mt-4 inline-block text-sm font-medium text-brand-blue">
                  View mockup →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
