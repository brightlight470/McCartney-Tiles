/**
 * Tile sizes drawn as black-outline tiles with the dimension underneath. Two variants:
 *  - card:   a compact stack overlaid on the right of a product card (Products page)
 *  - detail: a larger row of all sizes on the product page
 * The outline box is proportioned to the real tile aspect (600×1200 reads as a tall rectangle).
 */

function parseAspect(size: string): { w: number; h: number } {
  const m = size.replace(/×/g, 'x').match(/(\d+)\s*x\s*(\d+)/i)
  if (!m) return { w: 1, h: 1 } // Modular / non-numeric → square chip
  return { w: Number(m[1]), h: Number(m[2]) }
}

// Rule: sizes are ordered numerically, smallest first. Sort by tile area; non-numeric
// entries (e.g. Modular) sort last.
function sizeArea(size: string): number {
  const m = size.replace(/×/g, 'x').match(/(\d+)\s*x\s*(\d+)/i)
  return m ? Number(m[1]) * Number(m[2]) : Number.POSITIVE_INFINITY
}

function orderSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => sizeArea(a) - sizeArea(b))
}

function MiniTile({ size, base, textClass }: { size: string; base: number; textClass: string }) {
  const { w, h } = parseAspect(size)
  const tw = w >= h ? base : Math.round((base * w) / h)
  const th = h >= w ? base : Math.round((base * h) / w)
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="rounded-[2px] border border-ink"
        style={{ width: `${tw}px`, height: `${th}px` }}
        aria-hidden="true"
      />
      <span className={`tabular leading-none text-ink ${textClass}`}>{size}</span>
    </div>
  )
}

export function SizeStack({
  sizes,
  variant = 'card',
}: {
  sizes: string[]
  variant?: 'card' | 'detail'
}) {
  const ordered = orderSizes(sizes)
  if (variant === 'detail') {
    return (
      <div className="flex flex-wrap items-end gap-5">
        {ordered.map((s) => (
          <MiniTile key={s} size={s} base={56} textClass="mt-1 text-xs font-medium" />
        ))}
      </div>
    )
  }
  // card overlay — top-right stack, on a translucent chip so outlines read over the photo
  return (
    <div className="absolute right-2 top-2 flex flex-col items-center gap-2 rounded bg-white/85 p-2 backdrop-blur-[1px]">
      {ordered.map((s) => (
        <MiniTile key={s} size={s} base={22} textClass="text-[9px]" />
      ))}
    </div>
  )
}
