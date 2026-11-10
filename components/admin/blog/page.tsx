import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedBlogs } from '@/lib/blog'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Blog CMS',
}

export default async function BlogAdminPage() {
  const supabase = await createClient()

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, category, status, published_at, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch blog posts:', error.message)
  }

  return (
    <>
      <div className="admin-title">
        <div>
          <span className="eyebrow">Content</span>
          <h1>Blog CMS</h1>
          <p className="admin-sub">
            Create, review and publish articles that connect to package pages.
          </p>
        </div>
      </div>

      <div className="admin-actions">
        <Link href="/admin/blog/new" className="btn">
          New post
        </Link>
      </div>

      <div className="admin-list">
        {(posts ?? []).map((post) => (
          <div key={post.id} className="admin-card">
            <div>
              <strong>{post.title}</strong>
              <small>
                {post.category || 'Uncategorised'} • {post.status} •{' '}
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString()
                  : 'Not published'}
              </small>
            </div>

            <div className="admin-card-actions">
              {post.status === 'published' && (
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Preview
                </Link>
              )}
              <Link href={`/admin/blog/${post.id}`}>Edit</Link>
            </div>
          </div>
        ))}

        {(!posts || posts.length === 0) && (
          <p className="note">No blog posts found. Create your first post.</p>
        )}
      </div>
    </>
  )
}