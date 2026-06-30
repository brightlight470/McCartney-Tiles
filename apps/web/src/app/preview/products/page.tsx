import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { AccordionFilters } from '../_components/AccordionFilters'
import { MockProductCard } from '../_components/MockProductCard'
import { PRODUCTS } from '../_data'

export default function PreviewProducts() {
  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Products</h1>
          <p className="mt-2 max-w-2xl text-slate">
            Every colour across all ranges. One card per colour — the sizes for each are shown as a
            stack on the card, so the list stays short. Open a colour to see its full specification
            and sizes.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[16rem_1fr]">
            <AccordionFilters />

            <section aria-label="Results">
              <p className="tabular text-sm text-slate">{PRODUCTS.length} colours</p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {PRODUCTS.map((p) => (
                  <MockProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
