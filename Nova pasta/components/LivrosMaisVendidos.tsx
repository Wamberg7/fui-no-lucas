'use client'

import { BookOpen } from 'lucide-react'

interface LivroVendido {
  livro: {
    id_livros: number
    titulos: string
    preco: number | null
    autor: {
      nome_autor: string
    } | null
  }
  total: number
}

interface LivrosMaisVendidosProps {
  data: LivroVendido[]
}

export default function LivrosMaisVendidos({ data }: LivrosMaisVendidosProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Livros Mais Vendidos</h2>
        <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Livros Mais Vendidos</h2>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div 
            key={item.livro.id_livros} 
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">#{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.livro.titulos}
                </p>
                <p className="text-xs text-gray-500">
                  {item.livro.autor?.nome_autor || 'Autor desconhecido'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{item.total}</p>
                <p className="text-xs text-gray-500">vendas</p>
              </div>
              {item.livro.preco && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    R$ {item.livro.preco.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

