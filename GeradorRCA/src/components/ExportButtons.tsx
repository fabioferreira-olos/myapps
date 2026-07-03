import { FileDown, FileText, ChevronDown, Users } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useRCAStore } from '../context/RCAContext'
import { exportToPdf } from '../services/exportPdf'
import { exportToDocx } from '../services/exportDocx'

type ExportType = 'pdf' | 'docx'

export default function ExportButtons() {
  const document = useRCAStore((s) => s.document)
  const [exporting, setExporting] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState<ExportType | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const clients = document.affectedClients
    ? document.affectedClients.split(', ').filter(Boolean)
    : []

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(null)
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = async (type: ExportType, clientName?: string) => {
    setExporting(true)
    setDropdownOpen(null)
    try {
      if (type === 'pdf') {
        await exportToPdf(document, clientName)
      } else {
        await exportToDocx(document, clientName)
      }
    } catch (err) {
      console.error(`Erro ao exportar ${type.toUpperCase()}:`, err)
      alert(`Erro ao exportar ${type.toUpperCase()}. Verifique o console para mais detalhes.`)
    } finally {
      setExporting(false)
    }
  }

  const handleButtonClick = (type: ExportType) => {
    if (clients.length > 0) {
      setDropdownOpen(dropdownOpen === type ? null : type)
    } else {
      handleExport(type)
    }
  }

  return (
    <div className="flex items-center gap-1 relative" ref={dropdownRef}>
      {/* PDF Button */}
      <div className="relative">
        <button
          onClick={() => handleButtonClick('pdf')}
          disabled={exporting}
          className="btn-secondary flex items-center gap-1.5 text-sm"
          title="Exportar como PDF"
        >
          <FileDown className="w-4 h-4" />
          <span className="hidden sm:inline">PDF</span>
          {clients.length > 0 && <ChevronDown className="w-3 h-3" />}
        </button>

        {dropdownOpen === 'pdf' && (
          <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Selecione o cliente para gerar o PDF
              </p>
            </div>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Todos os clientes
            </button>
            <div className="border-t border-gray-100 dark:border-gray-700" />
            {clients.map((client) => (
              <button
                key={client}
                onClick={() => handleExport('pdf', client)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {client}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DOCX Button */}
      <div className="relative">
        <button
          onClick={() => handleButtonClick('docx')}
          disabled={exporting}
          className="btn-secondary flex items-center gap-1.5 text-sm"
          title="Exportar como DOCX"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">DOCX</span>
          {clients.length > 0 && <ChevronDown className="w-3 h-3" />}
        </button>

        {dropdownOpen === 'docx' && (
          <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Selecione o cliente para gerar o DOCX
              </p>
            </div>
            <button
              onClick={() => handleExport('docx')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Todos os clientes
            </button>
            <div className="border-t border-gray-100 dark:border-gray-700" />
            {clients.map((client) => (
              <button
                key={client}
                onClick={() => handleExport('docx', client)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {client}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
