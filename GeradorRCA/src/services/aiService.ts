import { AIConfig, RCADocument } from '../types/rca'

export class AIService {
  private config: AIConfig | null = null

  configure(config: AIConfig) {
    this.config = config
  }

  isConfigured(): boolean {
    return !!(this.config?.apiKey && this.config?.awsRegion && this.config?.modelId)
  }

  private getEndpoint(modelId: string): string {
    const region = this.config!.awsRegion
    return `https://bedrock-runtime.${region}.amazonaws.com/model/${modelId}/converse`
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config) {
      return { success: false, message: 'Configuração não encontrada' }
    }

    try {
      const response = await fetch(this.getEndpoint(this.config.modelId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: [{ text: 'Diga apenas "OK" para testar a conexão.' }] },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return { success: false, message: `Erro ${response.status}: ${error}` }
      }

      return { success: true, message: 'Conexão estabelecida com sucesso!' }
    } catch (error: any) {
      return {
        success: false,
        message: `Erro na conexão: ${error.message || 'Erro desconhecido'}`,
      }
    }
  }

  async suggest(
    field: string,
    context: Partial<RCADocument>
  ): Promise<string> {
    if (!this.config) {
      throw new Error('IA não configurada')
    }

    const prompt = this.buildPrompt(field, context)

    const response = await fetch(this.getEndpoint(this.config.modelId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: [{ text: prompt }] },
        ],
        inferenceConfig: {
          maxTokens: 2000,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    if (data.output?.message?.content && data.output.message.content.length > 0) {
      return data.output.message.content[0].text
    }

    throw new Error('Resposta vazia da IA')
  }

  private buildPrompt(field: string, context: Partial<RCADocument>): string {
    const baseContext = `
Você é um especialista em análise de causa raiz (RCA) para incidentes de TI.
Contexto do incidente:
- Título: ${context.title || 'Não definido'}
- ID do Incidente: ${context.incidentId || 'Não definido'}
- Descrição: ${context.description || 'Não definida'}
- Serviços afetados: ${context.affectedServices || 'Não definidos'}
- Clientes afetados: ${context.affectedClients || 'Não definidos'}
- Causa raiz: ${context.rootCause || 'Não definida'}
`.trim()

    const fieldPrompts: Record<string, string> = {
      rootCause: `${baseContext}\n\nDescreva a causa raiz deste incidente e o que foi feito para resolver o problema de forma técnica e clara em português brasileiro.`,
      correctiveActions: `${baseContext}\n\nSugira ações corretivas para este incidente em português brasileiro. Liste de 3 a 5 ações com responsável sugerido e prazo. Formato: uma ação por linha.`,
      preventiveActions: `${baseContext}\n\nSugira ações preventivas para evitar a recorrência deste tipo de incidente em português brasileiro. Liste de 3 a 5 ações com responsável sugerido e prazo. Formato: uma ação por linha.`,
      considerations: `${baseContext}\n\nEscreva considerações finais para este RCA em português brasileiro, incluindo recomendações gerais.`,
      clientImpactDescription: `${baseContext}\n\nDescreva o impacto nos clientes de forma clara e objetiva em português brasileiro.`,
    }

    return fieldPrompts[field] || `${baseContext}\n\nGere conteúdo relevante para o campo "${field}" deste documento RCA em português brasileiro.`
  }
}

export const aiService = new AIService()
