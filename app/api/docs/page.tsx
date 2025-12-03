'use client'

import { ArrowLeft, Code, Book, Zap, Lock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function APIDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/configuracoes?tab=integracoes"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Voltar para Integrações</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Code className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Reference</h1>
              <p className="text-gray-600">Documentação completa da API para integração</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Autenticação */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Lock className="h-5 w-5 text-gray-700" />
                <h2 className="text-2xl font-semibold text-gray-900">Autenticação</h2>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>Importante:</strong> Todas as requisições (exceto login e cadastro) requerem autenticação via JWT token.
                </p>
                <p className="text-sm text-blue-800">
                  O token é obtido através do endpoint de login e deve ser enviado no header <code className="bg-blue-100 px-1 rounded">Authorization</code>.
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto relative">
                <button
                  onClick={() => copyToClipboard('Authorization: Bearer SEU_TOKEN_AQUI', 'auth-header')}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                >
                  {copiedCode === 'auth-header' ? <CheckCircle className="h-4 w-4" /> : '📋'}
                </button>
                <code className="text-green-400 text-sm">
                  Authorization: Bearer SEU_TOKEN_AQUI
                </code>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                O token JWT expira em 7 dias. Use o endpoint <code className="bg-gray-100 px-1 rounded">/api/auth/verificar</code> para verificar se o token ainda é válido.
              </p>
            </section>

            {/* Base URL */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Base URL</h2>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto relative">
                <button
                  onClick={() => copyToClipboard('https://seu-dominio.com/api', 'base-url')}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                >
                  {copiedCode === 'base-url' ? <CheckCircle className="h-4 w-4" /> : '📋'}
                </button>
                <code className="text-green-400 text-sm">
                  https://seu-dominio.com/api
                </code>
              </div>
            </section>

            {/* Autenticação - Login e Cadastro */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Autenticação</h2>
              
              <div className="space-y-6">
                {/* Login */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">POST</span>
                    <code className="text-gray-900 font-mono">/api/auth/login</code>
                  </div>
                  <p className="text-gray-600 mb-4">Autentica um usuário e retorna um token JWT.</p>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Request Body:</p>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto relative">
                      <button
                        onClick={() => copyToClipboard(JSON.stringify({ email: 'usuario@example.com', senha: 'senha123' }, null, 2), 'login-body')}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      >
                        {copiedCode === 'login-body' ? <CheckCircle className="h-4 w-4" /> : '📋'}
                      </button>
                      <pre className="text-green-400 text-sm">
{`{
  "email": "usuario@example.com",
  "senha": "senha123"
}`}
                      </pre>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Response (200):</p>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm">
{`{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuarios": 1,
    "nome": "João Silva",
    "email": "usuario@example.com",
    "telefone": "+5511999999999",
    "tipo_conta": "dono_loja"
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Cadastro */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">POST</span>
                    <code className="text-gray-900 font-mono">/api/auth/cadastro</code>
                  </div>
                  <p className="text-gray-600 mb-4">Cria uma nova conta de usuário.</p>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Request Body:</p>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto relative">
                      <button
                        onClick={() => copyToClipboard(JSON.stringify({ nome: 'João Silva', email: 'joao@example.com', telefone: '+5511999999999', senha: 'senha123', cpf: '123.456.789-00', discord: 'usuario#1234' }, null, 2), 'cadastro-body')}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      >
                        {copiedCode === 'cadastro-body' ? <CheckCircle className="h-4 w-4" /> : '📋'}
                      </button>
                      <pre className="text-green-400 text-sm">
{`{
  "nome": "João Silva",
  "email": "joao@example.com",
  "telefone": "+5511999999999",
  "senha": "senha123",
  "cpf": "123.456.789-00",  // Opcional
  "discord": "usuario#1234"  // Opcional
}`}
                      </pre>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      <strong>Campos obrigatórios:</strong> nome, email, telefone, senha<br/>
                      <strong>Campos opcionais:</strong> cpf, discord
                    </p>
                  </div>
                </div>

                {/* Verificar Token */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">GET</span>
                    <code className="text-gray-900 font-mono">/api/auth/verificar</code>
                  </div>
                  <p className="text-gray-600 mb-4">Verifica se o token JWT é válido.</p>
                  <p className="text-sm text-gray-500">Require header: <code className="bg-gray-100 px-1 rounded">Authorization: Bearer TOKEN</code></p>
                </div>
              </div>
            </section>

            {/* Produtos */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Produtos</h2>
              
              <div className="space-y-6">
                {/* Listar Produtos */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">GET</span>
                    <code className="text-gray-900 font-mono">/api/produtos</code>
                  </div>
                  <p className="text-gray-600 mb-4">Lista todos os produtos do usuário autenticado.</p>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Query Parameters:</p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li><code className="bg-gray-100 px-1 rounded">categoria</code> - Filtrar por ID da categoria</li>
                      <li><code className="bg-gray-100 px-1 rounded">destaque</code> - Filtrar produtos em destaque (true/false)</li>
                      <li><code className="bg-gray-100 px-1 rounded">disponivel</code> - Filtrar produtos disponíveis (true/false)</li>
                      <li><code className="bg-gray-100 px-1 rounded">limit</code> - Limitar número de resultados</li>
                    </ul>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto relative">
                    <button
                      onClick={() => copyToClipboard('GET /api/produtos?categoria=1&destaque=true&limit=10', 'produtos-get')}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                      {copiedCode === 'produtos-get' ? <CheckCircle className="h-4 w-4" /> : '📋'}
                    </button>
                    <code className="text-green-400 text-sm">
                      GET /api/produtos?categoria=1&destaque=true&limit=10
                    </code>
                  </div>
                </div>

                {/* Criar Produto */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">POST</span>
                    <code className="text-gray-900 font-mono">/api/produtos</code>
                  </div>
                  <p className="text-gray-600 mb-4">Cria um novo produto.</p>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Request Body:</p>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto relative">
                      <button
                        onClick={() => copyToClipboard(JSON.stringify({ nome_produto: 'Produto Exemplo', descricao: 'Descrição do produto', preco: 99.90, estoque: 10, categorias_id_categorias: 1, disponivel_venda: true, destaque: false, imagem_produto: 'https://exemplo.com/imagem.jpg' }, null, 2), 'produto-post')}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      >
                        {copiedCode === 'produto-post' ? <CheckCircle className="h-4 w-4" /> : '📋'}
                      </button>
                      <pre className="text-green-400 text-sm">
{`{
  "nome_produto": "Produto Exemplo",
  "descricao": "Descrição do produto",
  "preco": 99.90,
  "estoque": 10,
  "categorias_id_categorias": 1,
  "disponivel_venda": true,
  "destaque": false,
  "imagem_produto": "https://exemplo.com/imagem.jpg"
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Buscar Produto por ID */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">GET</span>
                    <code className="text-gray-900 font-mono">/api/produtos/[id]</code>
                  </div>
                  <p className="text-gray-600 mb-4">Busca um produto específico por ID.</p>
                </div>

                {/* Atualizar Produto */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">PUT</span>
                    <code className="text-gray-900 font-mono">/api/produtos/[id]</code>
                  </div>
                  <p className="text-gray-600 mb-4">Atualiza um produto existente.</p>
                </div>

                {/* Deletar Produto */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">DELETE</span>
                    <code className="text-gray-900 font-mono">/api/produtos/[id]</code>
                  </div>
                  <p className="text-gray-600 mb-4">Remove um produto.</p>
                </div>
              </div>
            </section>

            {/* Categorias */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Categorias</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">GET</span>
                    <code className="text-gray-900 font-mono">/api/categorias</code>
                  </div>
                  <p className="text-gray-600 mb-4">Lista todas as categorias do usuário autenticado.</p>
                  <p className="text-sm text-gray-500">Query: <code className="bg-gray-100 px-1 rounded">?ativo=true</code></p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">POST</span>
                    <code className="text-gray-900 font-mono">/api/categorias</code>
                  </div>
                  <p className="text-gray-600 mb-4">Cria uma nova categoria.</p>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto relative">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify({ nome_categoria: 'Categoria Exemplo', descricao: 'Descrição da categoria', ativo: true }, null, 2), 'categoria-post')}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                      {copiedCode === 'categoria-post' ? <CheckCircle className="h-4 w-4" /> : '📋'}
                    </button>
                    <pre className="text-green-400 text-sm">
{`{
  "nome_categoria": "Categoria Exemplo",
  "descricao": "Descrição da categoria",
  "ativo": true
}`}
                    </pre>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">GET</span>
                    <code className="text-gray-900 font-mono">/api/categorias/[id]</code>
                  </div>
                  <p className="text-gray-600 mb-4">Busca uma categoria específica por ID.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">PUT</span>
                    <code className="text-gray-900 font-mono">/api/categorias/[id]</code>
                  </div>
                  <p className="text-gray-600 mb-4">Atualiza uma categoria existente.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">DELETE</span>
                    <code className="text-gray-900 font-mono">/api/categorias/[id]</code>
                  </div>
                  <p className="text-gray-600 mb-4">Remove uma categoria.</p>
                </div>
              </div>
            </section>

            {/* Vendas */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Vendas</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">GET</span>
                    <code className="text-gray-900 font-mono">/api/vendas</code>
                  </div>
                  <p className="text-gray-600 mb-4">Lista todas as vendas do usuário autenticado.</p>
                  <p className="text-sm text-gray-500 mb-2">Query Parameters:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li><code className="bg-gray-100 px-1 rounded">status</code> - Filtrar por status (concluida, pendente, cancelada)</li>
                    <li><code className="bg-gray-100 px-1 rounded">data_inicio</code> - Filtrar vendas a partir de uma data (ISO 8601)</li>
                    <li><code className="bg-gray-100 px-1 rounded">data_fim</code> - Filtrar vendas até uma data (ISO 8601)</li>
                    <li><code className="bg-gray-100 px-1 rounded">limit</code> - Limitar número de resultados</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">POST</span>
                    <code className="text-gray-900 font-mono">/api/vendas</code>
                  </div>
                  <p className="text-gray-600 mb-4">Cria uma nova venda e atualiza o estoque automaticamente.</p>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto relative">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify({ itens: [{ produtos_id_produtos: 1, quantidade: 2 }, { produtos_id_produtos: 3, quantidade: 1 }], observacoes: 'Pedido via API' }, null, 2), 'venda-post')}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                      {copiedCode === 'venda-post' ? <CheckCircle className="h-4 w-4" /> : '📋'}
                    </button>
                    <pre className="text-green-400 text-sm">
{`{
  "itens": [
    {
      "produtos_id_produtos": 1,
      "quantidade": 2
    },
    {
      "produtos_id_produtos": 3,
      "quantidade": 1
    }
  ],
  "observacoes": "Pedido via API"
}`}
                    </pre>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Atenção:</strong> A criação de venda reduz automaticamente o estoque dos produtos.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Estatísticas */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Estatísticas</h2>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">GET</span>
                  <code className="text-gray-900 font-mono">/api/estatisticas</code>
                </div>
                <p className="text-gray-600 mb-4">Retorna estatísticas gerais do dashboard do usuário autenticado.</p>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Response (200):</p>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
{`{
  "totalProdutos": 25,
  "totalCategorias": 5,
  "totalVendas": 150,
  "receitaTotal": "12500.50",
  "totalEstoque": 500,
  "produtosDisponiveis": 20,
  "produtosSemEstoque": 5
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Carteira */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Carteira</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">GET</span>
                    <code className="text-gray-900 font-mono">/api/carteira/saldo</code>
                  </div>
                  <p className="text-gray-600 mb-4">Retorna o saldo do usuário autenticado.</p>
                  <p className="text-sm text-gray-500">Query: <code className="bg-gray-100 px-1 rounded">?usuario_id=1</code> (opcional)</p>
                  
                  <div className="mb-4 mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Response (200):</p>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm">
{`{
  "saldo_total": 12500.50,
  "saldo_disponivel": 10000.00,
  "saldo_pendente": 2500.50
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">GET</span>
                    <code className="text-gray-900 font-mono">/api/carteira/saques</code>
                  </div>
                  <p className="text-gray-600 mb-4">Lista todos os saques solicitados pelo usuário autenticado.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">POST</span>
                    <code className="text-gray-900 font-mono">/api/carteira/saques</code>
                  </div>
                  <p className="text-gray-600 mb-4">Solicita um novo saque.</p>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto relative">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify({ valor: 500.00 }, null, 2), 'saque-post')}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                      {copiedCode === 'saque-post' ? <CheckCircle className="h-4 w-4" /> : '📋'}
                    </button>
                    <pre className="text-green-400 text-sm">
{`{
  "valor": 500.00
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Configurações */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Configurações</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">GET</span>
                    <code className="text-gray-900 font-mono">/api/configuracoes</code>
                  </div>
                  <p className="text-gray-600 mb-4">Retorna as configurações da loja do usuário autenticado.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">PUT</span>
                    <code className="text-gray-900 font-mono">/api/configuracoes</code>
                  </div>
                  <p className="text-gray-600 mb-4">Atualiza as configurações da loja.</p>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto relative">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify({ nome_loja: 'Minha Loja', descricao_loja: 'Descrição da loja', modo_manutencao: false, login_cliente: true, email: 'contato@loja.com', telefone: '+5511999999999', endereco: 'Rua Exemplo, 123', gateway_pagamento: 'stripe', chave_api: 'sk_live_...', cor_principal: '#3b82f6', cor_secundaria: '#8b5cf6' }, null, 2), 'config-put')}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                      {copiedCode === 'config-put' ? <CheckCircle className="h-4 w-4" /> : '📋'}
                    </button>
                    <pre className="text-green-400 text-sm">
{`{
  "nome_loja": "Minha Loja",
  "descricao_loja": "Descrição da loja",
  "modo_manutencao": false,
  "login_cliente": true,
  "email": "contato@loja.com",
  "telefone": "+5511999999999",
  "endereco": "Rua Exemplo, 123",
  "gateway_pagamento": "stripe",
  "chave_api": "sk_live_...",
  "cor_principal": "#3b82f6",
  "cor_secundaria": "#8b5cf6"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Pagamentos */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pagamentos</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900">
                  <strong>📄 Documentação completa:</strong> Consulte o arquivo <code className="bg-blue-100 px-1 rounded">docs/API_PAGAMENTOS.md</code> para informações detalhadas sobre a API de pagamentos, incluindo webhooks e integração com gateways.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">POST</span>
                    <code className="text-gray-900 font-mono">/api/pagamentos</code>
                  </div>
                  <p className="text-gray-600 mb-4">Cria um novo pagamento e retorna o link para processamento.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">GET</span>
                    <code className="text-gray-900 font-mono">/api/pagamentos</code>
                  </div>
                  <p className="text-gray-600 mb-4">Lista todos os pagamentos com filtros opcionais.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">GET</span>
                    <code className="text-gray-900 font-mono">/api/pagamentos/[id]</code>
                  </div>
                  <p className="text-gray-600 mb-4">Busca um pagamento específico por ID.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">PUT</span>
                    <code className="text-gray-900 font-mono">/api/pagamentos/[id]</code>
                  </div>
                  <p className="text-gray-600 mb-4">Atualiza o status de um pagamento.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">POST</span>
                    <code className="text-gray-900 font-mono">/api/pagamentos/webhook</code>
                  </div>
                  <p className="text-gray-600 mb-4">Endpoint para receber notificações de gateways de pagamento.</p>
                </div>
              </div>
            </section>

            {/* Códigos de Status HTTP */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Códigos de Status HTTP</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-gray-900">200 OK</span>
                  </div>
                  <p className="text-sm text-gray-600">Requisição bem-sucedida</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-gray-900">201 Created</span>
                  </div>
                  <p className="text-sm text-gray-600">Recurso criado com sucesso</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-gray-900">400 Bad Request</span>
                  </div>
                  <p className="text-sm text-gray-600">Dados inválidos na requisição</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lock className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-gray-900">401 Unauthorized</span>
                  </div>
                  <p className="text-sm text-gray-600">Token inválido ou ausente</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-gray-900">403 Forbidden</span>
                  </div>
                  <p className="text-sm text-gray-600">Acesso negado ao recurso</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-gray-900">404 Not Found</span>
                  </div>
                  <p className="text-sm text-gray-600">Recurso não encontrado</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-gray-900">500 Internal Server Error</span>
                  </div>
                  <p className="text-sm text-gray-600">Erro interno do servidor</p>
                </div>
              </div>
            </section>

            {/* Exemplos de Uso */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exemplos de Uso</h2>
              
              <div className="space-y-6">
                {/* JavaScript/TypeScript */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">JavaScript/TypeScript</h3>
                  <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto relative">
                    <button
                      onClick={() => copyToClipboard(`// Exemplo completo de uso da API\n\n// 1. Login\nconst loginResponse = await fetch('https://seu-dominio.com/api/auth/login', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    email: 'usuario@example.com',\n    senha: 'senha123'\n  })\n})\nconst { token, usuario } = await loginResponse.json()\n\n// 2. Listar produtos\nconst produtosResponse = await fetch('https://seu-dominio.com/api/produtos', {\n  headers: {\n    'Authorization': \`Bearer \${token}\`,\n    'Content-Type': 'application/json'\n  }\n})\nconst produtos = await produtosResponse.json()\n\n// 3. Criar venda\nconst vendaResponse = await fetch('https://seu-dominio.com/api/vendas', {\n  method: 'POST',\n  headers: {\n    'Authorization': \`Bearer \${token}\`,\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    itens: [\n      { produtos_id_produtos: 1, quantidade: 2 }\n    ]\n  })\n})\nconst venda = await vendaResponse.json()`, 'js-example')}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                      {copiedCode === 'js-example' ? <CheckCircle className="h-4 w-4" /> : '📋'}
                    </button>
                    <pre className="text-green-400 text-sm">
{`// Exemplo completo de uso da API

// 1. Login
const loginResponse = await fetch('https://seu-dominio.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@example.com',
    senha: 'senha123'
  })
})
const { token, usuario } = await loginResponse.json()

// 2. Listar produtos
const produtosResponse = await fetch('https://seu-dominio.com/api/produtos', {
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  }
})
const produtos = await produtosResponse.json()

// 3. Criar venda
const vendaResponse = await fetch('https://seu-dominio.com/api/vendas', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    itens: [
      { produtos_id_produtos: 1, quantidade: 2 }
    ]
  })
})
const venda = await vendaResponse.json()`}
                    </pre>
                  </div>
                </div>

                {/* Python */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Python</h3>
                  <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto relative">
                    <button
                      onClick={() => copyToClipboard(`import requests\n\n# 1. Login\nlogin_response = requests.post(\n    'https://seu-dominio.com/api/auth/login',\n    json={\n        'email': 'usuario@example.com',\n        'senha': 'senha123'\n    }\n)\ndata = login_response.json()\ntoken = data['token']\n\n# 2. Listar produtos\nheaders = {\n    'Authorization': f'Bearer {token}',\n    'Content-Type': 'application/json'\n}\nprodutos_response = requests.get(\n    'https://seu-dominio.com/api/produtos',\n    headers=headers\n)\nprodutos = produtos_response.json()\n\n# 3. Criar venda\nvenda_response = requests.post(\n    'https://seu-dominio.com/api/vendas',\n    headers=headers,\n    json={\n        'itens': [\n            {'produtos_id_produtos': 1, 'quantidade': 2}\n        ]\n    }\n)\nvenda = venda_response.json()`, 'python-example')}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                      {copiedCode === 'python-example' ? <CheckCircle className="h-4 w-4" /> : '📋'}
                    </button>
                    <pre className="text-green-400 text-sm">
{`import requests

# 1. Login
login_response = requests.post(
    'https://seu-dominio.com/api/auth/login',
    json={
        'email': 'usuario@example.com',
        'senha': 'senha123'
    }
)
data = login_response.json()
token = data['token']

# 2. Listar produtos
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}
produtos_response = requests.get(
    'https://seu-dominio.com/api/produtos',
    headers=headers
)
produtos = produtos_response.json()

# 3. Criar venda
venda_response = requests.post(
    'https://seu-dominio.com/api/vendas',
    headers=headers,
    json={
        'itens': [
            {'produtos_id_produtos': 1, 'quantidade': 2}
        ]
    }
)
venda = venda_response.json()`}
                    </pre>
                  </div>
                </div>

                {/* cURL */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">cURL</h3>
                  <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto relative">
                    <button
                      onClick={() => copyToClipboard(`# Login\ncurl -X POST https://seu-dominio.com/api/auth/login \\\n  -H "Content-Type: application/json" \\\n  -d '{"email":"usuario@example.com","senha":"senha123"}'\n\n# Listar produtos\ncurl -X GET https://seu-dominio.com/api/produtos \\\n  -H "Authorization: Bearer SEU_TOKEN_AQUI"\n\n# Criar venda\ncurl -X POST https://seu-dominio.com/api/vendas \\\n  -H "Authorization: Bearer SEU_TOKEN_AQUI" \\\n  -H "Content-Type: application/json" \\\n  -d '{"itens":[{"produtos_id_produtos":1,"quantidade":2}]}'`, 'curl-example')}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                      {copiedCode === 'curl-example' ? <CheckCircle className="h-4 w-4" /> : '📋'}
                    </button>
                    <pre className="text-green-400 text-sm">
{`# Login
curl -X POST https://seu-dominio.com/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"usuario@example.com","senha":"senha123"}'

# Listar produtos
curl -X GET https://seu-dominio.com/api/produtos \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Criar venda
curl -X POST https://seu-dominio.com/api/vendas \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \\
  -H "Content-Type: application/json" \\
  -d '{"itens":[{"produtos_id_produtos":1,"quantidade":2}]}'`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Notas Importantes */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Notas Importantes</h2>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900 mb-1">Multi-tenancy</p>
                      <p className="text-sm text-yellow-800">
                        Todas as requisições retornam apenas dados do usuário autenticado. Cada usuário tem acesso apenas aos seus próprios produtos, categorias, vendas e configurações.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Atualização de Estoque</p>
                      <p className="text-sm text-blue-800">
                        Quando uma venda é criada, o estoque dos produtos é automaticamente reduzido. Certifique-se de que há estoque suficiente antes de criar a venda.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900 mb-1">Validação de Dados</p>
                      <p className="text-sm text-green-800">
                        Todos os endpoints validam os dados de entrada. Sempre verifique os códigos de status HTTP e as mensagens de erro retornadas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
