'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  ShoppingCart, 
  CreditCard,
  Settings,
  Wallet,
  Shield
} from 'lucide-react'

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/produtos', label: 'Produtos', icon: Package },
  { href: '/categorias', label: 'Categorias', icon: Tag },
  { href: '/vendas', label: 'Vendas', icon: ShoppingCart },
  { href: '/pagamentos', label: 'Pagamentos', icon: CreditCard },
  { href: '/carteira', label: 'Carteira', icon: Wallet },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Verificar se é super admin
    const checkSuperAdmin = async () => {
      const token = localStorage.getItem('token')
      const isSuperAdminLocal = localStorage.getItem('isSuperAdmin')
      
      // Verificação rápida do localStorage
      if (!token || isSuperAdminLocal !== 'true') {
        setIsSuperAdmin(false)
        return
      }

      // Verificar no servidor para garantir
      try {
        const response = await fetch('/api/admin/verificar-admin', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setIsSuperAdmin(data.is_super_admin || false)
          
          // Sincronizar localStorage
          if (data.is_super_admin) {
            localStorage.setItem('isSuperAdmin', 'true')
          } else {
            localStorage.removeItem('isSuperAdmin')
          }
        } else {
          setIsSuperAdmin(false)
          localStorage.removeItem('isSuperAdmin')
        }
      } catch (error) {
        console.error('Erro ao verificar super admin:', error)
        setIsSuperAdmin(false)
      }
    }
    
    checkSuperAdmin()
    // Verificar periodicamente (caso o login seja feito em outra aba)
    const interval = setInterval(checkSuperAdmin, 5000) // A cada 5 segundos
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return null
  }

  // Se for super admin, mostrar apenas o link Admin
  // Se não for super admin, mostrar os itens normais
  const menuItemsParaExibir = isSuperAdmin 
    ? [{ href: '/admin', label: 'Admin', icon: Shield }]
    : menuItems

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl z-50 hidden lg:block">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {isSuperAdmin ? 'Admin Dashboard' : 'Dashboard Pro'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {isSuperAdmin ? 'Painel Administrativo' : 'Sistema de Gestão'}
          </p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItemsParaExibir.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href === '/admin' && pathname?.startsWith('/admin'))
            const isAdminItem = item.href === '/admin'
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? isAdminItem
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
                {isAdminItem && (
                  <span className="ml-auto px-2 py-0.5 text-xs bg-red-500/20 text-red-300 rounded">
                    Super
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Dashboard Pro v1.0
          </p>
        </div>
      </div>
    </aside>
  )
}

