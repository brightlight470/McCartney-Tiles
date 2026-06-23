/**
 * McCartney Tiles brand tokens — locked from logo 2026-06-23.
 * Hex values are the single source of truth and mirror styles/tokens.css.
 */
export const brand = {
  blue: '#23349d',
  yellow: '#fae351',
  ink: '#14215c',
  slate: '#6b7280',
  mist: '#e7eaf1',
  porcelain: '#f6f7f9',
  white: '#ffffff',
  border: '#dde2ec',
} as const

export const radius = {
  sm: '8px',
  default: '14px',
} as const

export const font = {
  display: "'Trebuchet MS', 'Segoe UI', Arial, sans-serif",
  body: "'Segoe UI', Arial, sans-serif",
} as const

/** Stock status → display colour (matches --status-* CSS vars / taxonomy slugs). */
export const stockStatusColor = {
  in_stock: '#1e7f4f',
  out_of_stock: '#b23b3b',
  on_order: '#b7791f',
  special_offer: '#23349d',
  clearance: '#b7791f',
} as const

export type StockStatus = keyof typeof stockStatusColor
