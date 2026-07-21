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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="card-strong animate-fade-up w-full max-w-2xl max-h-[80vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-oid-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-light" />
            <h2 className="text-lg font-semibold text-oid-text">
              Assistente IA
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-oid-surface-hover rounded-oid-xxs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!isConfigured ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-oid-muted" />
              <p className="text-oid-sub font-medium">
                IA não configurada
              </p>
              <p className="text-sm text-oid-muted mt-1">
                Acesse <span className="font-mono bg-[rgba(255,255,255,0.04)] px-1.5 py-0.5 rounded-oid-xxs">/admin</span> para configurar as credenciais do AWS Bedrock.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-accent-glow rounded-oid-sm p-4">
                <p className="text-sm text-accent-light">
                  <strong>Campo alvo:</strong>{' '}
                  {aiTargetField ? fieldLabels[aiTargetField] || aiTargetField : 'Não selecionado'}
                </p>
                <p className="text-xs text-accent-light/70 mt-1">
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
                  <Loader2 className="w-6 h-6 animate-spin text-accent-light" />
                  <span className="ml-2 text-oid-sub">Gerando sugestão...</span>
                </div>
              )}

              {error && (
                <div className="bg-status-red-bg border border-status-red-border rounded-oid-sm p-4 animate-fade-in">
                  <p className="text-sm text-status-red">{error}</p>
                  <button
                    onClick={handleGenerate}
                    className="mt-2 text-sm text-status-red underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {suggestion && (
                <div className="space-y-3">
                  <div className="bg-oid-surface-soft rounded-oid-sm p-4 border border-oid-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-oid-muted uppercase">
                        Sugestão gerada
                      </span>
                      <button
                        onClick={handleCopy}
                        className="text-oid-muted hover:text-oid-sub"
                        title="Copiar"
                      >
                        {copied ? <Check className="w-4 h-4 text-status-green" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-sm text-oid-sub whitespace-pre-wrap max-h-60 overflow-y-auto">
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
