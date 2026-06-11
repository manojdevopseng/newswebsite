'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { createPortal } from 'react-dom'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import CharacterCount from '@tiptap/extension-character-count'
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'
import Suggestion from '@tiptap/suggestion'
import { useEffect, useReducer, useRef, useCallback, useState } from 'react'
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Highlighter,
  List, ListOrdered, Quote, Minus,
  AlignLeft, AlignCenter, AlignRight,
  Link2, Image as ImageIcon, Undo, Redo, Code,
  ChevronDown, Type, Search, Maximize2, X, Replace,
  ListTree, Keyboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  content:  string
  onChange: (html: string) => void
}

/* ─── Slash Command Definitions ──────────────────────────────── */
type SlashCmd = {
  title: string; desc: string; icon: string
  keys: string[]
  cmd: (editor: any, range: any) => void
}

const SLASH_COMMANDS: SlashCmd[] = [
  { title: 'Paragraph',     desc: 'Normal text',      icon: '¶',   keys: ['p','paragraph','text'],
    cmd: (e, r) => e.chain().focus().deleteRange(r).setParagraph().run() },
  { title: 'Heading 1',     desc: 'Large heading',    icon: 'H1',  keys: ['h1','heading','title'],
    cmd: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 1 }).run() },
  { title: 'Heading 2',     desc: 'Section heading',  icon: 'H2',  keys: ['h2','heading','section'],
    cmd: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 2 }).run() },
  { title: 'Heading 3',     desc: 'Sub heading',      icon: 'H3',  keys: ['h3','heading','sub'],
    cmd: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 3 }).run() },
  { title: 'Bullet List',   desc: 'Unordered list',   icon: '•',   keys: ['ul','bullet','list'],
    cmd: (e, r) => e.chain().focus().deleteRange(r).toggleBulletList().run() },
  { title: 'Numbered List', desc: 'Ordered list',     icon: '1.',  keys: ['ol','numbered','ordered'],
    cmd: (e, r) => e.chain().focus().deleteRange(r).toggleOrderedList().run() },
  { title: 'Blockquote',    desc: 'Quote block',      icon: '"',   keys: ['quote','blockquote'],
    cmd: (e, r) => e.chain().focus().deleteRange(r).setBlockquote().run() },
  { title: 'Code Block',    desc: 'Code snippet',     icon: '</>',  keys: ['code','pre','snippet'],
    cmd: (e, r) => e.chain().focus().deleteRange(r).setCodeBlock().run() },
  { title: 'Table',         desc: '3×3 table',        icon: '⊞',   keys: ['table','grid'],
    cmd: (e, r) => e.chain().focus().deleteRange(r).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { title: 'Divider',       desc: 'Horizontal line',  icon: '—',   keys: ['hr','divider','line'],
    cmd: (e, r) => e.chain().focus().deleteRange(r).setHorizontalRule().run() },
]

/* ─── Bridge: Suggestion plugin ↔ React state (single editor) ── */
const _sl: {
  items: SlashCmd[]; idx: number; cmdFn: ((i: SlashCmd) => void) | null
  setItems: ((v: SlashCmd[])                        => void) | null
  setIdx:   ((v: number)                            => void) | null
  setPos:   ((v: {top:number;left:number}|null)     => void) | null
} = { items:[], idx:0, cmdFn:null, setItems:null, setIdx:null, setPos:null }

/* ─── Focused Block Highlight ─────────────────────────────────── */
const FocusedBlock = Extension.create({
  name: 'focusedBlock',
  addProseMirrorPlugins() {
    const editor = this.editor
    return [new Plugin({
      key: new PluginKey('focusedBlock'),
      props: {
        decorations(state) {
          if (!editor.isFocused) return DecorationSet.empty
          const { $anchor } = state.selection
          if ($anchor.depth < 1) return DecorationSet.empty
          const node = $anchor.node(1)
          const pos  = $anchor.before(1)
          return DecorationSet.create(state.doc, [
            Decoration.node(pos, pos + node.nodeSize, { class: 'focused-block' }),
          ])
        },
      },
    })]
  },
})

/* ─── Search Highlight Plugin ─────────────────────────────────── */
// SearchHighlightKey is module-level so the useEffect dispatch can reference it
const SearchHighlightKey = new PluginKey<{ findText: string }>('searchHighlight')

// Plugin is created INSIDE addProseMirrorPlugins to avoid singleton conflicts
// when ProseMirror state is rebuilt (React StrictMode / HMR)
const SearchHighlightExt = Extension.create({
  name: 'searchHighlight',
  addProseMirrorPlugins() {
    return [new Plugin<{ findText: string }>({
      key: SearchHighlightKey,
      state: {
        init:  () => ({ findText: '' }),
        apply(tr, prev) {
          const meta = tr.getMeta(SearchHighlightKey)
          return meta !== undefined ? { findText: meta } : prev
        },
      },
      props: {
        decorations(state) {
          const { findText } = SearchHighlightKey.getState(state)!
          if (!findText.trim()) return DecorationSet.empty
          const decs: Decoration[] = []
          const re = new RegExp(esc(findText), 'gi')
          state.doc.descendants((node, pos) => {
            if (!node.isText || !node.text) return
            let m; re.lastIndex = 0
            while ((m = re.exec(node.text)) !== null)
              decs.push(Decoration.inline(pos + m.index, pos + m.index + m[0].length, { class: 'search-highlight' }))
          })
          return DecorationSet.create(state.doc, decs)
        },
      },
    })]
  },
})

/* ─── Slash Commands Extension ────────────────────────────────── */
const SlashExtension = Extension.create({
  name: 'slashCommands',
  addProseMirrorPlugins() {
    return [
      Suggestion({
        // Explicit unique key so each editor instance gets its own plugin
        pluginKey: new PluginKey('slashCommands'),
        editor: this.editor,
        char: '/',
        allowSpaces: false,
        command: ({ editor, range, props }: any) => (props as SlashCmd).cmd(editor, range),
        items: ({ query }: { query: string }) =>
          SLASH_COMMANDS.filter(c =>
            c.title.toLowerCase().includes(query.toLowerCase()) ||
            c.keys.some(k => k.startsWith(query.toLowerCase()))
          ).slice(0, 8),
        render: () => ({
          onStart: (p: any) => {
            const r = p.clientRect?.()
            _sl.items = p.items; _sl.idx = 0; _sl.cmdFn = p.command
            _sl.setItems?.(p.items); _sl.setIdx?.(0)
            if (r) _sl.setPos?.({ top: r.bottom + 4, left: r.left })
          },
          onUpdate: (p: any) => {
            const r = p.clientRect?.()
            _sl.items = p.items; _sl.idx = 0; _sl.cmdFn = p.command
            _sl.setItems?.(p.items); _sl.setIdx?.(0)
            if (r) _sl.setPos?.({ top: r.bottom + 4, left: r.left })
          },
          onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowDown') {
              _sl.idx = Math.min(_sl.idx + 1, _sl.items.length - 1)
              _sl.setIdx?.(_sl.idx); return true
            }
            if (event.key === 'ArrowUp') {
              _sl.idx = Math.max(_sl.idx - 1, 0)
              _sl.setIdx?.(_sl.idx); return true
            }
            if (event.key === 'Enter') {
              const item = _sl.items[_sl.idx]
              if (item) { _sl.cmdFn?.(item); _sl.setPos?.(null) }
              return !!item
            }
            return false
          },
          onExit: () => {
            _sl.setPos?.(null); _sl.setItems?.([])
            _sl.items = []; _sl.idx = 0; _sl.cmdFn = null
          },
        }),
      }),
    ]
  },
})

/* ─── Text Style Dropdown ─────────────────────────────────────── */
const TEXT_STYLES = [
  { label: 'Paragraph',  tag: 'P',  desc: 'Normal text',     size: 'text-sm',   weight: 'font-normal'  },
  { label: 'Heading 1',  tag: 'H1', desc: 'Large heading',   size: 'text-xl',   weight: 'font-bold'    },
  { label: 'Heading 2',  tag: 'H2', desc: 'Section heading', size: 'text-lg',   weight: 'font-bold'    },
  { label: 'Heading 3',  tag: 'H3', desc: 'Sub heading',     size: 'text-base', weight: 'font-semibold'},
] as const

function TextStyleDropdown({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  if (!editor) return null
  const current =
    editor.isActive('heading', { level: 1 }) ? TEXT_STYLES[1] :
    editor.isActive('heading', { level: 2 }) ? TEXT_STYLES[2] :
    editor.isActive('heading', { level: 3 }) ? TEXT_STYLES[3] : TEXT_STYLES[0]

  function apply(style: typeof TEXT_STYLES[number]) {
    if (!editor) return
    const { $from, $to, from } = editor.state.selection
    if (!$from.sameParent($to)) editor.commands.setTextSelection(from)
    if (style.tag === 'P')       editor.chain().focus().setParagraph().run()
    else if (style.tag === 'H1') editor.chain().focus().toggleHeading({ level: 1 }).run()
    else if (style.tag === 'H2') editor.chain().focus().toggleHeading({ level: 2 }).run()
    else if (style.tag === 'H3') editor.chain().focus().toggleHeading({ level: 3 }).run()
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onMouseDown={e => { e.preventDefault(); setOpen(v => !v) }}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all select-none',
          'border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08]',
          open ? 'text-white border-white/20 bg-white/[0.08]' : 'text-slate-300'
        )}>
        <Type className="w-3.5 h-3.5 text-slate-400" />
        <span className="min-w-[72px] text-left">{current.label}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-52 rounded-xl border border-white/[0.1] bg-[#13131f] shadow-2xl shadow-black/60 z-50 overflow-hidden py-1">
          {TEXT_STYLES.map(style => (
            <button key={style.tag} type="button" onMouseDown={e => { e.preventDefault(); apply(style) }}
              className={cn('w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]', current.tag === style.tag && 'bg-blue-500/10')}>
              <span className={cn('w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold shrink-0',
                current.tag === style.tag ? 'bg-blue-500/20 text-blue-400' : 'bg-white/[0.06] text-slate-400')}>
                {style.tag}
              </span>
              <div>
                <div className={cn(style.size, style.weight, 'text-slate-200 leading-tight')}>{style.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{style.desc}</div>
              </div>
              {current.tag === style.tag && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Toolbar Button + Separator ─────────────────────────────── */
function Btn({ onClick, active, title, children, className }: {
  onClick: () => void; active?: boolean; title: string
  children: React.ReactNode; className?: string
}) {
  return (
    <button type="button" onMouseDown={e => { e.preventDefault(); onClick() }} title={title}
      className={cn('p-2 rounded-lg transition-all', active ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.07]', className)}>
      {children}
    </button>
  )
}
function Sep() { return <div className="w-px h-5 bg-white/[0.07] mx-0.5 self-center" /> }

/* ─── Helpers ─────────────────────────────────────────────────── */
function esc(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

function readability(text: string) {
  if (!text.trim()) return null
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3)
  if (!sentences.length) return null
  const avg = text.split(/\s+/).filter(Boolean).length / sentences.length
  if (avg < 12) return { label: 'Easy read',  color: 'text-emerald-400' }
  if (avg < 20) return { label: 'Moderate',   color: 'text-amber-400'   }
  return           { label: 'Complex',        color: 'text-red-400'     }
}

/* ─── Keyboard Shortcuts Data ─────────────────────────────────── */
const SHORTCUTS = [
  { group: 'Formatting', items: [
    { keys: ['Ctrl','B'],       desc: 'Bold'          },
    { keys: ['Ctrl','I'],       desc: 'Italic'        },
    { keys: ['Ctrl','U'],       desc: 'Underline'     },
    { keys: ['Ctrl','Shift','X'], desc: 'Strikethrough'},
  ]},
  { group: 'Structure', items: [
    { keys: ['Ctrl','Alt','1'], desc: 'Heading 1'     },
    { keys: ['Ctrl','Alt','2'], desc: 'Heading 2'     },
    { keys: ['Ctrl','Alt','3'], desc: 'Heading 3'     },
    { keys: ['Ctrl','Alt','0'], desc: 'Paragraph'     },
    { keys: ['Ctrl','Shift','8'], desc: 'Bullet list' },
    { keys: ['Ctrl','Shift','7'], desc: 'Numbered list'},
  ]},
  { group: 'Editor', items: [
    { keys: ['Ctrl','Z'],       desc: 'Undo'          },
    { keys: ['Ctrl','Y'],       desc: 'Redo'          },
    { keys: ['Ctrl','H'],       desc: 'Find & Replace'},
    { keys: ['/'],              desc: 'Slash commands'},
    { keys: ['Tab'],            desc: 'Indent list'   },
    { keys: ['Shift','Tab'],    desc: 'Outdent list'  },
    { keys: ['Esc'],            desc: 'Exit focus/find'},
  ]},
]

/* ════════════════════════════════════════════════════════════════
   MAIN EDITOR COMPONENT
═══════════════════════════════════════════════════════════════ */
export function TipTapEditor({ content, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const findInputRef = useRef<HTMLInputElement>(null)

  // Find & Replace
  const [findOpen,    setFindOpen]    = useState(false)
  const [findText,    setFindText]    = useState('')
  const [replaceText, setReplaceText] = useState('')

  // Focus Mode
  const [focusMode, setFocusMode] = useState(false)

  // Bubble menu
  const [bubblePos, setBubblePos] = useState<{ top: number; left: number } | null>(null)

  // Slash menu
  const [slashPos,   setSlashPos]   = useState<{ top: number; left: number } | null>(null)
  const [slashItems, setSlashItems] = useState<SlashCmd[]>([])
  const [slashIdx,   setSlashIdx]   = useState(0)

  // Outline panel
  const [outlineOpen, setOutlineOpen] = useState(false)
  const [, forceOutline] = useReducer(x => x + 1, 0)

  // Shortcuts modal
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  /* ── Register slash callbacks with module-level bridge ── */
  useEffect(() => {
    _sl.setItems = setSlashItems
    _sl.setIdx   = setSlashIdx
    _sl.setPos   = setSlashPos
    return () => { _sl.setItems = null; _sl.setIdx = null; _sl.setPos = null }
  }, [])

  /* ── Editor instance ── */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: { HTMLAttributes: { class: 'tiptap-code-block' } },
        link: false, underline: false,
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-400 underline underline-offset-2' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl max-w-full my-6 mx-auto' } }),
      Placeholder.configure({ placeholder: 'Start writing… or type / for commands' }),
      CharacterCount,
      Table.configure({ resizable: false, HTMLAttributes: { class: 'tiptap-table' } }),
      TableRow,
      TableHeader,
      TableCell,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      FocusedBlock as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      SearchHighlightExt as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      SlashExtension as any,
    ],
    immediatelyRender: false,
    content: content || '',
    editorProps: {
      attributes: {
        class: [
          'prose prose-invert max-w-none focus:outline-none',
          'px-8 py-7',
          'prose-p:text-slate-200 prose-p:leading-[1.85] prose-p:text-[15px]',
          'prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight',
          'prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-4',
          'prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3',
          'prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2',
          'prose-li:text-slate-200 prose-li:leading-relaxed',
          'prose-ul:my-4 prose-ol:my-4',
          'prose-blockquote:border-l-blue-500 prose-blockquote:text-slate-300 prose-blockquote:not-italic',
          'prose-strong:text-white prose-em:text-slate-200',
          'prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline',
          'prose-hr:border-white/[0.08]',
          'min-h-[520px]',
        ].join(' '),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  /* ── Sync content from parent ── */
  useEffect(() => {
    if (editor && content !== editor.getHTML())
      editor.commands.setContent(content || '', { emitUpdate: false })
  }, [content]) // eslint-disable-line

  /* ── Force outline re-render on doc update ── */
  useEffect(() => {
    if (!editor || !outlineOpen) return
    editor.on('update', forceOutline)
    return () => { editor.off('update', forceOutline) }
  }, [editor, outlineOpen])

  /* ── Search highlight ── */
  useEffect(() => {
    if (!editor) return
    editor.view.dispatch(editor.state.tr.setMeta(SearchHighlightKey, findText))
  }, [findText, editor])

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        setFindOpen(v => { if (!v) setTimeout(() => findInputRef.current?.focus(), 50); return !v })
      }
      if (e.key === 'Escape') {
        if (focusMode) setFocusMode(false)
        if (findOpen) { setFindOpen(false); setFindText(''); setReplaceText('') }
        if (shortcutsOpen) setShortcutsOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [focusMode, findOpen, shortcutsOpen])

  /* ── Bubble menu position ── */
  useEffect(() => {
    if (!editor) return
    const ed = editor
    function updateBubble() {
      const { from, to } = ed.state.selection
      if (from === to) { setBubblePos(null); return }
      try {
        const a = ed.view.coordsAtPos(from)
        const b = ed.view.coordsAtPos(to)
        setBubblePos({ top: a.top, left: Math.round((a.left + b.left) / 2) })
      } catch { setBubblePos(null) }
    }
    function onBlur()   { setBubblePos(null) }
    function onScroll() { setBubblePos(null) }
    ed.on('selectionUpdate', updateBubble)
    ed.on('blur', onBlur)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      ed.off('selectionUpdate', updateBubble)
      ed.off('blur', onBlur)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [editor])

  /* ── Link insert ── */
  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:')
    if (!url || !editor) return
    editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  /* ── Image upload ── */
  const handleImageUpload = useCallback(async (file: File) => {
    const id = toast.loading('Uploading image…')
    try {
      const fd = new FormData(); fd.append('file', file)
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      editor?.chain().focus().setImage({ src: json.url }).run()
      toast.success('Image uploaded', { id })
    } catch { toast.error('Upload failed', { id }) }
  }, [editor])

  /* ── Find & Replace ── */
  function doReplace(replaceAll: boolean) {
    if (!editor || !findText.trim()) return
    const { state, view } = editor
    const { tr, doc }     = state
    const regex = new RegExp(esc(findText), replaceAll ? 'gi' : 'i')
    const hits: Array<{ from: number; to: number; marks: readonly any[] }> = []
    let found = false
    doc.descendants((node, pos) => {
      if (!replaceAll && found) return
      if (!node.isText || !node.text) return
      let m; regex.lastIndex = 0
      while ((m = regex.exec(node.text)) !== null) {
        hits.push({ from: pos + m.index, to: pos + m.index + m[0].length, marks: node.marks })
        if (!replaceAll) { found = true; break }
      }
    })
    if (!hits.length) { toast.info('No matches found'); return }
    let t = tr
    for (let i = hits.length - 1; i >= 0; i--) {
      const { from, to, marks } = hits[i]
      if (replaceText) t = t.replaceWith(from, to, editor.schema.text(replaceText, marks))
      else             t = t.delete(from, to)
    }
    view.dispatch(t)
    toast.success(`Replaced ${hits.length} occurrence${hits.length !== 1 ? 's' : ''}`)
    setFindOpen(false); setFindText(''); setReplaceText('')
  }

  if (!editor) return null

  /* ── Computed values ── */
  const words    = editor.storage.characterCount?.words() ?? 0
  const readMin  = Math.max(1, Math.ceil(words / 200))
  const quality  =
    words === 0  ? null :
    words < 300  ? { label: 'Too short',   color: 'text-red-400',    bar: 1 } :
    words < 600  ? { label: 'Developing',  color: 'text-amber-400',  bar: 2 } :
    words < 900  ? { label: 'Good length', color: 'text-emerald-400',bar: 3 } :
    words < 1400 ? { label: 'Great',       color: 'text-emerald-400',bar: 4 } :
                   { label: 'In-depth',    color: 'text-blue-400',   bar: 5 }
  const readScore = readability(editor.getText())

  /* ── Headings for outline ── */
  function getHeadings() {
    const h: { level: number; text: string; pos: number }[] = []
    editor!.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading')
        h.push({ level: node.attrs.level, text: node.textContent, pos })
    })
    return h
  }

  /* ══════════════════════ JSX BLOCKS ═══════════════════════════ */

  /* ── CSS ── */
  const styles = `
    .focused-block{border-radius:6px;outline:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.02);transition:outline-color .12s,background .12s}
    .search-highlight{background:rgba(253,224,71,0.25);border-radius:2px;outline:1px solid rgba(253,224,71,0.45)}
    .scrollbar-none{scrollbar-width:none}.scrollbar-none::-webkit-scrollbar{display:none}
    .tiptap-code-block{background:#0d0d1a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:1rem;font-size:13px;font-family:monospace;color:#cbd5e1;overflow-x:auto}
    .tiptap-table{border-collapse:collapse;width:100%;margin:1.5rem 0;table-layout:fixed}
    .tiptap-table th,.tiptap-table td{border:1px solid rgba(255,255,255,0.1);padding:.5rem .75rem;text-align:left;vertical-align:top;min-width:80px}
    .tiptap-table th{background:rgba(255,255,255,0.05);font-weight:600;color:#fff}
    .tiptap-table .selectedCell{position:relative}
    .tiptap-table .selectedCell::after{content:'';position:absolute;inset:0;background:rgba(59,130,246,0.15);pointer-events:none;z-index:2}
  `

  /* ── Toolbar ── */
  const toolbar = (
    <div className="flex items-center gap-1 px-3 py-2.5 border-b border-white/[0.06] bg-[#09090f] sticky top-0 z-10 overflow-x-auto scrollbar-none">
      <TextStyleDropdown editor={editor} />
      <Sep />
      <Btn onClick={() => editor.chain().focus().toggleBold().run()}      active={editor.isActive('bold')}      title="Bold (Ctrl+B)"><Bold className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()}    active={editor.isActive('italic')}    title="Italic (Ctrl+I)"><Italic className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)"><UnderlineIcon className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()}    active={editor.isActive('strike')}    title="Strikethrough"><Strikethrough className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight"><Highlighter className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleCode().run()}      active={editor.isActive('code')}      title="Inline Code"><Code className="w-4 h-4" /></Btn>
      <Sep />
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive('bulletList')}  title="Bullet List"><List className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List"><ListOrdered className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()}  active={editor.isActive('blockquote')}  title="Blockquote"><Quote className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus className="w-4 h-4" /></Btn>
      <Sep />
      <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()}   active={editor.isActive({ textAlign: 'left' })}   title="Align Left"><AlignLeft className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()}  active={editor.isActive({ textAlign: 'right' })}  title="Align Right"><AlignRight className="w-4 h-4" /></Btn>
      <Sep />
      <Btn onClick={addLink}                             active={editor.isActive('link')} title="Insert Link"><Link2 className="w-4 h-4" /></Btn>
      <Btn onClick={() => fileInputRef.current?.click()} title="Upload Image"><ImageIcon className="w-4 h-4" /></Btn>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1">
        <Btn onClick={() => setShortcutsOpen(true)} title="Keyboard Shortcuts (?)"><Keyboard className="w-4 h-4" /></Btn>
        <Btn onClick={() => setOutlineOpen(v => !v)} active={outlineOpen} title="Article Outline"><ListTree className="w-4 h-4" /></Btn>
        <Btn onClick={() => { setFindOpen(v => { if (!v) setTimeout(() => findInputRef.current?.focus(), 50); return !v }) }} active={findOpen} title="Find & Replace (Ctrl+H)">
          <Search className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => setFocusMode(v => !v)} active={focusMode} title={focusMode ? 'Exit Focus Mode (Esc)' : 'Focus Mode'}>
          {focusMode ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)"><Undo className="w-4 h-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)"><Redo className="w-4 h-4" /></Btn>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = '' }}
      />
    </div>
  )

  /* ── Find & Replace Panel ── */
  const findPanel = findOpen && (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0a0a15]">
      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <input ref={findInputRef} value={findText} onChange={e => setFindText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doReplace(false)} placeholder="Find…"
          className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all" />
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <Replace className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <input value={replaceText} onChange={e => setReplaceText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doReplace(false)} placeholder="Replace with…"
          className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all" />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button type="button" onClick={() => doReplace(false)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.07] text-slate-300 hover:bg-white/[0.12] hover:text-white transition-all">Replace</button>
        <button type="button" onClick={() => doReplace(true)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600/80 text-white hover:bg-blue-600 transition-all">Replace All</button>
        <button type="button" onClick={() => { setFindOpen(false); setFindText(''); setReplaceText('') }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )

  /* ── Status Bar ── */
  const statusBar = (
    <div className="px-6 py-2.5 border-t border-white/[0.05] bg-[#09090f] flex items-center justify-between">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-slate-500">
          <span className="text-slate-300 font-medium tabular-nums">{words.toLocaleString()}</span> words
        </span>
        <span className="text-xs text-slate-600">·</span>
        <span className="text-xs text-slate-500">
          ~<span className="text-slate-300 font-medium">{readMin}</span> min read
        </span>
        {quality && <><span className="text-xs text-slate-600">·</span><span className={cn('text-xs font-medium', quality.color)}>{quality.label}</span></>}
        {readScore && <><span className="text-xs text-slate-600">·</span><span className={cn('text-xs font-medium', readScore.color)}>{readScore.label}</span></>}
      </div>
      {words > 0 && quality && (
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={cn('w-5 h-1 rounded-full transition-all duration-300',
              i <= quality.bar
                ? quality.bar <= 1 ? 'bg-red-400' : quality.bar <= 2 ? 'bg-amber-400' : quality.bar <= 4 ? 'bg-emerald-400' : 'bg-blue-400'
                : 'bg-white/[0.08]')} />
          ))}
        </div>
      )}
    </div>
  )

  /* ── Outline Panel ── */
  const outlinePanel = outlineOpen && (
    <div className="w-52 shrink-0 border-l border-white/[0.06] bg-[#09090f] overflow-y-auto">
      <div className="px-3 py-2.5 border-b border-white/[0.06]">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outline</span>
      </div>
      <div className="py-2">
        {(() => {
          const hs = getHeadings()
          if (!hs.length) return (
            <p className="px-3 py-6 text-xs text-slate-600 text-center">
              No headings yet.<br />Use H2/H3 to structure your article.
            </p>
          )
          return hs.map((h, i) => (
            <button key={i} type="button"
              onClick={() => {
                editor.commands.setTextSelection(h.pos + 1)
                editor.view.dispatch(editor.state.tr.scrollIntoView())
                editor.view.focus()
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all truncate"
              style={{ paddingLeft: `${(h.level - 1) * 12 + 12}px` }}
            >
              <span className="text-slate-600 mr-1.5 font-mono text-[10px]">H{h.level}</span>
              {h.text || '(empty)'}
            </button>
          ))
        })()}
      </div>
    </div>
  )

  /* ── Bubble Menu (portal) ── */
  const bubbleMenu = bubblePos && typeof document !== 'undefined'
    ? createPortal(
        <div style={{ position:'fixed', top: Math.max(8, bubblePos.top - 52), left: bubblePos.left, transform:'translateX(-50%)', zIndex:99999 }}
          onMouseDown={e => e.preventDefault()}
          className="flex items-center gap-0.5 p-1.5 rounded-xl bg-[#16162a] border border-white/[0.12] shadow-2xl shadow-black/70 backdrop-blur-sm">
          <Btn onClick={() => editor.chain().focus().toggleBold().run()}      active={editor.isActive('bold')}      title="Bold"><Bold className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleItalic().run()}    active={editor.isActive('italic')}    title="Italic"><Italic className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleStrike().run()}    active={editor.isActive('strike')}    title="Strike"><Strikethrough className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight"><Highlighter className="w-3.5 h-3.5" /></Btn>
          <div className="w-px h-4 bg-white/[0.1] mx-0.5" />
          <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run() }}
            className={cn('px-2 py-1.5 rounded-lg text-xs font-bold transition-all', editor.isActive('heading',{level:2}) ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/[0.07]')}>H2</button>
          <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run() }}
            className={cn('px-2 py-1.5 rounded-lg text-xs font-bold transition-all', editor.isActive('heading',{level:3}) ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/[0.07]')}>H3</button>
          <div className="w-px h-4 bg-white/[0.1] mx-0.5" />
          <Btn onClick={addLink} active={editor.isActive('link')} title="Link"><Link2 className="w-3.5 h-3.5" /></Btn>
        </div>,
        document.body
      ) : null

  /* ── Slash Menu (portal) ── */
  const slashMenu = slashPos && slashItems.length > 0 && typeof document !== 'undefined'
    ? createPortal(
        <div style={{ position:'fixed', top: slashPos.top, left: slashPos.left, zIndex:99999 }}
          className="w-64 rounded-xl bg-[#13131f] border border-white/[0.1] shadow-2xl shadow-black/60 overflow-hidden py-1">
          {slashItems.map((item, i) => (
            <button key={item.title} type="button"
              onMouseDown={e => { e.preventDefault(); _sl.cmdFn?.(item); setSlashPos(null) }}
              onMouseEnter={() => { _sl.idx = i; setSlashIdx(i) }}
              className={cn('w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                i === slashIdx ? 'bg-blue-500/10' : 'hover:bg-white/[0.05]')}>
              <span className={cn('w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold shrink-0',
                i === slashIdx ? 'bg-blue-500/20 text-blue-400' : 'bg-white/[0.06] text-slate-400')}>
                {item.icon}
              </span>
              <div>
                <div className="text-sm font-medium text-slate-200">{item.title}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>,
        document.body
      ) : null

  /* ── Keyboard Shortcuts Modal ── */
  const shortcutsModal = shortcutsOpen && typeof document !== 'undefined'
    ? createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          onClick={() => setShortcutsOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-2xl bg-[#13131f] border border-white/[0.1] shadow-2xl shadow-black/70 overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-slate-400" /> Keyboard Shortcuts
              </h3>
              <button type="button" onClick={() => setShortcutsOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 gap-5 max-h-[70vh] overflow-y-auto">
              {SHORTCUTS.map(group => (
                <div key={group.group}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{group.group}</p>
                  <div className="space-y-1.5">
                    {group.items.map(s => (
                      <div key={s.desc} className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">{s.desc}</span>
                        <div className="flex items-center gap-1">
                          {s.keys.map((k, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-white/[0.07] border border-white/[0.1] text-xs font-mono text-slate-300">{k}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      ) : null

  /* ══ RENDER ══════════════════════════════════════════════════ */

  const editorBody = (
    <div className={cn('flex flex-1 min-h-0', outlineOpen && 'divide-x divide-white/[0.06]')}>
      <div className="flex-1 overflow-auto"><EditorContent editor={editor} /></div>
      {outlinePanel}
    </div>
  )

  if (focusMode) {
    return (
      <>
        <style>{styles}</style>
        {bubbleMenu}{slashMenu}{shortcutsModal}
        <div className="fixed inset-0 z-50 bg-[#08080f] overflow-auto flex flex-col">
          <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
            <div className="rounded-none sm:rounded-xl overflow-hidden border-0 sm:border border-white/[0.07] bg-[#0c0c18] flex flex-col my-0 sm:my-8">
              {toolbar}{findPanel}
              {editorBody}
              {statusBar}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      {bubbleMenu}{slashMenu}{shortcutsModal}
      <div className="rounded-xl overflow-hidden border border-white/[0.07] bg-[#0c0c18] shadow-xl shadow-black/30 flex flex-col">
        {toolbar}{findPanel}
        {editorBody}
        {statusBar}
      </div>
    </>
  )
}
