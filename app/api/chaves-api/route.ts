import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
const crypto = require('crypto')

// Função para gerar chave API única
function gerarChaveAPI(): string {
  const prefixo = 'sk_live_'
  const randomBytes = crypto.randomBytes(32).toString('hex')
  return `${prefixo}${randomBytes}`
}

// GET - Listar chaves API do usuário
export async function GET(request: NextRequest) {
  try {
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: chaves, error } = await supabase
      .from('chaves_api')
      .select('id_chave_api, nome_chave, chave_api, ativa, ultimo_uso, data_criacao, data_expiracao')
      .eq('usuarios_id_usuarios', usuario.id)
      .order('data_criacao', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Mascarar chaves para segurança (mostrar apenas últimos 8 caracteres)
    const chavesMascaradas = chaves?.map(chave => ({
      ...chave,
      chave_api: chave.chave_api.substring(0, 12) + '...' + chave.chave_api.slice(-8)
    })) || []

    return NextResponse.json(chavesMascaradas)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar nova chave API
export async function POST(request: NextRequest) {
  try {
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nome_chave } = body

    // Gerar chave API única
    let chaveAPI = gerarChaveAPI()
    let tentativas = 0
    const maxTentativas = 10

    // Garantir que a chave seja única
    while (tentativas < maxTentativas) {
      const { data: chaveExistente } = await supabase
        .from('chaves_api')
        .select('id_chave_api')
        .eq('chave_api', chaveAPI)
        .maybeSingle()

      if (!chaveExistente) {
        break
      }

      chaveAPI = gerarChaveAPI()
      tentativas++
    }

    if (tentativas >= maxTentativas) {
      return NextResponse.json({ error: 'Erro ao gerar chave única' }, { status: 500 })
    }

    // Criar chave API
    const { data: novaChave, error } = await supabase
      .from('chaves_api')
      .insert({
        usuarios_id_usuarios: usuario.id,
        chave_api: chaveAPI,
        nome_chave: nome_chave || 'Chave Principal',
        ativa: true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Retornar chave completa apenas na criação (usuário deve salvar)
    return NextResponse.json({
      success: true,
      chave_api: novaChave.chave_api,
      id_chave_api: novaChave.id_chave_api,
      nome_chave: novaChave.nome_chave,
      message: 'Chave API criada com sucesso! Salve esta chave, ela não será exibida novamente.'
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

