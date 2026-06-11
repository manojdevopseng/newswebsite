import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/admin/auth'
import dbConnect from '@/lib/db/mongoose'
import ArticleModel from '@/lib/db/models/Article'
import { Tag, Search } from 'lucide-react'

export const metadata: Metadata = { title: 'Tags' }
export const dynamic = 'force-dynamic'

export default async function TagsPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await dbConnect()

  // Aggregate all tags with article count
  const tagStats = await ArticleModel.aggregate([
    { $match: { status: 'published' } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort:  { count: -1 } },
  ])

  const draftTagStats = await ArticleModel.aggregate([
    { $match: { status: { $in: ['draft', 'archived'] } } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
  ])

  const draftMap: Record<string, number> = {}
  draftTagStats.forEach((t: any) => { draftMap[t._id] = t.count })

  const total = tagStats.reduce((s: number, t: any) => s + t.count, 0)

  return (
    <div className="max-w-4xl space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Tag className="w-5 h-5 text-accent" /> Tags
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {tagStats.length} unique tags across {total} published articles
        </p>
      </div>

      {/* Tags grid */}
      {tagStats.length === 0 ? (
        <div className="py-16 text-center text-slate-600">
          <Tag className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No tags found in published articles</p>
        </div>
      ) : (
        <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_100px_100px_120px] gap-4 px-5 py-3 border-b border-white/[0.06] text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span>Tag</span>
            <span className="text-right">Published</span>
            <span className="text-right">Drafts</span>
            <span className="text-right">Action</span>
          </div>

          {tagStats.map((tag: any) => {
            const maxCount = tagStats[0].count
            const barWidth = Math.round((tag.count / maxCount) * 100)
            return (
              <div key={tag._id}
                className="grid grid-cols-[1fr_100px_100px_120px] gap-4 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">#{tag._id}</span>
                  </div>
                  {/* Bar */}
                  <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden w-full max-w-xs">
                    <div className="h-full bg-accent/40 rounded-full" style={{ width: `${barWidth}%` }} />
                  </div>
                </div>
                <span className="text-sm text-emerald-400 text-right font-medium">{tag.count}</span>
                <span className="text-sm text-slate-500 text-right">{draftMap[tag._id] || 0}</span>
                <div className="flex justify-end">
                  <Link
                    href={`/admin/articles?search=${encodeURIComponent(tag._id)}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors">
                    <Search className="w-3 h-3" /> View Articles
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
