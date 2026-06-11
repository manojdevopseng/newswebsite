export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/admin/auth'
import dbConnect from '@/lib/db/mongoose'
import CategoryModel from '@/lib/db/models/Category'
import ArticleModel from '@/lib/db/models/Article'

function slugify(t: string) {
  return t.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await dbConnect()
  const categories = await CategoryModel.find({}).sort({ name: 1 }).lean()
  // Article count per category
  const counts = await ArticleModel.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }])
  const countMap: Record<string, number> = {}
  counts.forEach((c: any) => { countMap[c._id?.toString()] = c.count })
  const data = categories.map((c: any) => ({ ...c, articleCount: countMap[c._id?.toString()] || 0 }))
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await dbConnect()
  try {
    const body = await req.json()
    if (!body.slug && body.name) body.slug = slugify(body.name)
    const category = await CategoryModel.create(body)
    return NextResponse.json({ data: category }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
