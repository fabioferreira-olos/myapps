import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Header,
} from 'docx'
import { saveAs } from 'file-saver'
import { RCADocument } from '../types/rca'
import { formatDateTime, getStatusLabel, getActionTypeLabel, getRecurrenceLabel, getUnavailabilityLabel, stripHtml } from '../utils/formatters'

const COMPANY_NAME = 'Olos Tecnologia'
const COMPANY_ADDRESS = 'Torre Milano - Av. Francisco Matarazzo, 1400 - 13°Andar - Água Branca, São Paulo/SP - CEP 05001-903'
const COMPANY_PHONE = 'T: (11) 2281-1650'
const COMPANY_EMAIL = 'E: contato@olos.com.br'

async function loadLogoBuffer(): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch('/olos_lg-laranja.png')
    return await response.arrayBuffer()
  } catch {
    return null
  }
}

export async function exportToDocx(doc: RCADocument): Promise<void> {
  const logoBuffer = await loadLogoBuffer()
  const children: Paragraph[] = []

  // Helper functions
  function addHeading(text: string) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            size: 24,
            color: '282828',
          }),
        ],
        spacing: { before: 300, after: 150 },
      })
    )
  }

  function addField(label: string, value: string) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true, size: 20, color: '282828' }),
          new TextRun({ text: value || 'N/A', size: 20, color: '3c3c3c' }),
        ],
        spacing: { after: 80 },
      })
    )
  }

  function addRichText(content: string) {
    const plainText = stripHtml(content)
    const paragraphs = plainText.split('\n').filter(Boolean)
    for (const p of paragraphs) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: p, size: 20, color: '3c3c3c' })],
          spacing: { after: 60 },
        })
      )
    }
    if (paragraphs.length === 0 && plainText) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: plainText, size: 20, color: '3c3c3c' })],
          spacing: { after: 60 },
        })
      )
    }
  }

  // Cover page title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Relatório de evento',
          bold: true,
          size: 36,
          color: '282828',
        }),
      ],
      spacing: { before: 600, after: 200 },
    })
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Incidente: ${doc.incidentId || 'N/A'}`,
          size: 28,
          color: '555555',
        }),
      ],
      spacing: { after: 100 },
    })
  )

  if (doc.title) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: doc.title, size: 24, color: '555555' }),
        ],
        spacing: { after: 400 },
      })
    )
  }

  // Separator
  children.push(new Paragraph({ spacing: { after: 200 } }))

  // Description
  addField('Descrição', doc.description)

  // Dates
  const startFormatted = doc.startDate ? formatDateTime(doc.startDate) : 'N/A'
  const endFormatted = doc.endDate ? formatDateTime(doc.endDate) : 'N/A'
  addField('Data de Início', startFormatted)
  addField('Data de Solução', `${endFormatted}${doc.totalDowntime ? ` | Tempo Total Indisponibilidade: ${doc.totalDowntime}` : ''}`)

  // Impact
  if (doc.clientImpactDescription) {
    addField('Impacto ao Cliente', stripHtml(doc.clientImpactDescription))
  }
  if (doc.affectedClients) {
    addField('Clientes Afetados', doc.affectedClients)
  }
  if (doc.affectedServices) {
    addField('Serviços Afetados', doc.affectedServices)
  }
  if (doc.affectedEnvironments) {
    addField('Ambientes Afetados', doc.affectedEnvironments)
  }
  if (doc.recurrence) {
    addField('Reincidência', getRecurrenceLabel(doc.recurrence))
  }
  if (doc.unavailability) {
    addField('Indisponibilidade', getUnavailabilityLabel(doc.unavailability))
  }

  children.push(new Paragraph({ spacing: { after: 200 } }))

  // Timeline - Principais Eventos
  if (doc.timeline.length > 0) {
    addHeading('Principais Eventos:')

    const sorted = [...doc.timeline].sort((a, b) => {
      if (!a.dateTime || !b.dateTime) return 0
      return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    })

    for (const entry of sorted) {
      const timeLabel = formatDateTime(entry.dateTime) || entry.dateTime
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${timeLabel} – `, bold: true, size: 20, color: '282828' }),
            new TextRun({ text: entry.event, size: 20, color: '3c3c3c' }),
          ],
          spacing: { after: 80 },
        })
      )
    }
    children.push(new Paragraph({ spacing: { after: 200 } }))
  }

  // Root Cause
  if (doc.rootCause) {
    addHeading('Causa Raiz do Incidente')
    addRichText(doc.rootCause)
    children.push(new Paragraph({ spacing: { after: 200 } }))
  }

  // Corrective Actions
  if (doc.correctiveActions.length > 0) {
    addHeading('Ações Corretivas')
    for (let i = 0; i < doc.correctiveActions.length; i++) {
      const action = doc.correctiveActions[i]
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${i + 1}. ${action.description}`, size: 20, color: '3c3c3c' }),
          ],
          spacing: { after: 40 },
        })
      )
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `(Responsável: ${action.responsible || 'N/A'} / Status: ${getStatusLabel(action.status)} / Tipo: ${getActionTypeLabel(action.actionType || '')} / Data: ${action.deadline || 'N/A'})`,
              size: 18,
              color: '666666',
              italics: true,
            }),
          ],
          spacing: { after: 100 },
        })
      )
    }
    children.push(new Paragraph({ spacing: { after: 200 } }))
  }

  // Preventive Actions
  if (doc.preventiveActions.length > 0) {
    addHeading('Ações Preventivas')
    for (let i = 0; i < doc.preventiveActions.length; i++) {
      const action = doc.preventiveActions[i]
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${i + 1}. ${action.description}`, size: 20, color: '3c3c3c' }),
          ],
          spacing: { after: 40 },
        })
      )
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `(Responsável: ${action.responsible || 'N/A'} / Status: ${getStatusLabel(action.status)} / Data: ${action.deadline || 'N/A'})`,
              size: 18,
              color: '666666',
              italics: true,
            }),
          ],
          spacing: { after: 100 },
        })
      )
    }
    children.push(new Paragraph({ spacing: { after: 200 } }))
  }

  // Considerations
  if (doc.considerations) {
    addHeading('Considerações')
    addRichText(doc.considerations)
  }

  // Build header with logo and company info
  const headerChildren: Paragraph[] = []

  if (logoBuffer) {
    headerChildren.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: { width: 120, height: 42 },
          }),
        ],
        spacing: { after: 60 },
      })
    )
  }

  headerChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: COMPANY_ADDRESS, size: 14, color: '666666' }),
      ],
      spacing: { after: 30 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${COMPANY_PHONE} | ${COMPANY_EMAIL}`, size: 14, color: '666666' }),
      ],
      spacing: { after: 30 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: COMPANY_NAME, size: 14, bold: true, color: 'FF6600' }),
      ],
      spacing: { after: 100 },
    })
  )

  // Generate document
  const docxDocument = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({ children: headerChildren }),
        },
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(docxDocument)
  const fileName = `RCA_${doc.incidentId || doc.id}_${doc.createdAt}.docx`
  saveAs(blob, fileName)
}
