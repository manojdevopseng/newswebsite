import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/admin/auth'
import dbConnect from '@/lib/db/mongoose'
import ArticleModel from '@/lib/db/models/Article'
import '@/lib/db/models/Category'
export const dynamic = 'force-dynamic'

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ data: [], error: 'Unauthorized' }, { status: 401 })

    const q     = req.nextUrl.searchParams.get('q') || ''
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '8'), 20)

    if (!q.trim()) return NextResponse.json({ data: [] })

    await dbConnect()

    const safe = escapeRegex(q.trim().slice(0, 100))
    const articles = await ArticleModel.find({
      $or: [
        { title: { $regex: safe, $options: 'i' } },
        { slug:  { $regex: safe, $options: 'i' } },
      ],
    })
      .populate('category', 'name color slug')
      .select('title slug status category publishedAt')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({ data: articles })
  } catch (err: any) {
    console.error('[GET /api/admin/articles/search]', err)
    return NextResponse.json({ data: [], error: err.message }, { status: 500 })
  }
}
