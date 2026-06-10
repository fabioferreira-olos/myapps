import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, Wifi, WifiOff, Lock, Eye, EyeOff, Plus, X } from 'lucide-react'
import { useAIConfigStore } from '../context/RCAContext'
import { aiService } from '../services/aiService'
import { AIConfig } from '../types/rca'
import { fetchClients, createClient, deleteClient, Client } from '../services/apiService'

export default function AdminPanel() {
  const navigate = useNavigate()
  const { config, loadConfig, saveConfig, clearConfig } = useAIConfigStore()
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState<AIConfig>({
    awsRegion: 'us-east-1',
    modelId: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    apiKey: '',
  })

  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [saved, setSaved] = useState(false)

  // Client management state
  const [clients, setClients] = useState<Client[]>([])
  const [newClientName, setNewClientName] = useState('')
  const [clientsLoading, setClientsLoading] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  useEffect(() => {
    if (config) {
      setFormData(config)
    }
  }, [config])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'Olos@123!') {
      setAuthenticated(true)
      setPasswordError('')
      loadClients()
    } else {
      setPasswordError('Senha incorreta')
    }
  }

  const loadClients = async () => {
    setClientsLoading(true)
    try {
      const data = await fetchClients()
      setClients(data)
    } catch (err) {
      console.error('Failed to load clients:', err)
    } finally {
      setClientsLoading(false)
    }
  }

  const handleAddClient = async () => {
    if (!newClientName.trim()) return
    try {
      await createClient(newClientName.trim())
      setNewClientName('')
      await loadClients()
    } catch (err) {
      console.error('Failed to add client:', err)
    }
  }

  const handleDeleteClient = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este cliente?')) return
    try {
      await deleteClient(id)
      await loadClients()
    } catch (err) {
      console.error('Failed to delete client:', err)
    }
  }

  const handleSave = () => {
    saveConfig(formData)
    aiService.configure(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    aiService.configure(formData)
    const result = await aiService.testConnection()
    setTestResult(result)
    setTesting(false)
  }

  const handleClear = () => {
    if (confirm('Tem certeza que deseja limpar todas as configurações de IA?')) {
      clearConfig()
      setFormData({
        awsRegion: 'us-east-1',
        modelId: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
        apiKey: '',
      })
      setTestResult(null)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="card max-w-sm w-full">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 mx-auto mb-3 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Painel de Administração
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Digite a senha para acessar as configurações
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Digite a senha..."
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-600 mt-1">{passwordError}</p>
              )}
            </div>
            <button type="submit" className="btn-primary w-full">
              Entrar
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Administração
          </h1>
        </div>

        <div className="card space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Configure as credenciais do AWS Bedrock para habilitar o assistente de IA.
              As credenciais são armazenadas localmente no navegador.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Região AWS</label>
              <input
                type="text"
                value={formData.awsRegion}
                onChange={(e) => setFormData({ ...formData, awsRegion: e.target.value })}
                className="input-field"
                placeholder="us-east-1"
              />
            </div>

            <div>
              <label className="label">Model ID do Bedrock</label>
              <input
                type="text"
                value={formData.modelId}
                onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                className="input-field"
                placeholder="us.anthropic.claude-sonnet-4-20250514-v1:0"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ex: us.anthropic.claude-sonnet-4-20250514-v1:0, us.anthropic.claude-3-5-haiku-20241022-v1:0
              </p>
            </div>

            <div>
              <label className="label">API Key do Bedrock</label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="input-field font-mono text-sm"
                placeholder="Cole aqui sua API Key do Bedrock"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Gerada no console AWS Bedrock → API Keys
              </p>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                testResult.success
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
            >
              {testResult.success ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600" />
              )}
              <span
                className={`text-sm ${
                  testResult.success
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}
              >
                {testResult.message}
              </span>
            </div>
          )}

          {saved && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <span className="text-sm text-green-800 dark:text-green-200">
                ✓ Configurações salvas com sucesso!
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Salvar Configurações
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !formData.apiKey}
              className="btn-secondary flex items-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              {testing ? 'Testando...' : 'Testar Conexão'}
            </button>
            <button onClick={handleClear} className="btn-danger flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Limpar
            </button>
          </div>
        </div>

        {/* Client Management */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
          Cadastro de Clientes
        </h2>
        <div className="card space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Gerencie os clientes disponíveis para seleção nos documentos RCA.
            </p>
          </div>

          {/* Add new client */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddClient()}
              className="input-field flex-1"
              placeholder="Nome do novo cliente..."
            />
            <button
              onClick={handleAddClient}
              disabled={!newClientName.trim()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          {/* Client list */}
          {clientsLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
          ) : clients.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum cliente cadastrado</p>
          ) : (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg divide-y divide-gray-200 dark:divide-gray-600">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span className="text-sm text-gray-800 dark:text-gray-200">{client.name}</span>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    title="Remover cliente"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
