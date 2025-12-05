import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar todas as solicitações de carteira pendentes
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

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'todos'

    console.log('Buscando solicitações de carteira com status:', status)

    // Primeiro buscar as solicitações
    let query = supabase
      .from('carteira_pendente')
      .select('*')
    
    // Se não for 'todos', filtrar por status
    if (status !== 'todos') {
      query = query.eq('status', status)
    }
    
    const { data: solicitacoes, error } = await query
      .order('data_solicitacao', { ascending: false })

    if (error) {
      console.error('Erro ao buscar solicitações de carteira:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Se não houver solicitações, retornar array vazio
    if (!solicitacoes || solicitacoes.length === 0) {
      console.log('Nenhuma solicitação encontrada com status:', status)
      return NextResponse.json([])
    }

    // Buscar dados dos usuários para cada solicitação
    const solicitacoesComUsuarios = await Promise.all(
      solicitacoes.map(async (solicitacao) => {
        // Buscar dados do usuário
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('id_usuarios, nome, email, telefone')
          .eq('id_usuarios', solicitacao.usuarios_id_usuarios)
          .single()

        // Buscar dados do aprovador se houver
        let aprovador = null
        if (solicitacao.aprovado_por) {
          const { data: aprovadorData } = await supabase
            .from('usuarios')
            .select('id_usuarios, nome, email')
            .eq('id_usuarios', solicitacao.aprovado_por)
            .single()
          aprovador = aprovadorData
        }

        return {
          ...solicitacao,
          usuario: usuario || null,
          aprovador: aprovador || null
        }
      })
    )

    console.log('Solicitações encontradas:', solicitacoesComUsuarios?.length || 0)
    return NextResponse.json(solicitacoesComUsuarios || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar nova solicitação de carteira
export async function POST(request: NextRequest) {
  try {
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // POST não precisa ser super admin - qualquer usuário pode criar solicitação

    const body = await request.json()
    const { cpf, nome_completo, chave_pix } = body

    if (!cpf || !nome_completo || !chave_pix) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    // Verificar se já existe uma solicitação pendente para este usuário
    const { data: existente } = await supabase
      .from('carteira_pendente')
      .select('id_carteira_pendente')
      .eq('usuarios_id_usuarios', usuario.id)
      .eq('status', 'pendente')
      .maybeSingle()

    if (existente) {
      return NextResponse.json({ error: 'Você já possui uma solicitação pendente. Aguarde a aprovação ou cancele a solicitação anterior.' }, { status: 400 })
    }

    // Se o usuário já foi aprovado antes, criar nova solicitação (isso invalidará a aprovação anterior)
    // Primeiro, verificar se há uma aprovação ativa e desativar o gateway
    const { data: aprovacaoAnterior } = await supabase
      .from('carteira_pendente')
      .select('id_carteira_pendente')
      .eq('usuarios_id_usuarios', usuario.id)
      .eq('status', 'aprovado')
      .order('data_aprovacao', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Se houver aprovação anterior, desativar o gateway da carteira para esta loja
    if (aprovacaoAnterior) {
      // Buscar loja do usuário
      const { data: loja } = await supabase
        .from('lojas')
        .select('id_lojas')
        .eq('usuarios_id_usuarios', usuario.id)
        .limit(1)
        .maybeSingle()

      if (loja) {
        // Desativar gateway carteira
        await supabase
          .from('gateways_carteira')
          .update({
            ativo: false,
            configurado: false,
            data_atualizacao: new Date().toISOString()
          })
          .eq('lojas_id_lojas', loja.id_lojas)
          .eq('gateway_tipo', 'carteira')
      }
    }

    const dadosInsercao = {
      usuarios_id_usuarios: usuario.id,
      cpf,
      nome_completo,
      chave_pix,
      status: 'pendente',
      data_solicitacao: new Date().toISOString()
    }

    console.log('Tentando inserir solicitação de carteira:', dadosInsercao)

    const { data, error } = await supabase
      .from('carteira_pendente')
      .insert(dadosInsercao)
      .select()
      .single()

    if (error) {
      console.error('Erro ao inserir solicitação de carteira:', error)
      return NextResponse.json({ error: error.message || 'Erro ao salvar solicitação' }, { status: 400 })
    }

    console.log('Solicitação de carteira salva com sucesso:', data)
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

