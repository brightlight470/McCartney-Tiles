import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { IngestionTool } from '@/components/IngestionTool'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ingest catalogue',
  robots: { index: false },
}

export default async function StaffIngestPage() {
  const user = await getCurrentUser()
  const isStaff = user?.role === 'staff'

  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Ingest catalogue</h1>
          <p className="mt-3 max-w-2xl text-slate">
            Upload supplier CSV. Values are mapped to the McCartney taxonomy and pre-filled —
            confirm or correct, then publish. Publishing makes the ranges live and indexes them for
            search.
          </p>

          {!isStaff ? (
            <p className="mt-10 rounded border border-border bg-white p-6 text-slate">
              Staff sign-in required.{' '}
              <Link href="/account/login" className="font-medium text-brand-blue hover:underline">
                Sign in
              </Link>
              .
            </p>
          ) : (
            <div className="mt-8">
              <IngestionTool />
            </div>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
