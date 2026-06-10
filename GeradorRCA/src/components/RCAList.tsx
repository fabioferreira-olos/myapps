import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileDown, FileText, Calendar } from 'lucide-react'
import { fetchRCAs, fetchRCA, RCASummary } from '../services/apiService'
import { exportToPdf } from '../services/exportPdf'
import { exportToDocx } from '../services/exportDocx'

export default function RCAList() {
  const navigate = useNavigate()
  const [rcas, setRcas] = useState<RCASummary[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-01-01`
  })
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadRCAs()
  }, [])

  const loadRCAs = async () => {
    setLoading(true)
    try {
      const data = await fetchRCAs()
      setRcas(data)
    } catch (err) {
      console.error('Failed to load RCAs:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return rcas.filter((rca) => {
      const rcaDate = rca.created_at.split('T')[0]
      if (dateFrom && rcaDate < dateFrom) return false
      if (dateTo && rcaDate > dateTo) return false
      return true
    })
  }, [rcas, dateFrom, dateTo])

  const handleExportPdf = async (id: string) => {
    setExporting(id + '-pdf')
    try {
      const record = await fetchRCA(id)
      await exportToPdf(record.data)
    } catch (err) {
      console.error('Export PDF error:', err)
      alert('Erro ao exportar PDF')
    } finally {
      setExporting(null)
    }
  }

  const handleExportDocx = async (id: string) => {
    setExporting(id + '-docx')
    try {
      const record = await fetchRCA(id)
      await exportToDocx(record.data)
    } catch (err) {
      console.error('Export DOCX error:', err)
      alert('Erro ao exportar DOCX')
    } finally {
      setExporting(null)
    }
  }

  const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            RCAs Gravadas
          </h1>
        </div>

        {/* Date filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="label">Data de</label>
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
              <label className="label">Data até</label>
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
              {filtered.length} RCA{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* RCA List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Carregando RCAs...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <p className="text-lg">Nenhuma RCA encontrada</p>
            <p className="text-sm mt-1">Ajuste os filtros de data ou grave uma nova RCA</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((rca) => (
              <div
                key={rca.id}
                className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3 !p-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">
                      {rca.id}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(rca.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                    {rca.title || 'Sem título'}
                  </p>
                  {rca.incident_id && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Incidente: {rca.incident_id}
                      {rca.affected_clients && ` • ${rca.affected_clients}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleExportPdf(rca.id)}
                    disabled={exporting === rca.id + '-pdf'}
                    className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
                    title="Exportar PDF"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    PDF
                  </button>
                  <button
                    onClick={() => handleExportDocx(rca.id)}
                    disabled={exporting === rca.id + '-docx'}
                    className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
                    title="Exportar DOCX"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    DOCX
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
