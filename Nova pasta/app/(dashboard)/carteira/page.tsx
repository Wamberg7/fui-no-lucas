'use client'

import { useState, useEffect } from 'react'
import { Info, Send, HelpCircle, User, Calendar, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface Saque {
  id: number
  data: string
  valor: number
  status: 'concluido' | 'pendente' | 'cancelado'
}

export default function CarteiraPage() {
  const { usuario } = useAuth()
  const [activeTab, setActiveTab] = useState('saques')
  const [valorSaque, setValorSaque] = useState('')
  const [saques, setSaques] = useState<Saque[]>([])
  const [loading, setLoading] = useState(true)
  const [saldo, setSaldo] = useState({
    total: 0,
    disponivel: 0,
    pendente: 0
  })

  useEffect(() => {
    // Verificar se é super admin e redirecionar
    const checkAndRedirect = async () => {
      const pathname = window.location.pathname
      if (pathname.startsWith('/admin')) return

      const token = localStorage.getItem('token')
      const isSuperAdminLocal = localStorage.getItem('isSuperAdmin')
      
      if (token && isSuperAdminLocal === 'true') {
        try {
          const response = await fetch('/api/admin/verificar-admin', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.is_super_admin) {
              window.location.href = '/admin'
              return
            }
          }
        } catch (error) {
          console.error('Erro ao verificar super admin:', error)
        }
      }
    }
    
    checkAndRedirect()
    
    if (usuario) {
      carregarDados()
    }
  }, [usuario])

  async function carregarDados() {
    if (!usuario) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('Token não encontrado')
        return
      }

      // Buscar saldo e saques do usuário autenticado
      const [saldoResponse, saquesResponse] = await Promise.all([
        fetch(`/api/carteira/saldo?usuario_id=${usuario.id_usuarios}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('/api/carteira/saques', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ])

      if (saldoResponse.ok) {
        const saldoData = await saldoResponse.json()
        setSaldo({
          total: saldoData.saldo_total || 0,
          disponivel: saldoData.saldo_disponivel || 0,
          pendente: saldoData.saldo_pendente || 0
        })
      }

      if (saquesResponse.ok) {
        const saquesData = await saquesResponse.json()
        setSaques(saquesData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  async function solicitarSaque() {
    const valor = parseFloat(valorSaque.replace('R$', '').replace('.', '').replace(',', '.').trim())
    
    if (!valor || valor <= 0) {
      alert('Informe um valor válido')
      return
    }

    if (valor > saldo.disponivel) {
      alert('Valor excede o saldo disponível')
      return
    }

    if (!usuario) {
      alert('Usuário não autenticado')
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Token não encontrado')
        return
      }

      const response = await fetch('/api/carteira/saques', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ valor })
      })

      if (response.ok) {
        alert('Saque solicitado com sucesso!')
        setValorSaque('')
        carregarDados()
        // Atualizar saldo
        setSaldo({
          ...saldo,
          disponivel: saldo.disponivel - valor,
          total: saldo.total - valor
        })
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao solicitar saque:', error)
      alert('Erro ao solicitar saque')
    }
  }

  function formatarValor(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const statusConfig = {
    concluido: { label: 'CONCLUÍDO', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    pendente: { label: 'PENDENTE', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    cancelado: { label: 'CANCELADO', color: 'bg-red-100 text-red-800', icon: XCircle }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Minha carteira</h1>
          <p className="text-gray-600">Veja e gerencie os seus pagamentos.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">Minha conta</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Cards de Saldo */}
        <div className="lg:col-span-2 space-y-4">
          {/* Total */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-gray-900">Total</h2>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <p className="text-4xl font-bold text-blue-600">{formatarValor(saldo.total)}</p>
          </div>

          {/* Saldo Disponível e Pendente */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-gray-900">Saldo disponível</h3>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatarValor(saldo.disponivel)}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-gray-900">Saldo pendente</h3>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-orange-600">{formatarValor(saldo.pendente)}</p>
            </div>
          </div>
        </div>

        {/* Solicitar Saque */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Solicitar saque</h2>
          <p className="text-sm text-gray-600 mb-6">
            Informe o valor que será transferido para a sua chave PIX cadastrada.
          </p>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={valorSaque}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '')
                  if (value) {
                    value = (parseInt(value) / 100).toFixed(2)
                    value = value.replace('.', ',')
                    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                    setValorSaque(`R$ ${value}`)
                  } else {
                    setValorSaque('R$ 0,00')
                  }
                }}
                placeholder="R$ 0,00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-semibold"
              />
            </div>

            <button
              onClick={solicitarSaque}
              disabled={!valorSaque || parseFloat(valorSaque.replace(/[^\d,]/g, '').replace(',', '.')) <= 0 || parseFloat(valorSaque.replace(/[^\d,]/g, '').replace(',', '.')) > saldo.disponivel}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
              <span>Solicitar saque</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('saques')}
              className={`px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'saques'
                  ? 'border-gray-900 text-gray-900 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Saques
            </button>
            <button
              onClick={() => setActiveTab('liberacoes')}
              className={`px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'liberacoes'
                  ? 'border-gray-900 text-gray-900 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Liberações
            </button>
            <button
              onClick={() => setActiveTab('disputas')}
              className={`px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'disputas'
                  ? 'border-gray-900 text-gray-900 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Disputas
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'saques' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Saques</h3>
                <p className="text-sm text-gray-600">Veja os saques feitos para sua conta.</p>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
              ) : saques.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum saque encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Valor</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saques.map((saque) => {
                        const status = statusConfig[saque.status]
                        const StatusIcon = status.icon
                        
                        return (
                          <tr key={saque.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900">{formatarData(saque.data)}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm font-semibold text-gray-900">{formatarValor(saque.valor)}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                <span>{status.label}</span>
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'liberacoes' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Liberações</h3>
                <p className="text-sm text-gray-600">Veja as liberações de pagamento para sua conta.</p>
              </div>
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma liberação encontrada</p>
              </div>
            </div>
          )}

          {activeTab === 'disputas' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Disputas</h3>
                <p className="text-sm text-gray-600">Veja as disputas relacionadas aos seus pagamentos.</p>
              </div>
              <div className="text-center py-12">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma disputa encontrada</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

