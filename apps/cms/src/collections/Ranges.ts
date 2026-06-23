import type { CollectionConfig } from 'payload'
import { options } from '@mccartney/db'
import { isStaff } from '../access'

/** A tile family (e.g. "Balti"). Publish gating via showOnWebsite. */
export const Ranges: CollectionConfig = {
  slug: 'ranges',
  admin: {
    useAsTitle: 'name',
    group: 'Catalogue',
    defaultColumns: ['name', 'status', 'showOnWebsite'],
  },
  access: {
    read: ({ req }) => {
      // Public sees only published ranges; staff see all.
      if ((req.user as { role?: string } | undefined)?.role) return true
      return { showOnWebsite: { equals: true } }
    },
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'supplier', type: 'relationship', relationTo: 'suppliers' },
    { name: 'description', type: 'textarea' },
    { name: 'story', type: 'richText' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'effect', type: 'select', hasMany: true, options: options('effect') },
    { name: 'design', type: 'select', hasMany: true, options: options('design') },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Discontinued', value: 'discontinued' },
      ],
    },
    {
      name: 'showOnWebsite',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Publish toggle — show this range on the public site + search.' },
    },
    {
      name: 'pushToStore',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Phase 2 — push to e-commerce store.' },
    },
    {
      type: 'group',
      name: 'seo',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
}
