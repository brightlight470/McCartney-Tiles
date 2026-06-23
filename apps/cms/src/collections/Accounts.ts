import type { CollectionConfig } from 'payload'
import { isStaff } from '../access'

/** Auth-enabled users with role-based gating (public/trade/staff). */
export const Accounts: CollectionConfig = {
  slug: 'accounts',
  auth: true,
  admin: { useAsTitle: 'email', group: 'Accounts' },
  access: {
    read: isStaff,
    create: isStaff,
    update: isStaff,
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
