import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST - Webhook para receber notificações de pagamento
// Este endpoint pode ser usado para integrar com gateways de pagamento (Stripe, Mercado Pago, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id_transacao, status_pagamento, dados_pagamento } = body

    if (!id_transacao) {
      return NextResponse.json(
        { error: 'id_transacao é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar venda pelo ID da transação
    const { data: venda, error: vendaError } = await supabase
      .from('vendas')
      .select('*')
      .eq('id_transacao', id_transacao)
      .single()

    if (vendaError || !venda) {
      return NextResponse.json(
        { error: 'Venda não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar status do pagamento
    const updateData: any = {}
    
    if (status_pagamento) {
      updateData.status_pagamento = status_pagamento
      
      if (status_pagamento === 'aprovado') {
        updateData.status = 'concluida'
        updateData.data_pagamento = new Date().toISOString()
        
        // Atualizar estoque
        const { data: itens } = await supabase
          .from('itens_venda')
          .select('produtos_id_produtos, quantidade')
          .eq('vendas_id_vendas', venda.id_vendas)

        if (itens) {
          for (const item of itens) {
            const { data: produto } = await supabase
              .from('produtos')
              .select('estoque')
              .eq('id_produtos', item.produtos_id_produtos)
              .single()

            if (produto) {
              const novoEstoque = produto.estoque - item.quantidade
              await supabase
                .from('produtos')
                .update({ estoque: novoEstoque })
                .eq('id_produtos', item.produtos_id_produtos)
            }
          }
        }
      }
    }

    if (dados_pagamento) {
      updateData.dados_pagamento = dados_pagamento
    }

    const { data: vendaAtualizada, error: updateError } = await supabase
      .from('vendas')
      .update(updateData)
      .eq('id_vendas', venda.id_vendas)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      venda: vendaAtualizada
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

