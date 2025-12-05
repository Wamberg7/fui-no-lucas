import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-key-aqui-mude-em-producao'

// POST - Login Super Admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, senha } = body

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Primeiro, buscar usuário pelo email (sem filtrar por is_super_admin)
    const { data: usuarios, error: errorBusca } = await supabase
      .from('usuarios')
      .select('id_usuarios, email, telefone, senha, tipo_conta, data_cadastro, is_super_admin')
      .eq('email', email)
      .limit(1)

    if (errorBusca) {
      console.error('Erro ao buscar usuário:', errorBusca)
      return NextResponse.json(
        { error: 'Erro ao buscar usuário no banco de dados' },
        { status: 500 }
      )
    }

    if (!usuarios || usuarios.length === 0) {
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos' },
        { status: 401 }
      )
    }

    const usuario = usuarios[0]

    // Verificar se o usuário tem senha
    if (!usuario.senha) {
      console.error('Usuário sem senha cadastrada:', usuario.email)
      return NextResponse.json(
        { error: 'Usuário sem senha cadastrada. Entre em contato com o administrador.' },
        { status: 401 }
      )
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha)

    if (!senhaValida) {
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos' },
        { status: 401 }
      )
    }

    // Verificar se é realmente super admin
    if (!usuario.is_super_admin) {
      return NextResponse.json(
        { error: 'Acesso negado. Este usuário não é um super administrador. Entre em contato com um administrador para obter acesso.' },
        { status: 403 }
      )
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: usuario.id_usuarios,
        email: usuario.email,
        isSuperAdmin: true
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      token,
      usuario: {
        id_usuarios: usuario.id_usuarios,
        email: usuario.email,
        telefone: usuario.telefone,
        is_super_admin: true
      }
    })
  } catch (error: any) {
    console.error('Erro no login admin:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


