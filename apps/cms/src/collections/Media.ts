import type { CollectionConfig } from 'payload'
import { anyone, isStaff } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, position: 'centre' },
      { name: 'card', width: 768, height: 768, position: 'centre' },
      { name: 'hero', width: 1920, position: 'centre' },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true, label: 'Alt text' },
    { name: 'credit', type: 'text' },
  ],
}
