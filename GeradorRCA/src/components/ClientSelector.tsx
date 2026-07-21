import { useState, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
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

  if (loading) {
    return <div className="text-sm text-oid-muted">Carregando clientes...</div>
  }

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-oid-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 text-sm"
          placeholder="Buscar clientes..."
        />
      </div>

      {/* Client list */}
      <div className="max-h-48 overflow-y-auto border border-oid-border rounded-oid-sm bg-oid-surface-soft">
        {filtered.length === 0 ? (
          <div className="p-3 text-sm text-oid-muted text-center">
            Nenhum cliente encontrado
          </div>
        ) : (
          filtered.map((client) => {
            const isSelected = selected.includes(client.name)
            return (
              <label
                key={client.id}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm transition-colors border-b border-oid-border-soft last:border-b-0 ${
                  isSelected
                    ? 'bg-orange/10 text-orange'
                    : 'hover:bg-oid-surface-hover text-oid-sub'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleClient(client.name)}
                  className="w-4 h-4 rounded border-oid-border text-orange focus:ring-accent-glow"
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
