export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/admin/auth'
import dbConnect from '@/lib/db/mongoose'
import ArticleModel from '@/lib/db/models/Article'
import NewsletterModel from '@/lib/db/models/Newsletter'
import CategoryModel from '@/lib/db/models/Category'

// ─── Existing helpers ────────────────────────────────────────────────────────

function getDayViews(articles: any[], dateKey: string): number {
  return articles.reduce((sum, a) => {
    const byDate = a.viewsByDate
    if (!byDate) return sum
    return sum + (byDate[dateKey] || 0)
  }, 0)
}

function getLast30Days(articles: any[]) {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const dateKey  = d.toISOString().slice(0, 10)
    const label    = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0)
    const dayEnd   = new Date(d); dayEnd.setHours(23, 59, 59, 999)
    const published = articles.filter(a => {
      const date = new Date(a.publishedAt || a.createdAt)
      return date >= dayStart && date <= dayEnd
    }).length
    return { date: label, views: getDayViews(articles, dateKey), articles: published }
  })
}

function getLast12Months(articles: any[]) {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (11 - i))
    const label  = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const mEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    const views = articles.reduce((sum, a) => {
      const byDate = a.viewsByDate
      if (!byDate) return sum
      return sum + Object.entries(byDate).reduce((s, [k, v]) => {
        const kDate = new Date(k)
        return kDate >= mStart && kDate <= mEnd ? s + (v as number) : s
      }, 0)
    }, 0)
    const published = articles.filter(a => {
      const date = new Date(a.publishedAt || a.createdAt)
      return date >= mStart && date <= mEnd
    }).length
    return { date: label, views, articles: published }
  })
}

// ─── Level 1: Advanced Analytics helpers ────────────────────────────────────

/** Top 10 tags by total views */
function getTagStats(articles: any[]) {
  const tagMap: Record<string, { views: number; count: number }> = {}
  articles.forEach(a => {
    ;(a.tags || []).forEach((tag: string) => {
      if (!tagMap[tag]) tagMap[tag] = { views: 0, count: 0 }
      tagMap[tag].views += a.views || 0
      tagMap[tag].count++
    })
  })
  return Object.entries(tagMap)
    .map(([tag, d]) => ({ tag, views: d.views, count: d.count }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
}

/** Views and article count grouped by day of week (Sun–Sat) */
function getPublishDayStats(articles: any[]) {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const map  = DAYS.map(d => ({ day: d, views: 0, articles: 0 }))
  articles
    .filter(a => a.status === 'published' && a.publishedAt)
    .forEach(a => {
      const idx = new Date(a.publishedAt).getDay()
      map[idx].views    += a.views || 0
      map[idx].articles += 1
    })
  return map
}

/** Week-over-week and month-over-month view growth using viewsByDate */
function getGrowthStats(articles: any[]) {
  const now = new Date()

  const thisWeekStart  = new Date(now); thisWeekStart.setDate(now.getDate() - 6);  thisWeekStart.setHours(0, 0, 0, 0)
  const lastWeekStart  = new Date(now); lastWeekStart.setDate(now.getDate() - 13); lastWeekStart.setHours(0, 0, 0, 0)
  const lastWeekEnd    = new Date(now); lastWeekEnd.setDate(now.getDate() - 7);    lastWeekEnd.setHours(23, 59, 59, 999)
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  function sumRange(start: Date, end: Date) {
    return articles.reduce((sum, a) => {
      const bd = a.viewsByDate
      if (!bd) return sum
      return sum + Object.entries(bd).reduce((s, [k, v]) => {
        const d = new Date(k)
        return d >= start && d <= end ? s + (v as number) : s
      }, 0)
    }, 0)
  }

  const thisWeekViews  = sumRange(thisWeekStart, now)
  const lastWeekViews  = sumRange(lastWeekStart, lastWeekEnd)
  const thisMonthViews = sumRange(thisMonthStart, now)
  const lastMonthViews = sumRange(lastMonthStart, lastMonthEnd)

  const weekGrowth  = lastWeekViews  === 0 ? 100 : Math.round(((thisWeekViews  - lastWeekViews)  / lastWeekViews)  * 100)
  const monthGrowth = lastMonthViews === 0 ? 100 : Math.round(((thisMonthViews - lastMonthViews) / lastMonthViews) * 100)

  return { thisWeekViews, lastWeekViews, weekGrowth, thisMonthViews, lastMonthViews, monthGrowth }
}

/** Articles and views grouped by reading time bucket */
function getReadingTimeStats(articles: any[]) {
  const buckets = [
    { label: '1–3 min', min: 0,  max: 3    },
    { label: '4–6 min', min: 4,  max: 6    },
    { label: '7–10 min', min: 7, max: 10   },
    { label: '10+ min', min: 11, max: 9999 },
  ]
  return buckets.map(b => {
    const matching = articles.filter(a => {
      const rt = a.readingTime || 3
      return rt >= b.min && rt <= b.max
    })
    return {
      label: b.label,
      count: matching.length,
      views: matching.reduce((s, a) => s + (a.views || 0), 0),
    }
  })
}

/** Articles published per week for the last 8 weeks */
function getPublishingVelocity(articles: any[]) {
  return Array.from({ length: 8 }, (_, i) => {
    const weekEnd   = new Date(); weekEnd.setDate(weekEnd.getDate() - i * 7);      weekEnd.setHours(23, 59, 59, 999)
    const weekStart = new Date(weekEnd); weekStart.setDate(weekEnd.getDate() - 6); weekStart.setHours(0, 0, 0, 0)
    const label = weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    const count = articles.filter(a => {
      if (!a.publishedAt) return false
      const d = new Date(a.publishedAt)
      return d >= weekStart && d <= weekEnd
    }).length
    return { week: label, articles: count }
  }).reverse()
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()

  const [articles, categories, activeSubs, totalSubs] = await Promise.all([
    ArticleModel.find({})
      .populate('category', 'name color slug')
      .select('title slug status publishedAt createdAt views viewsByDate tags readingTime category')
      .sort({ views: -1 })
      .lean(),
    CategoryModel.find({}).lean(),
    NewsletterModel.countDocuments({ status: 'active' }),
    NewsletterModel.countDocuments({}),
  ])

  const totalViews     = articles.reduce((s, a) => s + (a.views || 0), 0)
  const publishedCount = articles.filter(a => a.status === 'published').length
  const draftCount     = articles.filter(a => a.status === 'draft').length

  // Top articles by views
  const topArticles = articles.slice(0, 10).map((a: any) => ({
    _id:         a._id.toString(),
    title:       a.title,
    slug:        a.slug,
    views:       a.views || 0,
    status:      a.status,
    readingTime: a.readingTime || 0,
    category:    a.category ? { name: (a.category as any).name, color: (a.category as any).color } : null,
    publishedAt: a.publishedAt,
  }))

  // Category breakdown
  const catMap: Record<string, { name: string; color: string; count: number; views: number }> = {}
  articles.forEach(a => {
    const cat = a.category as any
    if (cat?._id) {
      const id = cat._id.toString()
      if (!catMap[id]) catMap[id] = { name: cat.name, color: cat.color || '#60a5fa', count: 0, views: 0 }
      catMap[id].count++
      catMap[id].views += (a.views || 0)
    }
  })
  const categoryData = Object.values(catMap).sort((a, b) => b.views - a.views)

  // Status breakdown
  const statusData = [
    { name: 'Published', value: publishedCount, color: '#34d399' },
    { name: 'Draft',     value: draftCount,     color: '#94a3b8' },
    { name: 'Archived',  value: articles.filter(a => a.status === 'archived').length, color: '#f97316' },
  ]

  return NextResponse.json({
    overview: {
      totalArticles: articles.length,
      publishedCount,
      draftCount,
      totalViews,
      activeSubs,
      totalSubs,
      avgViewsPerArticle: articles.length > 0 ? Math.round(totalViews / articles.length) : 0,
    },
    chart30d:     getLast30Days(articles),
    chart12m:     getLast12Months(articles),
    topArticles,
    categoryData,
    statusData,
    // Level 1 Advanced Analytics
    tagStats:     getTagStats(articles),
    dayStats:     getPublishDayStats(articles),
    growthStats:  getGrowthStats(articles),
    readingStats: getReadingTimeStats(articles),
    velocityData: getPublishingVelocity(articles),
  })
}
