import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useRedirectSuperAdmin() {
  const router = useRouter()

  useEffect(() => {
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
              // Redirecionar para /admin se for super admin
              router.push('/admin')
            }
          }
        } catch (error) {
          console.error('Erro ao verificar super admin:', error)
        }
      }
    }
    
    checkAndRedirect()
  }, [router])
}

