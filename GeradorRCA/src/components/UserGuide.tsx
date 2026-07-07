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
            <li><strong>Informações Gerais</strong> — Título, ID do incidente, autor, revisado por e data de criação</li>
            <li><strong>Incidente</strong> — Descrição, reincidência e nível de indisponibilidade</li>
            <li><strong>Impacto</strong> — Clientes afetados (seleção com busca), serviços afetados e descrição do impacto</li>
            <li><strong>Linha do Tempo</strong> — Eventos em ordem cronológica com data/hora. O tempo de indisponibilidade é calculado automaticamente (primeiro evento → último evento)</li>
            <li><strong>Causa Raiz</strong> — Descrição técnica do que causou o incidente e como foi resolvido</li>
            <li><strong>Ações Corretivas</strong> — Ações tomadas para corrigir, com responsável, prazo, status e tipo (Definitiva ou Contorno). Obrigatório pelo menos 1 item.</li>
            <li><strong>Ações Preventivas</strong> — Ações para evitar recorrência (opcional)</li>
            <li><strong>Considerações</strong> — Observações e recomendações finais (opcional — se vazio, não aparece no documento exportado)</li>
          </ol>

          <h2>Tempo de Indisponibilidade</h2>
          <p>O tempo de indisponibilidade é calculado automaticamente na seção <strong>Linha do Tempo</strong>:</p>
          <ul>
            <li>É necessário ter pelo menos <strong>2 eventos</strong> com data/hora preenchida</li>
            <li>O sistema pega o primeiro e o último evento (ordenados cronologicamente) e calcula a diferença</li>
            <li>O resultado é exibido em um card azul com Data de Início, Data de Término e Duração</li>
            <li>Use o checkbox <strong>"Ocultar tempo de indisponibilidade na RCA exportada"</strong> se não quiser que a duração apareça no documento final (as datas de início e término continuarão aparecendo)</li>
          </ul>

          <h2>Campos Obrigatórios</h2>
          <p>Para gravar uma RCA no banco, os seguintes campos devem estar preenchidos:</p>
          <ul>
            <li>Campos de texto com mín. <strong>5 caracteres</strong>: Título, ID Incidente, Criado por, Descrição, Clientes Afetados, Descrição do Impacto, Causa Raiz</li>
            <li>Serviços Afetados: mín. <strong>2 caracteres</strong></li>
            <li>Selects obrigatórios: Reincidência (Sim/Não), Indisponibilidade (Nenhuma/Parcial/Total)</li>
            <li>Data de Criação</li>
            <li>Linha do Tempo: mín. <strong>2 eventos</strong> (necessário para calcular indisponibilidade)</li>
            <li>Ações Corretivas: mín. <strong>1 item</strong> com Tipo (Definitiva/Contorno) definido</li>
          </ul>
          <p><strong>Opcionais:</strong> Revisado por, Ações Preventivas e Considerações Finais.</p>

          <h2>Botões do Header</h2>
          <table>
            <thead>
              <tr>
                <th>Botão</th>
                <th>Função</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Limpar/Nova</strong></td>
                <td>Limpa todos os campos localmente e inicia uma RCA do zero. Se estiver editando uma RCA existente, desvincula o ID e começa uma nova. <strong>Não altera nem deleta nada no banco de dados</strong> — a RCA original permanece intacta.</td>
              </tr>
              <tr>
                <td><strong>Draft</strong></td>
                <td>Salva os dados localmente no navegador. Útil para continuar depois sem perder o progresso. Não gera ID.</td>
              </tr>
              <tr>
                <td><strong>Gravar</strong></td>
                <td>Valida os campos obrigatórios e salva no banco. Gera um ID único (ex: RCA20260610-01) e redireciona para a lista de RCAs.</td>
              </tr>
              <tr>
                <td><strong>Atualizar</strong></td>
                <td>Aparece quando editando uma RCA existente. Salva as alterações e redireciona para a lista.</td>
              </tr>
              <tr>
                <td><strong>Preview</strong></td>
                <td>Visualiza o documento formatado antes de gravar.</td>
              </tr>
              <tr>
                <td><strong>Gerar RCA</strong></td>
                <td>Abre a lista de RCAs gravadas para exportar ou editar.</td>
              </tr>
              <tr>
                <td><strong>⚙️ (Engrenagem)</strong></td>
                <td>Acessa a área de administração.</td>
              </tr>
              <tr>
                <td><strong>🌙/☀️</strong></td>
                <td>Alterna entre modo claro e escuro.</td>
              </tr>
              <tr>
                <td><strong>? (Interrogação)</strong></td>
                <td>Abre este guia de uso.</td>
              </tr>
            </tbody>
          </table>

          <h2>Status do Header</h2>
          <p>O centro do header mostra o estado atual:</p>
          <ul>
            <li><strong>"Editando RCA nova"</strong> — Criando uma RCA do zero, sem ID</li>
            <li><strong>"Editando RCA [ID]"</strong> — Editando uma RCA já salva no banco</li>
          </ul>

          <h2>Editando uma RCA Existente</h2>
          <ol>
            <li>Clique no botão <strong>"Gerar RCA"</strong> no header</li>
            <li>Na lista, clique em <strong>"Editar"</strong> na RCA desejada</li>
            <li>Digite a <strong>senha de edição</strong> quando solicitado</li>
            <li>O formulário será carregado com os dados da RCA</li>
            <li>O status mostrará "Editando RCA [ID]" e o botão muda para "Atualizar"</li>
            <li>Faça as alterações e clique em <strong>"Atualizar"</strong></li>
          </ol>

          <h2>Exportando PDF / DOCX por Cliente</h2>
          <p>A exportação permite gerar documentos individuais por cliente:</p>
          <ol>
            <li>Clique no botão <strong>"Gerar RCA"</strong> no header</li>
            <li>Use os filtros de data para encontrar a RCA desejada</li>
            <li>Clique na <strong>linha da RCA</strong> para expandir e ver os clientes afetados</li>
            <li>Para cada cliente, há botões <strong>PDF</strong> e <strong>DOCX</strong></li>
            <li>Ao clicar, o documento gerado mostrará <strong>apenas aquele cliente</strong> no campo "Clientes Afetados"</li>
            <li>O nome do arquivo incluirá o sufixo do cliente (ex: <code>RCA_INC123_2026-06-10_ClienteX.pdf</code>)</li>
            <li>Há também a opção <strong>"Todos os clientes"</strong> que gera o documento completo como antes</li>
          </ol>
          <p>Os documentos exportados incluem o cabeçalho da Olos com logo, endereço e informações de contato.</p>
          <p><strong>Nota:</strong> Se o campo Considerações Finais estiver vazio, ele não aparece no documento gerado.</p>

          <h2>Relatórios</h2>
          <p>Acesse pela navegação do header. Os relatórios apresentam dados consolidados em tabelas:</p>

          <h3>Indisponibilidade por Cliente</h3>
          <ul>
            <li>Mostra horas de indisponibilidade acumuladas por cliente no período selecionado</li>
            <li>Ordenado por horas (maior primeiro)</li>
            <li>Inclui coluna de % do total com badges coloridos</li>
            <li>Paginação de 15 em 15 clientes</li>
          </ul>

          <h3>SLA por Cliente</h3>
          <ul>
            <li>Calcula SLA = (horas do período - downtime) / horas do período × 100</li>
            <li>Ordenado por SLA (pior primeiro)</li>
            <li>Status semafórico: verde (≥99.9% Saudável), amarelo (≥99% Atenção), vermelho (&lt;99% Crítico)</li>
            <li>Paginação de 15 em 15 clientes</li>
          </ul>

          <h2>Seleção de Clientes</h2>
          <p>Na seção Impacto, o campo "Clientes Afetados" funciona como um seletor com busca:</p>
          <ul>
            <li>Use a caixa de busca para filtrar clientes pelo nome</li>
            <li>Marque/desmarque os checkboxes para selecionar</li>
            <li>Os clientes selecionados aparecem como tags abaixo, com botão ✕ para remover</li>
            <li>Os clientes disponíveis são gerenciados na área de Administração</li>
          </ul>

          <h2>Assistente de IA</h2>
          <p>O assistente pode sugerir textos para campos como Causa Raiz, Impacto e Considerações:</p>
          <ol>
            <li>Configure a IA em <strong>Administração</strong> (engrenagem)</li>
            <li>Preencha Região AWS, Model ID e API Key do Bedrock</li>
            <li>Use o inference profile ID (ex: <code>us.amazon.nova-pro-v1:0</code>)</li>
            <li>Nos campos com editor rico, clique no ícone <strong>✨</strong> para gerar uma sugestão</li>
          </ol>

          <h2>Administração</h2>
          <p>Acesse pelo ícone de <strong>engrenagem</strong>. Requer senha (configurável).</p>

          <h3>Seções disponíveis:</h3>
          <ul>
            <li><strong>Configuração de IA</strong> — Região, Model ID e API Key do AWS Bedrock</li>
            <li><strong>Cadastro de Clientes</strong> — Adicione (separando por vírgulas para múltiplos) ou remova clientes</li>
            <li><strong>Senha de Edição de RCAs</strong> — Define a senha necessária para editar RCAs gravadas (visível, sem criptografia)</li>
            <li><strong>Deletar RCA</strong> — Informe o ID da RCA e confirme digitando "TENHO CERTEZA"</li>
            <li><strong>Alterar Senha</strong> — Troca a senha de acesso à administração (armazenada com hash SHA-256)</li>
          </ul>

          <h2>ID das RCAs</h2>
          <p>O formato do ID é <code>RCAYYYYMMDD-nn</code> onde:</p>
          <ul>
            <li><code>YYYY</code> = ano, <code>MM</code> = mês, <code>DD</code> = dia</li>
            <li><code>nn</code> = sequencial do dia (01 a 99)</li>
            <li>Exemplo: <code>RCA20260610-01</code> (primeira RCA do dia 10/06/2026)</li>
          </ul>
          <p>O ID é gerado automaticamente no momento do "Gravar".</p>

          <h2>Dicas</h2>
          <ul>
            <li>Use <strong>"Limpar/Nova"</strong> para começar do zero a qualquer momento</li>
            <li>Use o <strong>Draft</strong> frequentemente para não perder dados se fechar o navegador</li>
            <li>O tempo de indisponibilidade é calculado automaticamente a partir dos eventos da linha do tempo</li>
            <li>Adicione pelo menos 2 eventos na linha do tempo para que o cálculo funcione</li>
            <li>Na lista de RCAs, clique na RCA para expandir e ver opções de exportação por cliente</li>
            <li>Na lista de RCAs, use <strong>"Nova RCA"</strong> para iniciar uma nova a partir dali</li>
            <li>Ao cadastrar clientes, separe múltiplos nomes por vírgula</li>
            <li>Nos relatórios, use os botões "Anterior"/"Próximo" para navegar entre páginas de clientes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
