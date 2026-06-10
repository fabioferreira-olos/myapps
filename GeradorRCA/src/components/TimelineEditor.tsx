import { Plus, Trash2, Clock } from 'lucide-react'
import { useRCAStore } from '../context/RCAContext'

export default function TimelineEditor() {
  const { document, addTimelineEntry, updateTimelineEntry, removeTimelineEntry } = useRCAStore()
  const { timeline } = document

  const sortedTimeline = [...timeline].sort((a, b) => {
    if (!a.dateTime || !b.dateTime) return 0
    return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" />
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

      {sortedTimeline.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum evento na linha do tempo</p>
          <p className="text-sm">Clique em "Adicionar Evento" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTimeline.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600 group"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
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
                className="flex-shrink-0 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
