import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { JsonLd } from '@/components/JsonLd'
import { getShowrooms } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Showrooms',
  description: 'Visit a McCartney Tiles showroom in Randalstown. Opening hours and directions.',
}

export default async function ShowroomsPage() {
  const showrooms = await getShowrooms()

  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Showrooms</h1>
          <p className="mt-3 max-w-2xl text-slate">
            See ranges in person and talk specification with the team.
          </p>

          {showrooms.length === 0 ? (
            <p className="mt-10 rounded border border-border bg-white p-6 text-slate">
              Showroom details are being added. In the meantime,{' '}
              <Link href="/contact" className="font-medium text-brand-blue hover:underline">
                contact us
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {showrooms.map((s) => (
                <li key={s.id} className="rounded border border-border bg-white p-6">
                  <JsonLd
                    data={{
                      '@context': 'https://schema.org',
                      '@type': 'HomeGoodsStore',
                      name: s.name,
                      address: {
                        '@type': 'PostalAddress',
                        streetAddress: s.address,
                        postalCode: s.postcode ?? undefined,
                        addressCountry: 'GB',
                      },
                      openingHours: s.hours ?? undefined,
                    }}
                  />
                  <h2 className="font-display text-lg font-semibold text-ink">{s.name}</h2>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate">{s.address}</p>
                  {s.postcode ? <p className="text-sm text-slate">{s.postcode}</p> : null}
                  {s.hours ? (
                    <p className="mt-3 whitespace-pre-line text-sm text-slate">{s.hours}</p>
                  ) : null}
                  <Link
                    href="/contact?type=book-showroom-visit"
                    className="mt-4 inline-flex text-sm font-medium text-brand-blue hover:underline"
                  >
                    Book a visit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
