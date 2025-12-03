import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar chave API completa (apenas para o dono)
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
      .from('chaves_api')
      .select('id_chave_api, chave_api, nome_chave, ativa, ultimo_uso, data_criacao')
      .eq('id_chave_api', params.id)
      .eq('usuarios_id_usuarios', usuario.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Chave não encontrada' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar chave API (ativar/desativar, renomear)
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
    const { nome_chave, ativa } = body

    const atualizacoes: any = {}
    if (nome_chave !== undefined) atualizacoes.nome_chave = nome_chave
    if (ativa !== undefined) atualizacoes.ativa = ativa

    const { data, error } = await supabase
      .from('chaves_api')
      .update(atualizacoes)
      .eq('id_chave_api', params.id)
      .eq('usuarios_id_usuarios', usuario.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Deletar chave API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { error } = await supabase
      .from('chaves_api')
      .delete()
      .eq('id_chave_api', params.id)
      .eq('usuarios_id_usuarios', usuario.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Chave API deletada com sucesso' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

