/** URL-safe slug. Lowercase, ASCII-fold common accents, collapse non-alphanumerics to hyphens. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
