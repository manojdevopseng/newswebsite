'use client'

import { Globe, FileText, Archive, Calendar, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  status:      'draft' | 'published' | 'archived'
  publishedAt: string
  slug:        string
  isSaving:    boolean
  isNew:       boolean
  onStatusChange:      (s: 'draft' | 'published' | 'archived') => void
  onPublishedAtChange: (d: string) => void
  onSave:      () => void
  onPublish:   () => void
  onPreview?:  () => void
}

/**
 * Convert a UTC ISO string → local datetime-local input value (YYYY-MM-DDTHH:mm)
 * so the browser input shows the user's local time, not UTC.
 */
function utcToLocalInput(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  // Subtract timezone offset so toISOString gives local wall-clock time
  const localMs = d.getTime() - d.getTimezoneOffset() * 60_000
  return new Date(localMs).toISOString().slice(0, 16)
}

/**
 * Convert datetime-local input value (treated as LOCAL time by the browser)
 * back to a UTC ISO string for storage.
 */
function localInputToISO(local: string): string {
  if (!local) return ''
  // new Date('YYYY-MM-DDTHH:mm') in a browser context = local time → .toISOString() = UTC
  const d = new Date(local)
  return isNaN(d.getTime()) ? '' : d.toISOString()
}

const statusOptions = [
  { value: 'draft',     label: 'Draft',     icon: FileText, color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20' },
  { value: 'published', label: 'Published', icon: Globe,    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { value: 'archived',  label: 'Archived',  icon: Archive,  color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20' },
] as const

export function PublishPanel({
  status, publishedAt, slug,
  isSaving, isNew,
  onStatusChange, onPublishedAtChange,
  onSave, onPublish, onPreview,
}: Props) {
  return (
    <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white">Publish</h3>
      </div>

      <div className="p-4 space-y-4">

        {/* Status */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Status</label>
          <div className="space-y-1.5">
            {statusOptions.map(opt => {
              const Icon    = opt.icon
              const active  = status === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onStatusChange(opt.value)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm transition-all',
                    active ? opt.bg : 'border-transparent hover:bg-white/[0.03] text-slate-400'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', active ? opt.color : 'text-slate-500')} />
                  <span className={active ? 'text-white font-medium' : ''}>{opt.label}</span>
                  {active && <div className={cn('ml-auto w-1.5 h-1.5 rounded-full', opt.color.replace('text-', 'bg-'))} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Publish Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> Publish Date
          </label>
          <input
            type="datetime-local"
            value={utcToLocalInput(publishedAt)}
            onChange={e => onPublishedAtChange(localInputToISO(e.target.value))}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 [color-scheme:dark]"
          />
          <p className="text-[10px] text-slate-600">Your local timezone</p>
        </div>

        {/* Slug preview */}
        {slug && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">URL Preview</label>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500 font-mono break-all">/{slug}</p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="w-full flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-slate-300 text-sm py-2 rounded-lg transition-all"
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="w-full bg-white/[0.06] hover:bg-white/[0.10] disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-all"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition-all"
          >
            {isNew ? 'Publish Article' : status === 'published' ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}
