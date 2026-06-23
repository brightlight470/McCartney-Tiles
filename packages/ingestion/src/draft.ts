import {
  classifyColour,
  classifyEffect,
  classifyFinish,
  classifyFormat,
  classifySizeBand,
} from './classify'
import type { DraftProduct, FieldSuggestion } from './types'

const blank = (): FieldSuggestion => ({ value: null, confidence: 0, source: 'manual' })

/** Build a review-ready draft product from a name (+ optional size), running name-hint classifiers. */
export function buildDraftProduct(name: string, sizeMm: string | null = null): DraftProduct {
  return {
    name,
    sizeMm: sizeMm ? { value: sizeMm, confidence: 1, source: 'column' } : blank(),
    sizeBand: classifySizeBand(sizeMm),
    application: blank(),
    colourGroup: classifyColour(name),
    finish: classifyFinish(name),
    effect: classifyEffect(name),
    material: { value: 'porcelain', confidence: 0.5, source: 'name-hint' },
    edge: blank(),
    format: classifyFormat(name),
  }
}
