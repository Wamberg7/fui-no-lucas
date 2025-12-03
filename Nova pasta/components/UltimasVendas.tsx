'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ShoppingCart, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Venda {
  id_vendas: number
  data_venda: string
  total: number
  status: 'pendente' | 'concluida' | 'cancelada'
  usuario: {
    nome: string
    email: string | null
  } | null
}

interface UltimasVendasProps {
  data: Venda[]
}

const statusConfig = {
  concluida: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Concluída' },
  pendente: { icon: Clock, color: 'text-yellow-600 bg-yellow-50', label: 'Pendente' },
  cancelada: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Cancelada' }
}

export default function UltimasVendas({ data }: UltimasVendasProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Últimas Vendas</h2>
        <p className="text-gray-500 text-center py-8">Nenhuma venda encontrada</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Últimas Vendas</h2>
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
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((venda) => {
              const status = statusConfig[venda.status]
              const StatusIcon = status.icon
              
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(venda.data_venda), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    R$ {venda.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

