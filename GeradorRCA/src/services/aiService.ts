import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { AIConfig, RCADocument } from '../types/rca'

export class AIService {
  private client: BedrockRuntimeClient | null = null
  private config: AIConfig | null = null

  configure(config: AIConfig) {
    this.config = config
    this.client = new BedrockRuntimeClient({
      region: config.awsRegion,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
  }

  isConfigured(): boolean {
    return !!(this.client && this.config)
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.client || !this.config) {
      return { success: false, message: 'Configuração não encontrada' }
    }

    try {
      const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 50,
        messages: [
          { role: 'user', content: 'Diga apenas "OK" para testar a conexão.' },
        ],
      }

      const command = new InvokeModelCommand({
        modelId: this.config.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
      })

      await this.client.send(command)
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
    if (!this.client || !this.config) {
      throw new Error('IA não configurada')
    }

    const prompt = this.buildPrompt(field, context)

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: prompt },
      ],
    }

    const command = new InvokeModelCommand({
      modelId: this.config.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    })

    const response = await this.client.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))

    if (responseBody.content && responseBody.content.length > 0) {
      return responseBody.content[0].text
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
- Ambientes afetados: ${context.affectedEnvironments || 'Não definidos'}
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
