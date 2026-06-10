import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, Wifi, WifiOff, Lock, Eye, EyeOff, Plus, X } from 'lucide-react'
import { useAIConfigStore } from '../context/RCAContext'
import { aiService } from '../services/aiService'
import { AIConfig } from '../types/rca'
import { fetchClients, createClient, deleteClient, Client, fetchRCAs, deleteRCA, RCASummary, verifyPassword, changePassword } from '../services/apiService'

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

  // RCA management state
  const [rcas, setRcas] = useState<RCASummary[]>([])
  const [rcasLoading, setRcasLoading] = useState(false)
  const [deleteRcaId, setDeleteRcaId] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Password change state
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  useEffect(() => {
    if (config) {
      setFormData(config)
    }
  }, [config])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const valid = await verifyPassword(password)
    if (valid) {
      setAuthenticated(true)
      setPasswordError('')
      loadClients()
      loadRCAs()
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
    const names = newClientName.split(',').map(n => n.trim()).filter(n => n.length > 0)
    if (names.length === 0) return
    try {
      for (const name of names) {
        await createClient(name)
      }
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

  const loadRCAs = async () => {
    setRcasLoading(true)
    try {
      const data = await fetchRCAs()
      setRcas(data)
    } catch (err) {
      console.error('Failed to load RCAs:', err)
    } finally {
      setRcasLoading(false)
    }
  }

  const handleDeleteRCA = async (id: string) => {
    if (!confirm(`Tem certeza que deseja DELETAR a RCA ${id}? Esta ação é irreversível.`)) return
    try {
      await deleteRCA(id)
      await loadRCAs()
    } catch (err) {
      console.error('Failed to delete RCA:', err)
    }
  }

  const handleDeleteRCAConfirm = async () => {
    if (deleteConfirmation !== 'TENHO CERTEZA') return
    try {
      await deleteRCA(deleteRcaId)
      setDeleteRcaId('')
      setDeleteConfirmation('')
      setShowDeleteConfirm(false)
      await loadRCAs()
    } catch (err) {
      console.error('Failed to delete RCA:', err)
      alert('Erro ao deletar RCA. Verifique se o ID está correto.')
    }
  }

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      setPwMessage({ type: 'error', text: 'Preencha todos os campos' })
      return
    }
    if (newPw !== confirmPw) {
      setPwMessage({ type: 'error', text: 'Nova senha e confirmação não coincidem' })
      return
    }
    if (newPw.length < 6) {
      setPwMessage({ type: 'error', text: 'Nova senha deve ter pelo menos 6 caracteres' })
      return
    }
    const result = await changePassword(currentPw, newPw)
    if (result.success) {
      setPwMessage({ type: 'success', text: 'Senha alterada com sucesso!' })
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } else {
      setPwMessage({ type: 'error', text: result.error || 'Erro ao alterar senha' })
    }
    setTimeout(() => setPwMessage(null), 5000)
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
              placeholder="Cliente1, Cliente2, Cliente3..."
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
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
            Separe múltiplos clientes por vírgula
          </p>

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

        {/* RCA Management */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
          Deletar RCA
        </h2>
        <div className="card space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Cuidado: a exclusão de RCAs é permanente e não pode ser desfeita.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={deleteRcaId}
              onChange={(e) => setDeleteRcaId(e.target.value)}
              className="input-field flex-1 font-mono"
              placeholder="ID da RCA (ex: RCA20260610-01)"
            />
            <button
              onClick={() => {
                if (!deleteRcaId.trim()) return
                setShowDeleteConfirm(true)
                setDeleteConfirmation('')
              }}
              disabled={!deleteRcaId.trim()}
              className="btn-danger flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Deletar
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-3">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                Digite TENHO CERTEZA para deletar permanentemente esta RCA.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="input-field flex-1"
                  placeholder="TENHO CERTEZA"
                />
                <button
                  onClick={handleDeleteRCAConfirm}
                  disabled={deleteConfirmation !== 'TENHO CERTEZA'}
                  className="btn-danger"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmation('') }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Password Change */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
          Alterar Senha
        </h2>
        <div className="card space-y-4">
          <div className="space-y-3">
            <div>
              <label className="label">Senha Atual</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="input-field"
                placeholder="Digite a senha atual"
              />
            </div>
            <div>
              <label className="label">Nova Senha</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="input-field"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="label">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="input-field"
                placeholder="Repita a nova senha"
              />
            </div>
          </div>

          {pwMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              pwMessage.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}>
              {pwMessage.text}
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={!currentPw || !newPw || !confirmPw}
            className="btn-primary"
          >
            Alterar Senha
          </button>
        </div>
      </div>
    </div>
  )
}
