import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar pagamentos/vendas com filtros
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const statusPagamento = searchParams.get('status_pagamento')
    const metodoPagamento = searchParams.get('metodo_pagamento')
    const limit = searchParams.get('limit')

    let query = supabase
      .from('vendas')
      .select(`
        *,
        usuario:usuarios (id_usuarios, nome, email)
      `)
      .eq('usuarios_id_usuarios', usuario.id)
      .order('data_venda', { ascending: false })

    if (statusPagamento) {
      query = query.eq('status_pagamento', statusPagamento)
    }

    if (metodoPagamento) {
      query = query.eq('metodo_pagamento', metodoPagamento)
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

// POST - Criar pagamento/venda
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
      itens,
      metodo_pagamento = 'pix',
      observacoes,
      dados_pagamento
    } = body

    const usuarios_id_usuarios = usuario.id

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { error: 'Itens são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar método de pagamento
    const metodosValidos = ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto', 'transferencia', 'carteira']
    if (!metodosValidos.includes(metodo_pagamento)) {
      return NextResponse.json(
        { error: 'Método de pagamento inválido' },
        { status: 400 }
      )
    }

    // Calcular total e validar estoque
    let total = 0
    const produtosParaAtualizar: Array<{ id: number, quantidade: number }> = []

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
      produtosParaAtualizar.push({
        id: item.produtos_id_produtos,
        quantidade: item.quantidade
      })
    }

    // Buscar loja do usuário para verificar gateway configurado
    const { data: loja } = await supabase
      .from('lojas')
      .select('id_lojas')
      .eq('usuarios_id_usuarios', usuario.id)
      .limit(1)
      .maybeSingle()

    // Gerar ID de transação único
    const id_transacao = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Processar pagamento com gateway configurado (se disponível)
    let link_pagamento = null
    let gateway_usado = null
    let qr_code = null

    if (loja && (metodo_pagamento === 'pix' || metodo_pagamento === 'carteira')) {
      try {
        const { processPaymentWithGateway } = await import('@/lib/gateways/helper')
        const paymentResult = await processPaymentWithGateway(loja.id_lojas, {
          amount: total,
          description: `Pagamento de venda #${id_transacao}`,
          customer: {
            name: usuario.nome,
            email: usuario.email
          },
          metadata: {
            venda_id: id_transacao,
            usuario_id: usuario.id
          }
        })

        if (paymentResult.success) {
          link_pagamento = paymentResult.payment_link || null
          qr_code = paymentResult.qr_code || null
          gateway_usado = 'gateway_configurado'
        }
      } catch (error) {
        console.error('Erro ao processar pagamento com gateway:', error)
        // Continuar com processamento padrão se houver erro
      }
    }

    // Fallback para processamento padrão se gateway não estiver configurado
    if (!link_pagamento && metodo_pagamento === 'pix') {
      link_pagamento = `https://api.pagamento.com/pix/${id_transacao}`
    } else if (!link_pagamento && metodo_pagamento === 'boleto') {
      link_pagamento = `https://api.pagamento.com/boleto/${id_transacao}`
    }

    // Criar venda com informações de pagamento
    const dadosVenda: any = {
      usuarios_id_usuarios,
      total,
      status: 'pendente',
      status_pagamento: 'pendente',
      metodo_pagamento,
      id_transacao,
      link_pagamento,
      observacoes: observacoes || null,
      dados_pagamento: dados_pagamento || null
    }

    // Adicionar informações do gateway se disponível
    if (gateway_usado) {
      dadosVenda.gateway_pagamento = gateway_usado
      if (qr_code) {
        dadosVenda.dados_pagamento = {
          ...(dados_pagamento || {}),
          qr_code
        }
      }
    }

    const { data: venda, error: vendaError } = await supabase
      .from('vendas')
      .insert(dadosVenda)
      .select()
      .single()

    if (vendaError) {
      return NextResponse.json({ error: vendaError.message }, { status: 400 })
    }

    // Criar itens de venda
    for (const item of itens) {
      const { data: produto } = await supabase
        .from('produtos')
        .select('preco')
        .eq('id_produtos', item.produtos_id_produtos)
        .single()

      await supabase.from('itens_venda').insert({
        vendas_id_vendas: venda.id_vendas,
        produtos_id_produtos: item.produtos_id_produtos,
        quantidade: item.quantidade,
        preco_unitario: produto!.preco,
        subtotal: produto!.preco * item.quantidade
      })
    }

    // Retornar dados da venda com link de pagamento
    return NextResponse.json({
      ...venda,
      link_pagamento,
      qr_code: qr_code || null,
      gateway_usado: gateway_usado || null,
      mensagem: 'Pagamento criado com sucesso. Use o link_pagamento ou qr_code para processar o pagamento.'
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

