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
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div className="flex items-center gap-1 border-b border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
            editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
          title="Negrito"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
            editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
          title="Itálico"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
            editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
          title="Lista com marcadores"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
            editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
          title="Lista numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        {aiField && (
          <>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button
              type="button"
              onClick={() => setAIPanelOpen(true, aiField)}
              className="p-1.5 rounded hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-400"
              title="Sugestão da IA"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      <EditorContent editor={editor} />
      {placeholder && !value && (
        <div className="px-3 py-2 text-gray-400 text-sm pointer-events-none absolute">
          {placeholder}
        </div>
      )}
    </div>
  )
}
