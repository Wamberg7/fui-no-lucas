import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar todas as solicitações de carteira pendentes
export async function GET(request: NextRequest) {
  try {
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'pendente'

    const { data: solicitacoes, error } = await supabase
      .from('carteira_pendente')
      .select(`
        *,
        usuario:usuarios (
          id_usuarios,
          nome,
          email,
          telefone
        ),
        aprovador:usuarios!carteira_pendente_aprovado_por_fkey (
          id_usuarios,
          nome,
          email
        )
      `)
      .eq('status', status)
      .order('data_solicitacao', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(solicitacoes || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar nova solicitação de carteira
export async function POST(request: NextRequest) {
  try {
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { cpf, nome_completo, chave_pix } = body

    if (!cpf || !nome_completo || !chave_pix) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    // Verificar se já existe uma solicitação pendente para este usuário
    const { data: existente } = await supabase
      .from('carteira_pendente')
      .select('id_carteira_pendente')
      .eq('usuarios_id_usuarios', usuario.id)
      .eq('status', 'pendente')
      .maybeSingle()

    if (existente) {
      return NextResponse.json({ error: 'Você já possui uma solicitação pendente' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('carteira_pendente')
      .insert({
        usuarios_id_usuarios: usuario.id,
        cpf,
        nome_completo,
        chave_pix,
        status: 'pendente'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

