'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Globe, Twitter, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── SEO Score ──────────────────────────────────────────────────────────────────
interface ScoreItem { label: string; pass: boolean; warn?: boolean }

function calcSeoScore(
  seo: SeoData,
  title: string,
  excerpt: string,
  slug: string,
  featuredImage: string,
): { score: number; items: ScoreItem[] } {
  const effectiveTitle = seo.metaTitle || title
  const effectiveDesc  = seo.metaDescription || excerpt
  const effectiveImage = seo.ogImage || featuredImage

  const items: ScoreItem[] = [
    {
      label: 'Meta title present',
      pass:  effectiveTitle.length > 0,
    },
    {
      label: `Meta title length (${effectiveTitle.length}/60 chars)`,
      pass:  effectiveTitle.length >= 40 && effectiveTitle.length <= 65,
      warn:  effectiveTitle.length > 0 && (effectiveTitle.length < 40 || effectiveTitle.length > 65),
    },
    {
      label: 'Meta description present',
      pass:  effectiveDesc.length > 0,
    },
    {
      label: `Meta description length (${effectiveDesc.length}/160 chars)`,
      pass:  effectiveDesc.length >= 100 && effectiveDesc.length <= 165,
      warn:  effectiveDesc.length > 0 && (effectiveDesc.length < 100 || effectiveDesc.length > 165),
    },
    {
      label: 'Featured image set',
      pass:  effectiveImage.length > 0,
    },
    {
      label: `Article title length (${title.length} chars)`,
      pass:  title.length >= 40 && title.length <= 80,
      warn:  title.length > 0 && (title.length < 40 || title.length > 80),
    },
    {
      label: 'Excerpt present',
      pass:  excerpt.length >= 80,
      warn:  excerpt.length > 0 && excerpt.length < 80,
    },
    {
      label: `Slug length (${slug.length} chars)`,
      pass:  slug.length > 0 && slug.length <= 75,
      warn:  slug.length > 75,
    },
    {
      label: 'Page is indexable',
      pass:  !seo.noIndex,
    },
  ]

  // Pass = 11pts, Warn = 5pts, Fail = 0pts — max ~99, normalize to 100
  const raw   = items.reduce((s, i) => s + (i.pass ? 11 : i.warn ? 5 : 0), 0)
  const score = Math.min(100, Math.round((raw / (items.length * 11)) * 100))
  return { score, items }
}

function SeoScore({ score, items }: { score: number; items: ScoreItem[] }) {
  const [expanded, setExpanded] = useState(false)
  const color = score >= 80 ? 'text-green-400' : score >= 55 ? 'text-yellow-400' : 'text-red-400'
  const bar   = score >= 80 ? 'bg-green-500'   : score >= 55 ? 'bg-yellow-500'   : 'bg-red-500'
  const label = score >= 80 ? 'Good'            : score >= 55 ? 'Needs work'      : 'Poor'

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all duration-500', bar)} style={{ width: `${score}%` }} />
        </div>
        <span className={cn('text-xs font-semibold tabular-nums shrink-0', color)}>
          {score}/100
        </span>
        <span className={cn('text-xs shrink-0', color)}>{label}</span>
        {expanded ? <ChevronUp className="w-3 h-3 text-slate-500 shrink-0" /> : <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />}
      </button>

      {expanded && (
        <ul className="space-y-1.5 pt-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-xs">
              {item.pass
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                : item.warn
                ? <AlertCircle  className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                : <XCircle      className="w-3.5 h-3.5 text-red-400 shrink-0" />}
              <span className={item.pass ? 'text-slate-400' : item.warn ? 'text-yellow-400/80' : 'text-red-400/80'}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface SeoData {
  metaTitle:       string
  metaDescription: string
  ogImage:         string
  canonicalUrl:    string
  noIndex:         boolean
}

interface Props {
  seo:           SeoData
  onChange:      (seo: SeoData) => void
  title?:        string
  excerpt?:      string
  slug?:         string
  featuredImage?: string
  categorySlug?: string
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length
  return (
    <span className={cn('text-xs', len > max ? 'text-red-400' : len > max * 0.85 ? 'text-yellow-400' : 'text-slate-500')}>
      {len}/{max}
    </span>
  )
}

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + '…' : str
}

function GooglePreview({ title, description, slug, categorySlug }: {
  title: string; description: string; slug: string; categorySlug: string
}) {
  const siteBase  = process.env.NEXT_PUBLIC_URL || 'https://techpulseglobe.com'
  const domain    = siteBase.replace(/^https?:\/\//, '')
  const breadcrumb = categorySlug && slug
    ? `${domain} › ${categorySlug} › ${slug}`
    : domain

  const displayTitle = truncate(title || 'Article Title', 60)
  const displayDesc  = truncate(description || 'Article description will appear here…', 160)

  return (
    <div className="rounded-lg bg-white p-4 space-y-0.5">
      {/* Favicon + URL row */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
          <span className="text-[9px] font-bold text-slate-600">T</span>
        </div>
        <div>
          <p className="text-xs text-slate-800 leading-tight font-medium">TechPulseGlobe</p>
          <p className="text-[11px] text-slate-500 leading-tight">{breadcrumb}</p>
        </div>
      </div>
      {/* Title */}
      <p className="text-[17px] text-[#1a0dab] leading-snug hover:underline cursor-pointer font-normal">
        {displayTitle}
      </p>
      {/* Description */}
      <p className="text-sm text-[#4d5156] leading-snug mt-0.5">{displayDesc}</p>
    </div>
  )
}

function TwitterPreview({ title, description, image, slug, categorySlug }: {
  title: string; description: string; image: string; slug: string; categorySlug: string
}) {
  const siteBase = process.env.NEXT_PUBLIC_URL || 'https://techpulseglobe.com'
  const domain   = siteBase.replace(/^https?:\/\//, '')

  const displayTitle = truncate(title || 'Article Title', 70)
  const displayDesc  = truncate(description || 'Article description will appear here…', 125)

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
      {/* Card image */}
      <div className="relative w-full h-40 bg-slate-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-slate-300 text-xs">No featured image</span>
          </div>
        )}
      </div>
      {/* Card text */}
      <div className="p-3">
        <p className="text-xs text-slate-500 mb-1">{domain}</p>
        <p className="text-sm font-bold text-slate-900 leading-tight">{displayTitle}</p>
        <p className="text-xs text-slate-500 mt-1 leading-snug">{displayDesc}</p>
      </div>
    </div>
  )
}

export function SeoPanel({ seo, onChange, title = '', excerpt = '', slug = '', featuredImage = '', categorySlug = '' }: Props) {
  const [open,        setOpen]        = useState(true)
  const [previewMode, setPreviewMode] = useState<'google' | 'twitter'>('google')

  const { score, items } = calcSeoScore(seo, title, excerpt, slug, featuredImage)

  function update(key: keyof SeoData, value: string | boolean) {
    onChange({ ...seo, [key]: value })
  }

  const previewTitle = seo.metaTitle       || title
  const previewDesc  = seo.metaDescription || excerpt
  const previewImage = seo.ogImage         || featuredImage

  return (
    <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 border-b border-white/[0.06] flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">SEO</h3>
          <span className={cn(
            'text-xs font-semibold px-1.5 py-0.5 rounded',
            score >= 80 ? 'bg-green-500/15 text-green-400'
            : score >= 55 ? 'bg-yellow-500/15 text-yellow-400'
            : 'bg-red-500/15 text-red-400'
          )}>
            {score}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="p-4 space-y-4">

          {/* SEO Score bar */}
          <SeoScore score={score} items={items} />

          <div className="border-t border-white/[0.06]" />

          {/* Meta Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400">Meta Title</label>
              <CharCount value={seo.metaTitle} max={60} />
            </div>
            <input
              type="text"
              placeholder="Leave blank to use article title"
              value={seo.metaTitle}
              onChange={e => update('metaTitle', e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400">Meta Description</label>
              <CharCount value={seo.metaDescription} max={160} />
            </div>
            <textarea
              rows={3}
              placeholder="Leave blank to use excerpt"
              value={seo.metaDescription}
              onChange={e => update('metaDescription', e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
            />
          </div>

          {/* OG Image */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">OG Image URL</label>
            <input
              type="url"
              placeholder="Defaults to featured image"
              value={seo.ogImage}
              onChange={e => update('ogImage', e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* Canonical URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Canonical URL</label>
            <input
              type="url"
              placeholder="Leave blank for default"
              value={seo.canonicalUrl}
              onChange={e => update('canonicalUrl', e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* noIndex */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={seo.noIndex}
                onChange={e => update('noIndex', e.target.checked)}
                className="sr-only"
              />
              <div className={cn(
                'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                seo.noIndex ? 'bg-blue-500 border-blue-500' : 'border-white/20 bg-white/[0.03]'
              )}>
                {seo.noIndex && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
              noIndex — Hide from Google
            </span>
          </label>

          {/* ── Preview ───────────────────────────────────────────────── */}
          <div className="pt-3 border-t border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Preview</span>
              <div className="flex gap-1 bg-white/[0.04] p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewMode('google')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                    previewMode === 'google' ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  <Globe className="w-3 h-3" /> Google
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('twitter')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                    previewMode === 'twitter' ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  <Twitter className="w-3 h-3" /> Twitter
                </button>
              </div>
            </div>

            {previewMode === 'google' ? (
              <GooglePreview
                title={previewTitle}
                description={previewDesc}
                slug={slug}
                categorySlug={categorySlug}
              />
            ) : (
              <TwitterPreview
                title={previewTitle}
                description={previewDesc}
                image={previewImage}
                slug={slug}
                categorySlug={categorySlug}
              />
            )}
          </div>

        </div>
      )}
    </div>
  )
}
