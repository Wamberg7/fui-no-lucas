'use client'

import { useState } from 'react'
import { Edit, Trash2, Eye, EyeOff, Package } from 'lucide-react'
import type { Produto, Categoria } from '@/lib/supabase'

interface ProdutosTableProps {
  produtos: Produto[]
  categorias: Categoria[]
  onEdit: (produto: Produto) => void
  onRefresh: () => void
}

export default function ProdutosTable({ produtos, categorias, onEdit, onRefresh }: ProdutosTableProps) {
  const [deletando, setDeletando] = useState<number | null>(null)

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return

    try {
      setDeletando(id)
      const response = await fetch(`/api/produtos/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar produto')
      }

      onRefresh()
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('Erro ao deletar produto')
    } finally {
      setDeletando(null)
    }
  }

  async function handleToggleDisponivel(produto: Produto) {
    try {
      const response = await fetch(`/api/produtos/${produto.id_produtos}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disponivel_venda: !produto.disponivel_venda
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar produto')
      }

      onRefresh()
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      alert('Erro ao atualizar produto')
    }
  }

  if (produtos.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        Nenhum produto cadastrado. Clique em "Novo Produto" para começar.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {produtos.map((produto) => {
            const categoria = categorias.find(c => c.id_categorias === produto.categorias_id_categorias)
            return (
              <tr key={produto.id_produtos} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    {produto.imagem_produto ? (
                      <img
                        src={produto.imagem_produto}
                        alt={produto.nome_produto}
                        className="h-10 w-10 rounded object-cover mr-3"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-gray-200 mr-3 flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{produto.nome_produto}</div>
                      {produto.destaque && (
                        <span className="text-xs text-yellow-600">⭐ Destaque</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {categoria?.nome_categoria || 'Sem categoria'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                  R$ {produto.preco.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-sm ${produto.estoque > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {produto.estoque}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleDisponivel(produto)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      produto.disponivel_venda
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {produto.disponivel_venda ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Disponível
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Indisponível
                      </>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(produto)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(produto.id_produtos)}
                      disabled={deletando === produto.id_produtos}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

