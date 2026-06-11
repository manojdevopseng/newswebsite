'use client'

import { useEffect, useState } from 'react'
import {
  X, Eye, MessageCircle, Clock, TrendingUp,
  BarChart2, ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

interface Stats {
  title:          string
  slug:           string
  status:         string
  views:          number
  commentCount:   number
  recentComments: number
  readingTime:    number
  publishedAt:    string | null
  category:       { name: string; color: string } | null
  reactions:      { like: number; love: number; fire: number; wow: number }
  chart:          { date: string; views: number }[]
  viewsLast7d:    number
  viewsLast30d:   number
}

const REACTIONS = [
  { type: 'like', emoji: '👍' },
  { type: 'love', emoji: '❤️' },
  { type: 'fire', emoji: '🔥' },
  { type: 'wow',  emoji: '😮' },
] as const

interface Props {
  articleId: string
  onClose:   () => void
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#161625] border border-white/[0.08] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-blue-400 font-medium">{payload[0].value.toLocaleString()} views</p>
    </div>
  )
}

export function ArticleAnalyticsModal({ articleId, onClose }: Props) {
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/analytics/${articleId}`)
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [articleId])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const totalReactions = stats
    ? Object.values(stats.reactions).reduce((s, v) => s + v, 0)
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#0d0d1a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-white">Article Analytics</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="space-y-3">
              <div className="h-5 bg-white/[0.06] rounded animate-pulse w-3/4" />
              <div className="h-40 bg-white/[0.06] rounded-xl animate-pulse" />
              <div className="grid grid-cols-4 gap-3">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-white/[0.06] rounded-xl animate-pulse" />)}
              </div>
            </div>
          ) : stats ? (
            <>
              {/* Title + link */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold text-white leading-snug line-clamp-2">
                    {stats.title}
                  </h2>
                  {stats.status === 'published' && (
                    <Link href={`/${stats.category?.name?.toLowerCase().replace(/\s+/g, '-') || ''}/${stats.slug}`}
                      target="_blank"
                      className="shrink-0 p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  {stats.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ color: stats.category.color, background: stats.category.color + '20' }}>
                      {stats.category.name}
                    </span>
                  )}
                  {stats.publishedAt && (
                    <span className="text-xs text-slate-500">
                      {new Date(stats.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Eye,           label: 'Total Views',    value: stats.views.toLocaleString(),       color: 'text-blue-400'    },
                  { icon: TrendingUp,    label: 'Last 30 Days',   value: stats.viewsLast30d.toLocaleString(), color: 'text-purple-400' },
                  { icon: TrendingUp,    label: 'Last 7 Days',    value: stats.viewsLast7d.toLocaleString(),  color: 'text-emerald-400' },
                  { icon: MessageCircle, label: 'Comments',       value: stats.commentCount.toLocaleString(), color: 'text-orange-400'  },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <Icon className={`w-3.5 h-3.5 mb-2 ${color}`} />
                    <p className="text-lg font-bold text-white tabular-nums">{value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Views chart */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-3">Views — Last 30 Days</p>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={stats.chart} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={false} tickLine={false} interval={4} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="views" stroke="#60a5fa" strokeWidth={2}
                      fill="url(#vg)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Reactions + Reading time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-2">Reactions ({totalReactions})</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {REACTIONS.map(({ type, emoji }) => (
                      <span key={type} className="flex items-center gap-1 text-sm">
                        {emoji}
                        <span className="text-xs text-slate-300 font-medium tabular-nums">
                          {stats.reactions[type] || 0}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-2">Reading Time</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-lg font-bold text-white">{stats.readingTime} min</span>
                  </div>
                  {stats.recentComments > 0 && (
                    <p className="text-xs text-emerald-400 mt-1">+{stats.recentComments} comments this week</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">Failed to load analytics</p>
          )}
        </div>
      </div>
    </div>
  )
}
