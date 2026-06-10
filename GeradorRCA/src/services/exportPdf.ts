import jsPDF from 'jspdf'
import { RCADocument } from '../types/rca'
import { formatDateTime, getStatusLabel, stripHtml } from '../utils/formatters'

const COMPANY_NAME = 'Olos Tecnologia'
const COMPANY_ADDRESS = 'Torre Milano - Av. Francisco Matarazzo,\n1400 - 13°Andar - Água Branca,\nSão Paulo/SP - CEP 05001-903'
const COMPANY_PHONE = 'T: (11) 2281-1650'
const COMPANY_EMAIL = 'E: contato@olos.com.br'

// Left sidebar width
const SIDEBAR_WIDTH = 60
const SIDEBAR_BG_COLOR = '#f8f9fa'

async function loadLogoAsBase64(): Promise<string | null> {
  try {
    const response = await fetch('/olos_lg-laranja.png')
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function exportToPdf(doc: RCADocument): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const contentMarginLeft = SIDEBAR_WIDTH + 10
  const contentMarginRight = 15
  const contentWidth = pageWidth - contentMarginLeft - contentMarginRight
  let y = 0

  const logoData = await loadLogoAsBase64()

  function drawSidebar() {
    // Sidebar background
    pdf.setFillColor(248, 249, 250)
    pdf.rect(0, 0, SIDEBAR_WIDTH, pageHeight, 'F')

    // Right border line
    pdf.setDrawColor(220, 220, 220)
    pdf.setLineWidth(0.3)
    pdf.line(SIDEBAR_WIDTH, 0, SIDEBAR_WIDTH, pageHeight)

    // Logo
    if (logoData) {
      try {
        pdf.addImage(logoData, 'PNG', 8, 12, 44, 15)
      } catch {
        // fallback: write company name
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(255, 102, 0)
        pdf.text(COMPANY_NAME, 8, 22)
      }
    } else {
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(255, 102, 0)
      pdf.text(COMPANY_NAME, 8, 22)
    }

    // Company info
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100)

    const addressLines = COMPANY_ADDRESS.split('\n')
    let infoY = 35
    for (const line of addressLines) {
      pdf.text(line, 8, infoY)
      infoY += 3.5
    }
    infoY += 2
    pdf.text(COMPANY_PHONE, 8, infoY)
    infoY += 3.5
    pdf.text(COMPANY_EMAIL, 8, infoY)
    infoY += 5
    pdf.setFontSize(6.5)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(255, 102, 0)
    pdf.text(COMPANY_NAME, 8, infoY)
  }

  function newPage() {
    pdf.addPage()
    drawSidebar()
    y = 20
  }

  function checkPageBreak(needed: number) {
    if (y + needed > pageHeight - 15) {
      newPage()
    }
  }

  function addSectionTitle(text: string) {
    checkPageBreak(14)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(40, 40, 40)
    pdf.text(text, contentMarginLeft, y)
    y += 7
  }

  function addText(text: string, indent = 0) {
    if (!text) return
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(60, 60, 60)
    const cleanText = stripHtml(text)
    const lines = pdf.splitTextToSize(cleanText, contentWidth - indent)
    for (const line of lines) {
      checkPageBreak(5)
      pdf.text(line, contentMarginLeft + indent, y)
      y += 4.2
    }
    y += 2
  }

  function addField(label: string, value: string) {
    checkPageBreak(8)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(40, 40, 40)
    pdf.text(`${label}: `, contentMarginLeft, y)
    const labelWidth = pdf.getTextWidth(`${label}: `)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(60, 60, 60)

    const val = value || 'N/A'
    const availWidth = contentWidth - labelWidth
    const valueLines = pdf.splitTextToSize(val, availWidth)
    pdf.text(valueLines[0], contentMarginLeft + labelWidth, y)
    y += 4.2

    for (let i = 1; i < valueLines.length; i++) {
      checkPageBreak(5)
      pdf.text(valueLines[i], contentMarginLeft + labelWidth, y)
      y += 4.2
    }
    y += 1.5
  }

  // ========== PAGE 1 - COVER ==========
  drawSidebar()

  // Cover title
  y = 80
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(40, 40, 40)
  pdf.text('Relatório de evento', contentMarginLeft, y)
  y += 15

  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(80, 80, 80)
  pdf.text(`Incidente: ${doc.incidentId || 'N/A'}`, contentMarginLeft, y)
  y += 10

  if (doc.title) {
    pdf.setFontSize(11)
    pdf.text(doc.title, contentMarginLeft, y)
  }

  // ========== PAGE 2 - CONTENT ==========
  newPage()

  // Description
  addField('Descrição', doc.description)

  // Dates
  const startFormatted = doc.startDate ? formatDateTime(doc.startDate) : ''
  const endFormatted = doc.endDate ? formatDateTime(doc.endDate) : ''
  addField('Data de Início', startFormatted)

  // End date + downtime on same conceptual line
  let endLine = endFormatted
  if (doc.totalDowntime) {
    endLine += ` | Tempo Total Indisponibilidade: ${doc.totalDowntime}`
  }
  addField('Data de Solução', endLine)

  addField('Impacto ao Cliente', doc.clientImpactDescription ? stripHtml(doc.clientImpactDescription) : '')

  // Affected info
  if (doc.affectedClients) {
    addField('Clientes Afetados', doc.affectedClients)
  }
  if (doc.affectedServices) {
    addField('Serviços Afetados', doc.affectedServices)
  }
  if (doc.affectedEnvironments) {
    addField('Ambientes Afetados', doc.affectedEnvironments)
  }

  y += 3

  // Timeline - "Principais Eventos"
  if (doc.timeline.length > 0) {
    addSectionTitle('Principais Eventos:')
    y += 2

    const sorted = [...doc.timeline].sort((a, b) => {
      if (!a.dateTime || !b.dateTime) return 0
      return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    })

    for (const entry of sorted) {
      checkPageBreak(10)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(40, 40, 40)

      const timeLabel = formatDateTime(entry.dateTime) || entry.dateTime
      pdf.text(`${timeLabel} –`, contentMarginLeft, y)

      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(60, 60, 60)
      const timeWidth = pdf.getTextWidth(`${timeLabel} – `)
      const eventLines = pdf.splitTextToSize(entry.event, contentWidth - timeWidth)

      if (eventLines.length > 0) {
        pdf.text(eventLines[0], contentMarginLeft + timeWidth, y)
        y += 4.2
        for (let i = 1; i < eventLines.length; i++) {
          checkPageBreak(5)
          pdf.text(eventLines[i], contentMarginLeft + timeWidth, y)
          y += 4.2
        }
      } else {
        y += 4.2
      }
      y += 1.5
    }
    y += 3
  }

  // Root Cause
  if (doc.rootCause) {
    addSectionTitle('Causa Raiz do Incidente')
    addText(doc.rootCause)
    y += 3
  }

  // Corrective Actions
  if (doc.correctiveActions.length > 0) {
    addSectionTitle('Ações Corretivas')
    for (let i = 0; i < doc.correctiveActions.length; i++) {
      const action = doc.correctiveActions[i]
      checkPageBreak(8)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(60, 60, 60)
      const actionText = `${i + 1}. ${action.description}`
      const actionLines = pdf.splitTextToSize(actionText, contentWidth)
      for (const line of actionLines) {
        checkPageBreak(5)
        pdf.text(line, contentMarginLeft, y)
        y += 4.2
      }
      // Status line
      const statusLine = `(Responsável: ${action.responsible || 'N/A'} / Status: ${getStatusLabel(action.status)} / Data: ${action.deadline || 'N/A'})`
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      const statusLines = pdf.splitTextToSize(statusLine, contentWidth)
      for (const line of statusLines) {
        checkPageBreak(5)
        pdf.text(line, contentMarginLeft, y)
        y += 3.8
      }
      y += 2
    }
    y += 3
  }

  // Preventive Actions
  if (doc.preventiveActions.length > 0) {
    addSectionTitle('Ações Preventivas')
    for (let i = 0; i < doc.preventiveActions.length; i++) {
      const action = doc.preventiveActions[i]
      checkPageBreak(8)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(60, 60, 60)
      const actionText = `${i + 1}. ${action.description}`
      const actionLines = pdf.splitTextToSize(actionText, contentWidth)
      for (const line of actionLines) {
        checkPageBreak(5)
        pdf.text(line, contentMarginLeft, y)
        y += 4.2
      }
      const statusLine = `(Responsável: ${action.responsible || 'N/A'} / Status: ${getStatusLabel(action.status)} / Data: ${action.deadline || 'N/A'})`
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      const statusLines = pdf.splitTextToSize(statusLine, contentWidth)
      for (const line of statusLines) {
        checkPageBreak(5)
        pdf.text(line, contentMarginLeft, y)
        y += 3.8
      }
      y += 2
    }
    y += 3
  }

  // ========== Considerations (may need new page) ==========
  if (doc.considerations) {
    checkPageBreak(30)
    addSectionTitle('Considerações')
    addText(doc.considerations)
  }

  // Save
  const fileName = `RCA_${doc.incidentId || doc.id}_${doc.createdAt}.pdf`
  pdf.save(fileName)
}
