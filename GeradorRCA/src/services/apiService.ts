const API_BASE = '/api'

export interface Client {
  id: number
  name: string
  active: boolean
}

export async function fetchClients(): Promise<Client[]> {
  const res = await fetch(`${API_BASE}/clients`)
  if (!res.ok) throw new Error('Failed to fetch clients')
  return res.json()
}

export async function createClient(name: string): Promise<Client> {
  const res = await fetch(`${API_BASE}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Failed to create client')
  return res.json()
}

export async function deleteClient(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete client')
}
