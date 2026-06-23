import { FACETS, type RawParams } from '@/lib/search-facets'

function listParam(v: string | string[] | undefined): string {
  if (!v) return ''
  return Array.isArray(v) ? v.join(',') : v
}

/**
 * Keyword box. Plain GET form so search works without JavaScript; current facet
 * selections persist via hidden inputs.
 */
export function SearchBox({ sp }: { sp: RawParams }) {
  const hidden: { name: string; value: string }[] = []
  for (const f of FACETS) {
    const v = listParam(sp[f.param])
    if (v) hidden.push({ name: f.param, value: v })
  }
  const stock = listParam(sp.stock)
  if (stock) hidden.push({ name: 'stock', value: stock })
  const sort = typeof sp.sort === 'string' ? sp.sort : ''
  if (sort) hidden.push({ name: 'sort', value: sort })

  const q = typeof sp.q === 'string' ? sp.q : ''

  return (
    <form action="/ranges" method="get" role="search" className="flex gap-2">
      {hidden.map((h) => (
        <input key={h.name} type="hidden" name={h.name} value={h.value} />
      ))}
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder="Search ranges, colours, effects…"
        aria-label="Search the catalogue"
        className="h-11 w-full rounded border border-border bg-white px-4 text-base focus-visible:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
      />
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded bg-brand-blue px-5 font-display font-semibold text-white hover:bg-ink focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Search
      </button>
    </form>
  )
}
