'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Package } from 'lucide-react'

interface EstoqueStatsProps {
  data: {
    totalEstoque: number
    livrosDisponiveis: number
    livrosSemEstoque: number
    totalLivros: number
  } | null
}

const COLORS = ['#0ea5e9', '#ef4444', '#f59e0b']

export default function EstoqueStats({ data }: EstoqueStatsProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Estatísticas de Estoque</h2>
        <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
      </div>
    )
  }

  const chartData = [
    { name: 'Disponíveis', value: data.livrosDisponiveis },
    { name: 'Sem Estoque', value: data.livrosSemEstoque },
    { name: 'Indisponíveis', value: data.totalLivros - data.livrosDisponiveis - data.livrosSemEstoque }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Estatísticas de Estoque</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">Total em Estoque</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{data.totalEstoque}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-900">Disponíveis</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{data.livrosDisponiveis}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

