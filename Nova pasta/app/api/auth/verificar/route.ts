import { NextRequest, NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'

// GET - Verificar se token é válido
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [VERIFICAR API] Verificando token...')
    const usuario = verificarToken(request)

    if (!usuario) {
      console.log('❌ [VERIFICAR API] Token inválido ou não fornecido')
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    console.log('✅ [VERIFICAR API] Token válido:', { id: usuario.id, email: usuario.email })
    return NextResponse.json({ 
      valid: true, 
      usuario 
    })
  } catch (error: any) {
    console.error('💥 [VERIFICAR API] Erro:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

