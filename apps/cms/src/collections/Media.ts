import type { CollectionConfig } from 'payload'
import sharp from 'sharp'
import { anyone, isStaff } from '../access'

/**
 * Trim a near-white border, then centre-crop to a square (the product-swatch convention). Payload
 * generates the thumbnail/card/hero sizes from this cleaned master.
 */
async function cropToSquareTile(buf: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  const trimmed = sharp(buf).trim({ threshold: 12 })
  const meta = await trimmed.metadata()
  const side = Math.min(meta.width ?? 0, meta.height ?? 0) || undefined
  const data = await trimmed.resize(side, side, { fit: 'cover', position: 'centre' }).toBuffer()
  const out = await sharp(data).metadata()
  return { data, width: out.width ?? 0, height: out.height ?? 0 }
}

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
  hooks: {
    // Auto-crop on upload (#8): when the uploader ticks "Crop to tile", trim the white border and
    // square the master before Payload derives its sizes. Off for logos/hero/lifestyle imagery.
    beforeOperation: [
      async ({ operation, req }) => {
        if (operation !== 'create' && operation !== 'update') return
        const file = (req as { file?: { data: Buffer; mimetype?: string; size?: number } }).file
        const wants = (req.data as { cropToTile?: boolean } | undefined)?.cropToTile
        if (!file || !wants || !file.mimetype?.startsWith('image/')) return
        try {
          const { data, width, height } = await cropToSquareTile(file.data)
          Object.assign(file, { data, size: data.length, width, height })
        } catch (err) {
          req.payload.logger.error({ err }, 'media auto-crop failed; keeping original')
        }
      },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true, label: 'Alt text' },
    { name: 'credit', type: 'text' },
    {
      name: 'cropToTile',
      type: 'checkbox',
      defaultValue: false,
      label: 'Crop to tile',
      admin: { description: 'Trim the white border and square this image on upload (product swatches).' },
    },
  ],
}
