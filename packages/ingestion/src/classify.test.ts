import { describe, expect, it } from 'vitest'
import { classifyColour, classifyEffect, classifyFinish, classifySizeBand } from './classify'
import { buildDraftProduct } from './draft'

describe('name-hint classifiers', () => {
  it('reads finish cues', () => {
    expect(classifyFinish('Berwyn Roble Natural').value).toBe('natural')
    expect(classifyFinish('Marble Lappato 600x600').value).toBe('lappato')
    expect(classifyFinish('Tech R11 Outdoor').value).toBe('anti-slip')
  })

  it('reads effect cues', () => {
    expect(classifyEffect('Berwyn Roble Natural').value).toBe('wood')
    expect(classifyEffect('Blackwater Slate').value).toBe('slate')
  })

  it('reads colour cues (EN/ES)', () => {
    expect(classifyColour('Balti Grey').value).toBe('grey')
    expect(classifyColour('Balti Blanco').value).toBe('white')
  })

  it('bands size by largest dimension', () => {
    expect(classifySizeBand('200x200').value).toBe('small')
    expect(classifySizeBand('600x600').value).toBe('medium')
    expect(classifySizeBand('900x900').value).toBe('large')
    expect(classifySizeBand('600x1200').value).toBe('xl')
  })
})

describe('buildDraftProduct', () => {
  it('assembles a review-ready draft with confidence', () => {
    const d = buildDraftProduct('Blackwater Slate 600x600', '600x600')
    expect(d.effect.value).toBe('slate')
    expect(d.sizeMm.value).toBe('600x600')
    expect(d.sizeBand.value).toBe('medium')
    expect(d.material.value).toBe('porcelain')
  })
})
