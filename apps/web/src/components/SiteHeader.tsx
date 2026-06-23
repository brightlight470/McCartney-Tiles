import Link from 'next/link'
import { Container, Logo } from '@mccartney/ui'

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
  )
}
