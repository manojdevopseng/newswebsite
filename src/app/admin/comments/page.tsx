'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  MessageCircle, Check, X, AlertTriangle, Trash2, RefreshCw,
  ExternalLink, Pin, PinOff, CheckCheck, Flame, Search, Flag,
} from 'lucide-react'
import { AdminPagination } from '@/components/admin/shared/AdminPagination'
import Link from 'next/link'
import { toast } from 'sonner'

interface Comment {
  _id:           string
  name:          string
  email:         string
  content:       string
  status:        'pending' | 'approved' | 'spam'
  parentId:      string | null
  parentExcerpt: string | null
  parentName:    string | null
  ip:            string
  createdAt:     string
  likes:         number
  pinned:        boolean
  reported:      boolean
  reportCount:   number
  article:       { _id: string; title: string; slug: string } | null
}

const STATUS_TABS = [
  { key: 'pending',  label: 'Pending',  badgeColor: 'bg-amber-500/15 text-amber-400',     activeColor: 'text-amber-400'   },
  { key: 'approved', label: 'Approved', badgeColor: 'bg-emerald-500/15 text-emerald-400', activeColor: 'text-emerald-400' },
  { key: 'spam',     label: 'Spam',     badgeColor: 'bg-red-500/15 text-red-400',          activeColor: 'text-red-400'     },
  { key: 'reported', label: 'Reported', badgeColor: 'bg-orange-500/15 text-orange-400',   activeColor: 'text-orange-400'  },
  { key: 'all',      label: 'All',      badgeColor: 'bg-white/[0.06] text-slate-400',      activeColor: 'text-slate-400'   },
] as const

type StatusFilter = typeof STATUS_TABS[number]['key']

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function CommentsPage() {
  const [comments,      setComments]      = useState<Comment[]>([])
  const [loading,       setLoading]       = useState(true)
  const [filter,        setFilter]        = useState<StatusFilter>('pending')
  const [page,          setPage]          = useState(1)
  const [total,         setTotal]         = useState(0)
  const [pendingCount,  setPendingCount]  = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [spamCount,     setSpamCount]     = useState(0)
  const [totalCount,    setTotalCount]    = useState(0)
  const [reportedCount, setReportedCount] = useState(0)
  const [actionId,      setActionId]      = useState<string | null>(null)
  const [bulkLoading,   setBulkLoading]   = useState(false)
  const [search,        setSearch]        = useState('')
  const [searchInput,   setSearchInput]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: filter, page: String(page) })
      if (search) params.set('search', search)
      const res  = await fetch(`/api/admin/comments?${params}`)
      const json = await res.json()
      setComments(json.comments || [])
      setTotal(json.total || 0)
      setPendingCount(json.pendingCount   || 0)
      setApprovedCount(json.approvedCount || 0)
      setSpamCount(json.spamCount         || 0)
      setTotalCount(json.totalCount       || 0)
      setReportedCount(json.reportedCount || 0)
    } catch { toast.error('Failed to load comments') }
    finally  { setLoading(false) }
  }, [filter, page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [filter, search])

  async function updateStatus(id: string, status: string) {
    setActionId(id)
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Marked as ${status}`)
      load()
    } catch { toast.error('Action failed') }
    finally  { setActionId(null) }
  }

  async function togglePin(id: string, pinned: boolean) {
    setActionId(id)
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pinned: !pinned }),
      })
      if (!res.ok) throw new Error()
      toast.success(pinned ? 'Comment unpinned' : 'Comment pinned to top')
      load()
    } catch { toast.error('Action failed') }
    finally  { setActionId(null) }
  }

  async function deleteComment(id: string) {
    if (!confirm('Delete this comment and all its replies?')) return
    setActionId(id)
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      toast.success('Comment deleted')
      load()
    } catch { toast.error('Delete failed') }
    finally  { setActionId(null) }
  }

  async function bulkAction(action: 'approve-pending' | 'delete-spam') {
    const confirmMsg = action === 'approve-pending'
      ? `Approve all ${pendingCount} pending comments?`
      : `Delete all ${spamCount} spam comments permanently?`
    if (!confirm(confirmMsg)) return
    setBulkLoading(true)
    try {
      const res  = await fetch('/api/admin/comments/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error()
      toast.success(json.message)
      load()
    } catch { toast.error('Bulk action failed') }
    finally  { setBulkLoading(false) }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  const totalPages = Math.ceil(total / 20)
  const countFor = (key: string) =>
    key === 'pending'  ? pendingCount  : key === 'approved' ? approvedCount :
    key === 'spam'     ? spamCount     : key === 'reported'  ? reportedCount :
    totalCount

  return (
    <div className="max-w-5xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Comments
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-400">
                {pendingCount} pending
              </span>
            )}
            {reportedCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500/15 text-red-400">
                <Flag className="w-3 h-3" /> {reportedCount} reported
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Moderate reader comments</p>
        </div>
        <button onClick={load} disabled={loading}
          className="p-2 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Bulk actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => bulkAction('approve-pending')}
          disabled={bulkLoading || pendingCount === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Approve All Pending ({pendingCount})
        </button>
        <button
          onClick={() => bulkAction('delete-spam')}
          disabled={bulkLoading || spamCount === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Flame className="w-3.5 h-3.5" />
          Delete All Spam ({spamCount})
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl">
          {STATUS_TABS.map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === tab.key ? `bg-white/[0.1] ${tab.activeColor}` : 'text-slate-500 hover:text-slate-300'
              }`}>
              {tab.label}
              {!loading && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${tab.badgeColor}`}>
                  {countFor(tab.key)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search name or content…"
              className="pl-8 pr-3 py-1.5 text-sm bg-white/[0.04] border border-white/[0.06] rounded-lg text-slate-300 placeholder:text-slate-600 outline-none focus:border-white/[0.12] w-52 transition-colors"
            />
          </div>
          <button type="submit"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.06] text-slate-400 hover:text-white transition-colors">
            Search
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSearchInput(''); }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Comments list */}
      <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-white/[0.04]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse space-y-2">
                <div className="h-3 bg-white/[0.06] rounded w-48" />
                <div className="h-3 bg-white/[0.06] rounded w-full" />
                <div className="h-3 bg-white/[0.06] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-600">
            <MessageCircle className="w-8 h-8" />
            <p className="text-sm">{search ? `No results for "${search}"` : `No ${filter !== 'all' ? filter : ''} comments`}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {comments.map(comment => (
              <div key={comment._id}
                className={`p-4 hover:bg-white/[0.02] transition-colors ${comment.parentId ? 'pl-8 border-l-2 border-blue-500/20 ml-4' : ''}`}>

                {/* Reply-to context bar */}
                {comment.parentId && (
                  <div className="flex items-start gap-1.5 mb-2.5 text-xs text-slate-500 bg-white/[0.03] rounded-lg px-3 py-2">
                    <span className="text-blue-400 shrink-0">↩</span>
                    <span>
                      Reply to <span className="text-slate-400 font-medium">{comment.parentName || 'Unknown'}</span>
                      {comment.parentExcerpt && (
                        <span className="ml-1 italic text-slate-600">
                          &ldquo;{comment.parentExcerpt}{comment.parentExcerpt.length >= 80 ? '…' : ''}&rdquo;
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                      {comment.name[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-white">{comment.name}</span>
                    <span className="text-xs text-slate-500">{comment.email}</span>
                    {comment.parentId && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Reply</span>}
                    {comment.pinned   && <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent"><Pin className="w-2.5 h-2.5" />Pinned</span>}
                    {comment.reported && <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400"><Flag className="w-2.5 h-2.5" />{comment.reportCount}</span>}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      comment.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400'
                      : comment.status === 'spam'   ? 'bg-red-500/10 text-red-400'
                      : 'bg-amber-500/10 text-amber-400'
                    }`}>{comment.status}</span>
                    {comment.likes > 0 && <span className="text-xs text-slate-500">👍 {comment.likes}</span>}
                  </div>
                  <span className="text-xs text-slate-600 shrink-0">{formatDate(comment.createdAt)}</span>
                </div>

                {/* Article */}
                {comment.article && (
                  <Link href={`/admin/articles/${comment.article._id}`}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-accent transition-colors mb-2">
                    <ExternalLink className="w-3 h-3" />
                    {comment.article.title.slice(0, 70)}…
                  </Link>
                )}

                {/* Content */}
                <p className="text-sm text-slate-300 leading-relaxed mb-3">{comment.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {comment.status !== 'approved' && (
                    <button onClick={() => updateStatus(comment._id, 'approved')} disabled={actionId === comment._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {comment.status !== 'spam' && (
                    <button onClick={() => updateStatus(comment._id, 'spam')} disabled={actionId === comment._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50">
                      <AlertTriangle className="w-3.5 h-3.5" /> Spam
                    </button>
                  )}
                  {comment.status !== 'pending' && (
                    <button onClick={() => updateStatus(comment._id, 'pending')} disabled={actionId === comment._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] transition-colors disabled:opacity-50">
                      <X className="w-3.5 h-3.5" /> Pending
                    </button>
                  )}
                  {comment.status === 'approved' && !comment.parentId && (
                    <button onClick={() => togglePin(comment._id, comment.pinned)} disabled={actionId === comment._id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                        comment.pinned
                          ? 'bg-accent/10 text-accent hover:bg-accent/20'
                          : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]'
                      }`}>
                      {comment.pinned ? <><PinOff className="w-3.5 h-3.5" /> Unpin</> : <><Pin className="w-3.5 h-3.5" /> Pin</>}
                    </button>
                  )}
                  <button onClick={() => deleteComment(comment._id)} disabled={actionId === comment._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.04] text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50 ml-auto">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="space-y-2">
          <p className="text-center text-xs text-slate-500">
            {total} comment{total !== 1 ? 's' : ''} · Page {page} of {totalPages}
          </p>
          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
