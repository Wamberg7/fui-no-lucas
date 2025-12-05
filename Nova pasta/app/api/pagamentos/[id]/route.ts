import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar pagamento por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const { data, error } = await supabase
      .from('vendas')
      .select(`
        *,
        usuario:usuarios (id_usuarios, nome, email),
        itens:itens_venda (
          *,
          produto:produtos (*)
        )
      `)
      .eq('id_vendas', params.id)
      .eq('usuarios_id_usuarios', usuario.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar status do pagamento
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { status_pagamento, dados_pagamento } = body

    // Validar status
    const statusValidos = ['pendente', 'processando', 'aprovado', 'rejeitado', 'cancelado', 'reembolsado']
    if (status_pagamento && !statusValidos.includes(status_pagamento)) {
      return NextResponse.json(
        { error: 'Status de pagamento inválido' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    if (status_pagamento) {
      updateData.status_pagamento = status_pagamento
      
      // Se o pagamento foi aprovado, atualizar status da venda e data de pagamento
      if (status_pagamento === 'aprovado') {
        updateData.status = 'concluida'
        updateData.data_pagamento = new Date().toISOString()
        
        // Buscar dados completos da venda
        const { data: venda } = await supabase
          .from('vendas')
          .select(`
            *,
            itens:itens_venda (
              produtos_id_produtos,
              quantidade
            )
          `)
          .eq('id_vendas', params.id)
          .eq('usuarios_id_usuarios', usuario.id)
          .single()

        if (venda) {
          // Atualizar estoque dos produtos
          if (venda.itens) {
            for (const item of venda.itens) {
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

          // Se o método de pagamento for "carteira", aplicar comissão
          if (venda.metodo_pagamento === 'carteira') {
            // Calcular comissão: R$ 0,50 + 3% do valor da venda
            const taxaFixa = 0.50
            const taxaPercentual = 3.00
            const valorComissao = taxaFixa + (venda.total * taxaPercentual / 100)

            // Buscar a loja do usuário
            const { data: loja } = await supabase
              .from('lojas')
              .select('id_lojas')
              .eq('usuarios_id_usuarios', usuario.id)
              .limit(1)
              .maybeSingle()

            if (loja) {
              // Registrar comissão
              await supabase
                .from('comissoes')
                .insert({
                  vendas_id_vendas: venda.id_vendas,
                  lojas_id_lojas: loja.id_lojas,
                  usuarios_id_usuarios: usuario.id,
                  valor_venda: venda.total,
                  taxa_fixa: taxaFixa,
                  taxa_percentual: taxaPercentual,
                  valor_comissao: valorComissao,
                  metodo_pagamento: 'carteira',
                  data_venda: venda.data_venda || new Date().toISOString()
                })
            }
          }
        }
      }
      
      // Se o pagamento foi rejeitado ou cancelado, atualizar status da venda
      if (status_pagamento === 'rejeitado' || status_pagamento === 'cancelado') {
        updateData.status = 'cancelada'
      }
    }

    if (dados_pagamento) {
      updateData.dados_pagamento = dados_pagamento
    }

    const { data, error } = await supabase
      .from('vendas')
      .update(updateData)
      .eq('id_vendas', params.id)
      .eq('usuarios_id_usuarios', usuario.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

