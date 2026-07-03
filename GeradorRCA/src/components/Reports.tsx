import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Shield } from 'lucide-react'

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

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)

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

  function getSlaStatusBadge(sla: number) {
    if (sla >= 99.9) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
          Saudável
        </span>
      )
    }
    if (sla >= 99) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
          Atenção
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
        Crítico
      </span>
    )
  }

  function getPercentBadge(percent: number) {
    if (percent >= 30) {
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
    }
    if (percent >= 15) {
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
    }
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Relatórios
          </h1>
        </div>

        {/* Global Date Filter */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="label">Período de</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
            </div>
            <div>
              <label className="label">&nbsp;</label>
              <button
                onClick={loadReports}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-5 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Carregando...' : 'SELECIONAR'}
              </button>
            </div>
            {totalPeriodHours > 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 pb-2">
                Período total: <strong>{totalPeriodHours.toFixed(0)}h</strong>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Carregando relatórios...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Report 1: Downtime by Client - Table */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  Indisponibilidade por Cliente
                </h2>
                {downtimeData.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total: <strong className="text-gray-900 dark:text-white">{totalDowntimeHours.toFixed(2)}h</strong>
                  </span>
                )}
              </div>

              {downtimeData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <p>Nenhum dado de indisponibilidade encontrado para o período selecionado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">#</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Cliente</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Indisponibilidade</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">% do Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDowntime.map((item, idx) => {
                        const percent = totalDowntimeHours > 0 ? (item.hours / totalDowntimeHours) * 100 : 0
                        return (
                          <tr
                            key={item.name}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="py-3 px-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                              {item.name}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-gray-900 dark:text-white">
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
                      <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                        <td className="py-3 px-4" colSpan={2}>
                          <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                          {totalDowntimeHours.toFixed(2)}h
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            100%
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Report 2: SLA by Client - Table */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-600" />
                  SLA por Cliente
                </h2>
                {slaData.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    SLA médio: <strong className={`${avgSla >= 99.9 ? 'text-green-600 dark:text-green-400' : avgSla >= 99 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                      {avgSla.toFixed(2)}%
                    </strong>
                  </span>
                )}
              </div>

              {slaData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <p>Nenhum dado de SLA encontrado para o período selecionado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">#</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Cliente</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Downtime</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">SLA</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSla.map((item, idx) => (
                        <tr
                          key={item.name}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                            {item.name}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-gray-700 dark:text-gray-300">
                            {item.downtime}h
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                              item.sla >= 99.9
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                : item.sla >= 99
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                            }`}>
                              {item.sla.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getSlaStatusBadge(item.sla)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                        <td className="py-3 px-4" colSpan={2}>
                          <span className="font-semibold text-gray-900 dark:text-white">Média Geral</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-gray-700 dark:text-gray-300">
                          {(slaData.reduce((sum, d) => sum + d.downtime, 0)).toFixed(2)}h
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            avgSla >= 99.9
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                              : avgSla >= 99
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          }`}>
                            {avgSla.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getSlaStatusBadge(avgSla)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
