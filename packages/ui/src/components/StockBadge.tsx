import type { StockStatus } from '../tokens'
import { stockStatusColor } from '../tokens'

const LABELS: Record<StockStatus, string> = {
  in_stock: 'In stock',
  out_of_stock: 'Out of stock',
  on_order: 'On order',
  special_offer: 'Special offer',
  clearance: 'Clearance',
}

/**
 * Availability chip. Public-safe — communicates stock state, never price.
 * Colour comes from the locked status tokens.
 */
export function StockBadge({ status }: { status: StockStatus }) {
  const color = stockStatusColor[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium"
      style={{ color, backgroundColor: `${color}1a` }}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {LABELS[status]}
    </span>
  )
}
