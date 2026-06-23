import type { MetadataRoute } from 'next'

const BASE = 'https://www.mccartneytiles.com'
const ROUTES = ['/', '/ranges', '/showrooms', '/about', '/contact']

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
