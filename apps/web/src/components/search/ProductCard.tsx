import Link from 'next/link'
import { StockBadge } from '@mccartney/ui'
import type { StockStatus } from '@mccartney/ui'
import type { ProductDocument } from '@mccartney/search'

const VALID: ReadonlySet<string> = new Set<StockStatus>([
  'in_stock',
  'out_of_stock',
  'on_order',
  'special_offer',
  'clearance',
])

export function ProductCard({ product }: { product: ProductDocument }) {
  const status =
    product.stockStatus && VALID.has(product.stockStatus)
      ? (product.stockStatus as StockStatus)
      : null
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded border border-border bg-white transition-colors hover:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="aspect-square bg-mist">
        {product.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element -- migrated remote thumbnails; next/image config lands in hardening
          <img
            src={product.thumbnail}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="p-4">
        <p className="font-display font-semibold text-ink">{product.name}</p>
        {product.sizeMm ? (
          <p className="tabular mt-1 text-sm text-slate">{product.sizeMm} mm</p>
        ) : null}
        {status ? (
          <div className="mt-3">
            <StockBadge status={status} />
          </div>
        ) : null}
      </div>
    </Link>
  )
}
