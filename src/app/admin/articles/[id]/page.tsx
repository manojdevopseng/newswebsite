import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/admin/auth'
import { ArticleEditor } from '@/components/admin/editor/ArticleEditor'
import dbConnect from '@/lib/db/mongoose'
import ArticleModel from '@/lib/db/models/Article'
import CategoryModel from '@/lib/db/models/Category'
import AuthorModel from '@/lib/db/models/Author'

export const metadata: Metadata = { title: 'Edit Article' }
export const dynamic = 'force-dynamic'

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { id } = await params
  await dbConnect()

  const [article, categories, authors] = await Promise.all([
    ArticleModel.findById(id)
      .populate('category', '_id name color slug')
      .populate('author', '_id name')
      .select('+views')
      .lean(),
    CategoryModel.find({}).select('_id name color slug').sort({ name: 1 }).lean(),
    AuthorModel.find({}).select('_id name').sort({ name: 1 }).lean(),
  ])

  if (!article) notFound()

  return (
    <ArticleEditor
      initialData={JSON.parse(JSON.stringify(article))}
      categories={JSON.parse(JSON.stringify(categories))}
      authors={JSON.parse(JSON.stringify(authors))}
    />
  )
}
