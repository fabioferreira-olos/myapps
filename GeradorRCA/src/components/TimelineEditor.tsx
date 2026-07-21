import { Plus, Trash2, Clock, Timer } from 'lucide-react'
import { useRCAStore } from '../context/RCAContext'
import { calculateDowntime, formatDateTime } from '../utils/formatters'
import { useMemo } from 'react'

export default function TimelineEditor() {
  const { document, addTimelineEntry, updateTimelineEntry, removeTimelineEntry, updateField } = useRCAStore()
  const { timeline } = document

  const sortedTimeline = [...timeline].sort((a, b) => {
    if (!a.dateTime || !b.dateTime) return 0
    return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  })

  const timelineStats = useMemo(() => {
    const validEntries = timeline.filter((e) => e.dateTime)
    if (validEntries.length < 2) return null

    const sorted = [...validEntries].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    )
    const first = sorted[0].dateTime
    const last = sorted[sorted.length - 1].dateTime
    const downtime = calculateDowntime(first, last)

    return { startDate: first, endDate: last, downtime }
  }, [timeline])

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-oid-text flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange" />
          Linha do Tempo
        </h3>
        <button
          onClick={addTimelineEntry}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Adicionar Evento
        </button>
      </div>

      {/* Downtime summary card */}
      {timelineStats && (
        <div className="bg-accent-glow border border-accent/25 rounded-oid-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Timer className="w-4 h-4 text-accent-light" />
            <span className="text-sm font-semibold text-accent-light">
              Tempo de Indisponibilidade (calculado)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-accent-light font-medium">Início:</span>
              <span className="ml-2 text-oid-text font-mono">
                {formatDateTime(timelineStats.startDate)}
              </span>
            </div>
            <div>
              <span className="text-accent-light font-medium">Término:</span>
              <span className="ml-2 text-oid-text font-mono">
                {formatDateTime(timelineStats.endDate)}
              </span>
            </div>
            <div>
              <span className="text-accent-light font-medium">Duração:</span>
              <span className="ml-2 text-oid-text font-mono font-bold">
                {timelineStats.downtime}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-accent/20">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={document.hideDowntime}
                onChange={(e) => updateField('hideDowntime', e.target.checked)}
                className="w-4 h-4 rounded border-oid-border text-orange focus:ring-accent-glow"
              />
              <span className="text-sm text-oid-sub">
                Ocultar tempo de indisponibilidade na RCA exportada
              </span>
            </label>
          </div>
        </div>
      )}

      {sortedTimeline.length === 0 ? (
        <div className="text-center py-8 text-oid-muted border-2 border-dashed border-oid-border rounded-oid-md">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum evento na linha do tempo</p>
          <p className="text-sm">Clique em "Adicionar Evento" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTimeline.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 p-4 bg-oid-surface-soft border border-oid-border rounded-oid-sm group"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange to-orange-light rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-white">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="label">Data/Hora</label>
                  <input
                    type="datetime-local"
                    value={entry.dateTime}
                    onChange={(e) => updateTimelineEntry(entry.id, 'dateTime', e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Descrição do Evento</label>
                  <input
                    type="text"
                    value={entry.event}
                    onChange={(e) => updateTimelineEntry(entry.id, 'event', e.target.value)}
                    className="input-field text-sm"
                    placeholder="Descreva o evento..."
                  />
                </div>
              </div>
              <button
                onClick={() => removeTimelineEntry(entry.id)}
                className="flex-shrink-0 p-2 text-status-red hover:bg-status-red-bg rounded-oid-xxs opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remover evento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
