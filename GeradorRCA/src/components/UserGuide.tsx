import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function UserGuide() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Guia de Uso
          </h1>
        </div>

        <div className="card prose prose-sm dark:prose-invert max-w-none">
          <h2>Visão Geral</h2>
          <p>
            O <strong>Gerador de RCA</strong> é uma ferramenta interna da Olos Tecnologia para criação de documentos de
            Análise de Causa Raiz (RCA) de incidentes. Ele permite preencher todas as informações do incidente de forma
            estruturada, salvar no banco de dados e exportar como PDF ou DOCX.
          </p>

          <h2>Criando uma Nova RCA</h2>
          <p>O formulário é dividido em seções acessíveis pela barra lateral esquerda:</p>
          <ol>
            <li><strong>Informações Gerais</strong> — Título, ID do incidente, autor e data de criação</li>
            <li><strong>Incidente</strong> — Descrição, datas de início/término, reincidência e nível de indisponibilidade</li>
            <li><strong>Impacto</strong> — Clientes afetados (seleção), serviços afetados e descrição do impacto</li>
            <li><strong>Linha do Tempo</strong> — Eventos em ordem cronológica com data/hora</li>
            <li><strong>Causa Raiz</strong> — Descrição técnica do que causou o incidente e como foi resolvido</li>
            <li><strong>Ações Corretivas</strong> — Ações tomadas para corrigir, com responsável, prazo, status e tipo (Definitiva ou Contorno)</li>
            <li><strong>Ações Preventivas</strong> — Ações para evitar recorrência (opcional)</li>
            <li><strong>Considerações</strong> — Observações e recomendações finais</li>
          </ol>

          <h2>Campos Obrigatórios</h2>
          <p>Para gravar uma RCA no banco, todos os campos devem estar preenchidos (exceto Ações Preventivas que é opcional):</p>
          <ul>
            <li>Campos de texto precisam ter no mínimo <strong>5 caracteres</strong></li>
            <li>Serviços Afetados precisa ter no mínimo <strong>2 caracteres</strong></li>
            <li>Selects (Reincidência, Indisponibilidade) devem ter uma opção selecionada</li>
            <li>Ações Corretivas devem ter pelo menos <strong>1 item</strong> com o Tipo definido</li>
            <li>Todas as datas são obrigatórias</li>
          </ul>

          <h2>Salvando e Gravando</h2>
          <table>
            <thead>
              <tr>
                <th>Ação</th>
                <th>O que faz</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Draft</strong></td>
                <td>Salva os dados localmente no navegador. Útil para continuar depois sem perder o progresso. Não gera ID.</td>
              </tr>
              <tr>
                <td><strong>Gravar</strong></td>
                <td>Valida os campos obrigatórios e salva no banco de dados. Gera um ID único (ex: RCA20260610-01) e redireciona para a lista de RCAs.</td>
              </tr>
              <tr>
                <td><strong>Atualizar</strong></td>
                <td>Aparece quando você está editando uma RCA existente. Salva as alterações no banco e redireciona para a lista.</td>
              </tr>
            </tbody>
          </table>

          <h2>Editando uma RCA Existente</h2>
          <ol>
            <li>Clique no botão <strong>"Gerar RCA"</strong> no header</li>
            <li>Na lista, clique em <strong>"Editar"</strong> na RCA desejada</li>
            <li>O formulário será carregado com os dados da RCA</li>
            <li>O status no header mostrará "Editando RCA [ID]"</li>
            <li>Faça as alterações e clique em <strong>"Atualizar"</strong></li>
          </ol>

          <h2>Exportando PDF / DOCX</h2>
          <ol>
            <li>Clique no botão <strong>"Gerar RCA"</strong> no header</li>
            <li>Use os filtros de data para encontrar a RCA desejada</li>
            <li>Clique em <strong>"PDF"</strong> ou <strong>"DOCX"</strong> para baixar o arquivo</li>
          </ol>
          <p>Os documentos exportados incluem o cabeçalho da Olos com logo, endereço e informações de contato.</p>

          <h2>Assistente de IA</h2>
          <p>
            O assistente de IA pode sugerir textos para campos como Causa Raiz, Impacto e Considerações.
            Para usá-lo:
          </p>
          <ol>
            <li>Configure a IA em <strong>Administração</strong> (ícone de engrenagem)</li>
            <li>Preencha a Região AWS, Model ID e API Key do Bedrock</li>
            <li>Nos campos com editor de texto, clique no ícone <strong>✨</strong> (sparkle) para gerar uma sugestão</li>
          </ol>

          <h2>Administração</h2>
          <p>Acesse pelo ícone de <strong>engrenagem</strong> no header. A senha padrão é fornecida pelo administrador.</p>
          <ul>
            <li><strong>Configuração de IA</strong> — Região, Model ID e API Key do AWS Bedrock</li>
            <li><strong>Cadastro de Clientes</strong> — Adicione ou remova clientes disponíveis para seleção nos documentos RCA</li>
          </ul>

          <h2>Status do Header</h2>
          <p>O centro do header mostra o estado atual:</p>
          <ul>
            <li><strong>"Editando RCA nova"</strong> — Você está criando uma RCA do zero</li>
            <li><strong>"Editando RCA [ID]"</strong> — Você está editando uma RCA existente</li>
          </ul>

          <h2>Dicas</h2>
          <ul>
            <li>Use o botão <strong>"Nova RCA"</strong> na página de listagem para começar uma RCA limpa</li>
            <li>O botão <strong>"Preview"</strong> permite visualizar como ficará o documento antes de gravar</li>
            <li>O tempo de indisponibilidade é calculado automaticamente a partir das datas de início e término</li>
            <li>Use o <strong>Draft</strong> frequentemente para não perder dados em caso de fechar o navegador</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
