'use client'

import { useEffect, useState } from 'react'
import { Bookmark, Trash2 } from 'lucide-react'
import { useUserPrefsStore } from '@/store/userPrefsStore'
import { ArticleCard } from '@/components/article/ArticleCard'
import type { ArticlePreview } from '@/types'

export default function BookmarksPage() {
  const { readingList, removeFromReadingList } = useUserPrefsStore()
  const [articles,  setArticles]  = useState<ArticlePreview[]>([])
  const [loading,   setLoading]   = useState(false)

  useEffect(() => {
    if (readingList.length === 0) { setArticles([]); return }
    setLoading(true)
    fetch(`/api/articles?ids=${readingList.join(',')}`)
      .then(r => r.json())
      .then(json => setArticles(json.data ?? []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [readingList])

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-accent fill-accent" />
            Saved Articles
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {readingList.length} article{readingList.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        {readingList.length > 0 && (
          <button
            onClick={() => readingList.forEach(id => removeFromReadingList(id))}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Empty state */}
      {readingList.length === 0 && (
        <div className="text-center py-24">
          <Bookmark className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-400">No saved articles yet</h2>
          <p className="text-sm text-slate-600 mt-2">
            Click the bookmark icon on any article to save it for later.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {readingList.map(id => (
            <div key={id} className="h-64 bg-white/[0.04] rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Articles grid */}
      {!loading && articles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map(article => (
            <div key={article._id} className="relative group/card">
              <ArticleCard article={article} />
              <button
                onClick={() => removeFromReadingList(article._id)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-400 text-slate-400"
                title="Remove bookmark"
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Saved IDs with no matching article (deleted/unpublished) */}
      {!loading && readingList.length > 0 && articles.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm">
            Saved articles could not be found. They may have been removed.
          </p>
        </div>
      )}
    </div>
  )
}
