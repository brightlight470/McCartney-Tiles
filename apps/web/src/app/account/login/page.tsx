import type { Metadata } from 'next'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { LoginForm } from '@/components/LoginForm'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false },
}

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container className="max-w-md">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Sign in</h1>
          <p className="mt-3 text-slate">
            Trade and staff accounts. Trade accounts see pricing and full stock.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
          <p className="mt-6 text-sm text-slate">
            No trade account?{' '}
            <a
              href="/contact?type=trade-account-application"
              className="font-medium text-brand-blue hover:underline"
            >
              Apply for one
            </a>
            .
          </p>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
