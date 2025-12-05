import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar gateways configurados para a loja do usuário
export async function GET(request: NextRequest) {
  try {
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar loja do usuário
    const { data: loja, error: lojaError } = await supabase
      .from('lojas')
      .select('id_lojas')
      .eq('usuarios_id_usuarios', usuario.id)
      .limit(1)
      .maybeSingle()

    if (lojaError || !loja) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Buscar gateways configurados
    const { data: gateways, error } = await supabase
      .from('gateways_carteira')
      .select('*')
      .eq('lojas_id_lojas', loja.id_lojas)
      .order('data_criacao', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(gateways || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar ou atualizar configuração de gateway
export async function POST(request: NextRequest) {
  try {
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { gateway_tipo, ativo, credenciais } = body

    if (!gateway_tipo) {
      return NextResponse.json({ error: 'Tipo de gateway é obrigatório' }, { status: 400 })
    }

    // Verificar se é gateway carteira - apenas super admin pode configurar
    if (gateway_tipo === 'carteira') {
      const { data: usuarioCompleto, error: errorUsuario } = await supabase
        .from('usuarios')
        .select('is_super_admin')
        .eq('id_usuarios', usuario.id)
        .single()

      if (errorUsuario || !usuarioCompleto?.is_super_admin) {
        return NextResponse.json(
          { error: 'Apenas super administradores podem configurar a Carteira' },
          { status: 403 }
        )
      }
    }

    // Buscar loja do usuário
    const { data: loja, error: lojaError } = await supabase
      .from('lojas')
      .select('id_lojas')
      .eq('usuarios_id_usuarios', usuario.id)
      .limit(1)
      .maybeSingle()

    if (lojaError || !loja) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Verificar se já existe configuração para este gateway
    const { data: gatewayExistente } = await supabase
      .from('gateways_carteira')
      .select('*')
      .eq('lojas_id_lojas', loja.id_lojas)
      .eq('gateway_tipo', gateway_tipo)
      .maybeSingle()

    const dadosGateway = {
      lojas_id_lojas: loja.id_lojas,
      gateway_tipo,
      ativo: ativo ?? false,
      configurado: credenciais ? true : false,
      credenciais: credenciais ? credenciais : null,
      data_configuracao: credenciais ? new Date().toISOString() : null,
      data_atualizacao: new Date().toISOString()
    }

    let resultado

    if (gatewayExistente) {
      // Atualizar gateway existente
      const { data, error } = await supabase
        .from('gateways_carteira')
        .update(dadosGateway)
        .eq('id_gateway_carteira', gatewayExistente.id_gateway_carteira)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      resultado = data
    } else {
      // Criar novo gateway
      const { data, error } = await supabase
        .from('gateways_carteira')
        .insert(dadosGateway)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      resultado = data
    }

    return NextResponse.json(resultado, { status: gatewayExistente ? 200 : 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar status ativo/inativo de um gateway
export async function PUT(request: NextRequest) {
  try {
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { gateway_tipo, ativo } = body

    if (!gateway_tipo || ativo === undefined) {
      return NextResponse.json({ error: 'Tipo de gateway e status são obrigatórios' }, { status: 400 })
    }

    // Buscar loja do usuário primeiro
    const { data: loja, error: lojaError } = await supabase
      .from('lojas')
      .select('id_lojas')
      .eq('usuarios_id_usuarios', usuario.id)
      .limit(1)
      .maybeSingle()

    if (lojaError || !loja) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Verificar se está tentando ATIVAR a carteira - apenas super admin pode
    // IMPORTANTE: Só verifica permissão se estiver ATIVANDO (ativo === true)
    // Desativar (ativo === false) é permitido para todos os donos de loja
    if (gateway_tipo === 'carteira' && ativo === true) {
      console.log('🔍 Verificando permissão para ativar carteira. Usuário ID:', usuario.id)
      const { data: usuarioCompleto, error: errorUsuario } = await supabase
        .from('usuarios')
        .select('is_super_admin')
        .eq('id_usuarios', usuario.id)
        .single()

      if (errorUsuario) {
        console.error('❌ Erro ao buscar usuário:', errorUsuario)
        return NextResponse.json(
          { error: 'Erro ao verificar permissões' },
          { status: 500 }
        )
      }

      if (!usuarioCompleto || !usuarioCompleto.is_super_admin) {
        console.log('❌ Usuário não é super admin. is_super_admin:', usuarioCompleto?.is_super_admin)
        return NextResponse.json(
          { error: 'Apenas super administradores podem ativar a Carteira. Você pode apenas desativar.' },
          { status: 403 }
        )
      }
      console.log('✅ Usuário é super admin, permitindo ativação')
    }
    
    // Se ativo === false, não verifica permissão - qualquer dono de loja pode desativar
    if (gateway_tipo === 'carteira' && ativo === false) {
      console.log('✅ Desativando carteira - permitido para todos os donos de loja')
    }

    // Se está ativando um gateway, desativar todos os outros da mesma loja
    // Isso é permitido para todos, pois é apenas desativação
    if (ativo) {
      // Primeiro desativar todos os outros gateways (incluindo carteira se necessário)
      const { error: desativarError } = await supabase
        .from('gateways_carteira')
        .update({ 
          ativo: false,
          data_atualizacao: new Date().toISOString()
        })
        .eq('lojas_id_lojas', loja.id_lojas)
        .neq('gateway_tipo', gateway_tipo)

      if (desativarError) {
        console.error('Erro ao desativar outros gateways:', desativarError)
        // Continuar mesmo se houver erro ao desativar outros
      }
    }

    // Atualizar status do gateway
    const { data, error } = await supabase
      .from('gateways_carteira')
      .update({ 
        ativo,
        data_atualizacao: new Date().toISOString()
      })
      .eq('lojas_id_lojas', loja.id_lojas)
      .eq('gateway_tipo', gateway_tipo)
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

