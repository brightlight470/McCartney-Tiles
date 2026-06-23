import type { CollectionConfig } from 'payload'
import { anyone, isStaff } from '../access'

/** Commercial developments + customer projects / case studies. */
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: { useAsTitle: 'title', group: 'Content' },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'location', type: 'text' },
    { name: 'description', type: 'richText' },
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
  ],
}
