import Link from 'next/link'
import type { Metadata } from 'next'
import { DeletePostButton } from '@/components/admin/delete-post-button'
import { requireStaff } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { deleteBlogPost } from './actions'

export const metadata: Metadata = { title: 'Blog' }
export const dynamic = 'force-dynamic'

export default async function BlogAdminPage() {
  await requireStaff(['admin', 'editor'])

  const supabase = await createClient()
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, category, status, updated_at')
    .order('updated_at', { ascending: false })

  return (
    <>
      <div className="admin-title">
        <div>
          <span className="eyebrow">Content</span>
          <h1>Blog</h1>
          <p className="admin-sub">Create and manage travel stories.</p>
        </div>
        <Link href="/admin/blog/new" className="btn">
          New post
        </Link>
      </div>

      {error ? (
        <div className="admin-empty">
          <h3>Could not load blog posts.</h3>
          <p>Check that the blog migration has been run in Supabase.</p>
        </div>
      ) : !posts?.length ? (
        <div className="admin-empty">
          <h3>No blog posts yet.</h3>
          <p>Create your first post to get started.</p>
          <Link href="/admin/blog/new" className="btn">Create first post</Link>
        </div>
      ) : (
        <ul className="bl-list">
          {posts.map((post) => (
            <li key={post.id} className="bl-row">
              <div className="bl-main">
                <strong>{post.title}</strong>
                <small>/blog/{post.slug} · {post.category || 'Uncategorized'}</small>
              </div>
              <span className="bl-pill" data-s={post.status}>
                {post.status === 'published' ? 'Published' : 'Draft'}
              </span>
              <div className="bl-actions">
                <Link href={`/admin/blog/${post.id}`} className="btn btn-outline">
                  Edit
                </Link>
                {post.status === 'published' && (
                  <Link href={`/blog/${post.slug}`} className="text-link" target="_blank">
                    View post
                  </Link>
                )}
                <form action={deleteBlogPost.bind(null, post.id)}>
                  <DeletePostButton title={post.title} />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}