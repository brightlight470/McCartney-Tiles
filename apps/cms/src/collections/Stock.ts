import type { CollectionConfig } from 'payload'
import { stockStatusOptions } from '@mccartney/db'
import { anyone, isStaff } from '../access'

/** Batch-level inventory (seeded from the stock sheet). */
export const Stock: CollectionConfig = {
  slug: 'stock',
  admin: { useAsTitle: 'batch', group: 'Catalogue', defaultColumns: ['product', 'status', 'm2'] },
  // Availability state is public; quantities are public too (no price here).
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: 'product', type: 'relationship', relationTo: 'products', required: true, index: true },
    { name: 'batch', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'in_stock',
      options: stockStatusOptions,
    },
    { name: 'statusRaw', type: 'text', admin: { description: 'Original sheet label (audit).' } },
    { name: 'boxes', type: 'number' },
    { name: 'looseTiles', type: 'number' },
    { name: 'qtyTiles', type: 'number' },
    { name: 'm2', type: 'number' },
    {
      name: 'location',
      type: 'select',
      options: [
        { label: 'Showroom', value: 'showroom' },
        { label: 'Warehouse', value: 'warehouse' },
      ],
    },
  ],
}
