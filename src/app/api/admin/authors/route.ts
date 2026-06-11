export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/admin/auth'
import dbConnect from '@/lib/db/mongoose'
import AuthorModel from '@/lib/db/models/Author'
import ArticleModel from '@/lib/db/models/Article'

function slugify(t: string) {
  return t.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await dbConnect()
  const authors = await AuthorModel.find({}).sort({ name: 1 }).lean()
  const counts  = await ArticleModel.aggregate([{ $group: { _id: '$author', count: { $sum: 1 } } }])
  const countMap: Record<string, number> = {}
  counts.forEach((c: any) => { countMap[c._id?.toString()] = c.count })
  const data = authors.map((a: any) => ({ ...a, articleCount: countMap[a._id?.toString()] || 0 }))
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await dbConnect()
  try {
    const body = await req.json()
    if (!body.slug && body.name) body.slug = slugify(body.name)
    const author = await AuthorModel.create(body)
    return NextResponse.json({ data: author }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
