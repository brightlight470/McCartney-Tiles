import type { FieldSuggestion } from './types'

const hint = (value: string | null, confidence: number): FieldSuggestion => ({
  value,
  confidence,
  source: 'name-hint',
})

/** Finish from name cues (data-model.md). */
export function classifyFinish(name: string): FieldSuggestion {
  const n = name.toLowerCase()
  if (/anti.?slip|\br1[01]\b|grip/.test(n)) return hint('anti-slip', 0.8)
  if (/lappato|honed|semi.?polish/.test(n)) return hint('lappato', 0.8)
  if (/gloss|polish|brillo/.test(n)) return hint('gloss', 0.8)
  if (/natural|matt|structured/.test(n)) return hint('natural', 0.7)
  return hint(null, 0)
}

/** Effect from name cues. */
export function classifyEffect(name: string): FieldSuggestion {
  const n = name.toLowerCase()
  if (/wood|roble|alerce|oak|plank|d[eé]cor/.test(n)) return hint('wood', 0.7)
  if (/marble|marmol|carrara|calacatta/.test(n)) return hint('marble', 0.8)
  if (/concrete|cement|beton/.test(n)) return hint('concrete', 0.8)
  if (/slate/.test(n)) return hint('slate', 0.85)
  if (/metal|steel|iron|copper|oxid/.test(n)) return hint('metallic', 0.7)
  if (/stone|piedra|travertine/.test(n)) return hint('stone', 0.7)
  return hint(null, 0)
}

/** Coarse colour group from common colour words (EN/ES). */
export function classifyColour(name: string): FieldSuggestion {
  const n = name.toLowerCase()
  const map: [RegExp, string][] = [
    [/black|nero|ebano|negro/, 'black'],
    [/charcoal|antraci|anthrac/, 'charcoal'],
    [/grey|gray|grigio|gris/, 'grey'],
    [/white|blanco|perla/, 'white'],
    [/marfil|cream|ivory/, 'cream'],
    [/beige|caramel|tan|sand/, 'beige'],
    [/walnut|noce|taupe|brown|marron/, 'brown'],
    [/green|verde|mint|sage/, 'green'],
    [/blue|azul|navy/, 'blue'],
  ]
  for (const [re, slug] of map) if (re.test(n)) return hint(slug, 0.6)
  return hint(null, 0)
}

/** Format from name cues. */
export function classifyFormat(name: string): FieldSuggestion {
  const n = name.toLowerCase()
  if (/hexagon|hexa/.test(n)) return hint('hexagonal', 0.85)
  if (/brick.?slip/.test(n)) return hint('brick-slips', 0.85)
  if (/brick/.test(n)) return hint('brick-effect', 0.7)
  if (/\bmod\b|modular/.test(n)) return hint('pre-boxed-modular', 0.7)
  return hint(null, 0)
}

/** Size band from a "WxH" mm string. */
export function classifySizeBand(sizeMm: string | null): FieldSuggestion {
  if (!sizeMm) return hint(null, 0)
  const m = sizeMm.match(/(\d+)\s*x\s*(\d+)/i)
  if (!m) return hint(null, 0)
  const max = Math.max(Number(m[1]), Number(m[2]))
  if (max <= 250) return hint('small', 0.9)
  if (max <= 650) return hint('medium', 0.9)
  if (max <= 950) return hint('large', 0.9)
  return hint('xl', 0.9)
}
