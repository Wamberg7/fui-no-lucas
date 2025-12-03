'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import type { Venda } from '@/lib/supabase'

interface VendasTableProps {
  vendas: Venda[]
}

const statusConfig = {
  concluida: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Concluída' },
  pendente: { icon: Clock, color: 'text-yellow-600 bg-yellow-50', label: 'Pendente' },
  cancelada: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Cancelada' }
}

export default function VendasTable({ vendas }: VendasTableProps) {
  if (vendas.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        Nenhuma venda encontrada.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vendas.map((venda) => {
            const status = statusConfig[venda.status]
            const StatusIcon = status.icon

            return (
              <tr key={venda.id_vendas} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{venda.id_vendas}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{venda.usuario?.nome || 'N/A'}</div>
                  {venda.usuario?.email && (
                    <div className="text-sm text-gray-500">{venda.usuario.email}</div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(venda.data_venda), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                  R$ {venda.total.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
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
  )
}

