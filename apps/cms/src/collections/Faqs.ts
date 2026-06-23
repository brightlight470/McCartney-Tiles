import type { CollectionConfig } from 'payload'
import { anyone, isStaff } from '../access'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  admin: { useAsTitle: 'question', group: 'Content' },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'textarea', required: true },
    { name: 'category', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
}
