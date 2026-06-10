import { useState } from 'react'
import { FileText, Eye, EyeOff, Settings, RotateCcw, Save, Database, List } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useRCAStore } from '../context/RCAContext'
import { publishRCA, updateRCA } from '../services/apiService'

function validateDocument(doc: any): string[] {
  const errors: string[] = []
  const minLen = 5
  if (!doc.title || doc.title.length < minLen) errors.push('Título (mín. 5 caracteres)')
  if (!doc.incidentId || doc.incidentId.length < minLen) errors.push('ID do Incidente (mín. 5 caracteres)')
  if (!doc.createdBy || doc.createdBy.length < minLen) errors.push('Criado por (mín. 5 caracteres)')
  if (!doc.createdAt) errors.push('Data de Criação')
  if (!doc.description || doc.description.length < minLen) errors.push('Descrição do Incidente (mín. 5 caracteres)')
  if (!doc.startDate) errors.push('Data de Início')
  if (!doc.endDate) errors.push('Data de Término')
  if (!doc.recurrence) errors.push('Reincidência')
  if (!doc.unavailability) errors.push('Indisponibilidade')
  if (!doc.affectedClients || doc.affectedClients.length < minLen) errors.push('Clientes Afetados')
  if (!doc.affectedServices || doc.affectedServices.length < 2) errors.push('Serviços Afetados (mín. 2 caracteres)')
  if (!doc.clientImpactDescription || doc.clientImpactDescription.replace(/<[^>]*>/g, '').length < minLen) errors.push('Descrição do Impacto (mín. 5 caracteres)')
  if (!doc.rootCause || doc.rootCause.replace(/<[^>]*>/g, '').length < minLen) errors.push('Causa Raiz (mín. 5 caracteres)')
  if (doc.correctiveActions.length === 0) errors.push('Ações Corretivas (pelo menos 1)')
  if (doc.correctiveActions.some((a: any) => !a.actionType)) errors.push('Tipo da Ação Corretiva')
  if (!doc.considerations || doc.considerations.replace(/<[^>]*>/g, '').length < minLen) errors.push('Considerações Finais (mín. 5 caracteres)')
  return errors
}

export default function Header() {
  const navigate = useNavigate()
  const { document: doc, showPreview, setShowPreview, resetDocument, rcaId, setRcaId, setSavedAt } = useRCAStore()
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSaveDraft = () => {
    localStorage.setItem('rcagen-draft', JSON.stringify(doc))
    setMessage({ type: 'success', text: 'Draft salvo localmente!' })
    setTimeout(() => setMessage(null), 3000)
  }

  const handlePublish = async () => {
    const errors = validateDocument(doc)
    if (errors.length > 0) {
      setMessage({ type: 'error', text: `Campos obrigatórios: ${errors.join(', ')}` })
      setTimeout(() => setMessage(null), 5000)
      return
    }

    setPublishing(true)
    try {
      if (rcaId) {
        const result = await updateRCA(rcaId, doc)
        setSavedAt(result.updated_at)
        setMessage({ type: 'success', text: `RCA ${rcaId} atualizada!` })
      } else {
        const result = await publishRCA(doc)
        setRcaId(result.id)
        setSavedAt(result.created_at)
        setMessage({ type: 'success', text: `RCA gravada: ${result.id}` })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao gravar no banco' })
    } finally {
      setPublishing(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-7 h-7 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Gerador de RCA
          </h1>
          {rcaId && (
            <span className="text-xs font-mono bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded">
              {rcaId}
            </span>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
            Olos Tecnologia
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="Salvar Draft (local)"
          >
            <Save className="w-4 h-4" />
            <span className="hidden md:inline">Draft</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center gap-2 text-sm"
            title="Gravar no Banco"
          >
            <Database className="w-4 h-4" />
            <span className="hidden md:inline">{publishing ? 'Gravando...' : rcaId ? 'Atualizar' : 'Gravar'}</span>
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary flex items-center gap-2 text-sm"
            title={showPreview ? 'Ocultar preview' : 'Mostrar preview'}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">{showPreview ? 'Editar' : 'Preview'}</span>
          </button>

          <button
            onClick={() => navigate('/rcas')}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="Listar RCAs gravadas"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Gerar RCA</span>
          </button>

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

      {/* Status message */}
      {message && (
        <div className={`mt-2 px-3 py-1.5 rounded text-sm ${
          message.type === 'success'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
        }`}>
          {message.text}
        </div>
      )}
    </header>
  )
}
