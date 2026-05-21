import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminBlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, published, reading_time, cover_image, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Блог <span className="text-muted text-lg font-normal">({posts?.length ?? 0})</span>
        </h1>
        <Link
          href="/admin/blog/new"
          className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
        >
          + Нова статия
        </Link>
      </div>

      {!posts?.length ? (
        <div className="py-20 text-center text-muted text-sm border border-border rounded-xl">
          <p className="mb-4">Няма добавени статии</p>
          <Link href="/admin/blog/new" className="text-accent hover:underline">
            Създайте първата статия →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map(post => (
            <Link
              key={post.id}
              href={`/admin/blog/${post.id}`}
              className="flex items-center gap-4 bg-surface border border-border hover:border-accent/50 rounded-xl px-4 py-3.5 transition-colors group"
            >
              {post.cover_image ? (
                <img
                  src={post.cover_image}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover shrink-0 bg-background"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border">
                  <svg className="w-5 h-5 text-muted/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2v6h6M8 13h8M8 17h6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm group-hover:text-accent transition-colors truncate">
                  {post.title}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {new Date(post.created_at).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {' · '}
                  {post.reading_time} мин. четене
                </p>
              </div>
              <div className="shrink-0">
                {post.published ? (
                  <span className="text-green-400 text-xs font-medium">● Публикувана</span>
                ) : (
                  <span className="text-muted text-xs font-medium">○ Скрита</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
