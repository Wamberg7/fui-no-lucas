import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-key-aqui-mude-em-producao'

// PUT - Atualizar usuário (apenas super admin)
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
        { error: 'Acesso negado. Apenas super administradores podem atualizar usuários.' },
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
    const { nome, email, telefone, senha, is_super_admin, tipo_conta } = body

    // Verificar se usuário existe
    const { data: usuarioExistente, error: errorBusca } = await supabase
      .from('usuarios')
      .select('id_usuarios, email')
      .eq('id_usuarios', id)
      .single()

    if (errorBusca || !usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Se email foi alterado, verificar se já existe
    if (email && email !== usuarioExistente.email) {
      const { data: emailExistente } = await supabase
        .from('usuarios')
        .select('id_usuarios')
        .eq('email', email)
        .single()

      if (emailExistente) {
        return NextResponse.json(
          { error: 'E-mail já cadastrado' },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualização
    const dadosAtualizacao: any = {}

    if (nome) dadosAtualizacao.nome = nome
    if (email) dadosAtualizacao.email = email
    if (telefone) dadosAtualizacao.telefone = telefone
    if (tipo_conta) dadosAtualizacao.tipo_conta = tipo_conta
    if (is_super_admin !== undefined) {
      dadosAtualizacao.is_super_admin = is_super_admin === true || is_super_admin === 'true'
    }
    if (senha) {
      dadosAtualizacao.senha = await bcrypt.hash(senha, 10)
    }

    // Atualizar usuário
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .update(dadosAtualizacao)
      .eq('id_usuarios', id)
      .select('id_usuarios, nome, email, telefone, tipo_conta, data_cadastro, is_super_admin')
      .single()

    if (error) {
      console.error('Erro ao atualizar usuário:', error)
      return NextResponse.json(
        { error: `Erro ao atualizar usuário: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      usuario,
      message: 'Usuário atualizado com sucesso!'
    })
  } catch (error: any) {
    console.error('Erro no PUT usuarios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

