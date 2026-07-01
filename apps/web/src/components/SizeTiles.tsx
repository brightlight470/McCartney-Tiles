/**
 * Tile sizes as black-outline tiles with the dimension underneath (approved v2 design).
 *  - card:   compact stack overlaid top-right of a product card
 *  - detail: a larger row of every size on the product page
 * Each outline is proportioned to the real tile aspect; sizes are ordered smallest-first.
 */

function parseAspect(size: string): { w: number; h: number } {
  const m = size.replace(/×/g, 'x').match(/(\d+)\s*x\s*(\d+)/i)
  if (!m) return { w: 1, h: 1 }
  return { w: Number(m[1]), h: Number(m[2]) }
}

function sizeArea(size: string): number {
  const m = size.replace(/×/g, 'x').match(/(\d+)\s*x\s*(\d+)/i)
  return m ? Number(m[1]) * Number(m[2]) : Number.POSITIVE_INFINITY
}

/** Order smallest-first; format 600x600 → 600 × 600. */
function orderSizes(sizes: string[]): string[] {
  return [...new Set(sizes.filter(Boolean))].sort((a, b) => sizeArea(a) - sizeArea(b))
}

const label = (size: string): string => size.replace(/x/i, ' × ')

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
      <span className={`tabular leading-none text-ink ${textClass}`}>{label(size)}</span>
    </div>
  )
}

export function SizeTiles({
  sizes,
  variant = 'card',
}: {
  sizes: string[]
  variant?: 'card' | 'detail'
}) {
  const ordered = orderSizes(sizes)
  if (ordered.length === 0) return null

  if (variant === 'detail') {
    return (
      <div className="flex flex-wrap items-end gap-5">
        {ordered.map((s) => (
          <MiniTile key={s} size={s} base={56} textClass="mt-1 text-xs font-medium" />
        ))}
      </div>
    )
  }
  return (
    <div className="absolute right-2 top-2 flex flex-col items-center gap-2 rounded bg-white/85 p-2 backdrop-blur-[1px]">
      {ordered.map((s) => (
        <MiniTile key={s} size={s} base={22} textClass="text-[9px]" />
      ))}
    </div>
  )
}
