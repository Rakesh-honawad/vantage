'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireStaff } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

function parsePackageIds(formData: FormData) {
  return formData
    .getAll('package_ids')
    .map((v) => String(v).trim())
    .filter(Boolean)
}

/** "My Post Title!" becomes "my-post-title". Keeps URLs clean for search engines. */
function cleanSlug(raw: string) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function readFields(formData: FormData) {
  const status = String(formData.get('status') ?? 'draft')
  return {
    title: String(formData.get('title') ?? '').trim(),
    slug: cleanSlug(String(formData.get('slug') ?? '')),
    summary: String(formData.get('summary') ?? '').trim(),
    category: String(formData.get('category') ?? '').trim(),
    cover_image: String(formData.get('cover_image') ?? '').trim(),
    content: String(formData.get('content') ?? '').trim(),
    status: status === 'published' ? 'published' : 'draft',
  }
}

function explain(error: { code?: string; message: string }, action: string): never {
  console.error(`blog ${action} failed:`, error)
  if (error.code === '23505') {
    throw new Error('That slug is already used by another post. Change the slug, or edit the existing post.')
  }
  throw new Error(`Could not ${action} blog post: ${error.message}`)
}

export async function saveBlogPost(formData: FormData) {
  const staff = await requireStaff(['admin', 'editor'])
  const supabase = await createClient()
  const f = readFields(formData)

  if (!f.title || !f.slug || !f.summary || !f.content) {
    throw new Error('Title, slug, summary and content are required.')
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      ...f,
      seo_title: f.title,
      seo_description: f.summary,
      author_id: staff.id,
      published_at: f.status === 'published' ? new Date().toISOString() : null,
    })
    .select('id')
    .single()

  if (error || !data) explain(error ?? { message: 'no row returned' }, 'save')

  const packageIds = parsePackageIds(formData)
  if (packageIds.length) {
    const rows = packageIds.map((pkgId, index) => ({
      blog_post_id: data.id,
      package_id: pkgId,
      sort_order: index,
    }))
    const { error: linkError } = await supabase.from('blog_post_packages').insert(rows)
    if (linkError) explain(linkError, 'link packages to')
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidatePath(`/blog/${f.slug}`)
  redirect(`/admin/blog/${data.id}?saved=${f.status}`) // must be last: redirect ends the function
}

export async function updateBlogPost(id: string, formData: FormData) {
  await requireStaff(['admin', 'editor'])
  const supabase = await createClient()
  const f = readFields(formData)

  if (!f.title || !f.slug || !f.summary || !f.content) {
    throw new Error('Title, slug, summary and content are required.')
  }

  // Remember the old slug and publish date so we refresh the right pages and keep the original date.
  const { data: existing } = await supabase.from('blog_posts').select('slug, published_at').eq('id', id).maybeSingle()

  const publishedAt = f.status === 'published' ? existing?.published_at ?? new Date().toISOString() : null

  const { error } = await supabase
    .from('blog_posts')
    .update({
      ...f,
      seo_title: f.title,
      seo_description: f.summary,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) explain(error, 'update')

  const packageIds = parsePackageIds(formData)
  const { error: clearError } = await supabase.from('blog_post_packages').delete().eq('blog_post_id', id)
  if (clearError) explain(clearError, 'update package links for')

  if (packageIds.length) {
    const rows = packageIds.map((pkgId, index) => ({
      blog_post_id: id,
      package_id: pkgId,
      sort_order: index,
    }))
    const { error: linkError } = await supabase.from('blog_post_packages').insert(rows)
    if (linkError) explain(linkError, 'update package links for')
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidatePath(`/blog/${f.slug}`)
  if (existing?.slug && existing.slug !== f.slug) revalidatePath(`/blog/${existing.slug}`)
  redirect(`/admin/blog/${id}?saved=${f.status}`) // must be last: redirect ends the function
}

export async function deleteBlogPost(id: string) {
  await requireStaff(['admin', 'editor'])
  const supabase = await createClient()

  const { data: post } = await supabase.from('blog_posts').select('slug').eq('id', id).maybeSingle()

  const { error: linkError } = await supabase.from('blog_post_packages').delete().eq('blog_post_id', id)
  if (linkError) explain(linkError, 'delete package links of')

  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) explain(error, 'delete')

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  if (post?.slug) revalidatePath(`/blog/${post.slug}`)
  redirect('/admin/blog') // must be last: redirect ends the function
}