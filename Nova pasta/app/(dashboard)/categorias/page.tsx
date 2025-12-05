'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'
import type { Categoria } from '@/lib/supabase'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se é super admin e redirecionar
    const checkAndRedirect = async () => {
      const token = localStorage.getItem('token')
      const isSuperAdminLocal = localStorage.getItem('isSuperAdmin')
      
      if (token && isSuperAdminLocal === 'true') {
        try {
          const response = await fetch('/api/admin/verificar-admin', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.is_super_admin) {
              window.location.href = '/admin'
              return
            }
          }
        } catch (error) {
          console.error('Erro ao verificar super admin:', error)
        }
      }
    }
    
    checkAndRedirect()
    carregarCategorias()
  }, [])

  async function carregarCategorias() {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/categorias', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setCategorias(data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deletarCategoria(id: number) {
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        carregarCategorias()
      } else {
        alert('Erro ao deletar categoria')
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error)
      alert('Erro ao deletar categoria')
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
              <p className="mt-1 text-sm text-gray-500">Gerencie as categorias de produtos</p>
            </div>
            <Link
              href="/categorias/nova"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Nova Categoria</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando categorias...</p>
          </div>
        ) : categorias.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma categoria encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorias.map((categoria) => (
              <div
                key={categoria.id_categorias}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {categoria.icone && (
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Tag className="h-5 w-5 text-primary-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{categoria.nome_categoria}</h3>
                      {categoria.descricao && (
                        <p className="text-sm text-gray-600 mt-1">{categoria.descricao}</p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      categoria.ativo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {categoria.ativo ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/categorias/${categoria.id_categorias}/editar`}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </Link>
                  <button
                    onClick={() => deletarCategoria(categoria.id_categorias)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Deletar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

