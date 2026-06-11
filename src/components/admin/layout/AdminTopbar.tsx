'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Bell, Search, X, Loader2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, string> = {
  '/admin':              'Dashboard',
  '/admin/articles':     'Articles',
  '/admin/articles/new': 'New Article',
  '/admin/categories':   'Categories',
  '/admin/authors':      'Authors',
  '/admin/media':        'Media Library',
  '/admin/analytics':    'Analytics',
  '/admin/newsletter':   'Newsletter',
  '/admin/settings':     'Settings',
}

const statusStyle: Record<string, string> = {
  published: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  draft:     'bg-yellow-500/10  text-yellow-400  border border-yellow-500/20',
  archived:  'bg-slate-500/10   text-slate-400   border border-slate-500/20',
}

interface ArticleResult {
  _id:      string
  title:    string
  slug:     string
  status:   string
  category: { name: string; color: string } | null
}

export function AdminTopbar() {
  const pathname = usePathname()
  const router   = useRouter()

  const [open,        setOpen]        = useState(false)
  const [query,       setQuery]       = useState('')
  const [results,     setResults]     = useState<ArticleResult[]>([])
  const [loading,     setLoading]     = useState(false)
  const [activeIdx,   setActiveIdx]   = useState(-1)

  const inputRef    = useRef<HTMLInputElement>(null)
  const modalRef    = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const title = Object.entries(pageTitles)
    .reverse()
    .find(([key]) => pathname.startsWith(key))?.[1] ?? 'Admin'

  const now     = new Date()
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  // Open modal
  function openSearch() {
    setOpen(true)
    setQuery('')
    setResults([])
    setActiveIdx(-1)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // Global Ctrl+K shortcut
  useEffect(() => {
    function onGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }
    }
    document.addEventListener('keydown', onGlobalKey)
    return () => document.removeEventListener('keydown', onGlobalKey)
  }, [])

  // Close modal
  function closeSearch() {
    setOpen(false)
    setQuery('')
    setResults([])
    setActiveIdx(-1)
  }

  // Navigate to edit
  function goToArticle(article: ArticleResult) {
    closeSearch()
    router.push(`/admin/articles/${article._id}`)
  }

  // Fetch results with debounce
  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    try {
      const res  = await fetch(`/api/admin/articles/search?q=${encodeURIComponent(q)}&limit=8`)
      const json = await res.json()
      setResults(json.data || [])
      setActiveIdx(-1)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    debounceRef.current = setTimeout(() => fetchResults(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchResults])

  // Keyboard: Esc, ArrowUp, ArrowDown, Enter
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { closeSearch(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx(i => Math.min(i + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx(i => Math.max(i - 1, -1))
      }
      if (e.key === 'Enter' && activeIdx >= 0 && results[activeIdx]) {
        goToArticle(results[activeIdx])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, activeIdx])

  // Click outside to close
  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeSearch()
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const showResults = query.trim().length > 0

  return (
    <>
      {/* ── Topbar ──────────────────────────────────────────────────── */}
      <header className="h-14 bg-[#080810]/80 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-30">

        {/* Page Title */}
        <div>
          <h1 className="text-sm font-semibold text-white">{title}</h1>
          <p className="text-xs text-slate-500">{dateStr}</p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search pill — matches frontend style */}
          <button
            onClick={openSearch}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.09] transition-all duration-150 group"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs">Search</span>
            <kbd className="ml-1 px-1.5 py-0.5 text-[10px] rounded bg-white/[0.06] text-slate-500 group-hover:bg-white/[0.08] border border-white/[0.08]">
              Ctrl K
            </kbd>
          </button>
          {/* Mobile — icon only */}
          <button
            onClick={openSearch}
            className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all relative">
            <Bell className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold ml-1">
            A
          </div>
        </div>
      </header>

      {/* ── Search Modal ─────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div
            ref={modalRef}
            className="w-full max-w-xl bg-[#111118] border border-white/[0.10] rounded-2xl shadow-2xl overflow-hidden"
          >

            {/* Search Input Row */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by title or slug…"
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
              <div className="flex items-center gap-2">
                {loading && <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />}
                {query && (
                  <button
                    onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <kbd className="text-[10px] text-slate-600 bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results */}
            {showResults && (
              <div className="py-1.5 max-h-80 overflow-y-auto">
                {results.length === 0 && !loading && (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    No articles found for &quot;{query}&quot;
                  </div>
                )}

                {results.map((article, i) => (
                  <button
                    key={article._id}
                    onClick={() => goToArticle(article)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors group',
                      activeIdx === i ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                    )}
                  >
                    {/* Icon */}
                    <div className="mt-0.5 w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    {/* Title + Slug */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate leading-snug">
                        {article.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {article.slug}
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                      {article.category && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: article.category.color + '18', color: article.category.color }}
                        >
                          {article.category.name}
                        </span>
                      )}
                      <span className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize',
                        statusStyle[article.status] ?? statusStyle.archived
                      )}>
                        {article.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Footer hint */}
            {!showResults && (
              <div className="px-4 py-4 flex items-center gap-4 text-[11px] text-slate-600">
                <span><kbd className="bg-white/[0.04] border border-white/[0.06] rounded px-1 py-0.5">↑↓</kbd> Navigate</span>
                <span><kbd className="bg-white/[0.04] border border-white/[0.06] rounded px-1 py-0.5">↵</kbd> Open</span>
                <span><kbd className="bg-white/[0.04] border border-white/[0.06] rounded px-1 py-0.5">ESC</kbd> Close</span>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}
