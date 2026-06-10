import { FileText, Eye, EyeOff, Settings, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import ExportButtons from './ExportButtons'
import { useRCAStore } from '../context/RCAContext'

export default function Header() {
  const navigate = useNavigate()
  const { showPreview, setShowPreview, resetDocument } = useRCAStore()

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-7 h-7 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Gerador de RCA
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
            Olos Tecnologia
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary flex items-center gap-2 text-sm"
            title={showPreview ? 'Ocultar preview' : 'Mostrar preview'}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">{showPreview ? 'Editar' : 'Preview'}</span>
          </button>

          <ExportButtons />

          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja limpar todos os campos?')) {
                resetDocument()
              }
            }}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="Limpar documento"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/admin')}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
