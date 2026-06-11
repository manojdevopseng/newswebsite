'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Activity, FileText, MessageCircle, RefreshCw,
  CheckCircle, Trash2, Pin, AlertTriangle, Archive,
  Edit3, Globe, Flag, CheckCheck, Flame,
} from 'lucide-react'
import { AdminPagination } from '@/components/admin/shared/AdminPagination'
import { formatDistanceToNow } from 'date-fns'

interface LogEntry {
  _id:         string
  action:      string
  entityType:  string
  entityId:    string
  entityTitle: string
  details:     string
  createdAt:   string
}

const FILTERS = [
  { key: '',         label: 'All'      },
  { key: 'article',  label: 'Articles' },
  { key: 'comment',  label: 'Comments' },
] as const

const ACTION_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  'article.created':       { icon: Edit3,         color: 'text-blue-400',    label: 'Article Created'       },
  'article.updated':       { icon: Edit3,         color: 'text-slate-400',   label: 'Article Updated'       },
  'article.published':     { icon: Globe,         color: 'text-emerald-400', label: 'Article Published'     },
  'article.archived':      { icon: Archive,       color: 'text-slate-400',   label: 'Article Archived'      },
  'article.deleted':       { icon: Trash2,        color: 'text-red-400',     label: 'Article Deleted'       },
  'comment.approved':      { icon: CheckCircle,   color: 'text-emerald-400', label: 'Comment Approved'      },
  'comment.spam':          { icon: AlertTriangle, color: 'text-red-400',     label: 'Marked as Spam'        },
  'comment.pending':       { icon: MessageCircle, color: 'text-amber-400',   label: 'Moved to Pending'      },
  'comment.pinned':        { icon: Pin,           color: 'text-accent',      label: 'Comment Pinned'        },
  'comment.unpinned':      { icon: Pin,           color: 'text-slate-400',   label: 'Comment Unpinned'      },
  'comment.deleted':       { icon: Trash2,        color: 'text-red-400',     label: 'Comment Deleted'       },
  'comment.bulk_approved': { icon: CheckCheck,    color: 'text-emerald-400', label: 'Bulk Approved'         },
  'comment.bulk_deleted':  { icon: Flame,         color: 'text-red-400',     label: 'Bulk Spam Deleted'     },
  'comment.reported':      { icon: Flag,          color: 'text-orange-400',  label: 'Comment Reported'      },
}

function getActionMeta(action: string) {
  return ACTION_META[action] ?? { icon: Activity, color: 'text-slate-400', label: action }
}

function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export default function ActivityPage() {
  const [logs,    setLogs]    = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('')
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (filter) params.set('entityType', filter)
      const res  = await fetch(`/api/admin/activity?${params}`)
      const json = await res.json()
      setLogs(json.logs || [])
      setTotal(json.total || 0)
      setHasMore(json.hasMore || false)
    } catch {/* silent */}
    finally { setLoading(false) }
  }, [filter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [filter])

  const totalPages = Math.ceil(total / 30)

  return (
    <div className="max-w-3xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            Activity Log
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">All admin actions — articles, comments</p>
        </div>
        <button onClick={load} disabled={loading}
          className="p-2 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl w-fit">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f.key ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Log list */}
      <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-white/[0.04]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-white/[0.06] rounded w-48" />
                  <div className="h-3 bg-white/[0.06] rounded w-32" />
                </div>
                <div className="h-3 bg-white/[0.06] rounded w-16" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-600">
            <Activity className="w-8 h-8" />
            <p className="text-sm">No activity yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {logs.map((log) => {
              const meta   = getActionMeta(log.action)
              const Icon   = meta.icon
              const isArticle = log.entityType === 'article'
              return (
                <div key={log._id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">

                  {/* Icon bubble */}
                  <div className={`w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-500">
                        {isArticle ? (
                          <span className="flex items-center gap-1"><FileText className="w-2.5 h-2.5" /> article</span>
                        ) : (
                          <span className="flex items-center gap-1"><MessageCircle className="w-2.5 h-2.5" /> comment</span>
                        )}
                      </span>
                    </div>
                    {(log.entityTitle || log.details) && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {log.entityTitle || log.details}
                      </p>
                    )}
                  </div>

                  {/* Time */}
                  <span className="text-xs text-slate-600 shrink-0 mt-0.5">
                    {timeAgo(log.createdAt)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="space-y-2">
          <p className="text-center text-xs text-slate-500">
            {total} actions · Page {page} of {totalPages}
          </p>
          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
