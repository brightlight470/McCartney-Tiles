'use client'

import { useEffect, useState, type ReactNode } from 'react'

/**
 * Responsive wrapper for the facet sidebar. On desktop the filters render inline; on mobile they
 * collapse behind a "Filters" button that opens a slide-over, so the product grid isn't pushed off
 * screen. Facet links are GET navigations, so selecting one reloads the page and closes the drawer.
 */
export function FilterDrawer({ activeCount, children }: { activeCount: number; children: ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded border border-border px-4 text-sm font-medium text-ink hover:border-brand-blue lg:hidden"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round" />
        </svg>
        Filters{activeCount ? ` (${activeCount})` : ''}
      </button>

      {/* Desktop: inline sidebar. */}
      <div className="hidden lg:block">{children}</div>

      {/* Mobile: slide-over. */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-display font-semibold text-ink">Filters</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="rounded-sm p-1 text-slate hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
            <div className="border-t border-border p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-full items-center justify-center rounded bg-brand-blue px-4 font-display font-semibold text-white hover:bg-ink"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
