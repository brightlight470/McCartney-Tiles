import Link from 'next/link'
import { Container, AnimatedLogo } from '@mccartney/ui'

export interface NavItem {
  label: string
  href: string
  external?: boolean
}

// Roomvo room-visualiser link. Roomvo's embedded widget is bound to the live domain, so a menu
// link pointing at a Roomvo-hosted URL is the way to reach it from the preview / any domain.
// Set NEXT_PUBLIC_ROOMVO_URL to that URL to surface the link.
const ROOMVO_URL = process.env.NEXT_PUBLIC_ROOMVO_URL

export const NAV: NavItem[] = [
  { label: 'Ranges', href: '/ranges' },
  { label: 'Showrooms', href: '/showrooms' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  ...(ROOMVO_URL ? [{ label: 'Room visualiser', href: ROOMVO_URL, external: true }] : []),
]

const NAV_LINK = 'text-sm font-medium text-ink hover:text-brand-blue'

export function NavLink({ item, className }: { item: NavItem; className?: string }) {
  const cls = className ?? NAV_LINK
  return item.external ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {item.label}
    </a>
  ) : (
    <Link href={item.href} className={cls}>
      {item.label}
    </Link>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/">
          <AnimatedLogo className="h-9 w-auto" title="McCartney Tiles home" />
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <nav aria-label="Primary" className="flex gap-8">
            {NAV.map((item) => (
              <NavLink key={item.href} item={item} />
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
