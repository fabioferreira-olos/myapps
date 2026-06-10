import { Plus, Trash2 } from 'lucide-react'
import { ActionItem } from '../types/rca'
import { getStatusLabel, getStatusColor } from '../utils/formatters'

interface ActionsTableProps {
  title: string
  actions: ActionItem[]
  onAdd: () => void
  onUpdate: (id: string, field: keyof ActionItem, value: string) => void
  onRemove: (id: string) => void
}

export default function ActionsTable({ title, actions, onAdd, onUpdate, onRemove }: ActionsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <button onClick={onAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Adicionar Ação
        </button>
      </div>

      {actions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p>Nenhuma ação adicionada</p>
          <p className="text-sm">Clique em "Adicionar Ação" para começar</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-750">
                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  Descrição
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 w-40">
                  Responsável
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 w-36">
                  Prazo
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 w-36">
                  Status
                </th>
                <th className="p-3 w-10 border-b border-gray-200 dark:border-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr key={action.id} className="group hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="p-2 border-b border-gray-100 dark:border-gray-700 align-top">
                    <input
                      type="text"
                      value={action.description}
                      onChange={(e) => onUpdate(action.id, 'description', e.target.value)}
                      className="input-field text-sm"
                      placeholder="Descreva a ação..."
                    />
                  </td>
                  <td className="p-2 border-b border-gray-100 dark:border-gray-700 align-top">
                    <input
                      type="text"
                      value={action.responsible}
                      onChange={(e) => onUpdate(action.id, 'responsible', e.target.value)}
                      className="input-field text-sm"
                      placeholder="Responsável"
                    />
                  </td>
                  <td className="p-2 border-b border-gray-100 dark:border-gray-700 align-top">
                    <input
                      type="date"
                      value={action.deadline}
                      onChange={(e) => onUpdate(action.id, 'deadline', e.target.value)}
                      className="input-field text-sm"
                    />
                  </td>
                  <td className="p-2 border-b border-gray-100 dark:border-gray-700 align-top">
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
                  <td className="p-2 border-b border-gray-100 dark:border-gray-700 align-top">
                    <button
                      onClick={() => onRemove(action.id)}
                      className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
