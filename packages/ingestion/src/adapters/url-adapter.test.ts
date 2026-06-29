import { describe, expect, it } from 'vitest'
import { UrlAdapter } from './url-adapter'

describe('UrlAdapter', () => {
  it('parses HTML content directly (no network) into draft ranges', async () => {
    const html = `
      <html><body>
        <img alt="Bloka Beige 800x800" src="/x/Bloka-Beige.png">
        <h2>Tercio Blanco 600x1198</h2>
      </body></html>
    `
    const result = await new UrlAdapter().extract({ content: html, sourceRef: 'paste' })
    expect(result.kind).toBe('url')
    expect(result.ranges.some((r) => r.name === 'Bloka Beige')).toBe(true)
    expect(result.ranges.some((r) => r.name === 'Tercio Blanco')).toBe(true)
    expect(result.warnings.join(' ')).toMatch(/low-confidence/)
  })
})
