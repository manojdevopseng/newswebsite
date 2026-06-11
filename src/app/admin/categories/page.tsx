import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/admin/auth'
import dbConnect from '@/lib/db/mongoose'
import CategoryModel from '@/lib/db/models/Category'
import ArticleModel from '@/lib/db/models/Article'
import { CategoriesClient } from '@/components/admin/categories/CategoriesClient'

export const metadata: Metadata = { title: 'Categories' }
export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await dbConnect()
  const categories = await CategoryModel.find({}).sort({ name: 1 }).lean()
  const counts     = await ArticleModel.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }])
  const countMap: Record<string, number> = {}
  counts.forEach((c: any) => { countMap[c._id?.toString()] = c.count })
  const data = categories.map((c: any) => ({ ...c, _id: c._id.toString(), articleCount: countMap[c._id?.toString()] || 0 }))

  return <CategoriesClient initialData={data} />
}
