'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, User, X, Twitter, Linkedin } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface Author {
  _id:          string
  name:         string
  slug:         string
  bio:          string
  avatar:       string
  twitter:      string
  linkedin:     string
  expertise:    string[]
  articleCount: number
}

const EMPTY = { name: '', slug: '', bio: '', avatar: '', twitter: '', linkedin: '', expertise: '' }

function slugify(t: string) {
  return t.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f0f1a] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] sticky top-0 bg-[#0f0f1a]">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function AuthorForm({ initial, onSave, onClose, saving }: {
  initial:  typeof EMPTY
  onSave:   (data: typeof EMPTY) => void
  onClose:  () => void
  saving:   boolean
}) {
  const [form, setForm]       = useState(initial)
  const [slugEdited, setSlugEdited] = useState(!!initial.slug)
  const [uploading, setUploading]   = useState(false)

  function update(k: keyof typeof EMPTY, v: string) {
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === 'name' && !slugEdited) next.slug = slugify(v)
      return next
    })
  }

  async function uploadAvatar(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('skipDimensionCheck', 'true')
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      update('avatar', json.url)
      toast.success('Avatar uploaded')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const inputCls = "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"

  return (
    <div className="p-5 space-y-4">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/[0.06] border border-white/[0.08] overflow-hidden flex items-center justify-center shrink-0 relative">
          {form.avatar
            ? <Image src={form.avatar} alt="Avatar" fill className="object-cover" sizes="64px" />
            : <User className="w-7 h-7 text-slate-500" />}
        </div>
        <div>
          <label className="cursor-pointer text-xs text-blue-400 hover:text-blue-300 transition-colors">
            {uploading ? 'Uploading...' : 'Upload photo'}
            <input type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f) }} />
          </label>
          <p className="text-xs text-slate-600 mt-0.5">JPG, PNG, WebP</p>
          {form.avatar && (
            <button type="button" onClick={() => update('avatar', '')}
              className="text-xs text-red-400 hover:text-red-300 mt-0.5 block">Remove</button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400">Name *</label>
        <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="John Doe" className={inputCls} />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400">Slug *</label>
        <input value={form.slug} onChange={e => { setSlugEdited(true); update('slug', e.target.value) }}
          placeholder="john-doe" className={`${inputCls} font-mono`} />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400">Bio</label>
        <textarea value={form.bio} onChange={e => update('bio', e.target.value)}
          rows={3} placeholder="Short bio..." className={`${inputCls} resize-none`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Twitter className="w-3 h-3" /> Twitter
          </label>
          <input value={form.twitter} onChange={e => update('twitter', e.target.value)}
            placeholder="@handle" className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Linkedin className="w-3 h-3" /> LinkedIn
          </label>
          <input value={form.linkedin} onChange={e => update('linkedin', e.target.value)}
            placeholder="linkedin.com/in/..." className={inputCls} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400">Expertise <span className="text-slate-600 font-normal">(comma separated)</span></label>
        <input value={form.expertise} onChange={e => update('expertise', e.target.value)}
          placeholder="AI, Machine Learning, Finance" className={inputCls} />
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white text-sm transition-all">Cancel</button>
        <button onClick={() => onSave(form)} disabled={saving || !form.name || !form.slug}
          className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-all">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export function AuthorsClient({ initialData }: { initialData: Author[] }) {
  const router    = useRouter()
  const [authors, setAuthors] = useState(initialData)
  const [modal,   setModal]   = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Author | null>(null)
  const [saving,  setSaving]  = useState(false)

  async function handleSave(form: typeof EMPTY) {
    setSaving(true)
    const payload = { ...form, expertise: form.expertise.split(',').map(s => s.trim()).filter(Boolean) }
    try {
      if (modal === 'add') {
        const res  = await fetch('/api/admin/authors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setAuthors(a => [...a, { ...json.data, _id: json.data._id, articleCount: 0 }])
        toast.success('Author created')
      } else if (modal === 'edit' && editing) {
        const res  = await fetch(`/api/admin/authors/${editing._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setAuthors(a => a.map(x => x._id === editing._id ? { ...x, ...json.data } : x))
        toast.success('Author updated')
      }
      setModal(null); setEditing(null); router.refresh()
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(author: Author) {
    if (author.articleCount > 0) { toast.error(`Cannot delete — ${author.articleCount} articles by this author`); return }
    if (!confirm(`Delete "${author.name}"?`)) return
    try {
      await fetch(`/api/admin/authors/${author._id}`, { method: 'DELETE' })
      setAuthors(a => a.filter(x => x._id !== author._id))
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Authors</h1>
          <p className="text-sm text-slate-400 mt-0.5">{authors.length} authors</p>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
          <Plus className="w-4 h-4" /> New Author
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {authors.length === 0 ? (
          <div className="col-span-2 bg-[#0f0f1a] border border-white/[0.06] rounded-xl py-16 text-center">
            <User className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No authors yet</p>
            <button onClick={() => setModal('add')} className="text-blue-400 text-sm mt-2 hover:text-blue-300">Add first author →</button>
          </div>
        ) : authors.map(author => (
          <div key={author._id} className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4 hover:border-white/10 transition-all group">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/[0.08] overflow-hidden flex items-center justify-center shrink-0 relative">
                {author.avatar
                  ? <Image src={author.avatar} alt={author.name} fill className="object-cover" sizes="48px" />
                  : <span className="text-lg font-bold text-slate-400">{author.name[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{author.name}</p>
                    <p className="text-xs text-slate-500 font-mono">/{author.slug}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditing(author); setModal('edit') }}
                      className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(author)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {author.bio && <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{author.bio}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-slate-500">{author.articleCount} articles</span>
                  {author.twitter && <Twitter className="w-3 h-3 text-slate-600" />}
                  {author.linkedin && <Linkedin className="w-3 h-3 text-slate-600" />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal === 'add' && (
        <Modal title="New Author" onClose={() => setModal(null)}>
          <AuthorForm initial={{ ...EMPTY }} onSave={handleSave} onClose={() => setModal(null)} saving={saving} />
        </Modal>
      )}
      {modal === 'edit' && editing && (
        <Modal title="Edit Author" onClose={() => { setModal(null); setEditing(null) }}>
          <AuthorForm
            initial={{ name: editing.name, slug: editing.slug, bio: editing.bio, avatar: editing.avatar, twitter: editing.twitter, linkedin: editing.linkedin, expertise: editing.expertise?.join(', ') || '' }}
            onSave={handleSave} onClose={() => { setModal(null); setEditing(null) }} saving={saving} />
        </Modal>
      )}
    </div>
  )
}
