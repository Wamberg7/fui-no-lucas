'use client'

import { useState, useEffect } from 'react'
import { Building2, DollarSign, ShoppingCart, CheckCircle, XCircle, Clock, Eye, Search, Filter, X } from 'lucide-react'

interface Loja {
  id_lojas: number
  nome_loja: string
  status: string
  data_criacao: string
  usuario: {
    id_usuarios: number
    nome: string
    email: string
    telefone: string
    cpf?: string
  }
  total_vendas: number
  receita_total: number
  vendas_aprovadas: number
}

interface CarteiraPendente {
  id_carteira_pendente: number
  usuarios_id_usuarios: number
  cpf: string
  nome_completo: string
  chave_pix: string
  status: string
  observacoes?: string
  data_solicitacao: string
  data_aprovacao?: string
  usuario: {
    id_usuarios: number
    nome: string
    email: string
    telefone: string
  }
  aprovador?: {
    id_usuarios: number
    nome: string
    email: string
  }
}

export default function AdminDashboard() {
  const [lojas, setLojas] = useState<Loja[]>([])
  const [carteirasPendentes, setCarteirasPendentes] = useState<CarteiraPendente[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'lojas' | 'carteira'>('lojas')
  const [filtroStatus, setFiltroStatus] = useState<'pendente' | 'aprovado' | 'rejeitado'>('pendente')
  const [busca, setBusca] = useState('')
  const [carteiraSelecionada, setCarteiraSelecionada] = useState<CarteiraPendente | null>(null)
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    carregarDados()
  }, [activeTab, filtroStatus])

  async function carregarDados() {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      if (activeTab === 'lojas') {
        const response = await fetch('/api/admin/lojas', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setLojas(data)
        }
      } else {
        const response = await fetch(`/api/admin/carteira-pendente?status=${filtroStatus}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setCarteirasPendentes(data)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  async function aprovarCarteira(id: number, aprovado: boolean) {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/carteira-pendente/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: aprovado ? 'aprovado' : 'rejeitado',
          observacoes: observacoes || undefined
        })
      })

      if (response.ok) {
        alert(`Solicitação ${aprovado ? 'aprovada' : 'rejeitada'} com sucesso!`)
        setCarteiraSelecionada(null)
        setObservacoes('')
        carregarDados()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao processar solicitação:', error)
      alert('Erro ao processar solicitação')
    }
  }

  const lojasFiltradas = lojas.filter(loja =>
    loja.nome_loja.toLowerCase().includes(busca.toLowerCase()) ||
    loja.usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
    loja.usuario.email.toLowerCase().includes(busca.toLowerCase())
  )

  const receitaTotal = lojas.reduce((acc, loja) => acc + loja.receita_total, 0)
  const totalVendas = lojas.reduce((acc, loja) => acc + loja.total_vendas, 0)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Administrativo</h1>
        <p className="text-gray-600">Gerencie todas as lojas e aprovações de carteira</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('lojas')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'lojas'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Lojas
          </button>
          <button
            onClick={() => setActiveTab('carteira')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'carteira'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Aprovações de Carteira
          </button>
        </div>
      </div>

      {activeTab === 'lojas' && (
        <div className="space-y-6">
          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Lojas</p>
                  <p className="text-3xl font-bold text-gray-900">{lojas.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Vendas</p>
                  <p className="text-3xl font-bold text-gray-900">{totalVendas}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Receita Total</p>
                  <p className="text-3xl font-bold text-gray-900">
                    R$ {receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Busca */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome da loja, nome do usuário ou email..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tabela de Lojas */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando lojas...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loja
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proprietário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total de Vendas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receita Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lojasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <p className="text-gray-600">Nenhuma loja encontrada</p>
                        </td>
                      </tr>
                    ) : (
                      lojasFiltradas.map((loja) => (
                        <tr key={loja.id_lojas} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{loja.nome_loja || 'Sem nome'}</div>
                            <div className="text-sm text-gray-500">{loja.usuario.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{loja.usuario.nome}</div>
                            {loja.usuario.telefone && (
                              <div className="text-sm text-gray-500">{loja.usuario.telefone}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {loja.total_vendas}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            R$ {loja.receita_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                loja.status === 'ativa'
                                  ? 'bg-green-100 text-green-800'
                                  : loja.status === 'suspensa'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {loja.status === 'ativa' ? 'Ativa' : loja.status === 'suspensa' ? 'Suspensa' : 'Pendente'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'carteira' && (
        <div className="space-y-6">
          {/* Filtros */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex space-x-2">
                <button
                  onClick={() => setFiltroStatus('pendente')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filtroStatus === 'pendente'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pendentes
                </button>
                <button
                  onClick={() => setFiltroStatus('aprovado')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filtroStatus === 'aprovado'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Aprovados
                </button>
                <button
                  onClick={() => setFiltroStatus('rejeitado')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filtroStatus === 'rejeitado'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Rejeitados
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Solicitações */}
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando solicitações...</p>
              </div>
            ) : carteirasPendentes.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma solicitação {filtroStatus === 'pendente' ? 'pendente' : filtroStatus === 'aprovado' ? 'aprovada' : 'rejeitada'}</p>
              </div>
            ) : (
              carteirasPendentes.map((carteira) => (
                <div key={carteira.id_carteira_pendente} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{carteira.usuario.nome}</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            carteira.status === 'aprovado'
                              ? 'bg-green-100 text-green-800'
                              : carteira.status === 'rejeitado'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {carteira.status === 'aprovado' ? 'Aprovado' : carteira.status === 'rejeitado' ? 'Rejeitado' : 'Pendente'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Email</p>
                          <p className="text-sm text-gray-900">{carteira.usuario.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Telefone</p>
                          <p className="text-sm text-gray-900">{carteira.usuario.telefone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">CPF</p>
                          <p className="text-sm text-gray-900 font-mono">{carteira.cpf}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Nome Completo</p>
                          <p className="text-sm text-gray-900">{carteira.nome_completo}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500 mb-1">Chave PIX</p>
                          <p className="text-sm text-gray-900 font-mono">{carteira.chave_pix}</p>
                        </div>
                      </div>
                      {carteira.observacoes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Observações</p>
                          <p className="text-sm text-gray-900">{carteira.observacoes}</p>
                        </div>
                      )}
                      {carteira.aprovador && (
                        <div className="text-xs text-gray-500">
                          {carteira.status === 'aprovado' ? 'Aprovado' : 'Rejeitado'} por {carteira.aprovador.nome} em{' '}
                          {new Date(carteira.data_aprovacao || '').toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                    {carteira.status === 'pendente' && (
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => setCarteiraSelecionada(carteira)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Ver Detalhes</span>
                        </button>
                        <button
                          onClick={() => aprovarCarteira(carteira.id_carteira_pendente, true)}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Aprovar</span>
                        </button>
                        <button
                          onClick={() => aprovarCarteira(carteira.id_carteira_pendente, false)}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Rejeitar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {carteiraSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Detalhes da Solicitação</h3>
              <button
                onClick={() => setCarteiraSelecionada(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Usuário</p>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900"><strong>Nome:</strong> {carteiraSelecionada.usuario.nome}</p>
                  <p className="text-sm text-gray-900"><strong>Email:</strong> {carteiraSelecionada.usuario.email}</p>
                  <p className="text-sm text-gray-900"><strong>Telefone:</strong> {carteiraSelecionada.usuario.telefone || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Dados da Carteira</p>
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm text-gray-900"><strong>CPF:</strong> <span className="font-mono">{carteiraSelecionada.cpf}</span></p>
                  <p className="text-sm text-gray-900"><strong>Nome Completo:</strong> {carteiraSelecionada.nome_completo}</p>
                  <p className="text-sm text-gray-900"><strong>Chave PIX:</strong> <span className="font-mono">{carteiraSelecionada.chave_pix}</span></p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Observações (opcional)</p>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Adicione observações sobre a aprovação ou rejeição..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setCarteiraSelecionada(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => aprovarCarteira(carteiraSelecionada.id_carteira_pendente, false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Rejeitar
                </button>
                <button
                  onClick={() => aprovarCarteira(carteiraSelecionada.id_carteira_pendente, true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Aprovar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

