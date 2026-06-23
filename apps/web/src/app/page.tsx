import Link from 'next/link'
import { Container, Logo } from '@mccartney/ui'

const NAV = [
  { label: 'Ranges', href: '/ranges' },
  { label: 'Showrooms', href: '/showrooms' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function HomePage() {
  return (
    <>
      <header className="border-b border-border">
        <Container className="flex h-20 items-center justify-between">
          <Link href="/" aria-label="McCartney Tiles home">
            <Logo className="h-9 w-auto" />
          </Link>
          <nav aria-label="Primary" className="hidden gap-8 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ink hover:text-brand-blue"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </Container>
      </header>

      <main>
        <section className="py-24 sm:py-32">
          <Container className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold tracking-wide text-slate uppercase">
              Randalstown · serving all of Ireland
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Tiles, specified to the millimetre.
            </h1>
            <p className="mt-6 text-lg text-slate">
              Porcelain and ceramic ranges held in stock and supplied across Ireland. Search every
              range by size, finish, effect, colour and availability.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/ranges"
                className="inline-flex h-12 items-center justify-center rounded bg-brand-blue px-6 font-display font-semibold text-white transition-colors duration-150 hover:bg-ink focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Browse the ranges
              </Link>
              <Link
                href="/showrooms"
                className="inline-flex h-12 items-center justify-center rounded border border-brand-blue px-6 font-display font-semibold text-brand-blue transition-colors duration-150 hover:bg-mist focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Book a showroom visit
              </Link>
            </div>
          </Container>
        </section>
      </main>

      <footer className="border-t border-border py-10">
        <Container className="text-sm text-slate">
          <p>&copy; {new Date().getFullYear()} McCartney Tiles. Randalstown, Co. Antrim.</p>
        </Container>
      </footer>
    </>
  )
}
