'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  PenSquare, ExternalLink, Eye, Trash2, Copy,
  CheckSquare, Square, Globe, Clock, Loader2, BarChart2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ArticleAnalyticsModal } from './ArticleAnalyticsModal'

interface Article {
  _id:         string
  title:       string
  slug:        string
  status:      string
  category:    { name: string; color: string; slug: string } | null
  publishedAt: string | null
  createdAt:   string
  views:       number
}

interface Props {
  articles: Article[]
  status:   string
}

const statusStyle: Record<string, string> = {
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  draft:     'bg-yellow-500/10  text-yellow-400  border-yellow-500/20',
  archived:  'bg-slate-500/10   text-slate-400   border-slate-500/20',
  scheduled: 'bg-blue-500/10   text-blue-400    border-blue-500/20',
}

function isScheduled(article: Article) {
  return article.status === 'published' && article.publishedAt && new Date(article.publishedAt) > new Date();
}

export function ArticlesTable({ articles, status }: Props) {
  const router     = useRouter()
  const [pending, startTransition] = useTransition()
  const [selected,      setSelected]      = useState<Set<string>>(new Set())
  const [bulkLoading,   setBulkLoading]   = useState(false)
  const [dupLoading,    setDupLoading]    = useState<string | null>(null)
  const [analyticsId,   setAnalyticsId]   = useState<string | null>(null)

  const allSelected = articles.length > 0 && selected.size === articles.length

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(articles.map(a => a._id)))
  }

  async function bulkAction(action: string) {
    if (selected.size === 0) return
    const label = action === 'delete' ? `Delete ${selected.size} articles?` : `${action} ${selected.size} articles?`
    if (!confirm(label)) return
    setBulkLoading(true)
    try {
      const res = await fetch('/api/admin/articles/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: [...selected] }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Done — ${selected.size} articles updated`)
      setSelected(new Set())
      startTransition(() => router.refresh())
    } catch {
      toast.error('Bulk action failed')
    } finally {
      setBulkLoading(false)
    }
  }

  async function duplicate(id: string, title: string) {
    setDupLoading(id)
    try {
      const res  = await fetch(`/api/admin/articles/${id}/duplicate`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error()
      toast.success('Duplicate created as draft')
      router.push(`/admin/articles/${json.data._id}`)
    } catch {
      toast.error('Duplicate failed')
    } finally {
      setDupLoading(null)
    }
  }

  async function deleteOne(id: string) {
    if (!confirm('Delete this article?')) return
    try {
      await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
      toast.success('Article deleted')
      startTransition(() => router.refresh())
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <>
      {/* Analytics Modal */}
      {analyticsId && (
        <ArticleAnalyticsModal
          articleId={analyticsId}
          onClose={() => setAnalyticsId(null)}
        />
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 flex-wrap p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
          <span className="text-xs font-medium text-blue-400">{selected.size} selected</span>
          <div className="flex gap-2 ml-2 flex-wrap">
            {status !== 'published' && (
              <button onClick={() => bulkAction('publish')} disabled={bulkLoading}
                className="px-3 py-1.5 text-xs rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                Publish
              </button>
            )}
            {status !== 'draft' && (
              <button onClick={() => bulkAction('draft')} disabled={bulkLoading}
                className="px-3 py-1.5 text-xs rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors disabled:opacity-50">
                Move to Draft
              </button>
            )}
            {status !== 'archived' && (
              <button onClick={() => bulkAction('archive')} disabled={bulkLoading}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 transition-colors disabled:opacity-50">
                Archive
              </button>
            )}
            <button onClick={() => bulkAction('delete')} disabled={bulkLoading}
              className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50">
              Delete
            </button>
          </div>
          {bulkLoading && <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin ml-auto" />}
          <button onClick={() => setSelected(new Set())} className="text-xs text-slate-500 hover:text-slate-300 ml-auto transition-colors">
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl overflow-hidden">
        {articles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-slate-500">No articles found</p>
            <Link href="/admin/articles/new" className="text-blue-400 text-sm hover:text-blue-300 mt-2 inline-block">
              Create your first article →
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[32px_1fr_160px_100px_70px_140px] gap-2 px-4 py-3 border-b border-white/[0.06] text-xs font-medium text-slate-500 uppercase tracking-wider">
              <button onClick={toggleAll} className="flex items-center">
                {allSelected
                  ? <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                  : <Square className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400" />}
              </button>
              <span>Title</span>
              <span>Category</span>
              <span>Status</span>
              <span className="text-right">Views</span>
              <span className="text-right">Date</span>
            </div>

            {articles.map((article) => {
              const scheduled = isScheduled(article)
              const displayStatus = scheduled ? 'scheduled' : article.status

              return (
                <div key={article._id}
                  className="grid grid-cols-[32px_1fr_160px_100px_70px_140px] gap-2 px-4 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group items-center">

                  {/* Checkbox */}
                  <button onClick={() => toggle(article._id)} className="flex items-center">
                    {selected.has(article._id)
                      ? <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                      : <Square className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500 transition-colors" />}
                  </button>

                  {/* Title */}
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{article.title}</p>
                    <p className="text-xs text-slate-500 font-mono truncate mt-0.5">/{article.slug}</p>
                  </div>

                  {/* Category */}
                  <div>
                    {article.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ color: article.category.color, background: article.category.color + '20' }}>
                        {article.category.name}
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1">
                    {scheduled && <Clock className="w-3 h-3 text-blue-400 shrink-0" />}
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border', statusStyle[displayStatus] || statusStyle.draft)}>
                      {scheduled ? 'Scheduled' : article.status}
                    </span>
                  </div>

                  {/* Views */}
                  <div className="flex items-center justify-end gap-1 text-xs text-slate-500">
                    <Eye className="w-3 h-3" />{(article.views || 0).toLocaleString()}
                  </div>

                  {/* Date + Actions */}
                  <div className="flex items-center justify-end gap-1 pl-3 border-l border-white/[0.1]">
                    <span className="text-xs text-slate-500 group-hover:hidden">
                      {scheduled
                        ? `in ${formatDistanceToNow(new Date(article.publishedAt!))}`
                        : formatDistanceToNow(new Date(article.publishedAt || article.createdAt), { addSuffix: true })}
                    </span>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <Link href={`/admin/articles/${article._id}`}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all" title="Edit">
                        <PenSquare className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => duplicate(article._id, article.title)}
                        disabled={dupLoading === article._id}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all" title="Duplicate">
                        {dupLoading === article._id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      {article.status === 'published' && !scheduled && (
                        <Link href={`/${article.category?.slug}/${article.slug}`} target="_blank"
                          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all" title="View live">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      <button onClick={() => setAnalyticsId(article._id)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-blue-400 transition-all" title="Analytics">
                        <BarChart2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteOne(article._id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </>
  )
}
