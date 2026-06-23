import type { Metadata } from 'next'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'About & heritage',
  description:
    'McCartney Tiles has supplied porcelain and ceramic tile across Ireland from Randalstown, Co. Antrim, for 45 years.',
}

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink">A tile supplier since 1981</h1>
          <div className="mt-6 space-y-4 text-slate">
            <p>
              McCartney Tiles is a family business in Randalstown, Co. Antrim. For 45 years we have
              supplied porcelain and ceramic tile to homeowners, builders and the trade across the
              island of Ireland.
            </p>
            <p>
              We hold stock. The ranges you search on this site reflect what we carry — by size,
              finish, effect and availability — so specification is a matter of fact, not guesswork.
            </p>
          </div>

          {/* TODO(content): replace with refined heritage copy + supplier list from Cowork
              (legacy /about-us, /about-our-suppliers). */}
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
