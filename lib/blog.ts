import { createClient } from '@/lib/supabase/server'
import type { TourPackage } from '@/lib/types'

export type BlogPost = {
  id: string
  slug: string
  title: string
  summary: string
  category: string
  cover_image: string
  content: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  seo_title: string
  seo_description: string
}

export async function getPublishedBlogs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) return []
  return (data ?? []) as BlogPost[]
}

export async function getBlogBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !data) return null
  return data as BlogPost
}

export async function getPackageLinks(blogPostId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_post_packages')
    .select('package_id')
    .eq('blog_post_id', blogPostId)

  if (error || !data?.length) return []

  const packageIds = data.map((row) => row.package_id)
  const { data: packages, error: pkgErr } = await supabase
    .from('packages')
    .select('id, code, slug, draft, status')
    .in('id', packageIds)
    .eq('status', 'published')

  if (pkgErr) return []
  return (packages ?? []) as Array<{ id: string; code: string; slug: string; draft: TourPackage }>
}

export async function getCategoryList(): Promise<string[]> {
  const posts = await getPublishedBlogs()

  return Array.from(
    new Set(
      posts
        .map((post) => post.category)
        .filter((category): category is string => Boolean(category))
    )
  )
}