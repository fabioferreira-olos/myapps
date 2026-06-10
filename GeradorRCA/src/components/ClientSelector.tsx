import { useState, useEffect, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { fetchClients, Client } from '../services/apiService'

interface ClientSelectorProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function ClientSelector({ selected, onChange }: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const data = await fetchClients()
      setClients(data)
    } catch (err) {
      console.error('Failed to load clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return clients
    const term = search.toLowerCase()
    return clients.filter((c) => c.name.toLowerCase().includes(term))
  }, [clients, search])

  const toggleClient = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((s) => s !== name))
    } else {
      onChange([...selected, name])
    }
  }

  const removeClient = (name: string) => {
    onChange(selected.filter((s) => s !== name))
  }

  if (loading) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Carregando clientes...</div>
  }

  return (
    <div className="space-y-2">
      {/* Selected clients as tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-200"
            >
              {name}
              <button
                type="button"
                onClick={() => removeClient(name)}
                className="hover:text-primary-600 dark:hover:text-primary-100"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 text-sm"
          placeholder="Buscar clientes..."
        />
      </div>

      {/* Client list */}
      <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
        {filtered.length === 0 ? (
          <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            Nenhum cliente encontrado
          </div>
        ) : (
          filtered.map((client) => {
            const isSelected = selected.includes(client.name)
            return (
              <label
                key={client.id}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                  isSelected
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleClient(client.name)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                />
                {client.name}
              </label>
            )
          })
        )}
      </div>
    </div>
  )
}
