'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Mail, Phone, User, FileText, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    discord: '',
    senha: '',
    confirmarSenha: ''
  })
  const [showSenha, setShowSenha] = useState(false)

  function formatarCPF(cpf: string) {
    cpf = cpf.replace(/\D/g, '')
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2')
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2')
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    return cpf
  }

  function formatarTelefone(telefone: string) {
    telefone = telefone.replace(/\D/g, '')
    if (telefone.length <= 10) {
      telefone = telefone.replace(/(\d{2})(\d)/, '($1) $2')
      telefone = telefone.replace(/(\d{4})(\d)/, '$1-$2')
    } else {
      telefone = telefone.replace(/(\d{2})(\d)/, '($1) $2')
      telefone = telefone.replace(/(\d{5})(\d)/, '$1-$2')
    }
    return telefone
  }

  function validarCPF(cpf: string) {
    cpf = cpf.replace(/\D/g, '')
    
    if (cpf.length !== 11) return false
    if (/^(\d)\1+$/.test(cpf)) return false

    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let digito = 11 - (soma % 11)
    if (digito >= 10) digito = 0
    if (digito !== parseInt(cpf.charAt(9))) return false

    soma = 0
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i)
    }
    digito = 11 - (soma % 11)
    if (digito >= 10) digito = 0
    if (digito !== parseInt(cpf.charAt(10))) return false

    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      setLoading(false)
      return
    }

    // Validar CPF apenas se foi preenchido
    if (formData.cpf && formData.cpf.trim() !== '') {
      const cpfLimpo = formData.cpf.replace(/\D/g, '')
      if (cpfLimpo.length > 0 && !validarCPF(cpfLimpo)) {
        setError('CPF inválido')
        setLoading(false)
        return
      }
    }

    try {
      const response = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone.replace(/\D/g, ''),
          cpf: formData.cpf && formData.cpf.trim() !== '' ? formData.cpf.replace(/\D/g, '') : null,
          discord: formData.discord && formData.discord.trim() !== '' ? formData.discord.trim() : null,
          senha: formData.senha
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        setError(data.error || 'Erro ao criar conta')
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error)
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Conta criada com sucesso!</h2>
          <p className="text-gray-600">Redirecionando para o login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar conta</h1>
            <p className="text-gray-600">Insira seus dados para começar.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome completo
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                placeholder="Digite seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                placeholder="Digite seu e-mail"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showSenha ? "text" : "password"}
                  required
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showSenha ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showSenha ? "text" : "password"}
                  required
                  value={formData.confirmarSenha}
                  onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="Digite sua senha novamente"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showSenha ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <span className="text-xl">🇧🇷</span>
                </div>
                <input
                  type="tel"
                  required
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: formatarTelefone(e.target.value) })}
                  maxLength={15}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="Digite seu telefone"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discord (Opcional)
              </label>
              <input
                type="text"
                value={formData.discord}
                onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                placeholder="Digite seu ID Discord"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF (Opcional)
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => {
                  const valor = formatarCPF(e.target.value)
                  if (valor.length <= 14) {
                    setFormData({ ...formData, cpf: valor })
                  }
                }}
                maxLength={14}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                placeholder="Digite seu CPF"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Criando conta...
                </span>
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600 text-center">
            Ao clicar em continuar, você confirma que aceita os nossos{' '}
            <Link href="/termos" className="text-gray-900 underline hover:text-green-600">
              Termos de Serviço
            </Link>
            .
          </p>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium underline">
                Faça login!
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

