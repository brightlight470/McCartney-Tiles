import Link from 'next/link'
import { Container } from '@mccartney/ui'
import { NAV } from './SiteHeader'

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-white py-12">
      <Container className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm text-sm text-slate">
          <p className="font-display text-base font-semibold text-ink">McCartney Tiles</p>
          <p className="mt-2">
            Tile supply across Ireland from our Randalstown showroom. 45 years in tile.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-slate hover:text-brand-blue">
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
      <Container className="mt-8 text-xs text-slate">
        <p>&copy; {new Date().getFullYear()} McCartney Tiles. Randalstown, Co. Antrim.</p>
      </Container>
    </footer>
  )
}
