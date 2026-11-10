
import Link from 'next/link'
import type { BlogPost } from '@/lib/blog'

type Props = {
  post: BlogPost
}

export function BlogCard({ post }: Props) {
  return (
    <Link href={`/blog/${post.slug}`} className="blog-card">
      {post.cover_image?.trim() ? (
  <img
    src={post.cover_image.trim()}
    alt={post.title}
    className="blog-cover-image"
  />
) : (
  <div className="blog-cover-placeholder">
    No cover image available
  </div>
)}

      <div className="blog-card-content">
        <span className="eyebrow">{post.category}</span>

        <h3>{post.title}</h3>

        <p>{post.summary}</p>

        <div className="blog-card-meta">
          <span>
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString()
              : 'Recently published'}
          </span>
        </div>
      </div>
    </Link>
  )
}
