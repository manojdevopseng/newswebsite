'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, Sparkles, Loader2, Eye, Languages, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { TipTapEditor }      from './TipTapEditor'
import { PublishPanel }      from './PublishPanel'
import { SeoPanel }          from './SeoPanel'
import { TaxonomyPanel }     from './TaxonomyPanel'
import { FeaturedImagePanel } from './FeaturedImagePanel'

interface Category { _id: string; name: string; color: string; slug: string }
interface Author   { _id: string; name: string }

interface ArticleData {
  _id?:           string
  title:          string
  slug:           string
  excerpt:        string
  content:        string
  contentHtml:    string
  // Hindi translation fields
  title_hi:       string
  excerpt_hi:     string
  contentHtml_hi: string
  featuredImage:  string
  category:       string
  author:         string
  tags:           string[]
  status:         'draft' | 'published' | 'archived'
  publishedAt:    string
  aiSummary:      string
  views?:         number
  seo: {
    metaTitle:       string
    metaDescription: string
    ogImage:         string
    canonicalUrl:    string
    noIndex:         boolean
  }
}

interface Props {
  initialData?: Partial<ArticleData> & { _id?: string; views?: number }
  categories:   Category[]
  authors:      Author[]
}

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

const EMPTY: ArticleData = {
  title: '', slug: '', excerpt: '', content: '', contentHtml: '',
  title_hi: '', excerpt_hi: '', contentHtml_hi: '',
  featuredImage: '', category: '', author: '', tags: [],
  status: 'draft', publishedAt: '', aiSummary: '',
  seo: { metaTitle: '', metaDescription: '', ogImage: '', canonicalUrl: '', noIndex: false },
}

export function ArticleEditor({ initialData, categories, authors }: Props) {
  const router   = useRouter()
  const isNew    = !initialData?._id
  const autoSaveRef     = useRef<ReturnType<typeof setTimeout>>(null)
  const saveArticleRef  = useRef<(mode: 'manual' | 'auto' | 'publish') => Promise<void>>(async () => {})
  const [saveStatus,      setSaveStatus]      = useState<'idle' | 'saving' | 'saved'>('idle')
  const [aiGenerating,    setAiGenerating]    = useState(false)
  const [contentTab,      setContentTab]      = useState<'en' | 'hi'>('en')
  const [deleting,        setDeleting]        = useState(false)

  const [data, setData] = useState<ArticleData>({
    ...EMPTY,
    ...initialData,
    category:   (initialData?.category as any)?._id ?? initialData?.category ?? '',
    author:     (initialData?.author as any)?._id   ?? initialData?.author   ?? '',
    seo:        { ...EMPTY.seo, ...(initialData?.seo ?? {}) },
  })

  const [slugEdited, setSlugEdited] = useState(!isNew)

  function update(field: keyof ArticleData, value: any) {
    setData(d => ({ ...d, [field]: value }))
  }

  // Auto-slug from title
  useEffect(() => {
    if (!slugEdited && data.title) update('slug', slugify(data.title))
  }, [data.title, slugEdited])

  // Auto-generate canonical URL from slug + category
  // Fires whenever slug or category changes — blank if either is missing
  useEffect(() => {
    const catSlug  = categories.find(c => c._id === data.category)?.slug ?? ''
    const siteUrl  = process.env.NEXT_PUBLIC_URL ?? 'https://techpulseglobe.com'
    const canonical = data.slug && catSlug ? `${siteUrl}/${catSlug}/${data.slug}` : ''
    setData(d => ({ ...d, seo: { ...d.seo, canonicalUrl: canonical } }))
  }, [data.slug, data.category]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save (10 seconds after last change, only for existing articles)
  // Uses a ref so the timer always calls the latest saveArticle — avoids stale-closure bug
  // where a stale draft-status snapshot would overwrite a just-published article.
  const triggerAutoSave = useCallback(() => {
    if (isNew) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => saveArticleRef.current('auto'), 10000)
  }, [isNew])

  useEffect(() => {
    triggerAutoSave()
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current) }
  }, [data, triggerAutoSave])

  async function saveArticle(mode: 'manual' | 'auto' | 'publish' = 'manual') {
    if (!data.title.trim()) { toast.error('Title is required'); return }
    if (!data.excerpt.trim()) { toast.error('Excerpt is required'); return }
    if (!data.category) { toast.error('Category is required'); return }
    if (!data.author) { toast.error('Author is required'); return }

    // Cancel any pending auto-save before a manual/publish save to avoid race conditions
    if (mode !== 'auto' && autoSaveRef.current) {
      clearTimeout(autoSaveRef.current)
      autoSaveRef.current = null
    }

    setSaveStatus('saving')
    const newStatus = mode === 'publish' ? 'published' : data.status
    const payload = {
      ...data,
      status: newStatus,
    }

    try {
      const url    = isNew ? '/api/admin/articles' : `/api/admin/articles/${initialData!._id}`
      const method = isNew ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      // Safe JSON parse — if server returns HTML (500 page) don't crash with parse error
      let json: any = {}
      try { json = await res.json() } catch { /* non-JSON response — handled below */ }
      if (!res.ok) throw new Error(json.error || `Server error (${res.status})`)

      // CRITICAL: Sync local status state so auto-save can't overwrite the new status
      if (mode === 'publish') {
        setData(d => ({ ...d, status: 'published' }))
      }

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)

      if (mode === 'auto') return

      // Refresh router cache so article list shows the correct status immediately
      router.refresh()

      if (mode === 'publish') toast.success(
        data.status === 'published' ? 'Article updated!' : 'Article published! 🎉'
      )
      else toast.success('Saved!')

      if (isNew) router.push(`/admin/articles/${json.data._id}`)
    } catch (err: any) {
      setSaveStatus('idle')
      toast.error(err.message || 'Save failed')
    }
  }

  // Keep ref always pointing to the latest saveArticle (must be after saveArticle is defined)
  saveArticleRef.current = saveArticle

  async function deleteArticle() {
    if (!window.confirm('Delete this article permanently? This cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/articles/${initialData!._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Article deleted')
      router.push('/admin/articles')
    } catch (err: any) {
      toast.error(err.message || 'Delete failed')
      setDeleting(false)
    }
  }

  function handlePreview() {
    if (!initialData?._id) {
      toast.error('Save the article first before previewing')
      return
    }
    if (contentTab === 'hi') {
      window.open(`/hi/preview/${initialData._id}`, '_blank')
    } else {
      window.open(`/preview/${initialData._id}`, '_blank')
    }
  }

  return (
    <div className="max-w-7xl">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/articles" className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">{isNew ? 'New Article' : 'Edit Article'}</h1>
            {saveStatus === 'saving' && <p className="text-xs text-slate-500">Saving...</p>}
            {saveStatus === 'saved'  && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Saved
              </p>
            )}
          </div>
        </div>
        {!isNew && (
          <button
            type="button"
            onClick={deleteArticle}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            {deleting ? 'Deleting…' : 'Delete Article'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

        {/* Left — Main Content */}
        <div className="space-y-5">

          {/* Language Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl w-fit">
            <button
              onClick={() => setContentTab('en')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                contentTab === 'en'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>🇺🇸</span> English
            </button>
            <button
              onClick={() => setContentTab('hi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                contentTab === 'hi'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Languages className="w-3 h-3" /> हिन्दी
              {data.title_hi && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 ml-0.5" />}
            </button>
          </div>

          {/* ── ENGLISH TAB ── */}
          {contentTab === 'en' && (
            <>
              {/* Title */}
              <div>
                <input
                  type="text"
                  placeholder="Article Title..."
                  value={data.title}
                  onChange={e => update('title', e.target.value)}
                  className="w-full bg-transparent text-3xl font-bold text-white placeholder-slate-600 focus:outline-none border-b border-white/[0.06] pb-3"
                />
              </div>

              {/* Slug */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 shrink-0">Slug:</span>
                <input
                  type="text"
                  value={data.slug}
                  onChange={e => { setSlugEdited(true); update('slug', e.target.value) }}
                  placeholder="auto-generated-from-title"
                  className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>

              {/* Excerpt */}
              <div>
                <textarea
                  rows={2}
                  placeholder="Short description (shown in cards, max 300 chars)..."
                  value={data.excerpt}
                  maxLength={300}
                  onChange={e => update('excerpt', e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20 transition-all resize-none"
                />
                <p className="text-xs text-slate-600 mt-1 text-right">{data.excerpt.length}/300</p>
              </div>

              {/* TipTap Editor */}
              <TipTapEditor
                content={data.contentHtml || data.content || ''}
                onChange={html => { update('contentHtml', html); update('content', html) }}
              />
            </>
          )}

          {/* ── HINDI TAB ── */}
          {contentTab === 'hi' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-xs text-orange-400/70 bg-orange-500/5 border border-orange-500/15 rounded-xl px-4 py-2.5">
                <Languages className="w-3.5 h-3.5 shrink-0" />
                <span>Hindi content is optional. If left empty, the English version will be shown on <code className="text-orange-300">/hi/…</code> pages.</span>
              </div>

              {/* Hindi Title */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">शीर्षक (Title in Hindi)</label>
                <input
                  type="text"
                  placeholder="हिन्दी में शीर्षक लिखें..."
                  value={data.title_hi}
                  onChange={e => update('title_hi', e.target.value)}
                  lang="hi"
                  className="w-full bg-transparent text-2xl font-bold text-white placeholder-slate-600 focus:outline-none border-b border-white/[0.06] pb-3"
                />
              </div>

              {/* Hindi Excerpt */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">सारांश (Excerpt in Hindi)</label>
                <textarea
                  rows={2}
                  placeholder="हिन्दी में संक्षिप्त विवरण (max 300 chars)..."
                  value={data.excerpt_hi}
                  maxLength={300}
                  lang="hi"
                  onChange={e => update('excerpt_hi', e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/30 transition-all resize-none"
                />
                <p className="text-xs text-slate-600 mt-1 text-right">{data.excerpt_hi.length}/300</p>
              </div>

              {/* Hindi Content */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">लेख (Article body in Hindi)</label>
                <TipTapEditor
                  content={data.contentHtml_hi || ''}
                  onChange={html => update('contentHtml_hi', html)}
                />
              </div>
            </div>
          )}

          {/* AI Summary */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">AI Summary <span className="text-slate-600 font-normal">(optional — shown as callout box)</span></label>
              <button
                type="button"
                disabled={aiGenerating || !data.title}
                onClick={async () => {
                  setAiGenerating(true)
                  try {
                    const res  = await fetch('/api/admin/ai/summary', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title: data.title, excerpt: data.excerpt, content: data.contentHtml }),
                    })
                    const json = await res.json()
                    if (!res.ok) throw new Error(json.error || 'Failed')
                    update('aiSummary', json.summary)
                    toast.success('AI summary generated')
                  } catch (e: any) {
                    toast.error(e.message || 'AI generation failed')
                  } finally {
                    setAiGenerating(false)
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {aiGenerating
                  ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                  : <><Sparkles className="w-3 h-3" /> Generate with AI</>}
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Write a short summary (shown as callout box in the article)…"
              value={data.aiSummary}
              onChange={e => update('aiSummary', e.target.value)}
              className="w-full bg-[#0f0f1a] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20 transition-all resize-none"
            />
          </div>
        </div>

        {/* Right — Sidebar Panels */}
        <div className="space-y-4">
          {/* Views stat for existing articles */}
          {!isNew && (initialData?.views ?? 0) > 0 && (
            <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Total Views</span>
              <span className="text-sm font-bold text-white">{(initialData!.views!).toLocaleString()}</span>
            </div>
          )}

          <PublishPanel
            status={data.status}
            publishedAt={data.publishedAt}
            slug={data.slug}
            isSaving={saveStatus === 'saving'}
            isNew={isNew}
            onStatusChange={s => update('status', s)}
            onPublishedAtChange={d => update('publishedAt', d)}
            onSave={() => saveArticle('manual')}
            onPublish={() => saveArticle('publish')}
            onPreview={!isNew ? handlePreview : undefined}
          />


          <FeaturedImagePanel
            value={data.featuredImage}
            slug={data.slug}
            onChange={url => setData(d => ({
              ...d,
              featuredImage: url,
              seo: { ...d.seo, ogImage: url },  // auto-sync ogImage
            }))}
          />

          <TaxonomyPanel
            categoryId={data.category}
            authorId={data.author}
            tags={data.tags}
            categories={categories}
            authors={authors}
            onCategoryChange={id => update('category', id)}
            onAuthorChange={id => update('author', id)}
            onTagsChange={tags => update('tags', tags)}
          />

          <SeoPanel
            seo={data.seo}
            onChange={seo => update('seo', seo)}
            title={data.title}
            excerpt={data.excerpt}
            slug={data.slug}
            featuredImage={data.featuredImage}
            categorySlug={categories.find(c => c._id === data.category)?.slug ?? ''}
          />
        </div>
      </div>
    </div>
  )
}
