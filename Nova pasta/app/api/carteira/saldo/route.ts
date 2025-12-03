import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar saldo do usuário
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const usuarioId = searchParams.get('usuario_id') || usuario.id.toString()

    // Verificar se o usuário está buscando seu próprio saldo
    if (parseInt(usuarioId) !== usuario.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    // Buscar saldo do usuário
    const { data: saldo, error } = await supabase
      .from('saldo_usuarios')
      .select('*')
      .eq('usuarios_id_usuarios', parseInt(usuarioId))
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Sempre calcular a partir das vendas para garantir dados corretos
    const { data: vendas } = await supabase
      .from('vendas')
      .select('total, status_pagamento')
      .eq('usuarios_id_usuarios', parseInt(usuarioId))
      .eq('status_pagamento', 'aprovado')

    const totalAprovado = vendas?.reduce((acc, v) => acc + (v.total || 0), 0) || 0

    // Se houver saldo na tabela, usar ele (mas validar)
    if (saldo) {
      // Garantir que o saldo não seja maior que o total de vendas aprovadas
      const saldoTotal = Math.min(saldo.saldo_total || 0, totalAprovado)
      const saldoDisponivel = Math.min(saldo.saldo_disponivel || 0, totalAprovado)
      
      return NextResponse.json({
        saldo_total: saldoTotal,
        saldo_disponivel: saldoDisponivel,
        saldo_pendente: saldo.saldo_pendente || 0
      })
    }

    // Se não houver saldo na tabela, retornar baseado nas vendas
    return NextResponse.json({
      saldo_total: totalAprovado,
      saldo_disponivel: totalAprovado,
      saldo_pendente: 0
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
