const API_BASE = '/api'

export interface Client {
  id: number
  name: string
  active: boolean
}

export interface RCASummary {
  id: string
  title: string
  incident_id: string
  affected_clients: string
  created_at: string
  updated_at: string
}

export interface RCARecord {
  id: string
  data: any
  created_at: string
  updated_at: string
}

// ========== Clients ==========

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

// ========== RCAs ==========

export async function fetchRCAs(): Promise<RCASummary[]> {
  const res = await fetch(`${API_BASE}/rcas`)
  if (!res.ok) throw new Error('Failed to fetch RCAs')
  return res.json()
}

export async function fetchRCA(id: string): Promise<RCARecord> {
  const res = await fetch(`${API_BASE}/rcas/${id}`)
  if (!res.ok) throw new Error('Failed to fetch RCA')
  return res.json()
}

export async function publishRCA(data: any): Promise<{ id: string; created_at: string }> {
  const res = await fetch(`${API_BASE}/rcas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  })
  if (!res.ok) throw new Error('Failed to publish RCA')
  return res.json()
}

export async function updateRCA(id: string, data: any): Promise<{ id: string; updated_at: string }> {
  const res = await fetch(`${API_BASE}/rcas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  })
  if (!res.ok) throw new Error('Failed to update RCA')
  return res.json()
}

export async function deleteRCA(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/rcas/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete RCA')
}

// ========== Auth ==========

export async function verifyPassword(password: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  return res.ok
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  if (!res.ok) {
    const data = await res.json()
    return { success: false, error: data.error || 'Failed to change password' }
  }
  return { success: true }
}

export async function getEditPassword(): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/edit-password`)
  if (!res.ok) return ''
  const data = await res.json()
  return data.password || ''
}

export async function setEditPassword(password: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/auth/edit-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  return res.ok
}

export async function verifyEditPassword(password: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/auth/verify-edit-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  return res.ok
}
