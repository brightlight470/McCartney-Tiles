import { MOCK_FILTERS } from '../_data'

/**
 * Expandable filter sections (changes #6 + #7) — each facet group collapses, so the sidebar is a
 * tidy set of headers instead of one long flowing list. Built on native <details> for keyboard +
 * screen-reader support with no client JS. Options here are visual only (mockup).
 */
export function AccordionFilters() {
  return (
    <aside aria-label="Filters" className="divide-y divide-border rounded border border-border">
      <p className="px-4 py-3 font-display text-sm font-semibold tracking-wide text-ink uppercase">
        Filter
      </p>
      {MOCK_FILTERS.map((group) => (
        <details key={group.label} open={group.open} className="group px-4 py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink">
            {group.label}
            <svg
              className="h-4 w-4 text-slate transition-transform group-open:rotate-180"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <ul className="mt-3 space-y-1.5">
            {group.options.map((opt) => (
              <li key={opt}>
                <label className="flex items-center gap-2 text-sm text-slate">
                  <span className="inline-block h-3.5 w-3.5 rounded-sm border border-border bg-white" />
                  {opt}
                </label>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </aside>
  )
}
