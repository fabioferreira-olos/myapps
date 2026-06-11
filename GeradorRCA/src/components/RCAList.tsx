import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileDown, FileText, Calendar, Pencil, Plus, Lock } from 'lucide-react'
import { fetchRCAs, fetchRCA, RCASummary, verifyEditPassword } from '../services/apiService'
import { exportToPdf } from '../services/exportPdf'
import { exportToDocx } from '../services/exportDocx'
import { useRCAStore } from '../context/RCAContext'

export default function RCAList() {
  const navigate = useNavigate()
  const { loadDocument, setRcaId, resetDocument } = useRCAStore()
  const [rcas, setRcas] = useState<RCASummary[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<string | null>(null)
  const [editPwInput, setEditPwInput] = useState('')
  const [editPwError, setEditPwError] = useState('')
  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-01-01`
  })
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [clientFilter, setClientFilter] = useState('')

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

  const allClients = useMemo(() => {
    const clientSet = new Set<string>()
    rcas.forEach((rca) => {
      if (rca.affected_clients) {
        rca.affected_clients.split(', ').forEach((c) => {
          if (c.trim()) clientSet.add(c.trim())
        })
      }
    })
    return Array.from(clientSet).sort()
  }, [rcas])

  const filtered = useMemo(() => {
    return rcas.filter((rca) => {
      const rcaDate = rca.created_at.split('T')[0]
      if (dateFrom && rcaDate < dateFrom) return false
      if (dateTo && rcaDate > dateTo) return false
      if (clientFilter && (!rca.affected_clients || !rca.affected_clients.toLowerCase().includes(clientFilter.toLowerCase()))) return false
      return true
    })
  }, [rcas, dateFrom, dateTo, clientFilter])

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

  const handleEdit = async (id: string) => {
    setEditTarget(id)
    setEditPwInput('')
    setEditPwError('')
  }

  const handleEditConfirm = async () => {
    if (!editTarget) return
    const valid = await verifyEditPassword(editPwInput)
    if (!valid) {
      setEditPwError('Senha incorreta')
      return
    }
    try {
      const record = await fetchRCA(editTarget)
      loadDocument(record.data, editTarget)
      setRcaId(editTarget)
      setEditTarget(null)
      navigate('/')
    } catch (err) {
      console.error('Error loading RCA for edit:', err)
      alert('Erro ao carregar RCA para edição')
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
          <button
            onClick={() => {
              resetDocument()
              navigate('/')
            }}
            className="btn-primary flex items-center gap-2 text-sm ml-auto"
          >
            <Plus className="w-4 h-4" />
            Nova RCA
          </button>
        </div>

        {/* Filters */}
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
            <div>
              <label className="label">Cliente</label>
              <input
                type="text"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="input-field"
                placeholder="Filtrar por cliente..."
                list="client-list"
              />
              <datalist id="client-list">
                {allClients.map((client) => (
                  <option key={client} value={client} />
                ))}
              </datalist>
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
            <p className="text-lg">Não há RCAs para o cliente e período selecionado</p>
            <p className="text-sm mt-1">Ajuste os filtros ou grave uma nova RCA</p>
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
                    onClick={() => handleEdit(rca.id)}
                    className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
                    title="Editar RCA"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </button>
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

      {/* Edit password modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Senha de Edição
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Digite a senha para editar a RCA <strong>{editTarget}</strong>
            </p>
            <input
              type="password"
              value={editPwInput}
              onChange={(e) => { setEditPwInput(e.target.value); setEditPwError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleEditConfirm()}
              className="input-field mb-2"
              placeholder="Senha de edição"
              autoFocus
            />
            {editPwError && (
              <p className="text-sm text-red-600 mb-3">{editPwError}</p>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={handleEditConfirm} className="btn-primary flex-1">
                Confirmar
              </button>
              <button
                onClick={() => { setEditTarget(null); setEditPwInput(''); setEditPwError('') }}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
