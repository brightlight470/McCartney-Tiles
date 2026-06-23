import type { CollectionConfig } from 'payload'
import { anyone, isStaff } from '../access'

export const Showrooms: CollectionConfig = {
  slug: 'showrooms',
  admin: { useAsTitle: 'name', group: 'Content' },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'address', type: 'textarea', required: true },
    { name: 'postcode', type: 'text' },
    { name: 'hours', type: 'textarea' },
    { name: 'location', type: 'point', label: 'Geo (lng, lat)' },
  ],
}
