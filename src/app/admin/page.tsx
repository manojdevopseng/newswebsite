import { StatsGrid }          from '@/components/admin/dashboard/StatsGrid'
import { TrafficChart }        from '@/components/admin/dashboard/TrafficChart'
import { CategoryBreakdown }   from '@/components/admin/dashboard/CategoryBreakdown'
import { RecentArticles }      from '@/components/admin/dashboard/RecentArticles'
import dbConnect               from '@/lib/db/mongoose'
import ArticleModel            from '@/lib/db/models/Article'
import CategoryModel           from '@/lib/db/models/Category'
import NewsletterModel         from '@/lib/db/models/Newsletter'
import { auth }                from '@/lib/admin/auth'
import { redirect }            from 'next/navigation'
import type { Metadata }       from 'next'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

// Generate last 30 days chart data
function getLast30Days(articles: any[]) {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateKey  = d.toISOString().slice(0, 10)
    const label    = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0)
    const dayEnd   = new Date(d); dayEnd.setHours(23, 59, 59, 999)

    const dayArticles = articles.filter(a => {
      const date = new Date(a.publishedAt || a.createdAt)
      return date >= dayStart && date <= dayEnd
    })

    const views = articles.reduce((sum: number, a: any) => {
      const byDate = a.viewsByDate
      if (!byDate) return sum
      return sum + (byDate[dateKey] || 0)
    }, 0)

    days.push({
      date:     label,
      views,
      articles: dayArticles.length,
    })
  }
  return days
}

export default async function AdminDashboard() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  let totalArticles  = 0
  let publishedCount = 0
  let draftCount     = 0
  let totalViews     = 0
  let totalSubs      = 0
  let recentArticles: any[] = []
  let chartData:      any[] = []
  let categoryData:   any[] = []

  try {
    await dbConnect()

    const [articles, categories, subscribers] = await Promise.all([
      ArticleModel.find({})
        .populate('category', 'name color slug')
        .select('title slug status publishedAt createdAt views viewsByDate category')
        .sort({ createdAt: -1 })
        .lean(),
      CategoryModel.find({}).select('name color slug').lean(),
      NewsletterModel.countDocuments({ status: 'active' }),
    ])

    totalArticles  = articles.length
    publishedCount = articles.filter(a => a.status === 'published').length
    draftCount     = articles.filter(a => a.status === 'draft').length
    totalViews     = articles.reduce((s, a) => s + (a.views || 0), 0)
    totalSubs      = subscribers
    recentArticles = articles.slice(0, 8) as any[]
    chartData      = getLast30Days(articles)

    // Category breakdown
    const catMap: Record<string, { name: string; color: string; count: number }> = {}
    articles.forEach(a => {
      const cat = a.category as any
      if (cat?._id) {
        const id = cat._id.toString()
        if (!catMap[id]) catMap[id] = { name: cat.name, color: cat.color || '#60a5fa', count: 0 }
        catMap[id].count++
      }
    })
    categoryData = Object.values(catMap)
      .sort((a, b) => b.count - a.count)
      .map(c => ({ name: c.name, value: c.count, color: c.color }))
  } catch {
    // DB unavailable — show empty state
  }

  const stats = [
    {
      label:   'Total Articles',
      value:   totalArticles,
      sub:     `${publishedCount} published · ${draftCount} draft`,
      delta:   12,
      icon:    'FileText' as const,
      color:   'text-blue-400',
      bgColor: 'bg-blue-500',
    },
    {
      label:   'Total Views',
      value:   totalViews,
      sub:     'All time',
      delta:   23,
      icon:    'Eye' as const,
      color:   'text-purple-400',
      bgColor: 'bg-purple-500',
    },
    {
      label:   'Newsletter Subs',
      value:   totalSubs,
      sub:     'Active subscribers',
      delta:   8,
      icon:    'Mail' as const,
      color:   'text-emerald-400',
      bgColor: 'bg-emerald-500',
    },
    {
      label:   'Published',
      value:   publishedCount,
      sub:     'Live articles',
      delta:   5,
      icon:    'TrendingUp' as const,
      color:   'text-orange-400',
      bgColor: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, Admin
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">Here's what's happening with TechPulseGlobe today.</p>
      </div>

      {/* Stats */}
      <StatsGrid stats={stats} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TrafficChart data={chartData} />
        </div>
        <CategoryBreakdown data={categoryData} />
      </div>

      {/* Recent Articles */}
      <RecentArticles articles={recentArticles} />
    </div>
  )
}

