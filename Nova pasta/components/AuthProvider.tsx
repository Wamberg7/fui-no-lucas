'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface Usuario {
  id_usuarios: number
  nome: string
  email: string
  telefone: string | null
  cpf: string | null
  discord: string | null
  tipo_usuario: string
  tipo_conta: string | null
}

interface AuthContextType {
  usuario: Usuario | null
  loading: boolean
  login: (token: string, usuario: Usuario) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    console.log('🔄 [AUTH PROVIDER] Verificando sessão...')
    // Verificar se há usuário salvo
    const usuarioStr = localStorage.getItem('usuario')
    const token = localStorage.getItem('token')

    console.log('🔍 [AUTH PROVIDER] localStorage:', {
      hasUsuario: !!usuarioStr,
      hasToken: !!token
    })

    if (usuarioStr && token) {
      try {
        const usuarioData = JSON.parse(usuarioStr)
        console.log('✅ [AUTH PROVIDER] Usuário encontrado no localStorage:', usuarioData.nome)
        // Definir usuário imediatamente para não bloquear
        setUsuario(usuarioData)
        setLoading(false)
        console.log('✅ [AUTH PROVIDER] Estado definido:', { 
          usuario: usuarioData.nome, 
          loading: false 
        })
        
        // Verificar token em background (não bloqueia a UI)
        fetch('/api/auth/verificar', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(res => res.json())
        .then(data => {
          console.log('🔍 [AUTH PROVIDER] Resposta da verificação:', data)
          if (!data.valid) {
            console.log('❌ [AUTH PROVIDER] Token inválido, limpando sessão')
            // Se token inválido, limpar
            localStorage.removeItem('usuario')
            localStorage.removeItem('token')
            setUsuario(null)
          } else {
            console.log('✅ [AUTH PROVIDER] Token válido, mantendo sessão')
          }
        })
        .catch((error) => {
          // Em caso de erro, manter o usuário (pode ser problema de rede)
          console.warn('⚠️ [AUTH PROVIDER] Erro ao verificar token, mantendo sessão local:', error)
        })
      } catch (error) {
        console.error('💥 [AUTH PROVIDER] Erro ao carregar usuário:', error)
        localStorage.removeItem('usuario')
        localStorage.removeItem('token')
        setLoading(false)
      }
    } else {
      console.log('ℹ️ [AUTH PROVIDER] Nenhum usuário encontrado no localStorage')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log('🔄 [AUTH PROVIDER] Verificando redirecionamento:', { 
      loading, 
      hasUsuario: !!usuario, 
      pathname,
      usuarioNome: usuario?.nome 
    })
    
    // Não fazer nada enquanto está carregando
    if (loading) {
      console.log('⏳ [AUTH PROVIDER] Ainda carregando, aguardando...')
      return
    }

    // Rotas públicas que não precisam de autenticação
    const isPublicRoute = pathname?.startsWith('/auth') || false

    // Se estiver autenticado e tentar acessar APENAS /auth/login, redirecionar para dashboard
    // MAS permitir acesso a /auth/cadastro mesmo se autenticado (para criar outras contas se necessário)
    if (usuario && pathname === '/auth/login') {
      console.log('🚀 [AUTH PROVIDER] Usuário autenticado em /auth/login, redirecionando para dashboard')
      router.push('/')
      return
    }

    // NÃO redirecionar se estiver em rota pública - permitir acesso livre
    // O AuthProvider só gerencia o estado, não bloqueia rotas públicas
    console.log('✅ [AUTH PROVIDER] Redirecionamento verificado, sem ação necessária')
  }, [usuario, loading, pathname, router])

  const login = (token: string, usuarioData: Usuario) => {
    console.log('🔐 [AUTH PROVIDER] Função login chamada:', { hasToken: !!token, usuario: usuarioData.nome })
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(usuarioData))
    
    // Salvar token nos cookies também (para o middleware verificar)
    if (typeof document !== 'undefined') {
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
      console.log('🍪 [AUTH PROVIDER] Token salvo nos cookies')
    }
    
    setUsuario(usuarioData)
    setLoading(false)
    console.log('✅ [AUTH PROVIDER] Estado atualizado:', { usuario: usuarioData.nome, loading: false })
    // Forçar re-render
    router.refresh()
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    
    // Remover token dos cookies também
    if (typeof document !== 'undefined') {
      document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
      console.log('🍪 [AUTH PROVIDER] Token removido dos cookies')
    }
    
    setUsuario(null)
    router.push('/auth/login')
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

