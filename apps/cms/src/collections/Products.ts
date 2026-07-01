import type { CollectionConfig } from 'payload'
import { options } from '@mccartney/db'
import { anyone, isStaff } from '../access'
import { syncProductToSearch, removeProductFromSearch } from '../hooks/search-sync'

/**
 * A product = a single colour/style within a range (e.g. "Bloka Grey"). The sizes that colour is
 * available in live in the `sizes` array — one product card per colour keeps the catalogue short,
 * and the size variants are sub-rows. Size-level spec (tiles per box, m²/box, thickness) belongs on
 * each size; colour-level spec (finish, effect, application…) stays on the product.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    group: 'Catalogue',
    defaultColumns: ['name', 'range', 'colour', 'colourGroup', 'finish'],
  },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    afterChange: [syncProductToSearch],
    afterDelete: [removeProductFromSearch],
  },
  fields: [
    { name: 'range', type: 'relationship', relationTo: 'ranges', required: true },
    { name: 'name', type: 'text', required: true, admin: { description: 'Display name, e.g. "Bloka Grey".' } },
    { name: 'colour', type: 'text', admin: { description: 'Short colour/style label shown on the card, e.g. "Grey".' } },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'application', type: 'select', options: options('application') },
    { name: 'colourGroup', type: 'select', options: options('colourGroup') },
    { name: 'finish', type: 'select', options: options('finish') },
    { name: 'effect', type: 'select', options: options('effect') },
    { name: 'material', type: 'select', defaultValue: 'porcelain', options: options('material') },
    { name: 'edge', type: 'select', options: options('edge') },
    { name: 'format', type: 'select', options: options('format') },
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'descriptiveSymbols', type: 'text', hasMany: true },
    {
      name: 'sizes',
      type: 'array',
      label: 'Sizes',
      admin: { description: 'Each size this colour is available in (smallest first is enforced in the UI).' },
      fields: [
        { name: 'sizeMm', type: 'text', required: true, admin: { description: 'e.g. 600x600' } },
        { name: 'sizeBand', type: 'select', options: options('sizeBand') },
        { name: 'thicknessMm', type: 'number' },
        { name: 'tilesPerBox', type: 'number' },
        { name: 'm2PerBox', type: 'number' },
        { name: 'tilesPerM2', type: 'number' },
      ],
    },
  ],
}
