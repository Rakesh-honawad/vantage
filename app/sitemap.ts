import type { MetadataRoute } from 'next'
import { getPublishedPackages } from '@/lib/data/packages'
import type { TourPackage } from '@/lib/types'

export const revalidate = 3600

const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

/** Only published packages are listed. Drafts, previews, admin and traveller links never appear. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let pkgs: TourPackage[] = []
  try {
    pkgs = await getPublishedPackages()
  } catch {
    // If the database is unreachable the static pages are still listed.
  }
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/packages`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/enquire`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    ...pkgs.map((p) => {
      const d = new Date(p.updatedAt)
      return { url: `${base}/packages/${p.slug}`, ...(Number.isNaN(d.getTime()) ? {} : { lastModified: d }), changeFrequency: 'weekly' as const, priority: 0.8 }
    }),
  ]
}
