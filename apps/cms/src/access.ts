import type { Access, FieldAccess } from 'payload'

type WithRole = { role?: string } | undefined | null

const roleOf = (user: unknown): string | undefined => (user as WithRole)?.role

/** Public read. */
export const anyone: Access = () => true

/** Authenticated staff only. */
export const isStaff: Access = ({ req }) => roleOf(req.user) === 'staff'

/** Trade or staff (price/stock visibility). */
export const isTradeOrStaff: Access = ({ req }) => {
  const r = roleOf(req.user)
  return r === 'trade' || r === 'staff'
}

/** Field-level: staff only (e.g. cost price). */
export const fieldStaffOnly: FieldAccess = ({ req }) => roleOf(req.user) === 'staff'

/** Field-level: trade or staff (e.g. trade/retail price). */
export const fieldTradeOrStaff: FieldAccess = ({ req }) => {
  const r = roleOf(req.user)
  return r === 'trade' || r === 'staff'
}
