import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, PieChart as PieIcon, BarChart3, Calendar } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface DowntimeData {
  name: string
  hours: number
}

interface SLAData {
  name: string
  sla: number
  downtime: number
}

const COLORS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
  '#e11d48', '#84cc16', '#0ea5e9', '#d946ef', '#78716c',
]

export default function Reports() {
  const navigate = useNavigate()
  const [downtimeData, setDowntimeData] = useState<DowntimeData[]>([])
  const [slaData, setSlaData] = useState<SLAData[]>([])
  const [totalPeriodHours, setTotalPeriodHours] = useState(0)
  const [loading, setLoading] = useState(false)
  const [downtimeChartType, setDowntimeChartType] = useState<'pie' | 'bar'>('pie')
  const [slaChartType, setSlaChartType] = useState<'pie' | 'bar'>('bar')
  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-01-01`
  })
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadReports()
  }, [dateFrom, dateTo])

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

  const ChartTypeToggle = ({ value, onChange }: { value: 'pie' | 'bar'; onChange: (v: 'pie' | 'bar') => void }) => (
    <div className="flex gap-1">
      <button
        onClick={() => onChange('pie')}
        className={`p-1.5 rounded transition-colors ${
          value === 'pie'
            ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
        title="Pizza"
      >
        <PieIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('bar')}
        className={`p-1.5 rounded transition-colors ${
          value === 'bar'
            ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
        title="Barras"
      >
        <BarChart3 className="w-4 h-4" />
      </button>
    </div>
  )

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
            <div className="text-sm text-gray-500 dark:text-gray-400 pb-2">
              Período total: <strong>{totalPeriodHours.toFixed(0)}h</strong>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Carregando relatórios...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Report 1: Downtime by Client */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Indisponibilidade por Cliente
                </h2>
                <div className="flex items-center gap-3">
                  {downtimeData.length > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Total: <strong>{totalDowntimeHours.toFixed(2)}h</strong>
                    </span>
                  )}
                  <ChartTypeToggle value={downtimeChartType} onChange={setDowntimeChartType} />
                </div>
              </div>

              {downtimeData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <p>Nenhum dado de indisponibilidade encontrado para o período selecionado</p>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 min-h-[350px]">
                    <ResponsiveContainer width="100%" height={350}>
                      {downtimeChartType === 'pie' ? (
                        <PieChart>
                          <Pie
                            data={downtimeData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, hours }) => `${name} (${hours}h)`}
                            outerRadius={120}
                            dataKey="hours"
                          >
                            {downtimeData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [`${value}h`, 'Indisponibilidade']} />
                          <Legend />
                        </PieChart>
                      ) : (
                        <BarChart data={downtimeData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                          <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value: number) => [`${value}h`, 'Indisponibilidade']} />
                          <Bar dataKey="hours" name="Indisponibilidade (horas)">
                            {downtimeData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                  <div className="lg:w-64">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Detalhamento</h3>
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300">Cliente</th>
                            <th className="text-right p-2 font-medium text-gray-700 dark:text-gray-300">Horas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {downtimeData.map((item, idx) => (
                            <tr key={item.name} className="border-t border-gray-100 dark:border-gray-700">
                              <td className="p-2 text-gray-800 dark:text-gray-200">
                                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                {item.name}
                              </td>
                              <td className="p-2 text-right text-gray-800 dark:text-gray-200 font-mono">{item.hours.toFixed(2)}h</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Report 2: SLA by Client */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  SLA por Cliente
                </h2>
                <ChartTypeToggle value={slaChartType} onChange={setSlaChartType} />
              </div>

              {slaData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <p>Nenhum dado de SLA encontrado para o período selecionado</p>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 min-h-[350px]">
                    <ResponsiveContainer width="100%" height={350}>
                      {slaChartType === 'pie' ? (
                        <PieChart>
                          <Pie
                            data={slaData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, sla }) => `${name} (${sla}%)`}
                            outerRadius={120}
                            dataKey="sla"
                          >
                            {slaData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [`${value}%`, 'SLA']} />
                          <Legend />
                        </PieChart>
                      ) : (
                        <BarChart data={slaData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                          <YAxis domain={[95, 100]} label={{ value: 'SLA %', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value: number) => [`${value}%`, 'SLA']} />
                          <Bar dataKey="sla" name="SLA (%)">
                            {slaData.map((item, index) => (
                              <Cell key={`cell-${index}`} fill={item.sla >= 99.9 ? '#10b981' : item.sla >= 99 ? '#f59e0b' : '#ef4444'} />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                  <div className="lg:w-72">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Detalhamento</h3>
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300">Cliente</th>
                            <th className="text-right p-2 font-medium text-gray-700 dark:text-gray-300">SLA</th>
                            <th className="text-right p-2 font-medium text-gray-700 dark:text-gray-300">Down</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slaData.map((item) => (
                            <tr key={item.name} className="border-t border-gray-100 dark:border-gray-700">
                              <td className="p-2 text-gray-800 dark:text-gray-200">{item.name}</td>
                              <td className="p-2 text-right font-mono">
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                  item.sla >= 99.9 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                  : item.sla >= 99 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                }`}>
                                  {item.sla.toFixed(2)}%
                                </span>
                              </td>
                              <td className="p-2 text-right text-gray-600 dark:text-gray-400 font-mono text-xs">{item.downtime}h</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
