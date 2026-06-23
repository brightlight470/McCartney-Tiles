import type { Metadata } from 'next'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { EnquiryForm, type EnquiryType } from '@/components/EnquiryForm'

export const metadata: Metadata = {
  title: 'Contact & enquiries',
  description:
    'Contact McCartney Tiles in Randalstown. Make an enquiry, request a brochure, book a showroom visit or apply for a trade account.',
}

const VALID: ReadonlySet<string> = new Set<EnquiryType>([
  'contact',
  'request-brochure',
  'book-showroom-visit',
  'trade-account-application',
  'sample-request',
])

const HEADINGS: Record<EnquiryType, string> = {
  contact: 'Make an enquiry',
  'request-brochure': 'Request a brochure',
  'book-showroom-visit': 'Book a showroom visit',
  'trade-account-application': 'Apply for a trade account',
  'sample-request': 'Request a sample',
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const type: EnquiryType =
    typeof sp.type === 'string' && VALID.has(sp.type) ? (sp.type as EnquiryType) : 'contact'
  const product = typeof sp.product === 'string' ? sp.product : undefined

  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink">{HEADINGS[type]}</h1>
          <p className="mt-3 text-slate">
            Tell us what you are working on. We supply across Ireland from our Randalstown showroom.
          </p>
          {product ? (
            <p className="mt-2 text-sm text-slate">
              Regarding product: <span className="font-medium text-ink">{product}</span>
            </p>
          ) : null}
          <div className="mt-8">
            <EnquiryForm
              type={type}
              productSlug={type === 'sample-request' ? product : undefined}
            />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
