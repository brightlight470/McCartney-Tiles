import Link from 'next/link'
import { Container, AnimatedLogo } from '@mccartney/ui'

export const NAV = [
  { label: 'Ranges', href: '/ranges' },
  { label: 'Showrooms', href: '/showrooms' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-white">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/">
          <AnimatedLogo className="h-9 w-auto" title="McCartney Tiles home" />
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <nav aria-label="Primary" className="flex gap-8">
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
          <Link href="/account" className="text-sm font-medium text-brand-blue hover:text-ink">
            Account
          </Link>
        </div>
      </Container>
    </header>
  )
}
