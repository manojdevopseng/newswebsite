'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  ImageIcon, Upload, Trash2, Copy, Check,
  Grid3X3, List, Search, RefreshCw, X, FileImage,
  AlertCircle,
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface MediaFile {
  key:          string
  url:          string
  size:         number
  lastModified: string
  name:         string
  path:         string
  source:       'media' | 'article'
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function MediaPage() {
  const [files,        setFiles]        = useState<MediaFile[]>([])
  const [loading,      setLoading]      = useState(true)
  const [uploading,    setUploading]    = useState(false)
  const [view,         setView]         = useState<'grid' | 'list'>('grid')
  const [query,        setQuery]        = useState('')
  const [copied,       setCopied]       = useState<string | null>(null)
  const [selected,     setSelected]     = useState<string | null>(null)
  const [deleting,     setDeleting]     = useState<string | null>(null)
  const [dragOver,     setDragOver]     = useState(false)
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [source,       setSource]       = useState<'all' | 'media' | 'articles'>('all')
  const [sortBy,       setSortBy]       = useState<'newest' | 'oldest' | 'largest'>('newest')
  const fileRef  = useRef<HTMLInputElement>(null)

  const load = useCallback(async (src = source) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/admin/media?source=${src}`)
      const json = await res.json()
      setFiles(json.data || [])
    } catch { toast.error('Failed to load media') }
    finally { setLoading(false) }
  }, [source])

  useEffect(() => { load(source) }, [source])  // eslint-disable-line react-hooks/exhaustive-deps

  async function uploadFiles(fileList: FileList) {
    setUploading(true)
    let uploaded = 0
    for (const file of Array.from(fileList)) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('skipDimensionCheck', 'true')
        const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        uploaded++
      } catch (err: any) {
        toast.error(`Failed: ${file.name} — ${err.message}`)
      }
    }
    if (uploaded > 0) {
      toast.success(`${uploaded} file${uploaded > 1 ? 's' : ''} uploaded`)
      await load()
    }
    setUploading(false)
  }

  async function handleDelete(file: MediaFile) {
    if (!confirm(`Delete "${file.name}"?`)) return
    setDeleting(file.key)
    try {
      await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: file.key }),
      })
      setFiles(f => f.filter(x => x.key !== file.key))
      if (selected === file.key) setSelected(null)
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
    finally { setDeleting(null) }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
    toast.success('URL copied')
  }

  async function bulkDelete() {
    if (bulkSelected.size === 0) return
    if (!confirm(`Delete ${bulkSelected.size} files? This cannot be undone.`)) return
    setBulkDeleting(true)
    let deleted = 0
    for (const key of bulkSelected) {
      try {
        await fetch('/api/admin/media', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        })
        deleted++
      } catch { /* continue */ }
    }
    setFiles(f => f.filter(x => !bulkSelected.has(x.key)))
    setBulkSelected(new Set())
    setBulkDeleting(false)
    toast.success(`${deleted} file${deleted !== 1 ? 's' : ''} deleted`)
  }

  function toggleBulk(key: string) {
    setBulkSelected(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const filtered = files
    .filter(f => {
      const q = query.toLowerCase()
      return !q || f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') return a.lastModified < b.lastModified ? -1 : 1
      if (sortBy === 'largest') return b.size - a.size
      return b.lastModified > a.lastModified ? 1 : -1 // newest
    })
  const selectedFile = files.find(f => f.key === selected)

  return (
    <div className="flex gap-5 max-w-7xl" style={{ height: 'calc(100vh - 7rem)' }}>
      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-white">Media</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {filtered.length} of {files.length} files
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => load(source)} disabled={loading}
              className="p-2 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white transition-all disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white transition-all">
              {view === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </button>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => { if (e.target.files?.length) uploadFiles(e.target.files); e.target.value = '' }} />
          </div>
        </div>

        {/* Bulk delete bar */}
        {bulkSelected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-red-500/5 border border-red-500/20 rounded-xl">
            <span className="text-xs font-medium text-red-400">{bulkSelected.size} selected</span>
            <button onClick={bulkDelete} disabled={bulkDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50">
              <Trash2 className="w-3.5 h-3.5" /> {bulkDeleting ? 'Deleting…' : 'Delete Selected'}
            </button>
            <button onClick={() => setBulkSelected(new Set())} className="text-xs text-slate-500 hover:text-slate-300 ml-auto transition-colors">
              Clear
            </button>
          </div>
        )}

        {/* Filters row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Source tabs */}
          <div className="flex gap-1 bg-white/[0.04] p-1 rounded-lg text-xs">
            {(['all', 'media', 'articles'] as const).map(s => (
              <button key={s} onClick={() => setSource(s)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all capitalize ${
                  source === s ? 'bg-white/[0.1] text-white' : 'text-slate-400 hover:text-white'
                }`}>
                {s === 'all' ? 'All' : s === 'media' ? 'Uploads' : 'Articles'}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="largest">Largest first</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by filename or path…"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg pl-9 pr-9 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Drop zone */}
        <div
          className={`relative flex-1 overflow-y-auto rounded-xl transition-all border-2 ${
            dragOver ? 'border-blue-500 bg-blue-500/5' : 'border-transparent'
          }`}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault(); setDragOver(false)
            if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
          }}>

          {dragOver && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="text-center">
                <Upload className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                <p className="text-blue-300 font-medium">Drop to upload</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className={view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'space-y-2'}>
              {Array.from({ length: 12 }).map((_, i) =>
                view === 'grid'
                  ? <div key={i} className="aspect-square rounded-xl bg-white/[0.04] animate-pulse" />
                  : <div key={i} className="h-14 rounded-lg bg-white/[0.04] animate-pulse" />
              )}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileImage className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-500 text-sm">{query ? 'No files match your search' : 'No media yet'}</p>
              {!query && (
                <button onClick={() => fileRef.current?.click()}
                  className="text-blue-400 text-sm mt-2 hover:text-blue-300">
                  Upload first image →
                </button>
              )}
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(file => (
                <button key={file.key} onClick={() => setSelected(s => s === file.key ? null : file.key)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    bulkSelected.has(file.key) ? 'border-red-500/70' :
                    selected === file.key ? 'border-blue-500' : 'border-white/[0.06] hover:border-white/20'
                  } bg-white/[0.03]`}>
                  <Image src={file.url} alt={file.name} fill className="object-cover" sizes="200px"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <button type="button" onClick={e => { e.stopPropagation(); copyUrl(file.url) }}
                      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg transition-all w-full justify-center">
                      {copied === file.url ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied === file.url ? 'Copied!' : 'Copy URL'}
                    </button>
                    <button type="button" onClick={e => { e.stopPropagation(); handleDelete(file) }}
                      disabled={deleting === file.key}
                      className="flex items-center gap-1.5 bg-red-500/30 hover:bg-red-500/50 text-red-300 text-xs px-3 py-1.5 rounded-lg transition-all w-full justify-center">
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                  {/* Bulk select checkbox */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); toggleBulk(file.key) }}
                    className={`absolute top-1.5 left-1.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      bulkSelected.has(file.key)
                        ? 'bg-red-500 border-red-500'
                        : 'bg-black/40 border-white/30 opacity-0 group-hover:opacity-100'
                    }`}>
                    {bulkSelected.has(file.key) && <Check className="w-3 h-3 text-white" />}
                  </button>
                  {selected === file.key && !bulkSelected.has(file.key) && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map(file => (
                <div key={file.key} onClick={() => setSelected(s => s === file.key ? null : file.key)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
                    selected === file.key ? 'border-blue-500/50 bg-blue-500/5' : 'border-transparent hover:bg-white/[0.04]'
                  }`}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/[0.06] shrink-0 relative">
                    <Image src={file.url} alt={file.name} fill className="object-cover" sizes="40px"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(file.size)} · {formatDate(file.lastModified)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={e => { e.stopPropagation(); copyUrl(file.url) }}
                      className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all">
                      {copied === file.url ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(file) }}
                      disabled={deleting === file.key}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all disabled:opacity-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="w-64 shrink-0 hidden lg:flex flex-col bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4 gap-4 overflow-y-auto">
        {selectedFile ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Details</p>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-square rounded-lg overflow-hidden bg-white/[0.06] relative">
              <Image src={selectedFile.url} alt={selectedFile.name} fill className="object-contain" sizes="256px" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Filename</p>
                <p className="text-xs text-white break-all">{selectedFile.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Size</p>
                <p className="text-xs text-white">{formatBytes(selectedFile.size)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Uploaded</p>
                <p className="text-xs text-white">{formatDate(selectedFile.lastModified)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">URL</p>
                <div className="bg-white/[0.04] rounded-lg p-2 break-all text-xs text-slate-400 font-mono leading-relaxed">
                  {selectedFile.url}
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-auto">
              <button onClick={() => copyUrl(selectedFile.url)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 rounded-lg transition-all">
                {copied === selectedFile.url ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied === selectedFile.url ? 'Copied!' : 'Copy URL'}
              </button>
              <button onClick={() => handleDelete(selectedFile)}
                disabled={deleting === selectedFile.key}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm py-2 rounded-lg transition-all disabled:opacity-50">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Select an image</p>
              <p className="text-xs text-slate-600 mt-0.5">to see details</p>
            </div>
            <div className="w-full mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 text-left">Drag & drop images anywhere to upload</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
