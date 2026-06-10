import { FileDown, FileText } from 'lucide-react'
import { useState } from 'react'
import { useRCAStore } from '../context/RCAContext'
import { exportToPdf } from '../services/exportPdf'
import { exportToDocx } from '../services/exportDocx'

export default function ExportButtons() {
  const document = useRCAStore((s) => s.document)
  const [exporting, setExporting] = useState(false)

  const handlePdfExport = async () => {
    setExporting(true)
    try {
      await exportToPdf(document)
    } catch (err) {
      console.error('Erro ao exportar PDF:', err)
      alert('Erro ao exportar PDF. Verifique o console para mais detalhes.')
    } finally {
      setExporting(false)
    }
  }

  const handleDocxExport = async () => {
    setExporting(true)
    try {
      await exportToDocx(document)
    } catch (err) {
      console.error('Erro ao exportar DOCX:', err)
      alert('Erro ao exportar DOCX. Verifique o console para mais detalhes.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handlePdfExport}
        disabled={exporting}
        className="btn-secondary flex items-center gap-2 text-sm"
        title="Exportar como PDF"
      >
        <FileDown className="w-4 h-4" />
        <span className="hidden sm:inline">PDF</span>
      </button>
      <button
        onClick={handleDocxExport}
        disabled={exporting}
        className="btn-secondary flex items-center gap-2 text-sm"
        title="Exportar como DOCX"
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">DOCX</span>
      </button>
    </div>
  )
}
