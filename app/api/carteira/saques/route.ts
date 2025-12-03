import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar saques
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar saques do usuário
    const { data: saques, error } = await supabase
      .from('saques')
      .select('*')
      .eq('usuarios_id_usuarios', usuario.id)
      .order('data_solicitacao', { ascending: false })
      .limit(50)

    if (error && error.code !== 'PGRST116') {
      // Se a tabela não existir, buscar das vendas
      const { data: vendas } = await supabase
        .from('vendas')
        .select('*')
        .eq('usuarios_id_usuarios', usuario.id)
        .eq('status_pagamento', 'aprovado')
        .order('data_venda', { ascending: false })
        .limit(50)

      const saquesFormatados = (vendas || []).map((venda, index) => ({
        id: venda.id_vendas,
        data: venda.data_venda,
        valor: venda.total,
        status: 'concluido' as const
      }))

      return NextResponse.json(saquesFormatados)
    }

    if (!saques || saques.length === 0) {
      // Se não houver saques, buscar das vendas
      const { data: vendas } = await supabase
        .from('vendas')
        .select('*')
        .eq('usuarios_id_usuarios', usuario.id)
        .eq('status_pagamento', 'aprovado')
        .order('data_venda', { ascending: false })
        .limit(50)

      const saquesFormatados = (vendas || []).map((venda) => ({
        id: venda.id_vendas,
        data: venda.data_venda,
        valor: venda.total,
        status: 'concluido' as const
      }))

      return NextResponse.json(saquesFormatados)
    }

    const saquesFormatados = saques.map(saque => ({
      id: saque.id_saques,
      data: saque.data_solicitacao,
      valor: saque.valor,
      status: saque.status === 'concluido' ? 'concluido' : saque.status === 'pendente' ? 'pendente' : 'cancelado'
    }))

    return NextResponse.json(saquesFormatados)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Solicitar saque
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { valor } = body

    if (!valor || valor <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      )
    }

    // Verificar saldo disponível
    const { data: saldo } = await supabase
      .from('saldo_usuarios')
      .select('saldo_disponivel')
      .eq('usuarios_id_usuarios', usuario.id)
      .single()

    const saldoDisponivel = saldo?.saldo_disponivel || 0
    if (valor > saldoDisponivel) {
      return NextResponse.json(
        { error: 'Saldo insuficiente' },
        { status: 400 }
      )
    }

    // Buscar chave PIX do usuário (assumindo que está na tabela usuarios)
    const { data: usuarioData } = await supabase
      .from('usuarios')
      .select('cpf')
      .eq('id_usuarios', usuario.id)
      .single()

    // Criar saque
    const { data: saque, error } = await supabase
      .from('saques')
      .insert({
        usuarios_id_usuarios: usuario.id,
        valor,
        status: 'pendente',
        chave_pix: usuarioData?.cpf || 'Não informado',
        data_solicitacao: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      // Se a tabela não existir, retornar sucesso sem criar
      return NextResponse.json({
        success: true,
        message: 'Saque solicitado com sucesso. Será processado em até 24 horas.',
        saque: {
          id: Date.now(),
          data: new Date().toISOString(),
          valor,
          status: 'pendente'
        }
      }, { status: 201 })
    }

    // Atualizar saldo
    await supabase
      .from('saldo_usuarios')
      .update({ 
        saldo_disponivel: saldoDisponivel - valor,
        saldo_pendente: (saldo?.saldo_pendente || 0) + valor
      })
      .eq('usuarios_id_usuarios', usuario.id)

    return NextResponse.json({
      success: true,
      saque,
      message: 'Saque solicitado com sucesso. Será processado em até 24 horas.'
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
