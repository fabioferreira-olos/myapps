import { useState } from 'react'
import { FileText, Eye, EyeOff, Settings, RotateCcw, Save, Database, List, HelpCircle, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
  if (doc.timeline.length < 2) errors.push('Linha do Tempo (pelo menos 2 eventos)')
  if (!doc.recurrence) errors.push('Reincidência')
  if (!doc.unavailability) errors.push('Indisponibilidade')
  if (!doc.affectedClients || doc.affectedClients.length < minLen) errors.push('Clientes Afetados')
  if (!doc.affectedServices || doc.affectedServices.length < 2) errors.push('Serviços Afetados (mín. 2 caracteres)')
  if (!doc.clientImpactDescription || doc.clientImpactDescription.replace(/<[^>]*>/g, '').length < minLen) errors.push('Descrição do Impacto (mín. 5 caracteres)')
  if (!doc.rootCause || doc.rootCause.replace(/<[^>]*>/g, '').length < minLen) errors.push('Causa Raiz (mín. 5 caracteres)')
  if (doc.correctiveActions.length === 0) errors.push('Ações Corretivas (pelo menos 1)')
  if (doc.correctiveActions.some((a: any) => !a.actionType)) errors.push('Tipo da Ação Corretiva')
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
        await updateRCA(rcaId, doc)
      } else {
        const result = await publishRCA(doc)
        setRcaId(result.id)
      }
      navigate('/rcas')
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao gravar no banco' })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setPublishing(false)
    }
  }

  return (
    <header className="bg-[rgba(0,0,40,0.55)] backdrop-blur-glass border-b border-oid-border px-6 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo icon */}
          <div className="w-9 h-9 rounded-oid-xs bg-gradient-to-br from-orange to-orange-light flex items-center justify-center shadow-orange-glow">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-oid-text">
            Gerador de RCA
          </h1>
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja limpar todos os campos e começar do zero?')) {
                resetDocument()
              }
            }}
            className="btn-secondary flex items-center gap-2 text-sm ml-2"
            title="Limpar campos e iniciar nova RCA"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Limpar/Nova</span>
          </button>
        </div>

        {/* Status central */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm font-medium text-oid-sub">
            {rcaId ? `Editando RCA ${rcaId}` : 'Editando RCA nova'}
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
            className="btn-primary flex items-center gap-2 text-sm"
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
            onClick={() => navigate('/reports')}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="Relatórios"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Relatórios</span>
          </button>

          <button
            onClick={() => navigate('/admin')}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/guia')}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="Guia de Uso"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div className={`mt-2 px-3 py-1.5 rounded-oid-xxs text-sm animate-fade-in ${
          message.type === 'success'
            ? 'bg-status-green-bg border border-status-green-border text-status-green'
            : 'bg-status-red-bg border border-status-red-border text-status-red'
        }`}>
          {message.text}
        </div>
      )}
    </header>
  )
}
