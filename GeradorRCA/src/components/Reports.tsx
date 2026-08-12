import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Shield, ChevronLeft, ChevronRight, Search } from 'lucide-react'

interface SLAData {
  name: string
  sla: number
  downtime: number
}

export default function Reports() {
  const navigate = useNavigate()
  const [slaData, setSlaData] = useState<SLAData[]>([])
  const [totalPeriodHours, setTotalPeriodHours] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return thirtyDaysAgo.toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [slaPage, setSlaPage] = useState(0)
  const [incidentTypeFilter, setIncidentTypeFilter] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const PAGE_SIZE = 100

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    setSlaPage(0)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      if (incidentTypeFilter) params.set('type', incidentTypeFilter)

      const slaRes = await fetch(`/api/reports/sla-by-client?${params}`)

      if (slaRes.ok) {
        const slaResult = await slaRes.json()
        setSlaData(slaResult.clients || [])
        setTotalPeriodHours(slaResult.totalPeriodHours || 0)
      }
    } catch (err) {
      console.error('Error loading reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const sortedSla = [...slaData].sort((a, b) => a.sla - b.sla)
  const filteredSla = clientSearch
    ? sortedSla.filter((d) => d.name.toLowerCase().includes(clientSearch.toLowerCase()))
    : sortedSla
  const avgSla = slaData.length > 0 ? slaData.reduce((sum, d) => sum + d.sla, 0) / slaData.length : 0

  const slaTotalPages = Math.ceil(filteredSla.length / PAGE_SIZE)
  const paginatedSla = filteredSla.slice(slaPage * PAGE_SIZE, (slaPage + 1) * PAGE_SIZE)

  function getSlaStatusBadge(sla: number) {
    if (sla >= 99.9) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-status-green-bg border border-status-green-border text-status-green">
          Saudável
        </span>
      )
    }
    if (sla >= 99) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-status-amber-bg border border-status-amber-border text-status-amber">
          Atenção
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-status-red-bg border border-status-red-border text-status-red">
        Crítico
      </span>
    )
  }

  function getSlaColor(sla: number) {
    if (sla >= 99.9) return 'text-status-green'
    if (sla >= 99) return 'text-status-amber'
    return 'text-status-red'
  }

  function calculatePercentile(values: number[], p: number): number {
    // PX = média do SLA dos X% melhores clientes (excluindo (100-X)% piores)
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const excludeCount = Math.ceil(sorted.length * ((100 - p) / 100))
    const remaining = sorted.slice(excludeCount)
    if (remaining.length === 0) return sorted[sorted.length - 1]
    return remaining.reduce((sum, v) => sum + v, 0) / remaining.length
  }

  // SLA Percentiles: "X% dos clientes têm SLA ≥ este valor"
  const slaValues = slaData.map((d) => d.sla)
  const slaP90 = calculatePercentile(slaValues, 90)
  const slaP95 = calculatePercentile(slaValues, 95)
  const slaP98 = calculatePercentile(slaValues, 98)
  const slaP99 = calculatePercentile(slaValues, 99)

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-up">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-oid-text">
            SLA
          </h1>
        </div>

        {/* Global Date Filter */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="label">Período de</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-oid-muted" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
            </div>
            <div>
              <label className="label">Período até</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-oid-muted" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
            </div>
            <div>
              <label className="label">Tipo de Incidente</label>
              <select
                value={incidentTypeFilter}
                onChange={(e) => setIncidentTypeFilter(e.target.value)}
                className="input-field"
              >
                <option value="">Todos</option>
                <option value="platform">Plataforma Olos</option>
                <option value="infra_onprem">Infraestrutura On Premises</option>
                <option value="infra_cloud">Infraestrutura Olos Cloud</option>
                <option value="other">Outros</option>
                <option value="unclassified">Não classificado</option>
              </select>
            </div>
            <div>
              <label className="label">&nbsp;</label>
              <button
                onClick={loadReports}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Carregando...' : 'SELECIONAR'}
              </button>
            </div>
            {totalPeriodHours > 0 && (
              <div className="text-sm text-oid-muted pb-2">
                Período total: <strong className="text-oid-text font-mono">{totalPeriodHours.toFixed(0)}h</strong>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-oid-muted">
            Carregando relatórios...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Disponibilidade Geral */}
            {slaData.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold text-oid-text mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent-light" />
                  Disponibilidade Geral
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="bg-oid-surface-soft border border-oid-border rounded-oid-sm p-4 text-center">
                    <div className="text-xs text-oid-muted font-semibold uppercase tracking-wider mb-2">SLA Geral</div>
                    <div className={`text-2xl font-bold font-mono ${getSlaColor(avgSla)}`}>
                      {avgSla.toFixed(3)}%
                    </div>
                  </div>
                  <div className="bg-oid-surface-soft border border-oid-border rounded-oid-sm p-4 text-center">
                    <div className="text-xs text-oid-muted font-semibold uppercase tracking-wider mb-2">SLA P99</div>
                    <div className={`text-2xl font-bold font-mono ${getSlaColor(slaP99)}`}>
                      {slaP99.toFixed(3)}%
                    </div>
                  </div>
                  <div className="bg-oid-surface-soft border border-oid-border rounded-oid-sm p-4 text-center">
                    <div className="text-xs text-oid-muted font-semibold uppercase tracking-wider mb-2">SLA P98</div>
                    <div className={`text-2xl font-bold font-mono ${getSlaColor(slaP98)}`}>
                      {slaP98.toFixed(3)}%
                    </div>
                  </div>
                  <div className="bg-oid-surface-soft border border-oid-border rounded-oid-sm p-4 text-center">
                    <div className="text-xs text-oid-muted font-semibold uppercase tracking-wider mb-2">SLA P95</div>
                    <div className={`text-2xl font-bold font-mono ${getSlaColor(slaP95)}`}>
                      {slaP95.toFixed(3)}%
                    </div>
                  </div>
                  <div className="bg-oid-surface-soft border border-oid-border rounded-oid-sm p-4 text-center">
                    <div className="text-xs text-oid-muted font-semibold uppercase tracking-wider mb-2">SLA P90</div>
                    <div className={`text-2xl font-bold font-mono ${getSlaColor(slaP90)}`}>
                      {slaP90.toFixed(3)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLA por Cliente */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-oid-text flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent-light" />
                  SLA por Cliente
                </h2>
              </div>

              {/* Client search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-oid-muted" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => { setClientSearch(e.target.value); setSlaPage(0) }}
                  className="input-field pl-9 text-sm"
                  placeholder="Buscar cliente..."
                />
              </div>

              {slaData.length === 0 ? (
                <div className="text-center py-8 text-oid-muted border-2 border-dashed border-oid-border rounded-oid-md">
                  <p>Nenhum dado de SLA encontrado para o período selecionado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-oid-border">
                        <th className="text-left py-3 px-4 font-semibold text-oid-sub">#</th>
                        <th className="text-left py-3 px-4 font-semibold text-oid-sub">Cliente</th>
                        <th className="text-right py-3 px-4 font-semibold text-oid-sub">Downtime</th>
                        <th className="text-right py-3 px-4 font-semibold text-oid-sub">SLA</th>
                        <th className="text-center py-3 px-4 font-semibold text-oid-sub">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSla.map((item, idx) => {
                        const globalIdx = slaPage * PAGE_SIZE + idx
                        return (
                          <tr
                            key={item.name}
                            className="border-b border-oid-border-soft hover:bg-oid-surface-soft transition-colors"
                          >
                            <td className="py-3 px-4 text-oid-muted font-mono text-xs">
                              {globalIdx + 1}
                            </td>
                            <td className="py-3 px-4 text-oid-text font-medium">
                              {item.name}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-oid-sub">
                              {item.downtime}h
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                item.sla >= 99.9
                                  ? 'bg-status-green-bg border border-status-green-border text-status-green'
                                  : item.sla >= 99
                                    ? 'bg-status-amber-bg border border-status-amber-border text-status-amber'
                                    : 'bg-status-red-bg border border-status-red-border text-status-red'
                              }`}>
                                {item.sla.toFixed(3)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {getSlaStatusBadge(item.sla)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {slaTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-oid-border-soft">
                      <span className="text-sm text-oid-muted">
                        Mostrando {slaPage * PAGE_SIZE + 1}–{Math.min((slaPage + 1) * PAGE_SIZE, filteredSla.length)} de {filteredSla.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSlaPage((p) => Math.max(0, p - 1))}
                          disabled={slaPage === 0}
                          className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-3 disabled:opacity-40"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          Anterior
                        </button>
                        <span className="text-sm text-oid-sub font-medium font-mono">
                          {slaPage + 1} / {slaTotalPages}
                        </span>
                        <button
                          onClick={() => setSlaPage((p) => Math.min(slaTotalPages - 1, p + 1))}
                          disabled={slaPage >= slaTotalPages - 1}
                          className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-3 disabled:opacity-40"
                        >
                          Próximo
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
