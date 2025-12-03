'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface VendasChartProps {
  data?: Array<{ data: string; valor: number }>
}

type Periodo = '7d' | '30d' | '90d'

export default function VendasChart({ data = [] }: VendasChartProps) {
  const [periodo, setPeriodo] = useState<Periodo>('90d')

  // Filtrar dados pelo período selecionado
  const hoje = startOfDay(new Date())
  const diasAtras = periodo === '7d' ? 7 : periodo === '30d' ? 30 : 90
  const dataInicio = subDays(hoje, diasAtras)

  // Filtrar dados do período
  const dadosFiltrados = data.filter(item => {
    const dataItem = new Date(item.data)
    return dataItem >= dataInicio && dataItem <= hoje
  })

  // Criar array completo de dias do período (preenchendo com zeros se não houver vendas)
  const diasCompletos: Array<{ data: string; dataFormatada: string; valor: number }> = []
  for (let i = diasAtras - 1; i >= 0; i--) {
    const dataAtual = subDays(hoje, i)
    const dataStr = dataAtual.toISOString().split('T')[0]
    const vendaDoDia = dadosFiltrados.find(d => d.data === dataStr)
    
    diasCompletos.push({
      data: dataStr,
      dataFormatada: format(dataAtual, 'dd/MM', { locale: ptBR }),
      valor: vendaDoDia ? vendaDoDia.valor : 0
    })
  }

  // Calcular total do período
  const totalPeriodo = dadosFiltrados.reduce((acc, item) => acc + item.valor, 0)

  return (
    <div>
      {/* Header com título e filtros */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gráfico de vendas</h2>
          <p className="text-sm text-gray-500 mt-1">
            Total para os últimos {periodo === '7d' ? '7 dias' : periodo === '30d' ? '30 dias' : '3 meses'}: R$ {totalPeriodo.toFixed(2)}
          </p>
        </div>
        
        {/* Botões de filtro */}
        <div className="flex items-center space-x-0 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setPeriodo('90d')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              periodo === '90d'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Últimos 3 meses
          </button>
          <button
            onClick={() => setPeriodo('30d')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              periodo === '30d'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Últimos 30 dias
          </button>
          <button
            onClick={() => setPeriodo('7d')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              periodo === '7d'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Últimos 7 dias
          </button>
        </div>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={diasCompletos}>
          <defs>
            <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="dataFormatada" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
            interval={periodo === '7d' ? 0 : periodo === '30d' ? 2 : 5}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
            stroke="#9ca3af"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
            labelFormatter={(label) => `Data: ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="valor" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValor)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
