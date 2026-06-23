import Link from 'next/link'
import { activeFilters, clearHref, toggleHref, type RawParams } from '@/lib/search-facets'

export function ActiveFilters({ sp }: { sp: RawParams }) {
  const active = activeFilters(sp)
  if (active.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      {active.map((f) => (
        <Link
          key={`${f.param}:${f.value}`}
          href={toggleHref(sp, f.param, f.value)}
          className="inline-flex items-center gap-1.5 rounded-sm bg-mist px-2 py-1 text-xs font-medium text-ink hover:bg-border focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
        >
          {f.label}
          <span aria-hidden="true">×</span>
          <span className="sr-only">Remove filter</span>
        </Link>
      ))}
      <Link href={clearHref()} className="text-xs font-medium text-brand-blue hover:underline">
        Clear all
      </Link>
    </div>
  )
}
