'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Produto, Categoria } from '@/lib/supabase'

interface ProdutoModalProps {
  produto?: Produto | null
  categorias: Categoria[]
  onClose: () => void
}

export default function ProdutoModal({ produto, categorias, onClose }: ProdutoModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome_produto: '',
    descricao: '',
    imagem_produto: '',
    categorias_id_categorias: '',
    preco: '',
    estoque: '0',
    disponivel_venda: false,
    tipo_produto: 'digital' as 'digital' | 'fisico',
    envio_automatico: true,
    destaque: false
  })

  useEffect(() => {
    if (produto) {
      setFormData({
        nome_produto: produto.nome_produto,
        descricao: produto.descricao || '',
        imagem_produto: produto.imagem_produto || '',
        categorias_id_categorias: produto.categorias_id_categorias.toString(),
        preco: produto.preco.toString(),
        estoque: produto.estoque.toString(),
        disponivel_venda: produto.disponivel_venda,
        tipo_produto: produto.tipo_produto,
        envio_automatico: produto.envio_automatico,
        destaque: produto.destaque
      })
    }
  }, [produto])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const url = produto
        ? `/api/produtos/${produto.id_produtos}`
        : '/api/produtos'

      const method = produto ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          categorias_id_categorias: parseInt(formData.categorias_id_categorias),
          preco: parseFloat(formData.preco),
          estoque: parseInt(formData.estoque)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar produto')
      }

      onClose()
    } catch (error: any) {
      alert(error.message || 'Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {produto ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Produto *
            </label>
            <input
              type="text"
              required
              value={formData.nome_produto}
              onChange={(e) => setFormData({ ...formData, nome_produto: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                required
                value={formData.categorias_id_categorias}
                onChange={(e) => setFormData({ ...formData, categorias_id_categorias: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(cat => (
                  <option key={cat.id_categorias} value={cat.id_categorias}>
                    {cat.nome_categoria}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Produto
              </label>
              <select
                value={formData.tipo_produto}
                onChange={(e) => setFormData({ ...formData, tipo_produto: e.target.value as 'digital' | 'fisico' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="digital">Digital</option>
                <option value="fisico">Físico</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estoque
              </label>
              <input
                type="number"
                min="0"
                value={formData.estoque}
                onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL da Imagem
            </label>
            <input
              type="url"
              value={formData.imagem_produto}
              onChange={(e) => setFormData({ ...formData, imagem_produto: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.disponivel_venda}
                onChange={(e) => setFormData({ ...formData, disponivel_venda: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Disponível para venda</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.destaque}
                onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Produto em destaque</span>
            </label>

            {formData.tipo_produto === 'digital' && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.envio_automatico}
                  onChange={(e) => setFormData({ ...formData, envio_automatico: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Envio automático</span>
              </label>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : produto ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

