'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Tag, ChevronDown } from 'lucide-react'

/* ── Minimal dark-themed custom select (portal-based) ───────────── */
interface SelectOption { value: string; label: string }

interface DropPos { top: number; left: number; width: number }

function DarkSelect({
  value, onChange, options, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  placeholder: string
}) {
  const [open,    setOpen]    = useState(false)
  const [dropPos, setDropPos] = useState<DropPos>({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropRef    = useRef<HTMLDivElement>(null)

  // Ensure we're client-side before using createPortal
  useEffect(() => { setMounted(true) }, [])

  function openDropdown() {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    setOpen(true)
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node
      if (triggerRef.current?.contains(target) || dropRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  // Reposition on scroll — follow the trigger button instead of closing abruptly
  useEffect(() => {
    if (!open) return
    function onScroll() {
      if (!triggerRef.current) { setOpen(false); return }
      const rect = triggerRef.current.getBoundingClientRect()
      // Close only if trigger has scrolled completely out of viewport
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setOpen(false)
        return
      }
      // Otherwise reposition dropdown to stay aligned with trigger
      setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
    window.addEventListener('scroll', onScroll, true)
    return () => window.removeEventListener('scroll', onScroll, true)
  }, [open])

  const selected = options.find(o => o.value === value)

  const dropdown = (
    <div
      ref={dropRef}
      style={{
        position:  'fixed',
        top:       dropPos.top,
        left:      dropPos.left,
        width:     dropPos.width,
        zIndex:    9999,
        maxHeight: '240px',
        overflowY: 'auto',
      }}
      className="bg-[#1a1a2e] border border-white/[0.1] rounded-lg shadow-2xl"
    >
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => { onChange(opt.value); setOpen(false) }}
          className={`w-full text-left px-3 py-2 text-sm transition-colors
            ${opt.value === value
              ? 'bg-blue-500/20 text-blue-300'
              : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => open ? setOpen(false) : openDropdown()}
        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:border-blue-500/50 transition-all hover:border-white/[0.15]"
      >
        <span className={selected ? 'text-white' : 'text-slate-500'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Portal: renders at document.body level — never clipped by any parent overflow */}
      {open && mounted && createPortal(dropdown, document.body)}
    </div>
  )
}

interface Category { _id: string; name: string; color: string; slug: string }
interface Author   { _id: string; name: string }

interface Props {
  categoryId:  string
  authorId:    string
  tags:        string[]
  categories:  Category[]
  authors:     Author[]
  onCategoryChange: (id: string) => void
  onAuthorChange:   (id: string) => void
  onTagsChange:     (tags: string[]) => void
}

export function TaxonomyPanel({
  categoryId, authorId, tags,
  categories, authors,
  onCategoryChange, onAuthorChange, onTagsChange,
}: Props) {
  const [tagInput, setTagInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase()
    if (t && !tags.includes(t) && tags.length < 10) {
      onTagsChange([...tags, t])
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    onTagsChange(tags.filter(t => t !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white">Taxonomy</h3>
      </div>

      <div className="p-4 space-y-4">

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">Category *</label>
          <DarkSelect
            value={categoryId}
            onChange={onCategoryChange}
            placeholder="Select category..."
            options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
          />
        </div>

        {/* Author */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">Author *</label>
          <DarkSelect
            value={authorId}
            onChange={onAuthorChange}
            placeholder="Select author..."
            options={authors.map(a => ({ value: a._id, label: a.name }))}
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Tag className="w-3 h-3" /> Tags
            <span className="text-slate-600 font-normal">(press Enter or comma)</span>
          </label>

          <div
            className="min-h-[44px] bg-white/[0.03] border border-white/[0.08] rounded-lg px-2 py-1.5 flex flex-wrap gap-1.5 cursor-text focus-within:border-blue-500/50 transition-all"
            onClick={() => inputRef.current?.focus()}
          >
            {tags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => tagInput && addTag(tagInput)}
              placeholder={tags.length === 0 ? 'Add tags...' : ''}
              className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
