import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
const bcrypt = require('bcryptjs')

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, telefone, cpf, discord, senha } = body

    // Validações - apenas campos obrigatórios
    if (!nome || !email || !telefone || !senha) {
      return NextResponse.json(
        { error: 'Nome, e-mail, telefone e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar formato de CPF apenas se foi fornecido
    let cpfLimpo = null
    if (cpf) {
      cpfLimpo = cpf.replace(/\D/g, '')
      if (cpfLimpo.length > 0 && cpfLimpo.length !== 11) {
        return NextResponse.json(
          { error: 'CPF inválido' },
          { status: 400 }
        )
      }
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

    // Verificar se CPF já existe (apenas se foi fornecido)
    if (cpfLimpo && cpfLimpo.length === 11) {
      const { data: cpfExistente } = await supabase
        .from('usuarios')
        .select('id_usuarios')
        .eq('cpf', cpfLimpo)
        .single()

      if (cpfExistente) {
        return NextResponse.json(
          { error: 'CPF já cadastrado' },
          { status: 400 }
        )
      }
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10)

    // Criar usuário
    const dadosUsuario: any = {
      nome,
      email,
      telefone,
      senha: senhaHash,
      tipo_conta: 'dono_loja',
      data_cadastro: new Date().toISOString().split('T')[0]
    }
    
    // Não incluir tipo_usuario - será definido pelo DEFAULT no banco

    // Adicionar CPF apenas se fornecido e válido
    if (cpfLimpo && cpfLimpo.length === 11) {
      dadosUsuario.cpf = cpfLimpo
    }

    // Adicionar Discord apenas se fornecido
    if (discord && discord.trim() !== '') {
      dadosUsuario.discord = discord.trim()
    }

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .insert(dadosUsuario)
      .select()
      .single()

    // Se der erro por coluna não existir, tentar sem campos opcionais
    if (error && (error.message.includes('discord') || error.message.includes('cpf') || error.message.includes('tipo_usuario'))) {
      const dadosUsuarioSimples: any = {
        nome,
        email,
        telefone,
        senha: senhaHash,
        tipo_conta: 'dono_loja',
        data_cadastro: new Date().toISOString().split('T')[0]
      }

      const { data: usuarioRetry, error: errorRetry } = await supabase
        .from('usuarios')
        .insert(dadosUsuarioSimples)
        .select()
        .single()
      
      if (errorRetry) {
        return NextResponse.json({ 
          error: `Erro ao criar usuário. Execute o script SQL em database/corrigir_banco_completo.sql no Supabase. Erro: ${errorRetry.message}` 
        }, { status: 400 })
      }
      
      const { senha: _, ...usuarioSemSenha } = usuarioRetry
      return NextResponse.json({
        success: true,
        usuario: usuarioSemSenha,
        message: 'Conta criada com sucesso! (Nota: Execute o script SQL database/corrigir_banco_completo.sql para habilitar todos os campos)'
      }, { status: 201 })
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Remover senha da resposta
    const { senha: _, ...usuarioSemSenha } = usuario

    return NextResponse.json({
      success: true,
      usuario: usuarioSemSenha,
      message: 'Conta criada com sucesso!'
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

