import type { Metadata } from 'next'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { JsonLd } from '@/components/JsonLd'
import { getFaqs, type Faq } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers on tile supply, delivery, samples, trade accounts and visiting McCartney Tiles.',
}

function groupByCategory(faqs: Faq[]): Map<string, Faq[]> {
  const groups = new Map<string, Faq[]>()
  for (const f of faqs) {
    const key = f.category ?? 'General'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(f)
  }
  return groups
}

export default async function FaqPage() {
  const faqs = await getFaqs()
  const groups = groupByCategory(faqs)

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  return (
    <>
      {faqs.length > 0 ? <JsonLd data={faqLd} /> : null}
      <SiteHeader />
      <main className="py-12">
        <Container className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Frequently asked questions</h1>

          {faqs.length === 0 ? (
            <p className="mt-10 rounded border border-border bg-white p-6 text-slate">
              FAQs are being added.
            </p>
          ) : (
            <div className="mt-10 space-y-12">
              {[...groups.entries()].map(([category, items]) => (
                <section key={category}>
                  <h2 className="font-display text-lg font-semibold text-ink">{category}</h2>
                  <dl className="mt-4 divide-y divide-border">
                    {items.map((f) => (
                      <div key={f.id} className="py-4">
                        <dt className="font-medium text-ink">{f.question}</dt>
                        <dd className="mt-2 text-slate">{f.answer}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
