import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Article {
  _id:        string
  title:      string
  slug:       string
  status:     'draft' | 'published' | 'archived'
  category:   { name: string; color: string; slug: string }
  publishedAt?: string
  createdAt:  string
  views:      number
}

const statusStyle = {
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  draft:     'bg-yellow-500/10  text-yellow-400  border-yellow-500/20',
  archived:  'bg-slate-500/10   text-slate-400   border-slate-500/20',
}

export function RecentArticles({ articles }: { articles: Article[] }) {
  return (
    <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Recent Articles</h3>
          <p className="text-xs text-slate-500 mt-0.5">Latest content</p>
        </div>
        <Link href="/admin/articles" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
          View all →
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-slate-500 text-sm">No articles yet</p>
          <Link href="/admin/articles/new" className="text-blue-400 text-sm hover:text-blue-300 mt-2 inline-block">
            Create your first article →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {articles.map((article) => (
            <div key={article._id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group">
              {/* Title + Category */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{article.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500" style={{ color: article.category?.color }}>
                    {article.category?.name}
                  </span>
                  <span className="text-slate-600 text-xs">·</span>
                  <span className="text-xs text-slate-500">
                    {article.publishedAt || article.createdAt
                      ? formatDistanceToNow(new Date(article.publishedAt || article.createdAt), { addSuffix: true })
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Views */}
              <div className="text-xs text-slate-500 w-16 text-right hidden sm:block">
                {(article.views || 0).toLocaleString()} views
              </div>

              {/* Status */}
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full border hidden md:inline-flex',
                statusStyle[article.status]
              )}>
                {article.status}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/admin/articles/${article._id}`}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/${article.category?.slug}/${article.slug}`}
                  target="_blank"
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
