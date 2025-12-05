import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verificarToken } from '@/lib/auth'

// GET - Buscar configuração de webhook Discord do usuário
export async function GET(request: NextRequest) {
  try {
    const usuario = verificarToken(request)

    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar loja do usuário
    const { data: loja, error: erroLoja } = await supabase
      .from('lojas')
      .select('id_lojas')
      .eq('usuarios_id_usuarios', usuario.id)
      .limit(1)
      .maybeSingle()

    if (erroLoja) {
      console.error('Erro ao buscar loja:', erroLoja)
      return NextResponse.json(
        { error: 'Erro ao buscar loja' },
        { status: 500 }
      )
    }

    // Buscar webhook do usuário
    const { data: webhook, error } = await supabase
      .from('webhooks_discord')
      .select('*')
      .eq('usuarios_id_usuarios', usuario.id)
      .eq('ativo', true)
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar webhook:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar webhook' },
        { status: 500 }
      )
    }

    return NextResponse.json(webhook || null)
  } catch (error: any) {
    console.error('Erro na API de buscar webhook Discord:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar ou atualizar configuração de webhook Discord
export async function POST(request: NextRequest) {
  try {
    const usuario = verificarToken(request)

    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      webhook_url,
      nome_webhook,
      notificar_vendas_publico,
      notificar_vendas_admin,
      notificar_estoque_baixo,
      notificar_saque_afiliado
    } = body

    if (!webhook_url || !webhook_url.trim()) {
      return NextResponse.json(
        { error: 'URL do webhook é obrigatória' },
        { status: 400 }
      )
    }

    // Validar URL do webhook
    if (!webhook_url.startsWith('https://discord.com/api/webhooks/') && 
        !webhook_url.startsWith('https://discordapp.com/api/webhooks/')) {
      return NextResponse.json(
        { error: 'URL do webhook inválida. Deve ser uma URL do Discord.' },
        { status: 400 }
      )
    }

    // Buscar loja do usuário
    const { data: loja, error: erroLoja } = await supabase
      .from('lojas')
      .select('id_lojas')
      .eq('usuarios_id_usuarios', usuario.id)
      .limit(1)
      .maybeSingle()

    if (erroLoja) {
      console.error('Erro ao buscar loja:', erroLoja)
      return NextResponse.json(
        { error: 'Erro ao buscar loja' },
        { status: 500 }
      )
    }

    // Verificar se já existe webhook para este usuário
    const { data: webhookExistente, error: erroBusca } = await supabase
      .from('webhooks_discord')
      .select('id_webhook_discord')
      .eq('usuarios_id_usuarios', usuario.id)
      .maybeSingle()

    const dadosWebhook = {
      usuarios_id_usuarios: usuario.id,
      lojas_id_lojas: loja?.id_lojas || null,
      webhook_url: webhook_url.trim(),
      nome_webhook: nome_webhook?.trim() || null,
      notificar_vendas_publico: notificar_vendas_publico || false,
      notificar_vendas_admin: notificar_vendas_admin || false,
      notificar_estoque_baixo: notificar_estoque_baixo || false,
      notificar_saque_afiliado: notificar_saque_afiliado || false,
      ativo: true,
      data_atualizacao: new Date().toISOString()
    }

    let webhook

    if (webhookExistente) {
      // Atualizar webhook existente
      const { data, error: erroUpdate } = await supabase
        .from('webhooks_discord')
        .update(dadosWebhook)
        .eq('id_webhook_discord', webhookExistente.id_webhook_discord)
        .select()
        .single()

      if (erroUpdate) {
        console.error('Erro ao atualizar webhook:', erroUpdate)
        return NextResponse.json(
          { error: 'Erro ao atualizar webhook' },
          { status: 500 }
        )
      }

      webhook = data
    } else {
      // Criar novo webhook
      const { data, error: erroInsert } = await supabase
        .from('webhooks_discord')
        .insert(dadosWebhook)
        .select()
        .single()

      if (erroInsert) {
        console.error('Erro ao criar webhook:', erroInsert)
        return NextResponse.json(
          { error: 'Erro ao criar webhook' },
          { status: 500 }
        )
      }

      webhook = data
    }

    return NextResponse.json({
      success: true,
      webhook
    })
  } catch (error: any) {
    console.error('Erro na API de salvar webhook Discord:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

