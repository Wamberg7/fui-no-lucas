import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PUT - Aprovar ou rejeitar solicitação de carteira
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const { status, observacoes } = body

    if (!status || !['aprovado', 'rejeitado'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    const atualizacao: any = {
      status,
      aprovado_por: usuario.id,
      data_aprovacao: new Date().toISOString()
    }

    if (observacoes) {
      atualizacao.observacoes = observacoes
    }

    // Buscar a solicitação antes de atualizar
    const { data: solicitacaoAntes } = await supabase
      .from('carteira_pendente')
      .select('usuarios_id_usuarios, cpf, nome_completo, chave_pix')
      .eq('id_carteira_pendente', params.id)
      .single()

    if (!solicitacaoAntes) {
      return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 })
    }

    // Atualizar sem fazer join primeiro
    const { error: updateError } = await supabase
      .from('carteira_pendente')
      .update(atualizacao)
      .eq('id_carteira_pendente', params.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // Buscar os dados atualizados separadamente
    const { data: solicitacaoAtualizada } = await supabase
      .from('carteira_pendente')
      .select('*')
      .eq('id_carteira_pendente', params.id)
      .single()

    if (!solicitacaoAtualizada) {
      return NextResponse.json({ error: 'Erro ao buscar solicitação atualizada' }, { status: 500 })
    }

    // Buscar dados do usuário separadamente
    const { data: dadosUsuario } = await supabase
      .from('usuarios')
      .select('id_usuarios, nome, email')
      .eq('id_usuarios', solicitacaoAtualizada.usuarios_id_usuarios)
      .single()

    const data = {
      ...solicitacaoAtualizada,
      usuario: dadosUsuario || null
    }

    // Se foi aprovado, criar/atualizar configuração do gateway carteira para o usuário
    if (status === 'aprovado') {
      // Buscar loja do usuário
      const { data: loja } = await supabase
        .from('lojas')
        .select('id_lojas')
        .eq('usuarios_id_usuarios', solicitacaoAntes.usuarios_id_usuarios)
        .limit(1)
        .maybeSingle()

      if (loja) {
        // Verificar se já existe gateway carteira para esta loja
        const { data: gatewayExistente } = await supabase
          .from('gateways_carteira')
          .select('id_gateway_carteira')
          .eq('lojas_id_lojas', loja.id_lojas)
          .eq('gateway_tipo', 'carteira')
          .maybeSingle()

        const credenciais = {
          cpf: solicitacaoAntes.cpf,
          nome_completo: solicitacaoAntes.nome_completo,
          chave_pix: solicitacaoAntes.chave_pix
        }

        if (gatewayExistente) {
          // Atualizar gateway existente
          await supabase
            .from('gateways_carteira')
            .update({
              credenciais,
              configurado: true,
              ativo: true,
              data_atualizacao: new Date().toISOString()
            })
            .eq('id_gateway_carteira', gatewayExistente.id_gateway_carteira)
        } else {
          // Criar novo gateway
          const { error: insertError } = await supabase
            .from('gateways_carteira')
            .insert({
              lojas_id_lojas: loja.id_lojas,
              gateway_tipo: 'carteira',
              credenciais,
              configurado: true,
              ativo: true
            })
          
          if (insertError) {
            console.error('Erro ao criar gateway carteira:', insertError)
          }
        }
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Buscar uma solicitação específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Buscar a solicitação
    const { data: solicitacao, error: solicitacaoError } = await supabase
      .from('carteira_pendente')
      .select('*')
      .eq('id_carteira_pendente', params.id)
      .single()

    if (solicitacaoError) {
      return NextResponse.json({ error: solicitacaoError.message }, { status: 400 })
    }

    if (!solicitacao) {
      return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 })
    }

    // Buscar dados do usuário separadamente
    const { data: dadosUsuario } = await supabase
      .from('usuarios')
      .select('id_usuarios, nome, email, telefone, cpf')
      .eq('id_usuarios', solicitacao.usuarios_id_usuarios)
      .single()

    // Buscar dados do aprovador se houver
    let dadosAprovador = null
    if (solicitacao.aprovado_por) {
      const { data: aprovadorData } = await supabase
        .from('usuarios')
        .select('id_usuarios, nome, email')
        .eq('id_usuarios', solicitacao.aprovado_por)
        .single()
      dadosAprovador = aprovadorData
    }

    const data = {
      ...solicitacao,
      usuario: dadosUsuario || null,
      aprovador: dadosAprovador || null
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

