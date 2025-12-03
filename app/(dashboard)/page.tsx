'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight, Activity } from 'lucide-react'
import StatCard from '@/components/StatCard'
import VendasChart from '@/components/VendasChart'
import ProdutosRecentes from '@/components/ProdutosRecentes'
import { useAuth } from '@/components/AuthProvider'

export default function Dashboard() {
  const { usuario } = useAuth()
  const [estatisticas, setEstatisticas] = useState<any>(null)
  const [vendasData, setVendasData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔄 [DASHBOARD PAGE] Verificando usuário:', { 
      hasUsuario: !!usuario, 
      usuarioNome: usuario?.nome 
    })
    
    if (!usuario) {
      console.log('⏳ [DASHBOARD PAGE] Aguardando usuário...')
      return
    }

    console.log('✅ [DASHBOARD PAGE] Usuário encontrado, carregando dados...')

    async function carregarDados() {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.log('❌ [DASHBOARD PAGE] Token não encontrado')
          return
        }
        
        console.log('📡 [DASHBOARD PAGE] Fazendo requisições para carregar dados...')
        const [statsResponse, vendasResponse] = await Promise.all([
          fetch('/api/estatisticas', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('/api/vendas?limit=100', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ])
        
        const stats = await statsResponse.json()
        const vendas = await vendasResponse.json()
        
        setEstatisticas(stats)
        
        // Processar dados de vendas para o gráfico - apenas vendas do usuário autenticado
        console.log('📊 [DASHBOARD PAGE] Processando vendas:', { total: vendas?.length || 0 })
        
        const vendasPorDia: { [key: string]: number } = {}
        
        // Verificar se vendas é um array
        if (Array.isArray(vendas)) {
          vendas.forEach((venda: any) => {
            // Filtrar apenas vendas concluídas e do usuário autenticado
            if (venda.status === 'concluida' && venda.usuarios_id_usuarios === usuario.id_usuarios) {
              const data = new Date(venda.data_venda).toISOString().split('T')[0]
              vendasPorDia[data] = (vendasPorDia[data] || 0) + (venda.total || 0)
            }
          })
        }
        
        const vendasFormatadas = Object.entries(vendasPorDia)
          .map(([data, valor]) => ({
            data,
            valor: Number(valor)
          }))
          .sort((a, b) => a.data.localeCompare(b.data)) // Ordenar por data
        
        console.log('📊 [DASHBOARD PAGE] Vendas formatadas para gráfico:', vendasFormatadas.length)
        setVendasData(vendasFormatadas)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [usuario])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo de volta, {usuario?.nome}! Aqui está um resumo das suas operações.</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Package className="h-6 w-6" />
            </div>
            <ArrowUpRight className="h-5 w-5 opacity-75" />
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">Total de Produtos</p>
          <p className="text-3xl font-bold">{estatisticas?.totalProdutos || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <ArrowUpRight className="h-5 w-5 opacity-75" />
          </div>
          <p className="text-purple-100 text-sm font-medium mb-1">Categorias</p>
          <p className="text-3xl font-bold">{estatisticas?.totalCategorias || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <ArrowUpRight className="h-5 w-5 opacity-75" />
          </div>
          <p className="text-orange-100 text-sm font-medium mb-1">Total de Vendas</p>
          <p className="text-3xl font-bold">{estatisticas?.totalVendas || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <DollarSign className="h-6 w-6" />
            </div>
            <ArrowUpRight className="h-5 w-5 opacity-75" />
          </div>
          <p className="text-green-100 text-sm font-medium mb-1">Receita Total</p>
          <p className="text-3xl font-bold">
            R$ {parseFloat(estatisticas?.receitaTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Gráficos e Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gráfico de Vendas */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <VendasChart data={vendasData} />
        </div>

        {/* Estatísticas de Estoque */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Estoque</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Total em Estoque</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{estatisticas?.totalEstoque || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{estatisticas?.produtosDisponiveis || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Sem Estoque</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{estatisticas?.produtosSemEstoque || 0}</p>
              </div>
              <Package className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Produtos Recentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Produtos Recentes</h2>
            <p className="text-sm text-gray-500 mt-1">Últimos produtos cadastrados</p>
          </div>
          <Link
            href="/produtos"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1"
          >
            <span>Ver todos</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <ProdutosRecentes />
      </div>
    </div>
  )
}
