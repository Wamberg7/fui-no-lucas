import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-key-aqui-mude-em-producao'

// GET - Listar todos os usuários (apenas super admin)
export async function GET(request: NextRequest) {
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
        { error: 'Acesso negado. Apenas super administradores podem acessar.' },
        { status: 403 }
      )
    }

    // Buscar todos os usuários
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id_usuarios, nome, email, telefone, tipo_conta, data_cadastro, is_super_admin')
      .order('data_cadastro', { ascending: false })

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar usuários' },
        { status: 500 }
      )
    }

    // Remover senhas (se houver)
    const usuariosSeguros = usuarios?.map(({ senha, ...usuario }) => usuario) || []

    return NextResponse.json(usuariosSeguros)
  } catch (error: any) {
    console.error('Erro no GET usuarios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo usuário (apenas super admin)
export async function POST(request: NextRequest) {
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
        { error: 'Acesso negado. Apenas super administradores podem criar usuários.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { nome, email, telefone, senha, is_super_admin, tipo_conta } = body

    // Validações
    if (!nome || !email || !telefone || !senha) {
      return NextResponse.json(
        { error: 'Nome, e-mail, telefone e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se email já existe
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

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10)

    // Criar usuário
    const dadosUsuario: any = {
      nome,
      email,
      telefone,
      senha: senhaHash,
      tipo_conta: tipo_conta || 'dono_loja',
      is_super_admin: is_super_admin === true || is_super_admin === 'true',
      data_cadastro: new Date().toISOString().split('T')[0]
    }

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .insert(dadosUsuario)
      .select('id_usuarios, nome, email, telefone, tipo_conta, data_cadastro, is_super_admin')
      .single()

    if (error) {
      console.error('Erro ao criar usuário:', error)
      return NextResponse.json(
        { error: `Erro ao criar usuário: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      usuario,
      message: 'Usuário criado com sucesso!'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Erro no POST usuarios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

