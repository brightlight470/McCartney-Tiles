import type { CollectionConfig } from 'payload'
import { options } from '@mccartney/db'
import { anyone, isStaff } from '../access'
import { syncProductToSearch, removeProductFromSearch } from '../hooks/search-sync'

/** A product/variant — a specific size/finish/colour within a range. */
export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    group: 'Catalogue',
    defaultColumns: ['name', 'sizeMm', 'colourGroup', 'finish'],
  },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    afterChange: [syncProductToSearch],
    afterDelete: [removeProductFromSearch],
  },
  fields: [
    { name: 'range', type: 'relationship', relationTo: 'ranges', required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'sizeMm', type: 'text', admin: { description: 'e.g. 600x600' } },
    { name: 'sizeBand', type: 'select', options: options('sizeBand') },
    { name: 'application', type: 'select', options: options('application') },
    { name: 'colourGroup', type: 'select', options: options('colourGroup') },
    { name: 'finish', type: 'select', options: options('finish') },
    { name: 'effect', type: 'select', options: options('effect') },
    { name: 'material', type: 'select', defaultValue: 'porcelain', options: options('material') },
    { name: 'edge', type: 'select', options: options('edge') },
    { name: 'format', type: 'select', options: options('format') },
    { name: 'thicknessMm', type: 'number' },
    { name: 'tilesPerBox', type: 'number' },
    { name: 'm2PerBox', type: 'number' },
    { name: 'tilesPerM2', type: 'number' },
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'descriptiveSymbols', type: 'text', hasMany: true },
  ],
}
