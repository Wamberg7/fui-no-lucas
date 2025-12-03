import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar vendas
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')
    const dataInicio = searchParams.get('data_inicio')
    const dataFim = searchParams.get('data_fim')

    let query = supabase
      .from('vendas')
      .select(`
        *,
        usuario:usuarios (id_usuarios, nome, email)
      `)
      .eq('usuarios_id_usuarios', usuario.id)
      .order('data_venda', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (dataInicio) {
      query = query.gte('data_venda', dataInicio)
    }

    if (dataFim) {
      query = query.lte('data_venda', dataFim)
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

// POST - Criar venda
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { itens, observacoes } = body
    const usuarios_id_usuarios = usuario.id

    if (!usuarios_id_usuarios || !itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { error: 'Usuário e itens são obrigatórios' },
        { status: 400 }
      )
    }

    // Calcular total
    let total = 0
    for (const item of itens) {
      const { data: produto } = await supabase
        .from('produtos')
        .select('preco, estoque')
        .eq('id_produtos', item.produtos_id_produtos)
        .single()

      if (!produto) {
        return NextResponse.json(
          { error: `Produto ${item.produtos_id_produtos} não encontrado` },
          { status: 400 }
        )
      }

      if (produto.estoque < item.quantidade) {
        return NextResponse.json(
          { error: `Estoque insuficiente para o produto ${item.produtos_id_produtos}` },
          { status: 400 }
        )
      }

      total += produto.preco * item.quantidade
    }

    // Criar venda
    const { data: venda, error: vendaError } = await supabase
      .from('vendas')
      .insert({
        usuarios_id_usuarios,
        total,
        status: 'concluida',
        observacoes: observacoes || null
      })
      .select()
      .single()

    if (vendaError) {
      return NextResponse.json({ error: vendaError.message }, { status: 400 })
    }

      // Criar itens de venda e atualizar estoque
      for (const item of itens) {
        const { data: produto } = await supabase
          .from('produtos')
          .select('preco, estoque')
          .eq('id_produtos', item.produtos_id_produtos)
          .single()

        await supabase.from('itens_venda').insert({
          vendas_id_vendas: venda.id_vendas,
          produtos_id_produtos: item.produtos_id_produtos,
          quantidade: item.quantidade,
          preco_unitario: produto!.preco,
          subtotal: produto!.preco * item.quantidade
        })

        // Atualizar estoque
        const novoEstoque = produto!.estoque - item.quantidade
        await supabase
          .from('produtos')
          .update({ estoque: novoEstoque })
          .eq('id_produtos', item.produtos_id_produtos)
      }

    // Buscar venda completa
    const { data: vendaCompleta } = await supabase
      .from('vendas')
      .select(`
        *,
        usuario:usuarios (id_usuarios, nome, email),
        itens:itens_venda (
          *,
          produto:produtos (*)
        )
      `)
      .eq('id_vendas', venda.id_vendas)
      .single()

    return NextResponse.json(vendaCompleta, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
