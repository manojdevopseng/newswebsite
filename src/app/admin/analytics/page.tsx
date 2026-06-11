'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import {
  Eye, FileText, TrendingUp, Users, RefreshCw,
  BarChart2, ArrowUpRight, TrendingDown, Hash, Clock, Zap,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Overview {
  totalArticles:       number
  publishedCount:      number
  draftCount:          number
  totalViews:          number
  activeSubs:          number
  totalSubs:           number
  avgViewsPerArticle:  number
}
interface ChartPoint    { date: string; views: number; articles: number }
interface TopArticle    { _id: string; title: string; slug: string; views: number; status: string; readingTime: number; category: { name: string; color: string } | null; publishedAt: string }
interface CategoryData  { name: string; color: string; count: number; views: number }
interface StatusData    { name: string; value: number; color: string }
interface TagStat       { tag: string; views: number; count: number }
interface DayStat       { day: string; views: number; articles: number }
interface ReadingTimeStat { label: string; count: number; views: number }
interface VelocityPoint { week: string; articles: number }
interface GrowthStats   { thisWeekViews: number; lastWeekViews: number; weekGrowth: number; thisMonthViews: number; lastMonthViews: number; monthGrowth: number }

const RANGE_OPTIONS = [
  { key: '30d', label: '30 Days' },
  { key: '12m', label: '12 Months' },
] as const

// ─── Shared tooltip ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#161625] border border-white/[0.08] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: number | string; sub: string; color: string
}) {
  return (
    <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-xs font-medium text-slate-400 mt-0.5">{label}</p>
      <p className="text-xs text-slate-600 mt-0.5">{sub}</p>
    </div>
  )
}

// ─── Growth card ─────────────────────────────────────────────────────────────

function GrowthCard({ label, current, previous, growth, period }: {
  label: string; current: number; previous: number; growth: number; period: string
}) {
  const positive = growth >= 0
  return (
    <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4">
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white tabular-nums">{current.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-0.5">vs {previous.toLocaleString()} {period}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold ${
          positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {positive
            ? <TrendingUp className="w-3.5 h-3.5" />
            : <TrendingDown className="w-3.5 h-3.5" />}
          {positive ? '+' : ''}{growth}%
        </div>
      </div>
    </div>
  )
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [overview,      setOverview]      = useState<Overview | null>(null)
  const [chart30d,      setChart30d]      = useState<ChartPoint[]>([])
  const [chart12m,      setChart12m]      = useState<ChartPoint[]>([])
  const [topArticles,   setTopArticles]   = useState<TopArticle[]>([])
  const [categoryData,  setCategoryData]  = useState<CategoryData[]>([])
  const [statusData,    setStatusData]    = useState<StatusData[]>([])
  const [tagStats,      setTagStats]      = useState<TagStat[]>([])
  const [dayStats,      setDayStats]      = useState<DayStat[]>([])
  const [growthStats,   setGrowthStats]   = useState<GrowthStats | null>(null)
  const [readingStats,  setReadingStats]  = useState<ReadingTimeStat[]>([])
  const [velocityData,  setVelocityData]  = useState<VelocityPoint[]>([])
  const [loading,       setLoading]       = useState(true)
  const [range,         setRange]         = useState<'30d' | '12m'>('30d')

  async function load() {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/analytics')
      const json = await res.json()
      setOverview(json.overview)
      setChart30d(json.chart30d || [])
      setChart12m(json.chart12m || [])
      setTopArticles(json.topArticles || [])
      setCategoryData(json.categoryData || [])
      setStatusData(json.statusData || [])
      setTagStats(json.tagStats || [])
      setDayStats(json.dayStats || [])
      setGrowthStats(json.growthStats || null)
      setReadingStats(json.readingStats || [])
      setVelocityData(json.velocityData || [])
    } catch { toast.error('Failed to load analytics') }
    finally  { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const chartData = range === '30d' ? chart30d : chart12m

  // Max views for tag bar width calculation
  const maxTagViews = tagStats[0]?.views || 1

  return (
    <div className="max-w-7xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-slate-400 mt-0.5">Content performance overview</p>
        </div>
        <button onClick={load} disabled={loading}
          className="p-2 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText}   label="Total Articles" color="bg-blue-500/10 text-blue-400"
          value={overview?.totalArticles ?? 0}
          sub={`${overview?.publishedCount ?? 0} published · ${overview?.draftCount ?? 0} draft`} />
        <StatCard icon={Eye}        label="Total Views"    color="bg-purple-500/10 text-purple-400"
          value={overview?.totalViews ?? 0} sub="All time" />
        <StatCard icon={Users}      label="Subscribers"    color="bg-emerald-500/10 text-emerald-400"
          value={overview?.activeSubs ?? 0} sub={`${overview?.totalSubs ?? 0} total`} />
        <StatCard icon={TrendingUp} label="Avg Views/Article" color="bg-orange-500/10 text-orange-400"
          value={overview?.avgViewsPerArticle ?? 0} sub="Per published article" />
      </div>

      {/* Growth rate cards */}
      {growthStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GrowthCard
            label="This Week Views"
            current={growthStats.thisWeekViews}
            previous={growthStats.lastWeekViews}
            growth={growthStats.weekGrowth}
            period="last week"
          />
          <GrowthCard
            label="This Month Views"
            current={growthStats.thisMonthViews}
            previous={growthStats.lastMonthViews}
            growth={growthStats.monthGrowth}
            period="last month"
          />
        </div>
      )}

      {/* Performance Over Time chart */}
      <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white">Performance Over Time</h3>
            <p className="text-xs text-slate-500 mt-0.5">Views and articles published</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> Views
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" /> Articles
              </span>
            </div>
            <div className="flex gap-1 bg-white/[0.04] p-1 rounded-lg">
              {RANGE_OPTIONS.map(r => (
                <button key={r.key} onClick={() => setRange(r.key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    range === r.key ? 'bg-white/[0.1] text-white' : 'text-slate-400 hover:text-white'
                  }`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {loading ? (
          <div className="h-56 bg-white/[0.03] rounded-lg animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                interval={range === '30d' ? 4 : 0} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="views"    name="Views"    stroke="#60a5fa" strokeWidth={2} fill="url(#vGrad)" dot={false} />
              <Area type="monotone" dataKey="articles" name="Articles" stroke="#a78bfa" strokeWidth={2} fill="url(#aGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category breakdown + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Views by Category</h3>
            <p className="text-xs text-slate-500 mt-0.5">Total views per category</p>
          </div>
          {loading ? (
            <div className="h-40 bg-white/[0.03] rounded-lg animate-pulse" />
          ) : categoryData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-600 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="views" name="Views" radius={[4, 4, 0, 0]}>
                  {categoryData.map((c, i) => <Cell key={i} fill={c.color} opacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Article Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribution</p>
          </div>
          {loading ? (
            <div className="h-40 bg-white/[0.03] rounded-lg animate-pulse" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={30} outerRadius={50}
                    paddingAngle={3} dataKey="value">
                    {statusData.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusData.map(s => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                      {s.name}
                    </span>
                    <span className="text-white font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Level 1 Advanced Analytics ─────────────────────────────────────── */}

      {/* Tags Performance + Best Publish Day */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Tags performance */}
        <Section title="Top Tags by Views" sub="Which topics drive the most traffic">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 bg-white/[0.03] rounded animate-pulse" />
              ))}
            </div>
          ) : tagStats.length === 0 ? (
            <div className="py-8 text-center text-slate-600 text-sm">No tags found</div>
          ) : (
            <div className="space-y-2.5">
              {tagStats.map((t, i) => (
                <div key={t.tag}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Hash className="w-3 h-3 text-slate-500" />
                      {t.tag}
                      <span className="text-slate-600">({t.count})</span>
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums">{t.views.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-400/70"
                      style={{ width: `${Math.round((t.views / maxTagViews) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Best publish day */}
        <Section title="Best Day to Publish" sub="Views earned by articles published each day">
          {loading ? (
            <div className="h-44 bg-white/[0.03] rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={176}>
              <BarChart data={dayStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="views" name="Views" radius={[4, 4, 0, 0]} fill="#a78bfa" opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>
      </div>

      {/* Reading Time Distribution + Publishing Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Reading time distribution */}
        <Section title="Reading Time vs Views" sub="Do short or long articles perform better?">
          {loading ? (
            <div className="h-44 bg-white/[0.03] rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={176}>
              <BarChart data={readingStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="views"    name="Views"    radius={[4, 4, 0, 0]} fill="#34d399" opacity={0.8} />
                <Bar dataKey="count"    name="Articles" radius={[4, 4, 0, 0]} fill="#60a5fa" opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {!loading && (
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/80 inline-block" /> Views</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400/60 inline-block" /> Articles</span>
            </div>
          )}
        </Section>

        {/* Publishing velocity */}
        <Section title="Publishing Velocity" sub="Articles published per week (last 8 weeks)">
          {loading ? (
            <div className="h-44 bg-white/[0.03] rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={176}>
              <BarChart data={velocityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="articles" name="Articles" radius={[4, 4, 0, 0]} fill="#f97316" opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>
      </div>

      {/* Top articles */}
      <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h3 className="text-sm font-semibold text-white">Top Articles</h3>
            <p className="text-xs text-slate-500 mt-0.5">By total views</p>
          </div>
          <BarChart2 className="w-4 h-4 text-slate-600" />
        </div>

        {loading ? (
          <div className="divide-y divide-white/[0.04]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className="h-4 bg-white/[0.06] rounded animate-pulse flex-1" />
                <div className="h-4 bg-white/[0.06] rounded animate-pulse w-16" />
              </div>
            ))}
          </div>
        ) : topArticles.length === 0 ? (
          <div className="py-12 text-center text-slate-600 text-sm">No articles yet</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {topArticles.map((a, i) => (
              <div key={a._id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors group">
                <span className="text-xs text-slate-600 font-mono w-5 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{a.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {a.category && (
                      <span className="text-xs font-medium" style={{ color: a.category.color }}>
                        {a.category.name}
                      </span>
                    )}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      a.status === 'published' ? 'bg-green-500/10 text-green-400'
                      : a.status === 'draft'   ? 'bg-slate-500/10 text-slate-400'
                      : 'bg-orange-500/10 text-orange-400'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-sm font-medium text-white">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    {(a.views || 0).toLocaleString()}
                  </div>
                  {a.readingTime > 0 && (
                    <p className="text-xs text-slate-600 mt-0.5">{a.readingTime} min read</p>
                  )}
                </div>
                <Link href={`/admin/articles/${a._id}`} target="_blank"
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-500 hover:text-white transition-all">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
