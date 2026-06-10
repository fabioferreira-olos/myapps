import { useState, useEffect } from 'react'
import { aiService } from '../services/aiService'
import { useAIConfigStore, useRCAStore } from '../context/RCAContext'

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const { config, loadConfig, isConfigured } = useAIConfigStore()
  const document = useRCAStore((s) => s.document)

  useEffect(() => {
    loadConfig()
  }, [])

  useEffect(() => {
    if (config) {
      aiService.configure(config)
    }
  }, [config])

  const generateSuggestion = async (field: string) => {
    if (!isConfigured()) {
      setError('IA não configurada. Acesse /admin para configurar.')
      return
    }

    setLoading(true)
    setError(null)
    setSuggestion(null)

    try {
      const result = await aiService.suggest(field, document)
      setSuggestion(result)
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar sugestão')
    } finally {
      setLoading(false)
    }
  }

  const clearSuggestion = () => {
    setSuggestion(null)
    setError(null)
  }

  return {
    loading,
    error,
    suggestion,
    generateSuggestion,
    clearSuggestion,
    isConfigured: isConfigured(),
  }
}
