import Image from 'next/image'
import Link from 'next/link'
import { StockBadge } from '@mccartney/ui'
import { SuitabilityOverlay } from '@/components/SuitabilityOverlay'
import { SizeTiles } from '@/components/SizeTiles'
import type { StockStatus } from '@mccartney/ui'
import type { ProductDocument } from '@mccartney/search'

const VALID: ReadonlySet<string> = new Set<StockStatus>([
  'in_stock',
  'out_of_stock',
  'on_order',
  'special_offer',
  'clearance',
])

const cap = (s?: string | null): string | null =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : null

export function ProductCard({ product }: { product: ProductDocument }) {
  const status =
    product.stockStatus && VALID.has(product.stockStatus)
      ? (product.stockStatus as StockStatus)
      : null
  const sub = [cap(product.effect), cap(product.finish)].filter(Boolean).join(' · ')
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded border border-border bg-white transition-colors hover:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="relative aspect-square bg-mist">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt=""
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : null}
        <SuitabilityOverlay application={product.application} size={40} />
        {product.sizesMm.length ? <SizeTiles sizes={product.sizesMm} variant="card" /> : null}
      </div>
      <div className="p-4">
        <p className="font-display font-semibold text-ink">{product.name}</p>
        {sub ? <p className="mt-1 text-sm text-slate">{sub}</p> : null}
        {status ? (
          <div className="mt-3">
            <StockBadge status={status} />
          </div>
        ) : null}
      </div>
    </Link>
  )
}
