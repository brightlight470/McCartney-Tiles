import Link from 'next/link'
import { pageHref, type RawParams } from '@/lib/search-facets'

interface Props {
  sp: RawParams
  page: number
  totalPages: number
}

export function Pagination({ sp, page, totalPages }: Props) {
  if (totalPages <= 1) return null
  const prev = page > 1 ? pageHref(sp, page - 1) : null
  const next = page < totalPages ? pageHref(sp, page + 1) : null
  const linkClass =
    'inline-flex h-10 items-center justify-center rounded border border-border px-4 text-sm font-medium hover:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none'
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between">
      {prev ? (
        <Link href={prev} className={linkClass} rel="prev">
          Previous
        </Link>
      ) : (
        <span className={`${linkClass} cursor-not-allowed opacity-40`} aria-disabled="true">
          Previous
        </span>
      )}
      <span className="tabular text-sm text-slate">
        Page {page} of {totalPages}
      </span>
      {next ? (
        <Link href={next} className={linkClass} rel="next">
          Next
        </Link>
      ) : (
        <span className={`${linkClass} cursor-not-allowed opacity-40`} aria-disabled="true">
          Next
        </span>
      )}
    </nav>
  )
}
