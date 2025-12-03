import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar produtos
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const categoriaId = searchParams.get('categoria')
    const destaque = searchParams.get('destaque')
    const disponivel = searchParams.get('disponivel')
    const limit = searchParams.get('limit')

    let query = supabase
      .from('produtos')
      .select(`
        *,
        categoria:categorias (*)
      `)
      .eq('usuarios_id_usuarios', usuario.id)
      .order('data_cadastro', { ascending: false })

    if (categoriaId) {
      query = query.eq('categorias_id_categorias', categoriaId)
    }

    if (destaque === 'true') {
      query = query.eq('destaque', true)
    }

    if (disponivel === 'true') {
      query = query.eq('disponivel_venda', true).gt('estoque', 0)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar produto
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      nome_produto,
      descricao,
      imagem_produto,
      categorias_id_categorias,
      preco,
      estoque,
      disponivel_venda,
      tipo_produto,
      envio_automatico,
      destaque
    } = body

    // Validação
    if (!nome_produto || !categorias_id_categorias) {
      return NextResponse.json(
        { error: 'Nome do produto e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('produtos')
      .insert({
        nome_produto,
        descricao: descricao || null,
        imagem_produto: imagem_produto || null,
        categorias_id_categorias,
        preco: preco || 0,
        estoque: estoque || 0,
        disponivel_venda: disponivel_venda || false,
        tipo_produto: tipo_produto || 'digital',
        envio_automatico: envio_automatico !== undefined ? envio_automatico : true,
        destaque: destaque || false,
        usuarios_id_usuarios: usuario.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
