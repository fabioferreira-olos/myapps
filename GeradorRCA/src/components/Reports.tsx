import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, PieChart as PieIcon, BarChart3 } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface DowntimeData {
  name: string
  hours: number
}

const COLORS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
  '#e11d48', '#84cc16', '#0ea5e9', '#d946ef', '#78716c',
]

export default function Reports() {
  const navigate = useNavigate()
  const [data, setData] = useState<DowntimeData[]>([])
  const [loading, setLoading] = useState(false)
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie')
  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-01-01`
  })
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadReport()
  }, [dateFrom, dateTo])

  const loadReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      const res = await fetch(`/api/reports/downtime-by-client?${params}`)
      if (!res.ok) throw new Error('Failed to load report')
      const result = await res.json()
      setData(result)
    } catch (err) {
      console.error('Error loading report:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalHours = data.reduce((sum, d) => sum + d.hours, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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

        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Indisponibilidade por Cliente
          </h2>

          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div>
              <label className="label">Data de</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Data até</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Tipo de Gráfico</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setChartType('pie')}
                  className={`p-2 rounded-lg transition-colors ${
                    chartType === 'pie'
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Gráfico de Pizza"
                >
                  <PieIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`p-2 rounded-lg transition-colors ${
                    chartType === 'bar'
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Gráfico de Barras"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>
            </div>
            {data.length > 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 pb-2">
                Total: <strong>{totalHours.toFixed(2)}h</strong> de indisponibilidade
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Carregando relatório...
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <p>Nenhum dado de indisponibilidade encontrado para o período selecionado</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Chart */}
              <div className="flex-1 min-h-[400px]">
                <ResponsiveContainer width="100%" height={400}>
                  {chartType === 'pie' ? (
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, hours }) => `${name} (${hours}h)`}
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="hours"
                      >
                        {data.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}h`, 'Indisponibilidade']} />
                      <Legend />
                    </PieChart>
                  ) : (
                    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                      <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: number) => [`${value}h`, 'Indisponibilidade']} />
                      <Bar dataKey="hours" name="Indisponibilidade (horas)">
                        {data.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="lg:w-72">
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
                      {data.map((item, idx) => (
                        <tr key={item.name} className="border-t border-gray-100 dark:border-gray-700">
                          <td className="p-2 text-gray-800 dark:text-gray-200">
                            <span
                              className="inline-block w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                            />
                            {item.name}
                          </td>
                          <td className="p-2 text-right text-gray-800 dark:text-gray-200 font-mono">
                            {item.hours.toFixed(2)}h
                          </td>
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
    </div>
  )
}
