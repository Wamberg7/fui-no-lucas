'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreditCard, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react'

interface Pagamento {
  id_vendas: number
  data_venda: string
  total: number
  metodo_pagamento: string
  status_pagamento: string
  id_transacao: string
  link_pagamento: string | null
  usuario?: {
    nome: string
    email: string
  }
}

export default function PagamentosPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>('')

  useEffect(() => {
    carregarPagamentos()
  }, [filtroStatus])

  async function carregarPagamentos() {
    try {
      const url = filtroStatus 
        ? `/api/pagamentos?status_pagamento=${filtroStatus}` 
        : '/api/pagamentos'
      const response = await fetch(url)
      const data = await response.json()
      setPagamentos(data)
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = {
    pendente: { icon: Clock, color: 'text-yellow-600 bg-yellow-50', label: 'Pendente' },
    processando: { icon: Clock, color: 'text-blue-600 bg-blue-50', label: 'Processando' },
    aprovado: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Aprovado' },
    rejeitado: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Rejeitado' },
    cancelado: { icon: XCircle, color: 'text-gray-600 bg-gray-50', label: 'Cancelado' },
    reembolsado: { icon: DollarSign, color: 'text-purple-600 bg-purple-50', label: 'Reembolsado' }
  }

  const metodoConfig = {
    dinheiro: 'Dinheiro',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    pix: 'PIX',
    boleto: 'Boleto',
    transferencia: 'Transferência'
  }

  const pagamentosFiltrados = pagamentos.filter(pagamento =>
    !filtroStatus || pagamento.status_pagamento === filtroStatus
  )

  const totalAprovado = pagamentosFiltrados
    .filter(p => p.status_pagamento === 'aprovado')
    .reduce((acc, p) => acc + (p.total || 0), 0)

  return (
    <div className="p-8">
      <header className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagamentos</h1>
          <p className="mt-1 text-sm text-gray-500">Gerenciar pagamentos e transações</p>
        </div>
      </header>

      <main>
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pagamentos</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{pagamentosFiltrados.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Aprovado</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  R$ {totalAprovado.toFixed(2)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {pagamentosFiltrados.filter(p => p.status_pagamento === 'pendente').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filtrar por status:</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="pendente">Pendentes</option>
              <option value="processando">Processando</option>
              <option value="aprovado">Aprovados</option>
              <option value="rejeitado">Rejeitados</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>
        </div>

        {/* Tabela de Pagamentos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando pagamentos...</p>
          </div>
        ) : pagamentosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum pagamento encontrado</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Link
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagamentosFiltrados.map((pagamento) => {
                    const status = statusConfig[pagamento.status_pagamento as keyof typeof statusConfig] || statusConfig.pendente
                    const StatusIcon = status.icon
                    
                    return (
                      <tr key={pagamento.id_vendas} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{pagamento.id_vendas}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{pagamento.usuario?.nome || 'N/A'}</div>
                          {pagamento.usuario?.email && (
                            <div className="text-sm text-gray-500">{pagamento.usuario.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metodoConfig[pagamento.metodo_pagamento as keyof typeof metodoConfig] || pagamento.metodo_pagamento}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          R$ {pagamento.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {pagamento.id_transacao}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {pagamento.link_pagamento ? (
                            <a
                              href={pagamento.link_pagamento}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-800 text-sm"
                            >
                              Ver Link
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

