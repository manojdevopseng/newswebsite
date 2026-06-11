'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, FolderOpen, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Category {
  _id:          string
  name:         string
  slug:         string
  description:  string
  color:        string
  articleCount: number
}

const PRESET_COLORS = [
  '#60a5fa', '#a78bfa', '#34d399', '#f97316',
  '#22d3ee', '#fb923c', '#4ade80', '#f59e0b',
  '#f87171', '#818cf8', '#2dd4bf', '#e879f9',
]

const EMPTY = { name: '', slug: '', description: '', color: '#60a5fa' }

function slugify(t: string) {
  return t.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f0f1a] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
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

function CategoryForm({
  initial, onSave, onClose, saving,
}: {
  initial:  typeof EMPTY
  onSave:   (data: typeof EMPTY) => void
  onClose:  () => void
  saving:   boolean
}) {
  const [form, setForm] = useState(initial)
  const [slugEdited, setSlugEdited] = useState(!!initial.slug)

  function update(k: keyof typeof EMPTY, v: string) {
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === 'name' && !slugEdited) next.slug = slugify(v)
      return next
    })
  }

  return (
    <div className="p-5 space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400">Name *</label>
        <input value={form.name} onChange={e => update('name', e.target.value)}
          placeholder="e.g. Artificial Intelligence"
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400">Slug *</label>
        <input value={form.slug}
          onChange={e => { setSlugEdited(true); update('slug', e.target.value) }}
          placeholder="artificial-intelligence"
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400">Description</label>
        <textarea value={form.description} onChange={e => update('description', e.target.value)}
          rows={2} placeholder="Short description..."
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none" />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400">Color</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(c => (
            <button key={c} type="button" onClick={() => update('color', c)}
              className="w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center"
              style={{ background: c, borderColor: form.color === c ? 'white' : 'transparent' }}>
              {form.color === c && <Check className="w-3 h-3 text-white" />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-white/20" style={{ background: form.color }} />
          <input type="text" value={form.color} onChange={e => update('color', e.target.value)}
            className="w-28 bg-white/[0.03] border border-white/[0.08] rounded-lg px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-blue-500/50" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white text-sm transition-all">
          Cancel
        </button>
        <button onClick={() => onSave(form)} disabled={saving || !form.name || !form.slug}
          className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-all">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export function CategoriesClient({ initialData }: { initialData: Category[] }) {
  const router  = useRouter()
  const [cats,  setCats]   = useState(initialData)
  const [modal, setModal]  = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Category | null>(null)
  const [saving, setSaving]   = useState(false)

  async function handleSave(form: typeof EMPTY) {
    setSaving(true)
    try {
      if (modal === 'add') {
        const res  = await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setCats(c => [...c, { ...json.data, _id: json.data._id, articleCount: 0 }])
        toast.success('Category created')
      } else if (modal === 'edit' && editing) {
        const res  = await fetch(`/api/admin/categories/${editing._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setCats(c => c.map(x => x._id === editing._id ? { ...x, ...json.data } : x))
        toast.success('Category updated')
      }
      setModal(null)
      setEditing(null)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(cat: Category) {
    if (cat.articleCount > 0) { toast.error(`Cannot delete — ${cat.articleCount} articles use this category`); return }
    if (!confirm(`Delete "${cat.name}"?`)) return
    try {
      await fetch(`/api/admin/categories/${cat._id}`, { method: 'DELETE' })
      setCats(c => c.filter(x => x._id !== cat._id))
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Categories</h1>
          <p className="text-sm text-slate-400 mt-0.5">{cats.length} categories</p>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.length === 0 ? (
          <div className="col-span-3 bg-[#0f0f1a] border border-white/[0.06] rounded-xl py-16 text-center">
            <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No categories yet</p>
            <button onClick={() => setModal('add')} className="text-blue-400 text-sm mt-2 hover:text-blue-300">
              Create first category →
            </button>
          </div>
        ) : cats.map(cat => (
          <div key={cat._id}
            className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4 hover:border-white/10 transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: cat.color + '20', border: `1px solid ${cat.color}40` }}>
                  <FolderOpen className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{cat.name}</p>
                  <p className="text-xs text-slate-500 font-mono">/{cat.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditing(cat); setModal('edit') }}
                  className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(cat)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {cat.description && <p className="text-xs text-slate-500 mt-3 line-clamp-2">{cat.description}</p>}
            <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ color: cat.color, background: cat.color + '15' }}>
                {cat.articleCount} articles
              </span>
              <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
            </div>
          </div>
        ))}
      </div>

      {modal === 'add' && (
        <Modal title="New Category" onClose={() => setModal(null)}>
          <CategoryForm initial={{ ...EMPTY }} onSave={handleSave} onClose={() => setModal(null)} saving={saving} />
        </Modal>
      )}
      {modal === 'edit' && editing && (
        <Modal title="Edit Category" onClose={() => { setModal(null); setEditing(null) }}>
          <CategoryForm
            initial={{ name: editing.name, slug: editing.slug, description: editing.description, color: editing.color }}
            onSave={handleSave} onClose={() => { setModal(null); setEditing(null) }} saving={saving} />
        </Modal>
      )}
    </div>
  )
}
