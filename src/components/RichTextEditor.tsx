'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef } from 'react'

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

const btnCls = 'p-1.5 rounded hover:bg-white/10 transition-colors text-muted hover:text-white disabled:opacity-30'
const activeCls = 'bg-accent/20 text-accent'

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-accent underline' } }),
      Placeholder.configure({ placeholder: placeholder ?? 'Напишете съдържанието тук...' }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none min-h-[320px] px-4 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  // Sync value when changed externally (e.g. on load)
  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [value, editor])

  const uploadImage = async (file: File) => {
    const form = new FormData()
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    form.append('file', file)
    form.append('path', path)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    if (!res.ok) throw new Error('Upload failed')
    const { url } = await res.json()
    return url as string
  }

  const handleImageFile = async (file: File) => {
    if (!editor) return
    try {
      const url = await uploadImage(file)
      editor.chain().focus().setImage({ src: url, alt: '' }).run()
    } catch {
      alert('Грешка при качване на снимка')
    }
  }

  if (!editor) return null

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-surface">
        {/* History */}
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={btnCls} title="Undo">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a5 5 0 015 5v1M3 10l4-4M3 10l4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={btnCls} title="Redo">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10H11a5 5 0 00-5 5v1M21 10l-4-4M21 10l-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Headings */}
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${btnCls} ${editor.isActive('heading', { level: 2 }) ? activeCls : ''}`} title="H2">
          <span className="text-xs font-bold">H2</span>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${btnCls} ${editor.isActive('heading', { level: 3 }) ? activeCls : ''}`} title="H3">
          <span className="text-xs font-bold">H3</span>
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Inline */}
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`${btnCls} ${editor.isActive('bold') ? activeCls : ''}`} title="Bold">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 010 8H6z M6 12h9a4 4 0 010 8H6z" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${btnCls} ${editor.isActive('italic') ? activeCls : ''}`} title="Italic">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Lists */}
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${btnCls} ${editor.isActive('bulletList') ? activeCls : ''}`} title="Bullet list">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/></svg>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${btnCls} ${editor.isActive('orderedList') ? activeCls : ''}`} title="Ordered list">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Blockquote / HR */}
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${btnCls} ${editor.isActive('blockquote') ? activeCls : ''}`} title="Blockquote">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnCls} title="Horizontal rule">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Image upload */}
        <button type="button" onClick={() => fileRef.current?.click()} className={btnCls} title="Insert image">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = '' }} />
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  )
}
