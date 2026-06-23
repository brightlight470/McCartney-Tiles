import type { CollectionConfig } from 'payload'
import { anyone, isStaff } from '../access'

export const Suppliers: CollectionConfig = {
  slug: 'suppliers',
  admin: { useAsTitle: 'name', group: 'Catalogue' },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'country', type: 'text' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'notes', type: 'textarea' },
    {
      name: 'ingestionHints',
      type: 'json',
      admin: { description: 'Default column → field mappings for this supplier (ingestion).' },
    },
  ],
}
