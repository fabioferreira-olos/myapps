import { X, Sparkles, Loader2, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { useRCAStore } from '../context/RCAContext'
import { useAI } from '../hooks/useAI'

const fieldLabels: Record<string, string> = {
  executiveSummary: 'Resumo Executivo',
  immediateCause: 'Causa Imediata',
  underlyingCause: 'Causa Subjacente',
  immediateResolution: 'Resolução Imediata',
  correctiveActions: 'Ações Corretivas',
  preventiveActions: 'Ações Preventivas',
  whatWorkedWell: 'O que funcionou bem',
  whatCanImprove: 'O que pode melhorar',
  considerations: 'Considerações Finais',
  clientImpactDescription: 'Descrição do Impacto',
}

export default function AIAssistant() {
  const { aiPanelOpen, aiTargetField, setAIPanelOpen, updateField } = useRCAStore()
  const { loading, error, suggestion, generateSuggestion, clearSuggestion, isConfigured } = useAI()
  const [copied, setCopied] = useState(false)

  if (!aiPanelOpen) return null

  const handleGenerate = () => {
    if (aiTargetField) {
      generateSuggestion(aiTargetField)
    }
  }

  const handleApply = () => {
    if (suggestion && aiTargetField) {
      updateField(aiTargetField as any, suggestion)
      setAIPanelOpen(false)
      clearSuggestion()
    }
  }

  const handleCopy = () => {
    if (suggestion) {
      navigator.clipboard.writeText(suggestion)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setAIPanelOpen(false)
    clearSuggestion()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Assistente IA
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!isConfigured ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                IA não configurada
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Acesse <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">/admin</span> para configurar as credenciais do AWS Bedrock.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>Campo alvo:</strong>{' '}
                  {aiTargetField ? fieldLabels[aiTargetField] || aiTargetField : 'Não selecionado'}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  A IA usará o contexto do documento atual para gerar uma sugestão relevante.
                </p>
              </div>

              {!suggestion && !loading && !error && (
                <button
                  onClick={handleGenerate}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Gerar Sugestão
                </button>
              )}

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Gerando sugestão...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  <button
                    onClick={handleGenerate}
                    className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {suggestion && (
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Sugestão gerada
                      </span>
                      <button
                        onClick={handleCopy}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        title="Copiar"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                      {suggestion}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleApply} className="flex-1 btn-primary">
                      Aplicar Sugestão
                    </button>
                    <button onClick={handleGenerate} className="btn-secondary">
                      Regenerar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
