import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-key-aqui-mude-em-producao'

// GET - Listar todos os saques (apenas super admin)
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pendente'

    // Buscar saques
    let query = supabase
      .from('saques')
      .select('*')
      .order('data_solicitacao', { ascending: false })

    if (status !== 'todos') {
      query = query.eq('status', status)
    }

    const { data: saques, error } = await query

    if (error) {
      console.error('Erro ao buscar saques:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar saques' },
        { status: 500 }
      )
    }

    // Buscar informações dos usuários
    if (saques && saques.length > 0) {
      const userIds = [...new Set(saques.map(s => s.usuarios_id_usuarios))]
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id_usuarios, nome, email, telefone')
        .in('id_usuarios', userIds)

      const usuariosMap = new Map((usuarios || []).map(u => [u.id_usuarios, u]))

      // Combinar dados
      const saquesComUsuarios = saques.map(saque => ({
        ...saque,
        usuarios: usuariosMap.get(saque.usuarios_id_usuarios) || {
          id_usuarios: saque.usuarios_id_usuarios,
          nome: 'Usuário não encontrado',
          email: '',
          telefone: ''
        }
      }))

      return NextResponse.json(saquesComUsuarios)
    }

    return NextResponse.json([])
  } catch (error: any) {
    console.error('Erro no GET saques:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

