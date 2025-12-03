import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PUT - Aprovar ou rejeitar solicitação de carteira
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { status, observacoes } = body

    if (!status || !['aprovado', 'rejeitado'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    const atualizacao: any = {
      status,
      aprovado_por: usuario.id,
      data_aprovacao: new Date().toISOString()
    }

    if (observacoes) {
      atualizacao.observacoes = observacoes
    }

    const { data, error } = await supabase
      .from('carteira_pendente')
      .update(atualizacao)
      .eq('id_carteira_pendente', params.id)
      .select(`
        *,
        usuario:usuarios (
          id_usuarios,
          nome,
          email
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Buscar uma solicitação específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('carteira_pendente')
      .select(`
        *,
        usuario:usuarios (
          id_usuarios,
          nome,
          email,
          telefone,
          cpf
        ),
        aprovador:usuarios!carteira_pendente_aprovado_por_fkey (
          id_usuarios,
          nome,
          email
        )
      `)
      .eq('id_carteira_pendente', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

