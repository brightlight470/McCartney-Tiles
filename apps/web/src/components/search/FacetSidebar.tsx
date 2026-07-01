import Link from 'next/link'
import type { ReactNode } from 'react'
import { FACETS, isActive, toggleHref, type RawParams } from '@/lib/search-facets'

interface Props {
  sp: RawParams
  distribution: Record<string, Record<string, number>>
}

function Option({
  href,
  label,
  count,
  active,
}: {
  href: string
  label: string
  count?: number
  active: boolean
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? 'true' : undefined}
        className="flex items-center justify-between gap-2 rounded-sm px-2 py-1 text-sm hover:bg-mist focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
      >
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`inline-block h-3.5 w-3.5 rounded-sm border ${
              active ? 'border-brand-blue bg-brand-blue' : 'border-border bg-white'
            }`}
          />
          <span className={active ? 'font-medium text-ink' : 'text-slate'}>{label}</span>
        </span>
        {typeof count === 'number' ? (
          <span className="tabular text-xs text-slate">{count}</span>
        ) : null}
      </Link>
    </li>
  )
}

export function FacetSidebar({ sp, distribution }: Props) {
  const hasDistribution = Object.keys(distribution).length > 0
  return (
    <aside aria-label="Filters" className="space-y-6">
      <div>
        <h2 className="font-display text-sm font-semibold tracking-wide text-ink uppercase">
          Availability
        </h2>
        <ul className="mt-2">
          <Option
            href={toggleHref(sp, 'stock', 'in')}
            label="In stock"
            active={isActive(sp, 'stock', 'in')}
          />
        </ul>
      </div>

      {FACETS.map((facet) => {
        const dist = distribution[facet.attr] ?? {}
        const visible = facet.options.filter((opt) => {
          if (!hasDistribution) return true
          return isActive(sp, facet.param, opt.value) || (dist[opt.value] ?? 0) > 0
        })
        if (visible.length === 0) return null
        return (
          <div key={facet.param}>
            <h2 className="font-display text-sm font-semibold tracking-wide text-ink uppercase">
              {facet.label}
            </h2>
            <ul className="mt-2 space-y-0.5">
              {visible.map((opt) => (
                <Option
                  key={opt.value}
                  href={toggleHref(sp, facet.param, opt.value)}
                  label={opt.label}
                  count={hasDistribution ? (dist[opt.value] ?? 0) : undefined}
                  active={isActive(sp, facet.param, opt.value)}
                />
              ))}
            </ul>
          </div>
        )
      })}
    </aside>
  )
}
