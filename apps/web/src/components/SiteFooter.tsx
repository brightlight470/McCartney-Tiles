import { Container } from '@mccartney/ui'
import { NAV, NavLink } from './SiteHeader'
import { RegionSwitcher } from './RegionSwitcher'
import { getRegion } from '@/lib/region.server'
import { REGION_LABELS } from '@/lib/region'

export async function SiteFooter() {
  const { region, capabilities } = await getRegion()
  const capabilityNote = capabilities.canSeeStore
    ? `Showing ${REGION_LABELS[region]} — showroom and live stock.`
    : 'Showing rest of world — showroom and enquiry. Online stock is Ireland and Northern Ireland only.'
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
            <NavLink key={item.href} item={item} className="text-slate hover:text-brand-blue" />
          ))}
        </nav>
      </Container>
      <Container className="mt-8 flex flex-col gap-3 border-t border-border pt-6 text-xs text-slate sm:flex-row sm:items-center sm:justify-between">
        <p>{capabilityNote}</p>
        <RegionSwitcher current={region} />
      </Container>
      <Container className="mt-6 text-xs text-slate">
        <p>&copy; {new Date().getFullYear()} McCartney Tiles. Randalstown, Co. Antrim.</p>
      </Container>
    </footer>
  )
}
