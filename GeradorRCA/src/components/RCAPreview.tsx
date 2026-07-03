import { useRCAStore } from '../context/RCAContext'
import { formatDateTime, getStatusLabel, getStatusColor, calculateDowntime } from '../utils/formatters'
import { useMemo } from 'react'

export default function RCAPreview() {
  const { document: doc } = useRCAStore()

  const timelineStats = useMemo(() => {
    const validEntries = doc.timeline.filter((e) => e.dateTime)
    if (validEntries.length < 2) return null
    const sorted = [...validEntries].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    )
    const first = sorted[0].dateTime
    const last = sorted[sorted.length - 1].dateTime
    return { startDate: first, endDate: last, downtime: calculateDowntime(first, last) }
  }, [doc.timeline])

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-3xl font-bold text-primary-700 dark:text-primary-400">
            Análise de Causa Raiz (RCA)
          </h1>
          <h2 className="text-xl text-gray-600 dark:text-gray-400 mt-2">
            {doc.title || 'Documento sem título'}
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
            {doc.incidentId && <span>ID: {doc.incidentId}</span>}
            {doc.createdAt && <span>Data: {doc.createdAt}</span>}
          </div>
        </div>

        {/* Metadata */}
        <Section title="Informações Gerais">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Criado por" value={doc.createdBy} />
            <Field label="ID do Incidente" value={doc.incidentId} />
          </div>
        </Section>

        {/* Incident */}
        <Section title="Informações do Incidente">
          <Field label="Descrição" value={doc.description} />
          {timelineStats && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Field label="Início" value={formatDateTime(timelineStats.startDate)} />
              <Field label="Término" value={formatDateTime(timelineStats.endDate)} />
              {!doc.hideDowntime && (
                <Field label="Tempo de Indisponibilidade" value={timelineStats.downtime} />
              )}
            </div>
          )}
        </Section>

        {/* Impact */}
        <Section title="Impacto">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Clientes Afetados" value={doc.affectedClients} />
            <Field label="Serviços Afetados" value={doc.affectedServices} />
          </div>
          {doc.clientImpactDescription && (
            <div className="mt-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Descrição do Impacto
              </span>
              <div
                className="prose dark:prose-invert max-w-none text-sm mt-1"
                dangerouslySetInnerHTML={{ __html: doc.clientImpactDescription }}
              />
            </div>
          )}
        </Section>

        {/* Timeline */}
        {doc.timeline.length > 0 && (
          <Section title="Linha do Tempo">
            <div className="space-y-3">
              {[...doc.timeline]
                .sort((a, b) => {
                  if (!a.dateTime || !b.dateTime) return 0
                  return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
                })
                .map((entry, index) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-primary-600 dark:text-primary-400">
                        {formatDateTime(entry.dateTime) || entry.dateTime}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {entry.event}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Section>
        )}

        {/* Root Cause */}
        {doc.rootCause && (
          <Section title="Causa Raiz">
            <div
              className="prose dark:prose-invert max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: doc.rootCause }}
            />
          </Section>
        )}

        {/* Corrective Actions */}
        {doc.correctiveActions.length > 0 && (
          <Section title="Ações Corretivas">
            <ActionsPreviewTable actions={doc.correctiveActions} />
          </Section>
        )}

        {/* Preventive Actions */}
        {doc.preventiveActions.length > 0 && (
          <Section title="Ações Preventivas">
            <ActionsPreviewTable actions={doc.preventiveActions} />
          </Section>
        )}

        {/* Considerations */}
        {doc.considerations && (
          <Section title="Considerações Finais">
            <div
              className="prose dark:prose-invert max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: doc.considerations }}
            />
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
      <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-400 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
        {label}
      </span>
      <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">
        {value || <span className="text-gray-400 italic">Não preenchido</span>}
      </p>
    </div>
  )
}

function ActionsPreviewTable({ actions }: { actions: { id: string; description: string; responsible: string; deadline: string; status: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-600">
            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Ação</th>
            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Responsável</th>
            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Prazo</th>
            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action: any) => (
            <tr key={action.id} className="border-b border-gray-100 dark:border-gray-700">
              <td className="py-2 px-3 text-gray-800 dark:text-gray-200">{action.description || '-'}</td>
              <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{action.responsible || '-'}</td>
              <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{action.deadline || '-'}</td>
              <td className="py-2 px-3">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(action.status)}`}>
                  {getStatusLabel(action.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
