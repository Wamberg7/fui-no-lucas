'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Package, Search } from 'lucide-react'
import type { Produto } from '@/lib/supabase'

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    carregarProdutos()
  }, [])

  async function carregarProdutos() {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/produtos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setProdutos(data)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deletarProduto(id: number) {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/produtos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        carregarProdutos()
      } else {
        alert('Erro ao deletar produto')
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
      alert('Erro ao deletar produto')
    }
  }

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome_produto.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
      <header className="mb-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
              <p className="mt-1 text-gray-600">Gerencie seus produtos</p>
            </div>
            <Link
              href="/produtos/novo"
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Novo Produto</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Busca */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando produtos...</p>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtosFiltrados.map((produto) => (
              <div
                key={produto.id_produtos}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
              >
                {produto.imagem_produto && (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <img
                      src={produto.imagem_produto}
                      alt={produto.nome_produto}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{produto.nome_produto}</h3>
                    {produto.destaque && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                        Destaque
                      </span>
                    )}
                  </div>
                  {produto.descricao && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{produto.descricao}</p>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-primary-600">
                        R$ {produto.preco.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Estoque: {produto.estoque} unidades
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        produto.disponivel_venda && produto.estoque > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {produto.disponivel_venda && produto.estoque > 0 ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/produtos/${produto.id_produtos}/editar`}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all hover:shadow-sm"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </Link>
                    <button
                      onClick={() => deletarProduto(produto.id_produtos)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all hover:shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Deletar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

