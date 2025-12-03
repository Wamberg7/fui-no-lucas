'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Iniciando login...', { email: formData.email })
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      console.log('📡 Resposta do servidor:', { status: response.status, ok: response.ok })

      const data = await response.json()
      console.log('📦 Dados recebidos:', { hasToken: !!data.token, hasUsuario: !!data.usuario, error: data.error })

      if (response.ok && data.token && data.usuario) {
        console.log('✅ [LOGIN PAGE] Login bem-sucedido!')
        
        // Salvar no localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        console.log('💾 [LOGIN PAGE] Dados salvos no localStorage')
        
        // Salvar token nos cookies também (para o middleware verificar)
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        console.log('🍪 [LOGIN PAGE] Token salvo nos cookies')
        
        // Usar a função login do AuthProvider para atualizar o estado
        login(data.token, data.usuario)
        console.log('🔄 [LOGIN PAGE] AuthProvider atualizado')
        
        // Redirecionar imediatamente para a dashboard
        console.log('🚀 [LOGIN PAGE] Redirecionando para dashboard...')
        // Usar window.location.href para garantir redirecionamento completo
        window.location.href = '/'
      } else {
        console.error('❌ [LOGIN PAGE] Erro no login:', data.error)
        setError(data.error || 'Erro ao fazer login')
        setLoading(false)
      }
    } catch (error) {
      console.error('💥 Erro ao fazer login:', error)
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h1>
            <p className="text-gray-600">Faça login para acessar sua dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link 
                href="/auth/cadastro" 
                className="text-primary-600 hover:text-primary-700 font-medium"
                onClick={(e) => {
                  console.log('🔗 [LOGIN PAGE] Link de cadastro clicado')
                  // Permitir navegação normal
                }}
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

