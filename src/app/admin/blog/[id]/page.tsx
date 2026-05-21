import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BlogPostForm from '@/components/BlogPostForm'

type Props = { params: Promise<{ id: string }> }

export default async function AdminBlogEditPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) notFound()

  return <BlogPostForm initial={post} />
}
