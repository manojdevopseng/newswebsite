'use client'

import { Bookmark } from 'lucide-react'
import { useUserPrefsStore } from '@/store/userPrefsStore'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

interface BookmarkButtonProps {
  articleId: string
  className?: string
  /** 'icon' = square icon button (share rail), 'pill' = labelled pill button */
  variant?: 'icon' | 'pill'
}

export function BookmarkButton({ articleId, className, variant = 'icon' }: BookmarkButtonProps) {
  const { isInReadingList, addToReadingList, removeFromReadingList } = useUserPrefsStore()
  const saved = isInReadingList(articleId)

  function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (saved) {
      removeFromReadingList(articleId)
      toast.success('Bookmark removed')
    } else {
      addToReadingList(articleId)
      toast.success(
        <span className="flex items-center gap-2">
          Article saved!{' '}
          <Link href="/bookmarks" className="underline font-medium">
            View saved →
          </Link>
        </span>
      )
    }
  }

  if (variant === 'pill') {
    return (
      <button
        onClick={toggle}
        aria-label={saved ? 'Remove bookmark' : 'Save article'}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
          saved
            ? 'bg-accent/15 text-accent border border-accent/30'
            : 'bg-white/[0.06] text-slate-300 border border-white/[0.1] hover:bg-white/[0.1]',
          className
        )}
      >
        <Bookmark className={cn('w-4 h-4', saved && 'fill-accent')} />
        {saved ? 'Saved' : 'Save'}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? 'Remove bookmark' : 'Save article'}
      className={cn(
        'w-9 h-9 flex items-center justify-center rounded-lg transition-all',
        saved
          ? 'bg-accent/15 text-accent'
          : 'bg-white/[0.06] text-slate-400 hover:bg-white/[0.1] hover:text-white',
        className
      )}
    >
      <Bookmark className={cn('w-4 h-4', saved && 'fill-accent')} />
    </button>
  )
}
