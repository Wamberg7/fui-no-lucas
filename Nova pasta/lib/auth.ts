import { NextRequest } from 'next/server'
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-key-aqui-mude-em-producao'

export interface UsuarioAutenticado {
  id: number
  email: string
}

export function verificarToken(request: NextRequest): UsuarioAutenticado | null {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('token')?.value

    if (!token) {
      console.log('❌ [AUTH LIB] Token não fornecido')
      return null
    }

    console.log('🔍 [AUTH LIB] Verificando token JWT...')
    const decoded = jwt.verify(token, JWT_SECRET) as UsuarioAutenticado
    console.log('✅ [AUTH LIB] Token válido:', { id: decoded.id, email: decoded.email })
    return decoded
  } catch (error: any) {
    console.error('❌ [AUTH LIB] Erro ao verificar token:', error.message)
    return null
  }
}

export function getUsuarioFromClient(): UsuarioAutenticado | null {
  if (typeof window === 'undefined') return null
  
  try {
    const usuarioStr = localStorage.getItem('usuario')
    if (!usuarioStr) return null
    
    const usuario = JSON.parse(usuarioStr)
    return {
      id: usuario.id_usuarios,
      email: usuario.email
    }
  } catch (error) {
    return null
  }
}

