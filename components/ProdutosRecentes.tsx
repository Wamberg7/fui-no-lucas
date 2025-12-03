'use client'

import { useEffect, useState } from 'react'
import { Package, ArrowRight } from 'lucide-react'
import type { Produto } from '@/lib/supabase'

export default function ProdutosRecentes() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/produtos?limit=5', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          console.error('Erro ao carregar produtos:', response.statusText)
          setProdutos([])
          return
        }
        
        const data = await response.json()
        
        // Garantir que data seja sempre um array
        if (Array.isArray(data)) {
          setProdutos(data)
        } else {
          console.error('Resposta da API não é um array:', data)
          setProdutos([])
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
        setProdutos([])
      } finally {
        setLoading(false)
      }
    }

    carregarProdutos()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Garantir que produtos seja sempre um array antes de usar map
  if (!Array.isArray(produtos) || produtos.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nenhum produto encontrado</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produto</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Categoria</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Preço</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estoque</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(produtos) && produtos.map((produto) => (
            <tr key={produto.id_produtos} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  {produto.imagem_produto ? (
                    <img
                      src={produto.imagem_produto}
                      alt={produto.nome_produto}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{produto.nome_produto}</p>
                    {produto.destaque && (
                      <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">Destaque</span>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 text-sm text-gray-600">
                {produto.categoria?.nome_categoria || 'N/A'}
              </td>
              <td className="py-4 px-4">
                <span className="font-semibold text-gray-900">R$ {produto.preco.toFixed(2)}</span>
              </td>
              <td className="py-4 px-4">
                <span className={`text-sm font-medium ${
                  produto.estoque > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {produto.estoque} unidades
                </span>
              </td>
              <td className="py-4 px-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  produto.disponivel_venda && produto.estoque > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {produto.disponivel_venda && produto.estoque > 0 ? 'Disponível' : 'Indisponível'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

