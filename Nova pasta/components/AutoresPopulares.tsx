'use client'

import { User, Globe } from 'lucide-react'

interface Autor {
  id_autores: number
  nome_autor: string
  nacionalidade: string
}

interface AutoresPopularesProps {
  data: Array<{
    autor: Autor
    total: number
  }>
}

export default function AutoresPopulares({ data }: AutoresPopularesProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Autores Mais Populares</h2>
        <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Autores Mais Populares</h2>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div 
            key={item.autor.id_autores} 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {item.autor.nome_autor}
                </p>
                <div className="flex items-center mt-1 space-x-2">
                  <Globe className="h-3 w-3 text-gray-400" />
                  <p className="text-xs text-gray-500">
                    {item.autor.nacionalidade}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary-600">{item.total}</p>
              <p className="text-xs text-gray-500">livros</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

