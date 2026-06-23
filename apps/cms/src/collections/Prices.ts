import type { CollectionConfig } from 'payload'
import { fieldStaffOnly, fieldTradeOrStaff, isStaff, isTradeOrStaff } from '../access'

/**
 * Price — SECURITY-CRITICAL. Collection read is gated to trade/staff so prices never
 * reach a public/unauthenticated request. Cost price is staff-only at field level.
 * Enforced server-side here AND must be re-checked on every web data path (Handover §9).
 */
export const Prices: CollectionConfig = {
  slug: 'prices',
  admin: { useAsTitle: 'id', group: 'Pricing' },
  access: {
    read: isTradeOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      unique: true,
      index: true,
    },
    { name: 'retailPerM2', type: 'number', access: { read: fieldTradeOrStaff } },
    { name: 'tradePerM2', type: 'number', access: { read: fieldTradeOrStaff } },
    {
      name: 'costPerM2',
      type: 'number',
      access: { read: fieldStaffOnly, update: fieldStaffOnly },
      admin: { description: 'Staff-only. Never exposed to trade or public.' },
    },
    { name: 'currency', type: 'text', defaultValue: 'GBP' },
    { name: 'effectiveFrom', type: 'date', defaultValue: () => new Date().toISOString() },
  ],
}
