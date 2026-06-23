/**
 * Build an image + content URL manifest by crawling the legacy WordPress site.
 * Migration prep for Sprint 1 (Handover §13 image migration, image-crawl-manifest.md).
 * Read-only: GET requests only; never modifies the live site.
 *
 * Usage: node scripts/crawl-images.mjs
 * Output: packages/db/seed/image-manifest.json
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = 'https://www.mccartneytiles.com'

const PATHS = [
  '/',
  // Effects
  '/wood-effect-ranges/',
  '/stone-effect-ranges/',
  '/marble-effect-ranges/',
  '/concrete-ranges/',
  '/slate-effect-ranges/',
  '/metallic-effect-ranges/',
  '/patterned-textured-ranges/',
  '/topcer-victorian-tiles/',
  '/kitchen-tiles/',
  '/bathroom-tiles/',
  // Uses
  '/porcelain-tiles/',
  '/wall-tiles/',
  '/mosaic-pieces/',
  '/special-pieces/',
  '/outdoor-porcelain/',
  // Colours
  '/black-nero-ebano/',
  '/charcoal-antracite/',
  '/grigio-gris-grey/',
  '/blanco-white-perla/',
  '/marfil-cream-light-beige/',
  '/caramel-tan-dark-beige/',
  '/walnut-taupe-brown/',
  '/pink-rose/',
  '/red-cherry-wood-terracotta/',
  '/orange-coral/',
  '/golden-oak-yellow/',
  '/green-mint-sage/',
  '/teal-turquoise/',
  '/light-blue/',
  '/blue-navy/',
  '/plum-mauve-purple/',
  '/multi-coloured/',
  '/copper-tiles/',
  '/golden-tiles/',
  '/Silver-Tiles/',
  '/iron-steel-other-metallic-tiles/',
  '/oxidised-metallic-tiles/',
  // Designs
  '/floral-prints/',
  '/terrazzo-prints/',
  '/travertine-prints/',
  '/weathered-tiles/',
  '/vintage-tiles/',
  '/encaustic-tiles/',
  '/rustic-tiles/',
  // Finishes
  '/natural-finish-tiles/',
  '/lappato-finish-tiles/',
  '/polished-gloss-finish-tiles/',
  '/anti-slip-finish-tiles/',
  // Edges
  '/pressed-edged-tiles/',
  '/rectified-edged-tiles/',
  '/chiselled-edged-tiles/',
  // Formats
  '/hexagonal-tiles/',
  '/brick-effect-tiles/',
  '/brick-slips/',
  '/pre-boxed-modular-porcelain-tiles/',
  '/miscellaneous/',
  // Master lists + content
  '/all-ranges/',
  '/new-ranges/',
  '/clearance-tiles/',
  '/tile-viewer/',
  '/about-us/',
  '/about-our-suppliers/',
  '/commercial-area/',
  '/customer-projects/',
  '/tile-laying-patterns/',
  '/descriptive-symbols/',
  '/delivery-terms-conditions/',
  '/customer-testimonials/',
]

/** Strip WordPress size suffixes to approximate the original asset. */
function toOriginal(url) {
  return url
    .replace(/-\d+x\d+(?=\.(?:jpe?g|png|webp|gif|avif)(?:\?|$))/i, '')
    .replace(/-scaled(?=\.(?:jpe?g|png|webp|gif|avif)(?:\?|$))/i, '')
}

function extractImages(html, pageUrl) {
  const urls = new Set()
  const re = /<img\b[^>]*?\b(?:src|data-src|data-lazy-src)=["']([^"']+)["'][^>]*>/gi
  let m
  while ((m = re.exec(html))) {
    try {
      const abs = new URL(m[1], pageUrl).toString()
      if (/\.(?:jpe?g|png|webp|gif|avif)(?:\?|$)/i.test(abs)) urls.add(toOriginal(abs))
    } catch {
      /* skip malformed */
    }
  }
  return [...urls]
}

function extractInternalLinks(html, pageUrl) {
  const links = new Set()
  const re = /<a\b[^>]*?\bhref=["']([^"']+)["']/gi
  let m
  while ((m = re.exec(html))) {
    try {
      const u = new URL(m[1], pageUrl)
      if (u.hostname.endsWith('mccartneytiles.com')) links.add(u.pathname)
    } catch {
      /* skip */
    }
  }
  return [...links]
}

async function fetchPage(p) {
  const url = BASE + p
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'McCartneyTiles-Migration/1.0' } })
    if (!res.ok) return { path: p, status: res.status, images: [], links: [] }
    const html = await res.text()
    return {
      path: p,
      status: res.status,
      images: extractImages(html, url),
      links: extractInternalLinks(html, url),
    }
  } catch (err) {
    return { path: p, status: 'error', error: String(err), images: [], links: [] }
  }
}

async function pool(items, size, worker) {
  const out = []
  let i = 0
  const runners = Array.from({ length: size }, async () => {
    while (i < items.length) {
      const idx = i++
      out[idx] = await worker(items[idx])
    }
  })
  await Promise.all(runners)
  return out
}

async function main() {
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const outDir = path.resolve(dirname, '../packages/db/seed')
  mkdirSync(outDir, { recursive: true })

  console.log(`Crawling ${PATHS.length} pages on ${BASE} …`)
  const pages = await pool(PATHS, 6, fetchPage)

  const allImages = new Set()
  const internalLinks = new Set()
  for (const pg of pages) {
    pg.images.forEach((u) => allImages.add(u))
    pg.links.forEach((l) => internalLinks.add(l))
  }

  const ok = pages.filter((p) => p.status === 200).length
  const manifest = {
    generatedFrom: BASE,
    pagesRequested: PATHS.length,
    pagesOk: ok,
    imageCount: allImages.size,
    internalLinkCount: internalLinks.size,
    images: [...allImages].sort(),
    internalLinks: [...internalLinks].sort(),
    pages: pages.map((p) => ({
      path: p.path,
      status: p.status,
      imageCount: p.images.length,
    })),
  }

  const outPath = path.join(outDir, 'image-manifest.json')
  writeFileSync(outPath, JSON.stringify(manifest, null, 2))
  console.log(
    `Done. ${ok}/${PATHS.length} pages OK · ${allImages.size} images · ${internalLinks.size} internal links`,
  )
  console.log(`Wrote ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
