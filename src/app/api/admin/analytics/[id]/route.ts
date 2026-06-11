export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/admin/auth'
import dbConnect from '@/lib/db/mongoose'
import ArticleModel from '@/lib/db/models/Article'
import CommentModel from '@/lib/db/models/Comment'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await dbConnect()

  const article = await ArticleModel.findById(id)
    .select('title slug views viewsByDate reactions commentCount publishedAt readingTime category status')
    .populate('category', 'name color')
    .lean() as any

  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Build last 30 days chart from viewsByDate map
  const chart: { date: string; views: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key   = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    chart.push({ date: label, views: article.viewsByDate?.get?.(key) ?? (article.viewsByDate?.[key] ?? 0) })
  }

  // Get recent comments count (last 7 days)
  const since7d   = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentComments = await CommentModel.countDocuments({
    articleId: id,
    status:    'approved',
    createdAt: { $gte: since7d },
  })

  return NextResponse.json({
    title:          article.title,
    slug:           article.slug,
    status:         article.status,
    views:          article.views || 0,
    commentCount:   article.commentCount || 0,
    recentComments,
    readingTime:    article.readingTime || 0,
    publishedAt:    article.publishedAt,
    category:       article.category,
    reactions:      article.reactions ?? { like: 0, love: 0, fire: 0, wow: 0 },
    chart,
    viewsLast7d:    chart.slice(-7).reduce((s, d) => s + d.views, 0),
    viewsLast30d:   chart.reduce((s, d) => s + d.views, 0),
  })
}
