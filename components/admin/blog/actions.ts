'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireStaff } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function saveBlogPost(formData: FormData) {
  const staff = await requireStaff(['admin', 'editor'])
  const supabase = await createClient()

  const title = String(formData.get('title') ?? '')
  const slug = String(formData.get('slug') ?? '')
  const summary = String(formData.get('summary') ?? '')
  const category = String(formData.get('category') ?? '')
  const content = String(formData.get('content') ?? '')
  const coverImage = String(formData.get('coverImage') ?? '')
  const status = String(formData.get('status') ?? 'draft')

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title,
      slug,
      summary,
      category,
      cover_image: coverImage,
      content,
      status,
      author_id: staff.id,
      seo_title: title,
      seo_description: summary,
    })
    .select('id')
    .single()

  if (error || !data) throw new Error('Could not save blog post')

  redirect(`/admin/blog/${data.id}`)
}