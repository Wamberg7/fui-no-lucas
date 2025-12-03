import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar configurações
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar configurações da loja do usuário
    const { data: lojas, error } = await supabase
      .from('lojas')
      .select('*')
      .eq('usuarios_id_usuarios', usuario.id)
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Retornar configurações padrão se não houver loja
    const config = lojas || {
      nome_loja: '',
      descricao: '',
      modo_manutencao: false,
      login_cliente: true
    }

    // Buscar chave API principal do usuário (primeira chave ativa)
    const { data: chavePrincipal } = await supabase
      .from('chaves_api')
      .select('chave_api')
      .eq('usuarios_id_usuarios', usuario.id)
      .eq('ativa', true)
      .order('data_criacao', { ascending: true })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({
      nome_loja: config.nome_loja || '',
      descricao_loja: config.descricao || '',
      cnpj: '',
      modo_manutencao: false,
      login_cliente: true,
      email: '',
      telefone: '',
      endereco: '',
      gateway_pagamento: 'stripe',
      chave_api: config.chave_api || chavePrincipal?.chave_api || '',
      cor_principal: '#3b82f6',
      cor_secundaria: '#8b5cf6',
      layout: 'padrao',
      chat_online: true,
      avaliacoes: true,
      google_analytics: '',
      facebook_pixel: '',
      email_vendas: true,
      email_estoque: false,
      dominio_personalizado: '',
      ...config
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Salvar configurações
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      nome_loja,
      descricao_loja,
      modo_manutencao,
      login_cliente,
      email,
      telefone,
      endereco,
      gateway_pagamento,
      chave_api,
      cor_principal,
      cor_secundaria
    } = body

    // Buscar loja existente ou criar nova
    const { data: lojaExistente } = await supabase
      .from('lojas')
      .select('*')
      .limit(1)
      .single()

    const dadosLoja: any = {
      nome_loja: nome_loja || '',
      descricao: descricao_loja || '',
      status: modo_manutencao ? 'suspensa' : 'ativa',
    }

    // Adicionar chave_api se fornecida
    if (chave_api !== undefined) {
      dadosLoja.chave_api = chave_api
    }

    if (lojaExistente) {
      // Atualizar loja existente
      const { data, error } = await supabase
        .from('lojas')
        .update(dadosLoja)
        .eq('id_lojas', lojaExistente.id_lojas)
        .eq('usuarios_id_usuarios', usuario.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, data })
    } else {
      // Criar nova loja para o usuário
      const { data, error } = await supabase
        .from('lojas')
        .insert({
          ...dadosLoja,
          usuarios_id_usuarios: usuario.id,
          slug: `loja-${usuario.id}-${Date.now()}`
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, data })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

