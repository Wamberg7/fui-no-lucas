import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar solicitações do próprio usuário
export async function GET(request: NextRequest) {
  try {
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    let query = supabase
      .from('carteira_pendente')
      .select('*')
      .eq('usuarios_id_usuarios', usuario.id)

    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('data_solicitacao', { ascending: false })

    const { data: solicitacoes, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(solicitacoes || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

