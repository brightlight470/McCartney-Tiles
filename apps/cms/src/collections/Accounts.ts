import type { Access, CollectionConfig } from 'payload'
import { isStaff } from '../access'

type U = { id?: string | number; role?: string } | undefined | null

// Self or staff — lets a signed-in user read/update their own account (so /me works),
// while staff manage all and the public sees none.
const selfOrStaff: Access = ({ req }) => {
  const u = req.user as U
  if (!u) return false
  if (u.role === 'staff') return true
  return { id: { equals: u.id } }
}

/** Auth-enabled users with role-based gating (public/trade/staff). */
export const Accounts: CollectionConfig = {
  slug: 'accounts',
  auth: true,
  admin: { useAsTitle: 'email', group: 'Accounts' },
  access: {
    read: selfOrStaff,
    create: isStaff,
    update: selfOrStaff,
    delete: isStaff,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'public',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Trade', value: 'trade' },
        { label: 'Staff', value: 'staff' },
      ],
    },
    { name: 'companyName', type: 'text' },
    {
      name: 'tradeStatus',
      type: 'select',
      options: [
        { label: 'Applied', value: 'applied' },
        { label: 'Approved', value: 'approved' },
      ],
    },
  ],
}
