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
  for (const [slug, dest] of Object.entries(CONTENT_REDIRECTS)) {
    redirects.push({ source: `/${slug}`, destination: dest, permanent: true })
  }
  return redirects
}
