import { useRCAStore } from '../context/RCAContext'
import {
  FileText,
  AlertTriangle,
  Users,
  Clock,
  Search,
  Shield,
  CheckCircle,
  MessageSquare,
} from 'lucide-react'
import { RCASection } from '../types/rca'
import RichTextEditor from './RichTextEditor'
import TimelineEditor from './TimelineEditor'
import ActionsTable from './ActionsTable'
import ClientSelector from './ClientSelector'

const sections: { id: RCASection; label: string; icon: React.ReactNode }[] = [
  { id: 'metadata', label: 'Informações Gerais', icon: <FileText className="w-4 h-4" /> },
  { id: 'incident', label: 'Incidente', icon: <AlertTriangle className="w-4 h-4" /> },
  { id: 'impact', label: 'Impacto', icon: <Users className="w-4 h-4" /> },
  { id: 'timeline', label: 'Linha do Tempo', icon: <Clock className="w-4 h-4" /> },
  { id: 'rootCause', label: 'Causa Raiz', icon: <Search className="w-4 h-4" /> },
  { id: 'correctiveActions', label: 'Ações Corretivas', icon: <Shield className="w-4 h-4" /> },
  { id: 'preventiveActions', label: 'Ações Preventivas', icon: <CheckCircle className="w-4 h-4" /> },
  { id: 'considerations', label: 'Considerações', icon: <MessageSquare className="w-4 h-4" /> },
]

export default function RCAForm() {
  const {
    document: doc,
    activeSection,
    setActiveSection,
    updateField,
    addCorrectiveAction,
    updateCorrectiveAction,
    removeCorrectiveAction,
    addPreventiveAction,
    updatePreventiveAction,
    removePreventiveAction,
  } = useRCAStore()

  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <nav className="w-56 flex-shrink-0 border-r border-oid-border bg-[rgba(0,0,40,0.30)] backdrop-blur-glass overflow-y-auto">
        <div className="py-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-all ${
                activeSection === section.id
                  ? 'bg-orange/10 text-orange border-r-2 border-orange font-semibold'
                  : 'text-oid-sub hover:bg-oid-surface-soft hover:text-oid-text'
              }`}
            >
              {section.icon}
              <span className="truncate">{section.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeSection === 'metadata' && (
          <div className="space-y-4 max-w-3xl animate-fade-up">
            <h2 className="text-xl font-bold text-oid-text mb-4">Informações Gerais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Título do RCA</label>
                <input
                  type="text"
                  value={doc.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="input-field"
                  placeholder="Ex: RCA - Incidente de Produção OC02"
                />
              </div>
              <div>
                <label className="label">ID do Incidente</label>
                <input
                  type="text"
                  value={doc.incidentId}
                  onChange={(e) => updateField('incidentId', e.target.value)}
                  className="input-field"
                  placeholder="Ex: INC0878526"
                />
              </div>
              <div>
                <label className="label">Criado por</label>
                <input
                  type="text"
                  value={doc.createdBy}
                  onChange={(e) => updateField('createdBy', e.target.value)}
                  className="input-field"
                  placeholder="Nome do autor"
                />
              </div>
              <div>
                <label className="label">Revisado por</label>
                <input
                  type="text"
                  value={doc.reviewedBy}
                  onChange={(e) => updateField('reviewedBy', e.target.value)}
                  className="input-field"
                  placeholder="Nome do revisor"
                />
              </div>
              <div>
                <label className="label">Data de Criação</label>
                <input
                  type="date"
                  value={doc.createdAt}
                  onChange={(e) => updateField('createdAt', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'incident' && (
          <div className="space-y-4 max-w-3xl animate-fade-up">
            <h2 className="text-xl font-bold text-oid-text mb-4">Informações do Incidente</h2>
            <div>
              <label className="label">Descrição do Incidente</label>
              <textarea
                value={doc.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="input-field min-h-[100px]"
                placeholder="Descreva o incidente de forma clara e objetiva..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Reincidência *</label>
                <select
                  value={doc.recurrence}
                  onChange={(e) => updateField('recurrence', e.target.value)}
                  className="input-field"
                >
                  <option value="" disabled>Selecione...</option>
                  <option value="yes">Sim</option>
                  <option value="no">Não</option>
                </select>
              </div>
              <div>
                <label className="label">Indisponibilidade *</label>
                <select
                  value={doc.unavailability}
                  onChange={(e) => updateField('unavailability', e.target.value)}
                  className="input-field"
                >
                  <option value="" disabled>Selecione...</option>
                  <option value="none">Nenhuma</option>
                  <option value="partial">Parcial</option>
                  <option value="total">Total</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'impact' && (
          <div className="space-y-4 max-w-3xl animate-fade-up">
            <h2 className="text-xl font-bold text-oid-text mb-4">Impacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <label className="label">Clientes Afetados</label>
                <ClientSelector
                  selected={doc.affectedClients ? doc.affectedClients.split(', ').filter(Boolean) : []}
                  onChange={(selected) => updateField('affectedClients', selected.join(', '))}
                />
              </div>
              <div>
                <label className="label">Serviços Afetados</label>
                <input
                  type="text"
                  value={doc.affectedServices}
                  onChange={(e) => updateField('affectedServices', e.target.value)}
                  className="input-field"
                  placeholder="Ex: API Gateway, Banco de Dados"
                />
              </div>
            </div>
            {/* Selected clients tags */}
            {doc.affectedClients && (
              <div className="flex flex-wrap gap-1.5">
                {doc.affectedClients.split(', ').filter(Boolean).map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange/10 border border-orange/25 text-orange"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => {
                        const current = doc.affectedClients.split(', ').filter(Boolean)
                        updateField('affectedClients', current.filter((c) => c !== name).join(', '))
                      }}
                      className="hover:text-orange-light"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div>
              <label className="label">Descrição do Impacto nos Clientes</label>
              <RichTextEditor
                value={doc.clientImpactDescription}
                onChange={(val) => updateField('clientImpactDescription', val)}
                placeholder="Descreva como os clientes foram impactados..."
                aiField="clientImpactDescription"
              />
            </div>
          </div>
        )}

        {activeSection === 'timeline' && <TimelineEditor />}

        {activeSection === 'rootCause' && (
          <div className="space-y-4 max-w-3xl animate-fade-up">
            <h2 className="text-xl font-bold text-oid-text mb-4">Causa Raiz</h2>
            <RichTextEditor
              value={doc.rootCause}
              onChange={(val) => updateField('rootCause', val)}
              placeholder="Descreva a causa raiz do incidente e o que foi feito para resolver o problema..."
              aiField="rootCause"
            />
          </div>
        )}

        {activeSection === 'correctiveActions' && (
          <ActionsTable
            title="Ações Corretivas"
            actions={doc.correctiveActions}
            onAdd={addCorrectiveAction}
            onUpdate={updateCorrectiveAction}
            onRemove={removeCorrectiveAction}
            showActionType
          />
        )}

        {activeSection === 'preventiveActions' && (
          <ActionsTable
            title="Ações Preventivas"
            actions={doc.preventiveActions}
            onAdd={addPreventiveAction}
            onUpdate={updatePreventiveAction}
            onRemove={removePreventiveAction}
          />
        )}

        {activeSection === 'considerations' && (
          <div className="space-y-4 max-w-3xl animate-fade-up">
            <h2 className="text-xl font-bold text-oid-text mb-4">Considerações Finais</h2>
            <RichTextEditor
              value={doc.considerations}
              onChange={(val) => updateField('considerations', val)}
              placeholder="Adicione considerações finais e recomendações..."
              aiField="considerations"
            />
          </div>
        )}
      </div>
    </div>
  )
}
