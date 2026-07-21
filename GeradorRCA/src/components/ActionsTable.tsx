import { Plus, Trash2 } from 'lucide-react'
import { ActionItem } from '../types/rca'

interface ActionsTableProps {
  title: string
  actions: ActionItem[]
  onAdd: () => void
  onUpdate: (id: string, field: keyof ActionItem, value: string) => void
  onRemove: (id: string) => void
  showActionType?: boolean
}

export default function ActionsTable({ title, actions, onAdd, onUpdate, onRemove, showActionType }: ActionsTableProps) {
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-oid-text">{title}</h3>
        <button onClick={onAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Adicionar Ação
        </button>
      </div>

      {actions.length === 0 ? (
        <div className="text-center py-8 text-oid-muted border-2 border-dashed border-oid-border rounded-oid-md">
          <p>Nenhuma ação adicionada</p>
          <p className="text-sm">Clique em "Adicionar Ação" para começar</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[rgba(255,255,255,0.04)]">
                <th className="text-left p-3 text-sm font-semibold text-oid-sub border-b border-oid-border">
                  Descrição
                </th>
                <th className="text-left p-3 text-sm font-semibold text-oid-sub border-b border-oid-border w-40">
                  Responsável
                </th>
                <th className="text-left p-3 text-sm font-semibold text-oid-sub border-b border-oid-border w-36">
                  Prazo
                </th>
                <th className="text-left p-3 text-sm font-semibold text-oid-sub border-b border-oid-border w-36">
                  Status
                </th>
                {showActionType && (
                  <th className="text-left p-3 text-sm font-semibold text-oid-sub border-b border-oid-border w-36">
                    Tipo *
                  </th>
                )}
                <th className="p-3 w-10 border-b border-oid-border"></th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr key={action.id} className="group hover:bg-oid-surface-soft transition-colors">
                  <td className="p-2 border-b border-oid-border-soft align-top">
                    <input
                      type="text"
                      value={action.description}
                      onChange={(e) => onUpdate(action.id, 'description', e.target.value)}
                      className="input-field text-sm"
                      placeholder="Descreva a ação..."
                    />
                  </td>
                  <td className="p-2 border-b border-oid-border-soft align-top">
                    <input
                      type="text"
                      value={action.responsible}
                      onChange={(e) => onUpdate(action.id, 'responsible', e.target.value)}
                      className="input-field text-sm"
                      placeholder="Responsável"
                    />
                  </td>
                  <td className="p-2 border-b border-oid-border-soft align-top">
                    <input
                      type="date"
                      value={action.deadline}
                      onChange={(e) => onUpdate(action.id, 'deadline', e.target.value)}
                      className="input-field text-sm"
                    />
                  </td>
                  <td className="p-2 border-b border-oid-border-soft align-top">
                    <select
                      value={action.status}
                      onChange={(e) => onUpdate(action.id, 'status', e.target.value)}
                      className="input-field text-sm"
                    >
                      <option value="pending">Pendente</option>
                      <option value="in_progress">Em Andamento</option>
                      <option value="completed">Concluído</option>
                    </select>
                  </td>
                  {showActionType && (
                    <td className="p-2 border-b border-oid-border-soft align-top">
                      <select
                        value={action.actionType || ''}
                        onChange={(e) => onUpdate(action.id, 'actionType', e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="" disabled>Selecione...</option>
                        <option value="definitive">Definitiva</option>
                        <option value="workaround">Contorno</option>
                      </select>
                    </td>
                  )}
                  <td className="p-2 border-b border-oid-border-soft align-top">
                    <button
                      onClick={() => onRemove(action.id)}
                      className="p-1.5 text-status-red hover:bg-status-red-bg rounded-oid-xxs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remover ação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
