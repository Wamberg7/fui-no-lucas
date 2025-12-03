import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-key-aqui-mude-em-producao'

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, senha } = body

    console.log('🔐 [LOGIN API] Recebida requisição de login:', { email })

    if (!email || !senha) {
      console.log('❌ [LOGIN API] Campos faltando')
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário - usar apenas colunas que realmente existem na tabela
    console.log('🔍 [LOGIN API] Buscando usuário no banco...')
    
    // Buscar apenas as colunas básicas que SEMPRE existem
    const { data: usuarios, error: errorBusca } = await supabase
      .from('usuarios')
      .select('id_usuarios, email, telefone, senha, tipo_conta, data_cadastro')
      .eq('email', email)
    
    if (errorBusca) {
      console.error('❌ [LOGIN API] Erro ao buscar usuário:', errorBusca)
      console.error('❌ [LOGIN API] Código:', errorBusca.code)
      console.error('❌ [LOGIN API] Mensagem:', errorBusca.message)
      
      // Se for erro de RLS, dar mensagem específica
      if (errorBusca.message?.includes('row-level security') || errorBusca.message?.includes('RLS') || errorBusca.code === '42501') {
        return NextResponse.json(
          { error: 'Erro de segurança: Execute o script database/ajustar_rls_usuarios_simples.sql no Supabase para desabilitar RLS' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: `Erro ao buscar usuário: ${errorBusca.message || 'Erro desconhecido'}` },
        { status: 500 }
      )
    }

    console.log('📋 [LOGIN API] Resultado da busca:', { 
      encontrados: usuarios?.length || 0 
    })

    if (!usuarios || usuarios.length === 0) {
      console.log('❌ [LOGIN API] Nenhum usuário encontrado com este email')
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos' },
        { status: 401 }
      )
    }
    
    // Definir valores padrão para colunas opcionais que podem não existir
    if (usuarios[0]) {
      usuarios[0].cpf = usuarios[0].cpf || null
      usuarios[0].discord = usuarios[0].discord || null
    }

    const usuario = usuarios[0]
    
    // Criar nome baseado no email (já que a coluna nome não existe)
    usuario.nome = usuario.email?.split('@')[0] || 'Usuário'
    
    // Se tipo_usuario não existir, usar tipo_conta ou padrão
    if (!usuario.tipo_usuario) {
      usuario.tipo_usuario = usuario.tipo_conta === 'dono_loja' ? 'dono_loja' : 'leitor'
    }
    
    console.log('✅ [LOGIN API] Usuário encontrado:', { 
      id: usuario.id_usuarios, 
      email: usuario.email,
      nome: usuario.nome,
      tipo_conta: usuario.tipo_conta,
      temSenha: !!usuario.senha
    })

    // Verificar senha
    if (!usuario.senha) {
      console.log('❌ [LOGIN API] Usuário sem senha cadastrada')
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos' },
        { status: 401 }
      )
    }

    console.log('🔐 [LOGIN API] Verificando senha...')
    const senhaValida = await bcrypt.compare(senha, usuario.senha)
    if (!senhaValida) {
      console.log('❌ [LOGIN API] Senha inválida')
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos' },
        { status: 401 }
      )
    }

    console.log('✅ [LOGIN API] Senha válida! Gerando token...')

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id_usuarios,
        email: usuario.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log('✅ [LOGIN API] Token gerado com sucesso')

    // Remover senha da resposta
    const { senha: _, ...usuarioSemSenha } = usuario

    console.log('✅ [LOGIN API] Retornando resposta de sucesso')
    return NextResponse.json({
      success: true,
      token,
      usuario: usuarioSemSenha
    })
  } catch (error: any) {
    console.error('💥 [LOGIN API] Erro inesperado:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

