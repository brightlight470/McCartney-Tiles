/**
 * Hardcoded sample catalogue for the v2.0.0 architecture mockups (/preview/*). No CMS, no search
 * — these pages exist only so Stephen + the client can approve the Range / Products / Product
 * structure before it is wired to live data and the backend is reworked (change #8).
 */

export interface MockProduct {
  slug: string
  colour: string
  range: string
  rangeSlug: string
  image: string
  application: 'wall-floor' | 'floor' | 'wall' | 'outdoor'
  sizes: string[]
  finish: string
  effect: string
  colourGroup: string
}

export interface MockRange {
  slug: string
  name: string
  supplier: string
  blurb: string // ~2 lines
  effect: string
  feature: string[] // feature image srcs
  products: MockProduct[]
}

const T = '/preview/tiles'

export const PRODUCTS: MockProduct[] = [
  { slug: 'bloka-grey', colour: 'Grey', range: 'Bloka', rangeSlug: 'bloka', image: `${T}/bloka-grey.jpg`, application: 'wall-floor', sizes: ['600×600', '800×800', '600×1200'], finish: 'Matt', effect: 'Concrete', colourGroup: 'Grey' },
  { slug: 'bloka-beige', colour: 'Beige', range: 'Bloka', rangeSlug: 'bloka', image: `${T}/bloka-beige.jpg`, application: 'wall-floor', sizes: ['600×600', '800×800'], finish: 'Matt', effect: 'Concrete', colourGroup: 'Beige' },
  { slug: 'bloka-white', colour: 'White', range: 'Bloka', rangeSlug: 'bloka', image: `${T}/bloka-white.jpg`, application: 'wall-floor', sizes: ['600×600', '800×800', '600×1200'], finish: 'Matt', effect: 'Concrete', colourGroup: 'White' },
  { slug: 'medella-grigio', colour: 'Grigio', range: 'Medella', rangeSlug: 'medella', image: `${T}/medella-grigio.jpg`, application: 'floor', sizes: ['600×600', '300×600'], finish: 'Matt', effect: 'Stone', colourGroup: 'Grey' },
  { slug: 'medella-beige', colour: 'Beige', range: 'Medella', rangeSlug: 'medella', image: `${T}/medella-beige.jpg`, application: 'wall-floor', sizes: ['600×600'], finish: 'Matt', effect: 'Stone', colourGroup: 'Beige' },
  { slug: 'medella-blanco', colour: 'Blanco', range: 'Medella', rangeSlug: 'medella', image: `${T}/medella-blanco.jpg`, application: 'wall', sizes: ['300×600'], finish: 'Gloss', effect: 'Stone', colourGroup: 'White' },
  { slug: 'lantica-portes', colour: 'Portes', range: 'Lantica', rangeSlug: 'lantica', image: `${T}/lantica-portes.jpg`, application: 'outdoor', sizes: ['600×1200', '900×900'], finish: 'Textured', effect: 'Stone', colourGroup: 'Beige' },
]

export const RANGE_BLOKA: MockRange = {
  slug: 'bloka',
  name: 'Bloka',
  supplier: 'Grespania',
  blurb:
    'A through-body concrete-effect porcelain for walls and floors. Rectified edges, R10 slip rating, held in stock across three sizes and three colours.',
  effect: 'Concrete',
  feature: [`${T}/bloka-grey.jpg`, `${T}/bloka-beige.jpg`, `${T}/bloka-white.jpg`],
  products: PRODUCTS.filter((p) => p.rangeSlug === 'bloka'),
}

// Filter groups for the accordion mock (visual only).
export const MOCK_FILTERS: { label: string; options: string[]; open?: boolean }[] = [
  { label: 'Colour', options: ['White', 'Beige', 'Grey', 'Black', 'Terracotta'], open: true },
  { label: 'Effect', options: ['Concrete', 'Stone', 'Marble', 'Wood', 'Terrazzo'], open: true },
  { label: 'Finish', options: ['Matt', 'Gloss', 'Textured', 'Polished'] },
  { label: 'Application', options: ['Wall', 'Floor', 'Exterior'] },
  { label: 'Size', options: ['Small format', 'Medium format', 'Large format', 'X-Large format'] },
  { label: 'Material', options: ['Porcelain', 'Ceramic'] },
]
