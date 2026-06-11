'use client'

import { useState, useEffect } from 'react'

const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'wow',  emoji: '😮', label: 'Wow'  },
] as const

type ReactionType = 'like' | 'love' | 'fire' | 'wow'

interface Reactions { like: number; love: number; fire: number; wow: number }

interface Props {
  articleId: string
  initial?: Partial<Reactions>
}

export function ArticleReactions({ articleId, initial = {} }: Props) {
  const storageKey = `reacted-${articleId}`

  const [counts,  setCounts]  = useState<Reactions>({
    like: initial.like ?? 0,
    love: initial.love ?? 0,
    fire: initial.fire ?? 0,
    wow:  initial.wow  ?? 0,
  })
  const [reacted, setReacted] = useState<ReactionType | null>(null)
  const [bumped,  setBumped]  = useState<ReactionType | null>(null)

  // Load saved reaction from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey) as ReactionType | null
    if (saved) setReacted(saved)
  }, [storageKey])

  async function handleClick(type: ReactionType) {
    const isUndo = reacted === type

    // Optimistic update
    setCounts(c => ({
      ...c,
      [type]:  c[type] + (isUndo ? -1 : 1),
      ...(reacted && !isUndo ? { [reacted]: Math.max(0, c[reacted] - 1) } : {}),
    }))

    const newReacted = isUndo ? null : type
    setReacted(newReacted)
    if (newReacted) localStorage.setItem(storageKey, newReacted)
    else localStorage.removeItem(storageKey)

    // Animate
    if (!isUndo) { setBumped(type); setTimeout(() => setBumped(null), 400) }

    // Sync to server — undo old if switching, then add new
    try {
      if (reacted && !isUndo) {
        await fetch(`/api/articles/${articleId}/react`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: reacted, undo: true }),
        })
      }
      const res = await fetch(`/api/articles/${articleId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, undo: isUndo }),
      })
      const json = await res.json()
      if (json.reactions) setCounts(json.reactions)
    } catch { /* silent fail */ }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-500 mr-1">Reactions:</span>
      {REACTIONS.map(({ type, emoji, label }) => {
        const active  = reacted === type
        const count   = counts[type]
        const animate = bumped === type

        return (
          <button
            key={type}
            onClick={() => handleClick(type)}
            title={label}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
              border transition-all duration-200 select-none
              ${active
                ? 'bg-accent/15 border-accent/30 text-accent scale-105'
                : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.08]'}
              ${animate ? 'scale-125' : ''}
            `}
          >
            <span className={animate ? 'animate-bounce' : ''}>{emoji}</span>
            {count > 0 && (
              <span className="text-xs font-medium tabular-nums">{count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
