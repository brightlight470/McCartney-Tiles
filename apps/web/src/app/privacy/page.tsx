import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Privacy & cookies',
  description:
    'How McCartney Tiles uses cookies and handles enquiries. Phase 1 sets only necessary cookies; the full policy is being finalised.',
}

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Privacy &amp; cookies</h1>
          <p className="mt-4 text-slate">
            This notice covers how the McCartney Tiles website uses cookies. The full privacy
            policy is being finalised with the business and will be published before launch.
          </p>

          <h2 className="mt-10 font-display text-lg font-semibold text-ink">Cookies we set</h2>
          <p className="mt-3 text-slate">
            The site uses only necessary cookies — there is no advertising or third-party tracking
            at this stage:
          </p>
          <ul className="mt-4 space-y-2 text-slate">
            <li>
              <span className="font-medium text-ink">mc_region</span> — remembers your selected
              region so the site shows the right availability.
            </li>
            <li>
              <span className="font-medium text-ink">mc_consent</span> — records that you have seen
              this cookie notice.
            </li>
            <li>
              <span className="font-medium text-ink">mc_preview</span> — present only while the site
              is in private preview.
            </li>
          </ul>

          <h2 className="mt-10 font-display text-lg font-semibold text-ink">Enquiries</h2>
          <p className="mt-3 text-slate">
            When you send an enquiry we use your details only to respond. For any question about
            your data, please{' '}
            <Link href="/contact" className="font-medium text-brand-blue hover:underline">
              contact us
            </Link>
            .
          </p>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
