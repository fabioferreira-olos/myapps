import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Shield, ChevronLeft, ChevronRight } from 'lucide-react'

interface DowntimeData {
  name: string
  hours: number
}

interface SLAData {
  name: string
  sla: number
  downtime: number
}

export default function Reports() {
  const navigate = useNavigate()
  const [downtimeData, setDowntimeData] = useState<DowntimeData[]>([])
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
  const [downtimePage, setDowntimePage] = useState(0)
  const [slaPage, setSlaPage] = useState(0)
  const [incidentTypeFilter, setIncidentTypeFilter] = useState('')
  const PAGE_SIZE = 15

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    setDowntimePage(0)
    setSlaPage(0)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      if (incidentTypeFilter) params.set('type', incidentTypeFilter)

      const [downtimeRes, slaRes] = await Promise.all([
        fetch(`/api/reports/downtime-by-client?${params}`),
        fetch(`/api/reports/sla-by-client?${params}`),
      ])

      if (downtimeRes.ok) {
        setDowntimeData(await downtimeRes.json())
      }
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

  const totalDowntimeHours = downtimeData.reduce((sum, d) => sum + d.hours, 0)

  const sortedDowntime = [...downtimeData].sort((a, b) => b.hours - a.hours)
  const sortedSla = [...slaData].sort((a, b) => a.sla - b.sla)
  const avgSla = slaData.length > 0 ? slaData.reduce((sum, d) => sum + d.sla, 0) / slaData.length : 0

  const downtimeTotalPages = Math.ceil(sortedDowntime.length / PAGE_SIZE)
  const paginatedDowntime = sortedDowntime.slice(downtimePage * PAGE_SIZE, (downtimePage + 1) * PAGE_SIZE)

  const slaTotalPages = Math.ceil(sortedSla.length / PAGE_SIZE)
  const paginatedSla = sortedSla.slice(slaPage * PAGE_SIZE, (slaPage + 1) * PAGE_SIZE)

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

  function getPercentBadge(percent: number) {
    if (percent >= 30) {
      return 'bg-status-red-bg border border-status-red-border text-status-red'
    }
    if (percent >= 15) {
      return 'bg-status-amber-bg border border-status-amber-border text-status-amber'
    }
    return 'bg-oid-surface-soft border border-oid-border text-oid-sub'
  }

  function calculatePercentile(values: number[], p: number): number {
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))]
  }

  // Percentiles for downtime (P95/P98/P99 = top values, higher = worse)
  const downtimeValues = downtimeData.map((d) => d.hours)
  const downtimeP95 = calculatePercentile(downtimeValues, 95)
  const downtimeP98 = calculatePercentile(downtimeValues, 98)
  const downtimeP99 = calculatePercentile(downtimeValues, 99)

  // Percentiles for SLA (P5/P2/P1 from bottom = worst clients)
  const slaValues = slaData.map((d) => d.sla)
  const slaP95 = calculatePercentile(slaValues, 5)   // 5% worst → P95 guarantee
  const slaP98 = calculatePercentile(slaValues, 2)   // 2% worst → P98 guarantee
  const slaP99 = calculatePercentile(slaValues, 1)   // 1% worst → P99 guarantee

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
            Relatórios
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
                <option value="platform">Plataforma</option>
                <option value="infrastructure">Infraestrutura</option>
                <option value="other">Outros</option>
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
            {/* Report 1: Downtime by Client */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-oid-text flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange" />
                  Indisponibilidade por Cliente
                </h2>
                {downtimeData.length > 0 && (
                  <span className="text-sm text-oid-muted">
                    Total: <strong className="text-oid-text font-mono">{totalDowntimeHours.toFixed(2)}h</strong>
                  </span>
                )}
              </div>

              {downtimeData.length === 0 ? (
                <div className="text-center py-8 text-oid-muted border-2 border-dashed border-oid-border rounded-oid-md">
                  <p>Nenhum dado de indisponibilidade encontrado para o período selecionado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-oid-border">
                        <th className="text-left py-3 px-4 font-semibold text-oid-sub">#</th>
                        <th className="text-left py-3 px-4 font-semibold text-oid-sub">Cliente</th>
                        <th className="text-right py-3 px-4 font-semibold text-oid-sub">Indisponibilidade</th>
                        <th className="text-right py-3 px-4 font-semibold text-oid-sub">% do Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDowntime.map((item, idx) => {
                        const globalIdx = downtimePage * PAGE_SIZE + idx
                        const percent = totalDowntimeHours > 0 ? (item.hours / totalDowntimeHours) * 100 : 0
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
                            <td className="py-3 px-4 text-right font-mono text-oid-text">
                              {item.hours.toFixed(2)}h
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPercentBadge(percent)}`}>
                                {percent.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-oid-border bg-[rgba(255,255,255,0.04)]">
                        <td className="py-3 px-4" colSpan={2}>
                          <span className="font-semibold text-oid-text">Total</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-orange">
                          {totalDowntimeHours.toFixed(2)}h
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-oid-surface border border-oid-border text-oid-sub">
                            100%
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  {downtimeTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-oid-border-soft">
                      <span className="text-sm text-oid-muted">
                        Mostrando {downtimePage * PAGE_SIZE + 1}–{Math.min((downtimePage + 1) * PAGE_SIZE, sortedDowntime.length)} de {sortedDowntime.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDowntimePage((p) => Math.max(0, p - 1))}
                          disabled={downtimePage === 0}
                          className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-3 disabled:opacity-40"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          Anterior
                        </button>
                        <span className="text-sm text-oid-sub font-medium font-mono">
                          {downtimePage + 1} / {downtimeTotalPages}
                        </span>
                        <button
                          onClick={() => setDowntimePage((p) => Math.min(downtimeTotalPages - 1, p + 1))}
                          disabled={downtimePage >= downtimeTotalPages - 1}
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

            {/* Report 2: SLA by Client */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-oid-text flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent-light" />
                  SLA por Cliente
                </h2>
                {slaData.length > 0 && (
                  <span className="text-sm text-oid-muted">
                    SLA P99: <strong className={`font-mono ${slaP99 >= 99.9 ? 'text-status-green' : slaP99 >= 99 ? 'text-status-amber' : 'text-status-red'}`}>
                      {slaP99.toFixed(2)}%
                    </strong>
                  </span>
                )}
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
                                {item.sla.toFixed(2)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {getSlaStatusBadge(item.sla)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-oid-border bg-[rgba(255,255,255,0.04)]">
                        <td className="py-3 px-4" colSpan={2}>
                          <span className="font-semibold text-oid-text">P95</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-oid-sub">
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            slaP95 >= 99.9
                              ? 'bg-status-green-bg border border-status-green-border text-status-green'
                              : slaP95 >= 99
                                ? 'bg-status-amber-bg border border-status-amber-border text-status-amber'
                                : 'bg-status-red-bg border border-status-red-border text-status-red'
                          }`}>
                            {slaP95.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getSlaStatusBadge(slaP95)}
                        </td>
                      </tr>
                      <tr className="bg-[rgba(255,255,255,0.04)]">
                        <td className="py-3 px-4" colSpan={2}>
                          <span className="font-semibold text-oid-text">P98</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-oid-sub">
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            slaP98 >= 99.9
                              ? 'bg-status-green-bg border border-status-green-border text-status-green'
                              : slaP98 >= 99
                                ? 'bg-status-amber-bg border border-status-amber-border text-status-amber'
                                : 'bg-status-red-bg border border-status-red-border text-status-red'
                          }`}>
                            {slaP98.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getSlaStatusBadge(slaP98)}
                        </td>
                      </tr>
                      <tr className="bg-[rgba(255,255,255,0.04)]">
                        <td className="py-3 px-4" colSpan={2}>
                          <span className="font-semibold text-oid-text">P99</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-oid-sub">
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            slaP99 >= 99.9
                              ? 'bg-status-green-bg border border-status-green-border text-status-green'
                              : slaP99 >= 99
                                ? 'bg-status-amber-bg border border-status-amber-border text-status-amber'
                                : 'bg-status-red-bg border border-status-red-border text-status-red'
                          }`}>
                            {slaP99.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getSlaStatusBadge(slaP99)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  {slaTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-oid-border-soft">
                      <span className="text-sm text-oid-muted">
                        Mostrando {slaPage * PAGE_SIZE + 1}–{Math.min((slaPage + 1) * PAGE_SIZE, sortedSla.length)} de {sortedSla.length}
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
