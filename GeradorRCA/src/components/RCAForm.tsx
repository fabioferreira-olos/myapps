import { useRCAStore } from '../context/RCAContext'
import { calculateDowntime } from '../utils/formatters'
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
      <nav className="w-56 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
        <div className="py-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-r-2 border-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
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
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Informações Gerais</h2>
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
                <label className="label">Revisor</label>
                <input
                  type="text"
                  value={doc.reviewer}
                  onChange={(e) => updateField('reviewer', e.target.value)}
                  className="input-field"
                  placeholder="Nome do revisor"
                />
              </div>
              <div>
                <label className="label">Versão</label>
                <input
                  type="text"
                  value={doc.version}
                  onChange={(e) => updateField('version', e.target.value)}
                  className="input-field"
                  placeholder="1.0"
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
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Informações do Incidente</h2>
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
                <label className="label">Data/Hora de Início</label>
                <input
                  type="datetime-local"
                  value={doc.startDate}
                  onChange={(e) => {
                    updateField('startDate', e.target.value)
                    if (e.target.value && doc.endDate) {
                      updateField('totalDowntime', calculateDowntime(e.target.value, doc.endDate))
                    }
                  }}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Data/Hora de Término</label>
                <input
                  type="datetime-local"
                  value={doc.endDate}
                  onChange={(e) => {
                    updateField('endDate', e.target.value)
                    if (doc.startDate && e.target.value) {
                      updateField('totalDowntime', calculateDowntime(doc.startDate, e.target.value))
                    }
                  }}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Tempo Total de Indisponibilidade</label>
                <input
                  type="text"
                  value={doc.totalDowntime}
                  readOnly
                  className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  placeholder="Calculado automaticamente"
                />
              </div>
              <div>
                <label className="label">Ambientes Afetados</label>
                <input
                  type="text"
                  value={doc.affectedEnvironments}
                  onChange={(e) => updateField('affectedEnvironments', e.target.value)}
                  className="input-field"
                  placeholder="Ex: Produção, Homologação"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'impact' && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Impacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Clientes Afetados</label>
                <input
                  type="text"
                  value={doc.affectedClients}
                  onChange={(e) => updateField('affectedClients', e.target.value)}
                  className="input-field"
                  placeholder="Ex: Cliente A, Cliente B"
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
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Causa Raiz</h2>
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
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Considerações Finais</h2>
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
