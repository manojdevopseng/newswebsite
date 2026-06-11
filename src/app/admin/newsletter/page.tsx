'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Mail, Users, UserMinus, Search, Trash2, RefreshCw,
  Download, X, ToggleLeft, ToggleRight, Send, Loader2,
} from 'lucide-react'
import { AdminPagination } from '@/components/admin/shared/AdminPagination'
import { toast } from 'sonner'

interface Subscriber {
  _id:          string
  email:        string
  status:       'active' | 'unsubscribed'
  source:       string
  subscribedAt: string
}

interface Stats {
  active:       number
  unsubscribed: number
  total:        number
}

const TABS = [
  { key: 'all',          label: 'All' },
  { key: 'active',       label: 'Active' },
  { key: 'unsubscribed', label: 'Unsubscribed' },
] as const

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats,       setStats]       = useState<Stats>({ active: 0, unsubscribed: 0, total: 0 })
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState<typeof TABS[number]['key']>('all')
  const [query,       setQuery]       = useState('')
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [total,       setTotal]       = useState(0)
  const [deleting,    setDeleting]    = useState<string | null>(null)
  const [sending,     setSending]     = useState(false)

  const load = useCallback(async (p = page, q = query, t = tab) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: '50', status: t, search: q })
      const res  = await fetch(`/api/admin/newsletter?${params}`)
      const json = await res.json()
      setSubscribers(json.data || [])
      setTotal(json.total || 0)
      setTotalPages(json.totalPages || 1)
      setStats(json.stats || { active: 0, unsubscribed: 0, total: 0 })
    } catch { toast.error('Failed to load subscribers') }
    finally { setLoading(false) }
  }, [page, query, tab])

  useEffect(() => { load(1, query, tab) }, [tab])
  useEffect(() => { load(page, query, tab) }, [page])

  function handleSearch(q: string) {
    setQuery(q)
    setPage(1)
    load(1, q, tab)
  }

  async function handleDelete(sub: Subscriber) {
    if (!confirm(`Remove ${sub.email}?`)) return
    setDeleting(sub._id)
    try {
      await fetch('/api/admin/newsletter', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sub._id }),
      })
      setSubscribers(s => s.filter(x => x._id !== sub._id))
      setStats(st => ({
        ...st,
        total: st.total - 1,
        [sub.status]: Math.max(0, st[sub.status] - 1),
      }))
      toast.success('Removed')
    } catch { toast.error('Failed') }
    finally { setDeleting(null) }
  }

  async function sendDigest() {
    if (!confirm(`Send weekly digest to ${stats.active} active subscribers?`)) return
    setSending(true)
    try {
      const res  = await fetch('/api/admin/newsletter/send-digest', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to send')
      toast.success(`✅ Digest sent to ${json.sent} subscribers (${json.articles} articles)`)
      if (json.failed > 0) toast.error(`${json.failed} emails failed`)
    } catch (e: any) {
      toast.error(e.message || 'Failed to send digest')
    } finally {
      setSending(false)
    }
  }

  async function toggleStatus(sub: Subscriber) {
    const next = sub.status === 'active' ? 'unsubscribed' : 'active'
    try {
      const res  = await fetch('/api/admin/newsletter', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sub._id, status: next }),
      })
      const json = await res.json()
      setSubscribers(s => s.map(x => x._id === sub._id ? { ...x, status: next } : x))
      toast.success(`Marked as ${next}`)
    } catch { toast.error('Failed') }
  }

  async function exportCsv() {
    try {
      toast.info('Preparing export…')
      // Fetch ALL subscribers (not just current page) with current filters
      const params = new URLSearchParams({ page: '1', limit: '10000', status: tab, search: query })
      const res    = await fetch(`/api/admin/newsletter?${params}`)
      const json   = await res.json()
      const all: Subscriber[] = json.data || []

      const rows = [['Email', 'Status', 'Source', 'Subscribed At']]
      all.forEach(s => rows.push([
        s.email,
        s.status,
        s.source,
        new Date(s.subscribedAt).toLocaleDateString('en-IN'),
      ]))

      const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = `subscribers-${tab}-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${all.length} subscribers`)
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Newsletter</h1>
          <p className="text-sm text-slate-400 mt-0.5">{stats.total.toLocaleString()} total subscribers</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load(page, query, tab)} disabled={loading}
            className="p-2 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={exportCsv}
            className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={sendDigest}
            disabled={sending || stats.active === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
          >
            {sending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
              : <><Send className="w-4 h-4" /> Send Digest</>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Users}      label="Total Subscribers" value={stats.total}        color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={Mail}       label="Active"             value={stats.active}       color="bg-green-500/10 text-green-400" />
        <StatCard icon={UserMinus}  label="Unsubscribed"       value={stats.unsubscribed} color="bg-slate-500/10 text-slate-400" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.04] p-1 rounded-lg">
          {TABS.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === t.key ? 'bg-white/[0.1] text-white' : 'text-slate-400 hover:text-white'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={query} onChange={e => handleSearch(e.target.value)}
            placeholder="Search emails…"
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg pl-9 pr-9 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" />
          {query && (
            <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 border-b border-white/[0.06] text-xs font-medium text-slate-500 uppercase tracking-wide">
          <span>Email</span>
          <span className="text-center">Status</span>
          <span>Subscribed</span>
          <span />
        </div>

        {loading ? (
          <div className="divide-y divide-white/[0.04]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3">
                <div className="h-4 bg-white/[0.06] rounded animate-pulse w-48" />
                <div className="h-5 bg-white/[0.06] rounded-full animate-pulse w-20" />
                <div className="h-4 bg-white/[0.06] rounded animate-pulse w-24" />
                <div className="h-4 bg-white/[0.06] rounded animate-pulse w-8" />
              </div>
            ))}
          </div>
        ) : subscribers.length === 0 ? (
          <div className="py-16 text-center">
            <Mail className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No subscribers found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {subscribers.map(sub => (
              <div key={sub._id}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-4 py-3 hover:bg-white/[0.02] transition-colors group">
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{sub.email}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{sub.source}</p>
                </div>
                <button onClick={() => toggleStatus(sub)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:opacity-80 ${
                    sub.status === 'active'
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-slate-500/15 text-slate-400'
                  }`}>
                  {sub.status === 'active'
                    ? <ToggleRight className="w-3.5 h-3.5" />
                    : <ToggleLeft className="w-3.5 h-3.5" />}
                  {sub.status === 'active' ? 'Active' : 'Unsub'}
                </button>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(sub.subscribedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <button onClick={() => handleDelete(sub)} disabled={deleting === sub._id}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all disabled:opacity-50">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-4 border-t border-white/[0.06] space-y-3">
            <p className="text-center text-xs text-slate-500">
              Showing {Math.min((page - 1) * 50 + 1, total)}–{Math.min(page * 50, total)} of {total}
            </p>
            <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}
