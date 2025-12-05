import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar gateway padrão global
export async function GET(request: NextRequest) {
  try {
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é super admin
    const { data: usuarioCompleto, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('is_super_admin')
      .eq('id_usuarios', usuario.id)
      .single()

    if (errorUsuario || !usuarioCompleto?.is_super_admin) {
      return NextResponse.json(
        { error: 'Apenas super administradores podem acessar esta configuração' },
        { status: 403 }
      )
    }

    // Buscar gateway padrão global (usando uma loja especial ou tabela de configurações)
    // Por enquanto, vamos usar a primeira loja como referência
    const { data: lojas } = await supabase
      .from('lojas')
      .select('id_lojas')
      .limit(1)

    if (lojas && lojas.length > 0) {
      // Buscar gateway padrão na primeira loja (ou criar uma configuração global)
      const { data: gatewayPadrao } = await supabase
        .from('gateways_carteira')
        .select('gateway_tipo, ativo')
        .eq('lojas_id_lojas', lojas[0].id_lojas)
        .eq('ativo', true)
        .order('data_configuracao', { ascending: false })
        .limit(1)
        .maybeSingle()

      return NextResponse.json({
        gateway_padrao: gatewayPadrao?.gateway_tipo || 'carteira'
      })
    }

    return NextResponse.json({
      gateway_padrao: 'carteira'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Definir gateway padrão global
export async function POST(request: NextRequest) {
  try {
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é super admin
    const { data: usuarioCompleto, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('is_super_admin')
      .eq('id_usuarios', usuario.id)
      .single()

    if (errorUsuario || !usuarioCompleto?.is_super_admin) {
      return NextResponse.json(
        { error: 'Apenas super administradores podem definir o gateway padrão' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { gateway_padrao } = body

    if (!gateway_padrao) {
      return NextResponse.json({ error: 'Gateway padrão é obrigatório' }, { status: 400 })
    }

    // Buscar todas as lojas
    const { data: lojas } = await supabase
      .from('lojas')
      .select('id_lojas')

    if (!lojas || lojas.length === 0) {
      return NextResponse.json({ error: 'Nenhuma loja encontrada' }, { status: 404 })
    }

    // Para cada loja que não tiver gateway configurado, criar/atualizar o gateway padrão
    for (const loja of lojas) {
      // Verificar se já existe gateway para esta loja
      const { data: gatewayExistente } = await supabase
        .from('gateways_carteira')
        .select('*')
        .eq('lojas_id_lojas', loja.id_lojas)
        .eq('gateway_tipo', gateway_padrao)
        .maybeSingle()

      if (!gatewayExistente) {
        // Criar gateway padrão para esta loja
        await supabase
          .from('gateways_carteira')
          .insert({
            lojas_id_lojas: loja.id_lojas,
            gateway_tipo: gateway_padrao,
            ativo: true,
            configurado: false,
            data_configuracao: new Date().toISOString(),
            data_atualizacao: new Date().toISOString()
          })
      } else {
        // Atualizar gateway existente para ser o padrão
        await supabase
          .from('gateways_carteira')
          .update({
            ativo: true,
            data_atualizacao: new Date().toISOString()
          })
          .eq('id_gateway_carteira', gatewayExistente.id_gateway_carteira)
      }
    }

    return NextResponse.json({
      success: true,
      gateway_padrao,
      message: 'Gateway padrão definido com sucesso para todas as lojas'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

