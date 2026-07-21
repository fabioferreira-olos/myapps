import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { useRCAStore } from '../context/RCAContext'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  aiField?: string
}

export default function RichTextEditor({ value, onChange, placeholder, aiField }: RichTextEditorProps) {
  const { setAIPanelOpen } = useRCAStore()

  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [value])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-oid-border rounded-oid-sm overflow-hidden bg-oid-surface-soft backdrop-blur-glass">
      <div className="flex items-center gap-1 border-b border-oid-border p-2 bg-[rgba(255,255,255,0.04)]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-oid-xxs text-oid-sub hover:bg-oid-surface-hover hover:text-oid-text transition-colors ${
            editor.isActive('bold') ? 'bg-oid-surface text-oid-text' : ''
          }`}
          title="Negrito"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-oid-xxs text-oid-sub hover:bg-oid-surface-hover hover:text-oid-text transition-colors ${
            editor.isActive('italic') ? 'bg-oid-surface text-oid-text' : ''
          }`}
          title="Itálico"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-oid-xxs text-oid-sub hover:bg-oid-surface-hover hover:text-oid-text transition-colors ${
            editor.isActive('bulletList') ? 'bg-oid-surface text-oid-text' : ''
          }`}
          title="Lista com marcadores"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-oid-xxs text-oid-sub hover:bg-oid-surface-hover hover:text-oid-text transition-colors ${
            editor.isActive('orderedList') ? 'bg-oid-surface text-oid-text' : ''
          }`}
          title="Lista numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        {aiField && (
          <>
            <div className="w-px h-5 bg-oid-border mx-1" />
            <button
              type="button"
              onClick={() => setAIPanelOpen(true, aiField)}
              className="p-1.5 rounded-oid-xxs text-accent-light hover:bg-accent-glow transition-colors"
              title="Sugestão da IA"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      <EditorContent editor={editor} />
      {placeholder && !value && (
        <div className="px-3 py-2 text-oid-muted/60 text-sm pointer-events-none absolute">
          {placeholder}
        </div>
      )}
    </div>
  )
}
