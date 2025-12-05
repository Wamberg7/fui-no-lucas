import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar todas as lojas com estatísticas
export async function GET(request: NextRequest) {
  try {
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é super admin
    const { data: usuarioCompleto } = await supabase
      .from('usuarios')
      .select('is_super_admin')
      .eq('id_usuarios', usuario.id)
      .single()

    if (!usuarioCompleto?.is_super_admin) {
      return NextResponse.json({ error: 'Acesso negado. Apenas super administradores podem acessar.' }, { status: 403 })
    }

    // Buscar todas as lojas
    const { data: lojas, error: lojasError } = await supabase
      .from('lojas')
      .select(`
        *,
        usuario:usuarios (
          id_usuarios,
          nome,
          email,
          telefone,
          cpf
        )
      `)
      .order('data_criacao', { ascending: false })

    if (lojasError) {
      return NextResponse.json({ error: lojasError.message }, { status: 400 })
    }

    // Buscar estatísticas de vendas para cada loja
    const lojasComEstatisticas = await Promise.all(
      (lojas || []).map(async (loja) => {
        const { data: vendas } = await supabase
          .from('vendas')
          .select('id_vendas, total, status_pagamento, data_venda')
          .eq('usuarios_id_usuarios', loja.usuarios_id_usuarios)

        const totalVendas = vendas?.length || 0
        const vendasAprovadas = vendas?.filter(v => v.status_pagamento === 'aprovado') || []
        const receitaTotal = vendasAprovadas.reduce((acc, v) => acc + (v.total || 0), 0)

        return {
          ...loja,
          total_vendas: totalVendas,
          receita_total: receitaTotal,
          vendas_aprovadas: vendasAprovadas.length
        }
      })
    )

    return NextResponse.json(lojasComEstatisticas)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

