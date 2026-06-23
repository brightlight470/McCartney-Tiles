import type { CollectionConfig } from 'payload'
import { anyone, isStaff } from '../access'

/** Transcribed customer testimonials (image-screenshots → real text + Review schema). */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: { useAsTitle: 'author', group: 'Content' },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: 'author', type: 'text', required: true },
    { name: 'rating', type: 'number', min: 1, max: 5 },
    { name: 'text', type: 'textarea', required: true },
    { name: 'source', type: 'text', admin: { description: 'e.g. Google, Facebook' } },
    { name: 'date', type: 'date' },
  ],
}
