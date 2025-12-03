import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar venda por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('vendas')
      .select(`
        *,
        usuario:usuarios (id_usuarios, nome, email, telefone),
        itens:itens_venda (
          *,
          produto:produtos (*)
        )
      `)
      .eq('id_vendas', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ venda: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar venda (status, pagamento, etc)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, status_pagamento, observacoes } = body

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (status_pagamento !== undefined) updateData.status_pagamento = status_pagamento
    if (observacoes !== undefined) updateData.observacoes = observacoes

    const { data, error } = await supabase
      .from('vendas')
      .update(updateData)
      .eq('id_vendas', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ venda: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

