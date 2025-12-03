'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import type { Categoria } from '@/lib/supabase'

export default function NovoProdutoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [formData, setFormData] = useState({
    nome_produto: '',
    descricao: '',
    imagem_produto: '',
    categorias_id_categorias: '',
    preco: '',
    estoque: '',
    disponivel_venda: false,
    tipo_produto: 'digital',
    envio_automatico: true,
    destaque: false
  })

  useEffect(() => {
    async function carregarCategorias() {
      try {
        const response = await fetch('/api/categorias?ativo=true')
        const data = await response.json()
        setCategorias(data)
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      }
    }
    carregarCategorias()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          categorias_id_categorias: parseInt(formData.categorias_id_categorias),
          preco: parseFloat(formData.preco),
          estoque: parseInt(formData.estoque)
        })
      })

      if (response.ok) {
        router.push('/produtos')
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      alert('Erro ao criar produto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <div>
          <div className="flex items-center space-x-4">
            <Link
              href="/produtos"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Novo Produto</h1>
              <p className="mt-1 text-sm text-gray-500">Adicione um novo produto ao catálogo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={formData.nome_produto}
                onChange={(e) => setFormData({ ...formData, nome_produto: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Imagem
              </label>
              <input
                type="url"
                value={formData.imagem_produto}
                onChange={(e) => setFormData({ ...formData, imagem_produto: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  required
                  value={formData.categorias_id_categorias}
                  onChange={(e) => setFormData({ ...formData, categorias_id_categorias: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categorias} value={cat.id_categorias}>
                      {cat.nome_categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Produto
                </label>
                <select
                  value={formData.tipo_produto}
                  onChange={(e) => setFormData({ ...formData, tipo_produto: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="digital">Digital</option>
                  <option value="fisico">Físico</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estoque *
                </label>
                <input
                  type="number"
                  required
                  value={formData.estoque}
                  onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.disponivel_venda}
                  onChange={(e) => setFormData({ ...formData, disponivel_venda: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Disponível para venda</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.envio_automatico}
                  onChange={(e) => setFormData({ ...formData, envio_automatico: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Envio automático</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.destaque}
                  onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Produto em destaque</span>
              </label>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                <span>{loading ? 'Salvando...' : 'Salvar Produto'}</span>
              </button>
              <Link
                href="/produtos"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </Link>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}

