import type { Access, CollectionConfig } from 'payload'
import { isTradeOrStaff } from '../access'

type U = { id?: string | number; role?: string } | undefined | null

/** Owner sees/edits their own baskets; staff see all; public none. */
const ownerOrStaff: Access = ({ req }) => {
  const u = req.user as U
  if (!u) return false
  if (u.role === 'staff') return true
  return { account: { equals: u.id } }
}

/** Trade moodboards / project baskets (Handover §9). Account-owned. */
export const Baskets: CollectionConfig = {
  slug: 'baskets',
  admin: { useAsTitle: 'title', group: 'Accounts', defaultColumns: ['title', 'account'] },
  access: {
    read: ownerOrStaff,
    create: isTradeOrStaff,
    update: ownerOrStaff,
    delete: ownerOrStaff,
  },
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        // Bind ownership on create for non-staff so users cannot create baskets for others.
        const u = req.user as U
        if (operation === 'create' && u && u.role !== 'staff' && u.id) {
          return { ...data, account: u.id }
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'My project' },
    { name: 'account', type: 'relationship', relationTo: 'accounts', required: true },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products', required: true },
        { name: 'note', type: 'text' },
      ],
    },
  ],
}
