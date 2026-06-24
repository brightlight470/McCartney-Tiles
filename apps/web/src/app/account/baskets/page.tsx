import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { BasketRemoveButton } from '@/components/BasketRemoveButton'
import { getCurrentUser } from '@/lib/auth'
import { getMyBaskets } from '@/lib/baskets'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Project baskets',
  robots: { index: false },
}

export default async function BasketsPage() {
  const user = await getCurrentUser()
  const isTrade = user?.role === 'trade' || user?.role === 'staff'
  const baskets = isTrade ? await getMyBaskets(2) : []

  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Project baskets</h1>

          {!isTrade ? (
            <p className="mt-6 text-slate">
              Trade accounts can save products to project baskets.{' '}
              <Link href="/account/login" className="font-medium text-brand-blue hover:underline">
                Sign in
              </Link>
              .
            </p>
          ) : baskets.length === 0 ? (
            <p className="mt-6 text-slate">
              No saved products yet. Browse the{' '}
              <Link href="/ranges" className="font-medium text-brand-blue hover:underline">
                ranges
              </Link>{' '}
              and use “Add to project basket”.
            </p>
          ) : (
            <div className="mt-8 space-y-8">
              {baskets.map((basket) => (
                <section key={basket.id} className="rounded border border-border bg-white">
                  <h2 className="border-b border-border p-4 font-display font-semibold text-ink">
                    {basket.title ?? 'My project'}
                  </h2>
                  {basket.items && basket.items.length > 0 ? (
                    <ul className="divide-y divide-border">
                      {basket.items.map((item, i) => {
                        const p = typeof item.product === 'object' ? item.product : null
                        return (
                          <li key={i} className="flex items-center justify-between p-4">
                            <div>
                              {p?.slug ? (
                                <Link
                                  href={`/product/${p.slug}`}
                                  className="font-medium text-ink hover:text-brand-blue"
                                >
                                  {p.name}
                                </Link>
                              ) : (
                                <span className="text-ink">Product</span>
                              )}
                              {p?.sizeMm ? (
                                <span className="tabular ml-2 text-sm text-slate">
                                  {p.sizeMm} mm
                                </span>
                              ) : null}
                            </div>
                            {p?.id ? (
                              <BasketRemoveButton basketId={basket.id} productId={p.id} />
                            ) : null}
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="p-4 text-sm text-slate">This basket is empty.</p>
                  )}
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
