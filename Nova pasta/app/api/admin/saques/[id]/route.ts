import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-key-aqui-mude-em-producao'

// PUT - Aprovar ou rejeitar saque (apenas super admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticação não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verificar token e se é super admin
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Verificar se é super admin no banco
    const { data: usuarioCompleto, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('is_super_admin')
      .eq('id_usuarios', decoded.id)
      .single()

    if (errorUsuario || !usuarioCompleto?.is_super_admin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas super administradores podem aprovar saques.' },
        { status: 403 }
      )
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status, observacoes } = body

    if (!status || !['concluido', 'rejeitado', 'processando'].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido. Use: concluido, rejeitado ou processando' },
        { status: 400 }
      )
    }

    // Verificar se saque existe
    const { data: saqueExistente, error: errorBusca } = await supabase
      .from('saques')
      .select('id_saques, usuarios_id_usuarios, valor, status')
      .eq('id_saques', id)
      .single()

    if (errorBusca || !saqueExistente) {
      return NextResponse.json(
        { error: 'Saque não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar saque
    const dadosAtualizacao: any = {
      status,
      data_processamento: new Date().toISOString()
    }

    if (observacoes) {
      dadosAtualizacao.observacoes = observacoes
    }

    const { data: saque, error } = await supabase
      .from('saques')
      .update(dadosAtualizacao)
      .eq('id_saques', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar saque:', error)
      return NextResponse.json(
        { error: `Erro ao atualizar saque: ${error.message}` },
        { status: 400 }
      )
    }

    // Se foi rejeitado, devolver o saldo ao usuário
    if (status === 'rejeitado' && saqueExistente.status === 'pendente') {
      const { data: saldo } = await supabase
        .from('saldo_usuarios')
        .select('saldo_disponivel, saldo_pendente')
        .eq('usuarios_id_usuarios', saqueExistente.usuarios_id_usuarios)
        .single()

      if (saldo) {
        await supabase
          .from('saldo_usuarios')
          .update({
            saldo_disponivel: (saldo.saldo_disponivel || 0) + saqueExistente.valor,
            saldo_pendente: Math.max(0, (saldo.saldo_pendente || 0) - saqueExistente.valor)
          })
          .eq('usuarios_id_usuarios', saqueExistente.usuarios_id_usuarios)
      }
    }

    return NextResponse.json({
      success: true,
      saque,
      message: `Saque ${status === 'concluido' ? 'aprovado' : status === 'rejeitado' ? 'rejeitado' : 'em processamento'} com sucesso!`
    })
  } catch (error: any) {
    console.error('Erro no PUT saques:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

