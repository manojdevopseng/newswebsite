'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteArticleBtn({ id }: { id: string }) {
  const router     = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this article? This cannot be undone.')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Article deleted')
      router.refresh()
    } catch {
      toast.error('Delete failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all disabled:opacity-50"
      title="Delete"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
