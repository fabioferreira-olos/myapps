import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const date = parseISO(dateStr)
    return format(date, "dd/MM/yyyy", { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const date = parseISO(dateStr)
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    in_progress: 'Em Andamento',
    completed: 'Concluído',
  }
  return labels[status] || status
}

export function getRecurrenceLabel(value: string): string {
  const labels: Record<string, string> = {
    yes: 'Sim',
    no: 'Não',
  }
  return labels[value] || ''
}

export function getUnavailabilityLabel(value: string): string {
  const labels: Record<string, string> = {
    none: 'Nenhuma',
    partial: 'Parcial',
    total: 'Total',
  }
  return labels[value] || ''
}

export function getActionTypeLabel(value: string): string {
  const labels: Record<string, string> = {
    definitive: 'Definitiva',
    workaround: 'Contorno',
  }
  return labels[value] || ''
}

export function getIncidentTypeLabel(value: string): string {
  const labels: Record<string, string> = {
    platform: 'Plataforma Olos',
    infra_onprem: 'Infraestrutura On Premises',
    infra_cloud: 'Infraestrutura Olos Cloud',
    infrastructure: 'Infraestrutura',
    other: 'Outros',
  }
  return labels[value] || ''
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-status-amber-bg text-status-amber border border-status-amber-border',
    in_progress: 'bg-accent-glow text-accent-light border border-accent/25',
    completed: 'bg-status-green-bg text-status-green border border-status-green-border',
  }
  return colors[status] || 'bg-[rgba(255,255,255,0.04)] text-oid-muted'
}

export function stripHtml(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export function calculateDowntime(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return ''
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffMs = end.getTime() - start.getTime()

    if (diffMs <= 0) return '0min'

    const totalMinutes = Math.floor(diffMs / 60000)
    const days = Math.floor(totalMinutes / 1440)
    const hours = Math.floor((totalMinutes % 1440) / 60)
    const minutes = totalMinutes % 60

    const parts: string[] = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}min`)

    return parts.join(' ') || '0min'
  } catch {
    return ''
  }
}
