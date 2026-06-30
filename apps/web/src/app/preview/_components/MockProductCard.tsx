import Image from 'next/image'
import Link from 'next/link'
import { SuitabilityOverlay } from '@/components/SuitabilityOverlay'
import { SizeStack } from './SizeStack'
import type { MockProduct } from '../_data'

/**
 * Products-page card: one card per colour (not per size). The photo carries the suitability icon
 * as an overlay layer (change #3) and the available sizes as a black-outline stack on the right
 * (change #4). Clicking through goes to the individual product page.
 */
export function MockProductCard({ product }: { product: MockProduct }) {
  return (
    <Link
      href="/preview/product"
      className="group block overflow-hidden rounded border border-border bg-white transition-colors hover:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="relative aspect-square bg-mist">
        <Image
          src={product.image}
          alt={`${product.range} ${product.colour}`}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover"
        />
        <SuitabilityOverlay application={product.application} size={40} />
        <SizeStack sizes={product.sizes} variant="card" />
      </div>
      <div className="p-4">
        <p className="font-display font-semibold text-ink">
          {product.range} — {product.colour}
        </p>
        <p className="mt-1 text-sm text-slate">
          {product.effect} · {product.finish}
        </p>
      </div>
    </Link>
  )
}
