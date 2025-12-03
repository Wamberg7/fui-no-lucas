'use client'

import { useEffect, useState, useRef } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ShoppingCart, CheckCircle, XCircle, Clock, Search, ChevronUp, ChevronDown, MessageCircle, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import type { Venda } from '@/lib/supabase'

type Periodo = '7d' | '30d' | '90d' | 'custom' | 'all'

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'processando', label: 'Processando' },
  { value: 'aprovado', label: 'Aprovados' },
  { value: 'rejeitado', label: 'Rejeitados' },
  { value: 'cancelado', label: 'Cancelados' }
]

export default function VendasPage() {
  const { usuario } = useAuth()
  const [vendas, setVendas] = useState<Venda[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState<Periodo>('7d')
  const [busca, setBusca] = useState('')
  const [resultadosPorPagina, setResultadosPorPagina] = useState(10)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [ordenacao, setOrdenacao] = useState<{ campo: string; direcao: 'asc' | 'desc' }>({ campo: 'id_vendas', direcao: 'desc' })
  
  // Estados para dropdowns
  const [mostrarPeriodo, setMostrarPeriodo] = useState(false)
  const [mostrarStatus, setMostrarStatus] = useState(false)
  const [dataInicio, setDataInicio] = useState<Date | null>(null)
  const [dataFim, setDataFim] = useState<Date | null>(null)
  const [mesAtual, setMesAtual] = useState(new Date())
  const [statusSelecionado, setStatusSelecionado] = useState<string>('')
  
  const periodoRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (usuario) {
      carregarVendas()
    }
  }, [statusSelecionado, periodo, usuario])

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (periodoRef.current && !periodoRef.current.contains(event.target as Node)) {
        setMostrarPeriodo(false)
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setMostrarStatus(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function carregarVendas() {
    if (!usuario) return
    
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      let url = '/api/vendas?'
      // A API filtra por status individualmente, então vamos filtrar no cliente
      if (periodo !== 'all') {
        if (periodo === 'custom' && dataInicio) {
          const inicio = new Date(dataInicio)
          inicio.setHours(0, 0, 0, 0)
          url += `data_inicio=${inicio.toISOString()}&`
          if (dataFim) {
            const fim = new Date(dataFim)
            fim.setHours(23, 59, 59, 999)
            url += `data_fim=${fim.toISOString()}&`
          }
        } else if (periodo !== 'custom') {
          const hoje = new Date()
          const diasAtras = periodo === '7d' ? 7 : periodo === '30d' ? 30 : 90
          const dataInicio = new Date(hoje)
          dataInicio.setDate(dataInicio.getDate() - diasAtras)
          url += `data_inicio=${dataInicio.toISOString()}&`
        }
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setVendas(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
      setVendas([])
    } finally {
      setLoading(false)
    }
  }

  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    aprovado: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Aprovado' },
    pendente: { icon: Clock, color: 'text-yellow-600 bg-yellow-50', label: 'Pendente' },
    reembolsado: { icon: XCircle, color: 'text-orange-600 bg-orange-50', label: 'Reembolsado' },
    devolvido: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Devolvido' },
    cancelado: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Cancelado' },
    concluida: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Concluída' },
    cancelada: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Cancelada' }
  }

  // Gerar dias do calendário
  const diasDoMes = () => {
    const inicio = startOfMonth(mesAtual)
    const fim = endOfMonth(mesAtual)
    const dias = eachDayOfInterval({ start: inicio, end: fim })
    
    // Adicionar dias do mês anterior para completar a primeira semana
    const primeiroDia = getDay(inicio)
    const diasAnteriores: Date[] = []
    for (let i = primeiroDia - 1; i >= 0; i--) {
      const data = new Date(inicio)
      data.setDate(data.getDate() - i - 1)
      diasAnteriores.push(data)
    }
    
    // Adicionar dias do próximo mês para completar a última semana
    const ultimoDia = getDay(fim)
    const diasSeguintes: Date[] = []
    for (let i = 1; i <= 6 - ultimoDia; i++) {
      const data = new Date(fim)
      data.setDate(data.getDate() + i)
      diasSeguintes.push(data)
    }
    
    return [...diasAnteriores, ...dias, ...diasSeguintes]
  }


  // Filtrar por busca
  const vendasFiltradas = vendas.filter(venda => {
    const matchBusca = !busca || 
      venda.id_vendas.toString().includes(busca) ||
      venda.usuario?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      venda.usuario?.email?.toLowerCase().includes(busca.toLowerCase())
    
    const matchStatus = !statusSelecionado || venda.status === statusSelecionado
    
    return matchBusca && matchStatus
  })

  // Ordenar
  const vendasOrdenadas = [...vendasFiltradas].sort((a, b) => {
    let aVal: any, bVal: any
    
    switch (ordenacao.campo) {
      case 'id_vendas':
        aVal = a.id_vendas
        bVal = b.id_vendas
        break
      case 'cliente':
        aVal = a.usuario?.nome || ''
        bVal = b.usuario?.nome || ''
        break
      case 'total':
        aVal = a.total || 0
        bVal = b.total || 0
        break
      default:
        return 0
    }
    
    if (ordenacao.direcao === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
    }
  })

  // Paginação
  const inicio = (paginaAtual - 1) * resultadosPorPagina
  const fim = inicio + resultadosPorPagina
  const vendasPagina = vendasOrdenadas.slice(inicio, fim)
  const totalPaginas = Math.ceil(vendasOrdenadas.length / resultadosPorPagina)

  const handleOrdenacao = (campo: string) => {
    if (ordenacao.campo === campo) {
      setOrdenacao({ campo, direcao: ordenacao.direcao === 'asc' ? 'desc' : 'asc' })
    } else {
      setOrdenacao({ campo, direcao: 'desc' })
    }
  }

  const getPeriodoTexto = (p: Periodo) => {
    if (p === '7d') return 'Últimos 7 dias'
    if (p === '30d') return 'Últimos 30 dias'
    if (p === '90d') return 'Últimos 3 meses'
    return 'Todos'
  }

  return (
    <div className="p-8 relative min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
      </header>

      {/* Barra de busca e filtros */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Busca */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Procure pelo: nome, id ou email"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro Período */}
          <div className="flex items-center gap-2 relative" ref={periodoRef}>
            <button 
              onClick={() => setMostrarPeriodo(!mostrarPeriodo)}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              Período
            </button>
            
            {/* Campo de input que sempre aparece (não abre dropdown) */}
            <div className="relative">
              <input
                type="text"
                placeholder="Escolha um período"
                value={
                  periodo === '7d' ? 'Últimos 7 dias' :
                  periodo === '30d' ? 'Últimos 30 dias' :
                  periodo === '90d' ? 'Últimos 3 meses' :
                  periodo === 'all' ? 'Todo Período' :
                  periodo === 'custom' && dataInicio && dataFim
                    ? `${format(dataInicio, 'dd/MM/yyyy')} - ${format(dataFim, 'dd/MM/yyyy')}`
                    : periodo === 'custom' && dataInicio
                    ? format(dataInicio, 'dd/MM/yyyy')
                    : ''
                }
                readOnly
                className="px-3 pr-10 py-2 border-2 border-purple-500 rounded-lg text-sm focus:outline-none bg-white w-48"
              />
              <ChevronsUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Date Picker Dropdown - só aparece quando aberto */}
            {mostrarPeriodo && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 w-80" style={{ minWidth: '320px', left: '0' }}>

                {/* Opções pré-definidas */}
                <div className="mb-4 space-y-1">
                  <button
                    onClick={() => {
                      const hoje = new Date()
                      hoje.setHours(0, 0, 0, 0)
                      setDataInicio(hoje)
                      setDataFim(hoje)
                      setPeriodo('custom')
                      setMostrarPeriodo(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                      periodo === 'custom' && dataInicio && dataFim && isSameDay(dataInicio, new Date()) && isSameDay(dataFim, new Date())
                        ? 'bg-gray-100 text-gray-900 font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    Hoje
                  </button>
                  <button
                    onClick={() => {
                      setPeriodo('7d')
                      setDataInicio(null)
                      setDataFim(null)
                      setMostrarPeriodo(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                      periodo === '7d' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'
                    }`}
                  >
                    Últimos 7 dias
                  </button>
                  <button
                    onClick={() => {
                      setPeriodo('30d')
                      setDataInicio(null)
                      setDataFim(null)
                      setMostrarPeriodo(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                      periodo === '30d' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'
                    }`}
                  >
                    Últimos 30 dias
                  </button>
                  <button
                    onClick={() => {
                      setPeriodo('all')
                      setDataInicio(null)
                      setDataFim(null)
                      setMostrarPeriodo(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                      periodo === 'all' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'
                    }`}
                  >
                    Todo Período
                  </button>
                </div>
                
                {/* Navegação do mês */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setMesAtual(subMonths(mesAtual, 1))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-900">
                    {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
                  </span>
                  <button
                    onClick={() => setMesAtual(addMonths(mesAtual, 1))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Dias da semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].map((dia) => (
                    <div key={dia} className="text-center text-xs text-gray-500 font-medium py-1">
                      {dia}
                    </div>
                  ))}
                </div>
                
                {/* Calendário */}
                <div className="grid grid-cols-7 gap-1">
                  {diasDoMes().map((dia, index) => {
                    const mesmoMes = isSameMonth(dia, mesAtual)
                    const hoje = new Date()
                    hoje.setHours(0, 0, 0, 0)
                    const diaLimpo = new Date(dia)
                    diaLimpo.setHours(0, 0, 0, 0)
                    
                    // Verificar se está no range selecionado
                    let noRange = false
                    let inicioRange = false
                    let fimRange = false
                    
                    if (dataInicio && dataFim) {
                      const inicio = new Date(dataInicio)
                      inicio.setHours(0, 0, 0, 0)
                      const fim = new Date(dataFim)
                      fim.setHours(0, 0, 0, 0)
                      
                      noRange = diaLimpo >= inicio && diaLimpo <= fim
                      inicioRange = isSameDay(dia, dataInicio)
                      fimRange = isSameDay(dia, dataFim)
                    } else if (dataInicio) {
                      // Se só tem data início, mostrar como range até hoje
                      const inicio = new Date(dataInicio)
                      inicio.setHours(0, 0, 0, 0)
                      const hoje = new Date()
                      hoje.setHours(0, 0, 0, 0)
                      
                      noRange = diaLimpo >= inicio && diaLimpo <= hoje && mesmoMes
                      inicioRange = isSameDay(dia, dataInicio)
                    }
                    
                    // Se período é "Últimos 7 dias", destacar os últimos 7 dias
                    let ultimos7Dias = false
                    if (periodo === '7d') {
                      const hojeLimpo = new Date()
                      hojeLimpo.setHours(0, 0, 0, 0)
                      const diasAtras = 6 // 7 dias incluindo hoje = 6 dias atrás
                      const dataInicio7d = new Date(hojeLimpo)
                      dataInicio7d.setDate(dataInicio7d.getDate() - diasAtras)
                      ultimos7Dias = diaLimpo >= dataInicio7d && diaLimpo <= hojeLimpo
                    }
                    
                    // Se período é "Últimos 30 dias"
                    let ultimos30Dias = false
                    if (periodo === '30d') {
                      const hojeLimpo = new Date()
                      hojeLimpo.setHours(0, 0, 0, 0)
                      const diasAtras = 29 // 30 dias incluindo hoje = 29 dias atrás
                      const dataInicio30d = new Date(hojeLimpo)
                      dataInicio30d.setDate(dataInicio30d.getDate() - diasAtras)
                      ultimos30Dias = diaLimpo >= dataInicio30d && diaLimpo <= hojeLimpo
                    }
                    
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (!dataInicio || (dataInicio && dataFim)) {
                            // Nova seleção - definir range até hoje
                            setDataInicio(dia)
                            const hoje = new Date()
                            hoje.setHours(23, 59, 59, 999)
                            if (dia <= hoje) {
                              setDataFim(hoje)
                            } else {
                              setDataFim(dia)
                            }
                            setPeriodo('custom')
                          } else if (dataInicio && !dataFim) {
                            // Completar range
                            if (dia < dataInicio) {
                              setDataFim(dataInicio)
                              setDataInicio(dia)
                            } else {
                              setDataFim(dia)
                            }
                            setPeriodo('custom')
                          }
                        }}
                        className={`h-8 text-sm rounded transition-colors ${
                          mesmoMes
                            ? inicioRange || fimRange
                              ? 'bg-purple-600 text-white'
                              : noRange || ultimos7Dias || ultimos30Dias
                              ? 'bg-gray-200 text-gray-900'
                              : 'text-gray-900 hover:bg-gray-100'
                            : 'text-gray-400'
                        }`}
                      >
                        {format(dia, 'd')}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Filtro Status */}
          <div className="relative" ref={statusRef}>
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 mr-2">Filtrar por status:</label>
              <div className="inline-block relative">
                <input
                  type="text"
                  readOnly
                  value={statusOptions.find(s => s.value === statusSelecionado)?.label || 'Todos'}
                  onClick={() => setMostrarStatus(!mostrarStatus)}
                  className="px-4 py-2 pr-8 border-2 border-blue-500 rounded-lg text-sm focus:outline-none bg-white cursor-pointer min-w-[150px]"
                />
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                
                {/* Dropdown Status */}
                {mostrarStatus && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[150px]">
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => {
                          setStatusSelecionado(status.value)
                          setMostrarStatus(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          statusSelecionado === status.value || (statusSelecionado === '' && status.value === '')
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'text-gray-900'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando vendas...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleOrdenacao('id_vendas')}
                    >
                      <div className="flex items-center gap-2">
                        Venda
                        {ordenacao.campo === 'id_vendas' ? (
                          ordenacao.direcao === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <div className="flex flex-col">
                            <ChevronUp className="h-3 w-3 text-gray-300" />
                            <ChevronDown className="h-3 w-3 text-gray-300 -mt-1" />
                          </div>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleOrdenacao('cliente')}
                    >
                      <div className="flex items-center gap-2">
                        Cliente
                        {ordenacao.campo === 'cliente' ? (
                          ordenacao.direcao === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <div className="flex flex-col">
                            <ChevronUp className="h-3 w-3 text-gray-300" />
                            <ChevronDown className="h-3 w-3 text-gray-300 -mt-1" />
                          </div>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleOrdenacao('total')}
                    >
                      <div className="flex items-center gap-2">
                        Total
                        {ordenacao.campo === 'total' ? (
                          ordenacao.direcao === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <div className="flex flex-col">
                            <ChevronUp className="h-3 w-3 text-gray-300" />
                            <ChevronDown className="h-3 w-3 text-gray-300 -mt-1" />
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendasPagina.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <p className="text-gray-600">Nenhum resultado encontrado</p>
                      </td>
                    </tr>
                  ) : (
                    vendasPagina.map((venda) => {
                      const status = statusConfig[venda.status as keyof typeof statusConfig]
                      const StatusIcon = status?.icon || Clock
                      
                      return (
                        <tr key={venda.id_vendas} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{venda.id_vendas}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{venda.usuario?.nome || 'N/A'}</div>
                            {venda.usuario?.email && (
                              <div className="text-sm text-gray-500">{venda.usuario.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            R$ {venda.total?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status?.color || 'bg-gray-100 text-gray-800'}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status?.label || venda.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {vendasOrdenadas.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Resultados por página</span>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={resultadosPorPagina}
                    onChange={(e) => {
                      const valor = parseInt(e.target.value) || 10
                      setResultadosPorPagina(valor)
                      setPaginaAtual(1)
                    }}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                    disabled={paginaAtual === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-700">
                    Página {paginaAtual} de {totalPaginas}
                  </span>
                  <button
                    onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                    disabled={paginaAtual === totalPaginas}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Botão flutuante de chat */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 flex items-center justify-center z-50">
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  )
}

