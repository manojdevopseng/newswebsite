import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/admin/auth'
import { ArticleEditor } from '@/components/admin/editor/ArticleEditor'
import dbConnect from '@/lib/db/mongoose'
import CategoryModel from '@/lib/db/models/Category'
import AuthorModel from '@/lib/db/models/Author'

export const metadata: Metadata = { title: 'New Article' }
export const dynamic = 'force-dynamic'

export default async function NewArticlePage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await dbConnect()
  const [categories, authors] = await Promise.all([
    CategoryModel.find({}).select('_id name color slug').sort({ name: 1 }).lean(),
    AuthorModel.find({}).select('_id name').sort({ name: 1 }).lean(),
  ])

  return (
    <ArticleEditor
      categories={JSON.parse(JSON.stringify(categories))}
      authors={JSON.parse(JSON.stringify(authors))}
    />
  )
}
