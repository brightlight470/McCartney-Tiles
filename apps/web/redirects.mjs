/**
 * 301 redirect map: legacy WordPress URLs → new equivalents (Handover §11).
 * Category pages point into pre-filtered faceted search; info pages to content pages.
 * Sources are written without a trailing slash (Next normalises trailing slashes).
 */

// Legacy facet category slug → faceted-search query.
const FACET_REDIRECTS = {
  // Effects
  'wood-effect-ranges': 'effect=wood',
  'stone-effect-ranges': 'effect=stone',
  'marble-effect-ranges': 'effect=marble',
  'concrete-ranges': 'effect=concrete',
  'slate-effect-ranges': 'effect=slate',
  'metallic-effect-ranges': 'effect=metallic',
  'patterned-textured-ranges': 'effect=patterned',
  'topcer-victorian-tiles': 'effect=victorian',
  // Colours
  'black-nero-ebano': 'colour=black',
  'charcoal-antracite': 'colour=charcoal',
  'grigio-gris-grey': 'colour=grey',
  'blanco-white-perla': 'colour=white',
  'marfil-cream-light-beige': 'colour=cream',
  'caramel-tan-dark-beige': 'colour=beige',
  'walnut-taupe-brown': 'colour=brown',
  'pink-rose': 'colour=pink',
  'red-cherry-wood-terracotta': 'colour=red',
  'orange-coral': 'colour=orange',
  'golden-oak-yellow': 'colour=yellow',
  'green-mint-sage': 'colour=green',
  'teal-turquoise': 'colour=teal',
  'light-blue': 'colour=light-blue',
  'blue-navy': 'colour=blue',
  'plum-mauve-purple': 'colour=purple',
  'multi-coloured': 'colour=multi',
  'copper-tiles': 'colour=copper',
  'golden-tiles': 'colour=gold',
  'Silver-Tiles': 'colour=silver',
  'iron-steel-other-metallic-tiles': 'colour=iron',
  'oxidised-metallic-tiles': 'colour=oxidised',
  // Finishes
  'natural-finish-tiles': 'finish=natural',
  'lappato-finish-tiles': 'finish=lappato',
  'polished-gloss-finish-tiles': 'finish=gloss',
  'anti-slip-finish-tiles': 'finish=anti-slip',
  // Edges
  'pressed-edged-tiles': 'edge=pressed',
  'rectified-edged-tiles': 'edge=rectified',
  'chiselled-edged-tiles': 'edge=chiselled',
  // Formats
  'hexagonal-tiles': 'format=hexagonal',
  'brick-effect-tiles': 'format=brick-effect',
  'brick-slips': 'format=brick-slips',
  'pre-boxed-modular-porcelain-tiles': 'format=pre-boxed-modular',
  miscellaneous: 'format=miscellaneous',
  // Uses
  'porcelain-tiles': 'material=porcelain',
  'wall-tiles': 'application=wall',
  'mosaic-pieces': 'application=mosaic',
  'special-pieces': 'application=special-pieces',
  'outdoor-porcelain': 'application=outdoor',
}

// Legacy slugs that map to the unfiltered catalogue search.
const TO_RANGES = [
  'all-ranges',
  'new-ranges',
  'clearance-tiles',
  'bathroom-clearance-items',
  'tile-viewer',
  'kitchen-tiles',
  'bathroom-tiles',
  'floral-prints',
  'terrazzo-prints',
  'travertine-prints',
  'weathered-tiles',
  'vintage-tiles',
  'encaustic-tiles',
  'rustic-tiles',
  'fitting-materials-accessories',
  'phoenix-bathrooms',
  'sonas-bathrooms',
]

// Legacy size category pages (enumerated from /tile-viewer/). The faceted search has no
// exact-dimension facet (size = sizeBand), so these map to the page's category facet — relevant
// and never an empty exact-size result. Slugs are <WxH>[x20]-mm-<category>-tiles.
const SIZE_SLUGS = [
  '1000x1000-mm-porcelain-tiles',
  '100x600-mm-porcelain-tiles',
  '100x600-mm-wood-effect-tiles',
  '100x700-mm-wood-effect-tiles',
  '1200x1200x20-mm-outdoor-tiles',
  '150x1200-mm-wood-effect-tiles',
  '150x300-mm-porcelain-tiles',
  '150x800-mm-wood-effect-tiles',
  '150x900-mm-wood-effect-tiles',
  '200x1200-mm-wood-effect-tiles',
  '200x200-mm-porcelain-tiles',
  '200x200-mm-wall-tiles',
  '200x600-mm-wall-tiles',
  '200x800-mm-wood-effect-tiles',
  '240x880-mm-wood-effect-tiles',
  '250x1500-mm-wood-effect-tiles',
  '250x250-mm-porcelain-tiles',
  '250x400-mm-wall-tiles',
  '250x500-mm-wall-tiles',
  '250x750-mm-wall-tiles',
  '265x1800-mm-wood-effect-tiles',
  '300x1200-mm-porcelain-tiles',
  '300x1200-mm-wood-effect-tiles',
  '300x1200x20-mm-outdoor-tiles',
  '300x300-mm-porcelain-tiles',
  '300x600-mm-porcelain-tiles',
  '300x600-mm-wall-tiles',
  '300x600x20-mm-outdoor-tiles',
  '300x900-mm-wall-tiles',
  '310x980-mm-wall-tiles',
  '315x1000-mm-wall-tiles',
  '320x625-mm-wall-tiles',
  '333x550-mm-wall-tiles',
  '333x800-mm-wall-tiles',
  '400x1200-mm-wall-tiles',
  '450x1200-mm-wall-tiles',
  '450x450-mm-porcelain-tiles',
  '450x900-mm-porcelain-tiles',
  '450x900-mm-wall-tiles',
  '450x900x20-mm-outdoor-tiles',
  '500x500-mm-porcelain-tiles',
  '600x1200-mm-porcelain-tiles',
  '600x1200-mm-wall-tiles',
  '600x1200-mm-wood-effect-tiles',
  '600x1200x20-mm-outdoor-tiles',
  '600x600-mm-porcelain-tiles',
  '600x600-mm-wood-effect-tiles',
  '600x600x20-mm-outdoor-tiles',
  '600x900-mm-porcelain-tiles',
  '600x900x20-mm-outdoor-tiles',
  '650x1500-mm-porcelain-tiles',
  '750x1500-mm-porcelain-tiles',
  '750x750-mm-porcelain-tiles',
  '800x1600-mm-porcelain-tiles',
  '800x800-mm-porcelain-tiles',
  '800x800-mm-wood-effect-tiles',
  '800x800x20-mm-outdoor-tiles',
  '900x900-mm-porcelain-tiles',
  '900x900x20-mm-outdoor-tiles',
]

const SIZE_SUFFIX_FACET = {
  'porcelain-tiles': 'material=porcelain',
  'wall-tiles': 'application=wall',
  'wood-effect-tiles': 'effect=wood',
  'outdoor-tiles': 'application=outdoor',
}

// Legacy info pages → content pages.
const CONTENT_REDIRECTS = {
  'about-us': '/about',
  'about-our-suppliers': '/about',
  'tile-laying-patterns': '/about',
  'descriptive-symbols': '/about',
  'delivery-terms-conditions': '/about',
  'terms-and-conditions': '/about',
  'customer-testimonials': '/about',
  'commercial-area': '/projects',
  'customer-projects': '/projects',
}

/** @returns {Promise<import('next').Redirect[]>} */
export function legacyRedirects() {
  const redirects = []
  for (const [slug, query] of Object.entries(FACET_REDIRECTS)) {
    redirects.push({ source: `/${slug}`, destination: `/ranges?${query}`, permanent: true })
  }
  for (const slug of TO_RANGES) {
    redirects.push({ source: `/${slug}`, destination: '/ranges', permanent: true })
  }
  for (const slug of SIZE_SLUGS) {
    const suffix = slug.match(/-mm-(.+)$/)?.[1] ?? ''
    const facet = SIZE_SUFFIX_FACET[suffix]
    redirects.push({
      source: `/${slug}`,
      destination: facet ? `/ranges?${facet}` : '/ranges',
      permanent: true,
    })
  }
  for (const [slug, dest] of Object.entries(CONTENT_REDIRECTS)) {
    redirects.push({ source: `/${slug}`, destination: dest, permanent: true })
  }
  return redirects
}
