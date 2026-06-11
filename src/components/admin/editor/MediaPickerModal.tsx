'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Search, Check, ImageIcon, RefreshCw, FileImage } from 'lucide-react'

interface MediaFile {
  key:          string
  url:          string
  size:         number
  lastModified: string
  name:         string
  path:         string
  source:       'media' | 'article'
}

interface Props {
  onSelect: (url: string) => void
  onClose:  () => void
}

function formatBytes(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaPickerModal({ onSelect, onClose }: Props) {
  const [files,    setFiles]    = useState<MediaFile[]>([])
  const [loading,  setLoading]  = useState(true)
  const [query,    setQuery]    = useState('')
  const [source,   setSource]   = useState<'all' | 'media' | 'articles'>('all')
  const [selected, setSelected] = useState<MediaFile | null>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Load images
  async function load(src = source) {
    setLoading(true)
    try {
      const res  = await fetch(`/api/admin/media?source=${src}`)
      const json = await res.json()
      setFiles(json.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(source) }, [source]) // eslint-disable-line

  const filtered = files.filter(f => {
    const q = query.toLowerCase()
    return !q || f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-[#0d0d1a] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-white">Media Library</span>
            {!loading && (
              <span className="text-xs text-slate-500">
                {filtered.length} of {files.length} images
              </span>
            )}
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] shrink-0 flex-wrap">
          {/* Source tabs */}
          <div className="flex gap-1 bg-white/[0.04] p-1 rounded-lg text-xs">
            {(['all', 'media', 'articles'] as const).map(s => (
              <button key={s} onClick={() => { setSource(s); setSelected(null) }}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  source === s ? 'bg-white/[0.1] text-white' : 'text-slate-400 hover:text-white'
                }`}>
                {s === 'all' ? 'All' : s === 'media' ? 'Uploads' : 'Articles'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by filename or path…"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
            />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Refresh */}
          <button onClick={() => load(source)} disabled={loading}
            className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white transition-all disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
              <FileImage className="w-10 h-10 text-slate-600" />
              <p className="text-slate-500 text-sm">
                {query ? 'No images match your search' : 'No images found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map(file => (
                <button
                  key={file.key}
                  type="button"
                  onClick={() => setSelected(s => s?.key === file.key ? null : file)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all bg-white/[0.03] ${
                    selected?.key === file.key
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'border-white/[0.06] hover:border-white/25'
                  }`}
                >
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    className="object-cover"
                    sizes="160px"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />

                  {/* Hover name overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5
                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="text-white text-[10px] truncate">{file.name}</p>
                    <p className="text-slate-400 text-[9px]">{formatBytes(file.size)}</p>
                  </div>

                  {/* Selected checkmark */}
                  {selected?.key === file.key && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer — selected preview + confirm */}
        <div className="shrink-0 border-t border-white/[0.06] px-5 py-4 flex items-center gap-4">
          {selected ? (
            <>
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/[0.06] shrink-0 relative">
                <Image src={selected.url} alt={selected.name} fill className="object-cover" sizes="48px" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{selected.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(selected.size)}</p>
              </div>

              {/* Confirm */}
              <button
                type="button"
                onClick={() => onSelect(selected.url)}
                className="shrink-0 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all"
              >
                Use this image
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Click an image to select it
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] text-slate-400 hover:text-white text-sm rounded-lg transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
