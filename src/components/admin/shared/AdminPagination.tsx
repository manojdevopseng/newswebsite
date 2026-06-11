'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  page:          number
  totalPages:    number
  /** For server-rendered pages: return the URL for page p */
  buildHref?:    (p: number) => string
  /** For client-rendered pages: called when user picks a page */
  onPageChange?: (p: number) => void
}

/** Build the visible page range with ellipsis.
 *  Always shows: 1, 2, current-2…current+2, last-1, last
 *  Adds '...' between gaps > 1.
 */
function buildRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const shown = new Set<number>([
    1, 2,
    ...Array.from({ length: 5 }, (_, i) => current - 2 + i).filter(p => p >= 1 && p <= total),
    total - 1, total,
  ])

  const sorted = [...shown].sort((a, b) => a - b)
  const result: (number | '...')[] = []
  let prev = 0

  for (const p of sorted) {
    if (p - prev > 1) result.push('...')
    result.push(p)
    prev = p
  }

  return result
}

export function AdminPagination({ page, totalPages, buildHref, onPageChange }: Props) {
  if (totalPages <= 1) return null

  const range = buildRange(page, totalPages)

  function Item({
    targetPage,
    disabled,
    children,
  }: {
    targetPage: number
    disabled?:  boolean
    children:   React.ReactNode
  }) {
    const isActive = targetPage === page
    const cls = cn(
      'min-w-[2rem] h-8 px-2 rounded-lg text-sm flex items-center justify-center transition-all select-none font-medium',
      isActive   ? 'bg-blue-600 text-white pointer-events-none'
      : disabled ? 'opacity-30 cursor-not-allowed text-slate-500 pointer-events-none'
      : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white cursor-pointer'
    )

    if (disabled || isActive) {
      return <span className={cls}>{children}</span>
    }

    if (buildHref) {
      return (
        <Link href={buildHref(targetPage)} className={cls}>
          {children}
        </Link>
      )
    }

    return (
      <button
        type="button"
        onClick={() => onPageChange?.(targetPage)}
        className={cls}
      >
        {children}
      </button>
    )
  }

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      {/* ← Prev */}
      <Item targetPage={page - 1} disabled={page <= 1}>
        <ChevronLeft className="w-4 h-4" />
      </Item>

      {/* Page numbers + ellipsis */}
      {range.map((p, i) =>
        p === '...'
          ? (
            <span
              key={`dots-${i}`}
              className="w-8 h-8 flex items-center justify-center text-slate-600 text-sm select-none"
            >
              …
            </span>
          )
          : (
            <Item key={p} targetPage={p}>
              {p}
            </Item>
          )
      )}

      {/* Next → */}
      <Item targetPage={page + 1} disabled={page >= totalPages}>
        <ChevronRight className="w-4 h-4" />
      </Item>
    </div>
  )
}
