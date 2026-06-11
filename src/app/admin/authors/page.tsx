import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/admin/auth'
import dbConnect from '@/lib/db/mongoose'
import AuthorModel from '@/lib/db/models/Author'
import ArticleModel from '@/lib/db/models/Article'
import { AuthorsClient } from '@/components/admin/authors/AuthorsClient'

export const metadata: Metadata = { title: 'Authors' }
export const dynamic = 'force-dynamic'

export default async function AuthorsPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await dbConnect()
  const authors = await AuthorModel.find({}).sort({ name: 1 }).lean()
  const counts  = await ArticleModel.aggregate([{ $group: { _id: '$author', count: { $sum: 1 } } }])
  const countMap: Record<string, number> = {}
  counts.forEach((c: any) => { countMap[c._id?.toString()] = c.count })
  const data = authors.map((a: any) => ({ ...a, _id: a._id.toString(), articleCount: countMap[a._id?.toString()] || 0 }))

  return <AuthorsClient initialData={data} />
}
