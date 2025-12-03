'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { usuario, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('🔄 [DASHBOARD LAYOUT] Estado:', { 
      loading, 
      hasUsuario: !!usuario, 
      usuarioNome: usuario?.nome,
      pathname: window.location.pathname
    })
    
    // Verificar localStorage diretamente também
    const token = localStorage.getItem('token')
    const usuarioStr = localStorage.getItem('usuario')
    console.log('🔍 [DASHBOARD LAYOUT] localStorage:', {
      hasToken: !!token,
      hasUsuario: !!usuarioStr
    })
    
    // Aguardar um pouco para o AuthProvider processar
    const timer = setTimeout(() => {
      if (!loading && !usuario) {
        // Verificar localStorage uma última vez antes de redirecionar
        const tokenCheck = localStorage.getItem('token')
        const usuarioCheck = localStorage.getItem('usuario')
        
        if (tokenCheck && usuarioCheck) {
          console.log('⚠️ [DASHBOARD LAYOUT] Token existe mas AuthProvider não carregou, aguardando mais...')
          // Aguardar mais um pouco
          setTimeout(() => {
            if (!usuario) {
              console.log('❌ [DASHBOARD LAYOUT] Ainda sem usuário após espera, redirecionando para login')
              router.push('/auth/login')
            }
          }, 1000)
        } else {
          console.log('❌ [DASHBOARD LAYOUT] Sem usuário e sem token, redirecionando para login')
          router.push('/auth/login')
        }
      } else if (usuario) {
        console.log('✅ [DASHBOARD LAYOUT] Usuário autenticado, exibindo dashboard')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [usuario, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <TopBar />
        <main className="flex-1 overflow-y-auto pt-16 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}

