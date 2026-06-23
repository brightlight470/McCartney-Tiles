import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { LogoutButton } from '@/components/LogoutButton'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your account',
  robots: { index: false },
}

const CMS_URL = process.env.CMS_URL ?? 'http://localhost:3001'

export default async function AccountPage() {
  const user = await getCurrentUser()

  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container className="max-w-xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Your account</h1>

          {!user ? (
            <p className="mt-6 text-slate">
              You are not signed in.{' '}
              <Link href="/account/login" className="font-medium text-brand-blue hover:underline">
                Sign in
              </Link>
              .
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              <dl className="divide-y divide-border rounded border border-border bg-white">
                <div className="flex justify-between p-4">
                  <dt className="text-slate">Email</dt>
                  <dd className="font-medium text-ink">{user.email}</dd>
                </div>
                <div className="flex justify-between p-4">
                  <dt className="text-slate">Account type</dt>
                  <dd className="font-medium text-ink capitalize">{user.role}</dd>
                </div>
                {user.companyName ? (
                  <div className="flex justify-between p-4">
                    <dt className="text-slate">Company</dt>
                    <dd className="font-medium text-ink">{user.companyName}</dd>
                  </div>
                ) : null}
                {user.tradeStatus ? (
                  <div className="flex justify-between p-4">
                    <dt className="text-slate">Trade status</dt>
                    <dd className="font-medium text-ink capitalize">{user.tradeStatus}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="flex items-center gap-4">
                <LogoutButton />
                {user.role === 'staff' ? (
                  <a
                    href={`${CMS_URL}/admin`}
                    className="text-sm font-medium text-brand-blue hover:underline"
                  >
                    Open the admin
                  </a>
                ) : null}
              </div>
            </div>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
