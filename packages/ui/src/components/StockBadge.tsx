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
 * Darker text shades for the label so it clears WCAG AA (≥4.5:1) on the 10% status tint.
 * The dot keeps the brand status colour; only the text is darkened.
 */
const TEXT: Record<StockStatus, string> = {
  in_stock: '#15663d',
  out_of_stock: '#992f2f',
  on_order: '#8a5a13',
  special_offer: '#14215c',
  clearance: '#8a5a13',
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
      style={{ color: TEXT[status], backgroundColor: `${color}1a` }}
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
