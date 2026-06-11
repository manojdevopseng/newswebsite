'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Link2, AlertTriangle, CheckCircle2, Info, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { MediaPickerModal } from './MediaPickerModal'

interface Props {
  value:    string
  onChange: (url: string) => void
  slug?:    string   // article slug → uploads to articles/{slug}/featured.webp
}

interface UploadResult {
  url:    string
  width:  number
  height: number
}

const MIN_WIDTH  = 1200
const MIN_HEIGHT = 630

export function FeaturedImagePanel({ value, onChange, slug }: Props) {
  const [dragging,    setDragging]    = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [urlInput,    setUrlInput]    = useState(false)
  const [urlVal,      setUrlVal]      = useState('')
  const [imgInfo,     setImgInfo]     = useState<{ w: number; h: number } | null>(null)
  const [tooSmall,    setTooSmall]    = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [showPicker,  setShowPicker]  = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File, force = false) {
    if (!file.type.startsWith('image/')) { toast.error('Only images allowed'); return }
    setUploading(true)
    setTooSmall(false)
    setPendingFile(null)

    try {
      const fd = new FormData()
      fd.append('file', file)
      if (force) fd.append('skipDimensionCheck', 'true')
      if (slug)  fd.append('slug', slug)   // → articles/{slug}/featured.webp

      const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()

      // Image too small — show warning + let user decide
      if (res.status === 422 && json.tooSmall) {
        setTooSmall(true)
        setPendingFile(file)
        setImgInfo({ w: json.width, h: json.height })
        toast.warning(`Image is ${json.width}×${json.height}px — too small for Google Discover`)
        return
      }

      if (!res.ok) throw new Error(json.error)

      onChange(json.url)
      setImgInfo({ w: json.width, h: json.height })
      toast.success('Image uploaded ✓')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const isGoodSize = imgInfo ? (imgInfo.w >= MIN_WIDTH && imgInfo.h >= MIN_HEIGHT) : null

  return (
    <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Featured Image</h3>
          {/* Google Discover badge */}
          <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
            Google Discover
          </span>
        </div>
        {value && (
          <button type="button" onClick={() => { onChange(''); setImgInfo(null); setTooSmall(false) }}
            className="text-slate-500 hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">

        {/* Requirement info */}
        <div className="flex items-start gap-2 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500">
            Min <span className="text-white font-medium">1200×630px</span> required for Google Discover &amp; News
          </p>
        </div>

        {/* Preview */}
        {value ? (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden aspect-video bg-black border border-white/[0.06]">
              <Image src={value} alt="Featured" fill className="object-cover" sizes="300px" />
            </div>

            {/* Dimension status */}
            {imgInfo && (
              <div className={cn(
                'flex items-center gap-2 text-xs px-3 py-2 rounded-lg border',
                isGoodSize
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
              )}>
                {isGoodSize
                  ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                }
                <span>
                  {imgInfo.w}×{imgInfo.h}px
                  {isGoodSize ? ' — Perfect for Google Discover ✓' : ' — Too small for Discover'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Upload zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) uploadFile(f) }}
              onClick={() => fileRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all',
                dragging
                  ? 'border-blue-500/50 bg-blue-500/5'
                  : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02]'
              )}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400">Uploading & optimizing...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-slate-500" />
                  <p className="text-xs text-slate-400 font-medium">Drop image or click to upload</p>
                  <p className="text-xs text-slate-600">PNG, JPG, WebP · max 10MB · min 1200×630</p>
                </div>
              )}
            </div>

            {/* Too small warning — let user force upload */}
            {tooSmall && pendingFile && imgInfo && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-300">
                    <p className="font-medium">Image too small ({imgInfo.w}×{imgInfo.h}px)</p>
                    <p className="text-yellow-400/70 mt-0.5">
                      Google Discover needs min 1200×630px. This image may not appear in Discover feed.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setTooSmall(false); setPendingFile(null) }}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-white/[0.05] text-slate-400 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => uploadFile(pendingFile, true)}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition-all"
                  >
                    Upload anyway
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = '' }} />

        {/* Media Picker Modal */}
        {showPicker && (
          <MediaPickerModal
            onSelect={url => {
              onChange(url)
              setImgInfo(null)   // dimension info N/A for pre-uploaded images
              setShowPicker(false)
              toast.success('Image selected from Media Library ✓')
            }}
            onClose={() => setShowPicker(false)}
          />
        )}

        {/* Secondary actions */}
        <div className="flex items-center gap-3">
          {/* Pick from Media Library */}
          <button type="button" onClick={() => setShowPicker(true)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors">
            <FolderOpen className="w-3 h-3" />
            Pick from Media
          </button>

          <span className="text-white/10 text-xs">|</span>

          {/* URL input toggle */}
          <button type="button" onClick={() => setUrlInput(v => !v)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors">
            <Link2 className="w-3 h-3" />
            {urlInput ? 'Cancel' : 'Use URL'}
          </button>
        </div>

        {urlInput && (
          <div className="flex gap-2">
            <input type="url" placeholder="https://... (1200×630px recommended)"
              value={urlVal} onChange={e => setUrlVal(e.target.value)}
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50" />
            <button type="button"
              onClick={() => { if (urlVal) { onChange(urlVal); setUrlVal(''); setUrlInput(false); toast.info('URL set — make sure it\'s 1200×630px or larger') } }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-all">
              Set
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
