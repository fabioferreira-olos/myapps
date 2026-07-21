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
    <div className="h-full overflow-y-auto bg-oid-surface backdrop-blur-glass p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center border-b border-oid-border pb-6">
          <h1 className="text-3xl font-bold text-orange">
            Análise de Causa Raiz (RCA)
          </h1>
          <h2 className="text-xl text-oid-sub mt-2">
            {doc.title || 'Documento sem título'}
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-oid-muted">
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
              <span className="text-xs font-medium text-oid-muted uppercase">
                Descrição do Impacto
              </span>
              <div
                className="prose prose-invert max-w-none text-sm mt-1"
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
                    <div className="flex-shrink-0 w-6 h-6 bg-orange/10 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-orange">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-orange">
                        {formatDateTime(entry.dateTime) || entry.dateTime}
                      </div>
                      <div className="text-sm text-oid-sub">
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
              className="prose prose-invert max-w-none text-sm"
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
              className="prose prose-invert max-w-none text-sm"
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
    <div className="border border-oid-border rounded-oid-sm p-5">
      <h3 className="text-lg font-semibold text-orange mb-3 pb-2 border-b border-oid-border-soft">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-oid-muted uppercase">
        {label}
      </span>
      <p className="text-sm text-oid-sub mt-0.5">
        {value || <span className="text-oid-muted italic">Não preenchido</span>}
      </p>
    </div>
  )
}

function ActionsPreviewTable({ actions }: { actions: { id: string; description: string; responsible: string; deadline: string; status: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-oid-border">
            <th className="text-left py-2 px-3 font-medium text-oid-sub">Ação</th>
            <th className="text-left py-2 px-3 font-medium text-oid-sub">Responsável</th>
            <th className="text-left py-2 px-3 font-medium text-oid-sub">Prazo</th>
            <th className="text-left py-2 px-3 font-medium text-oid-sub">Status</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action: any) => (
            <tr key={action.id} className="border-b border-oid-border-soft">
              <td className="py-2 px-3 text-oid-sub">{action.description || '-'}</td>
              <td className="py-2 px-3 text-oid-muted">{action.responsible || '-'}</td>
              <td className="py-2 px-3 text-oid-muted">{action.deadline || '-'}</td>
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
