import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verificarToken } from '@/lib/auth'

// GET - Listar anúncios (apenas super admin)
export async function GET(request: NextRequest) {
  try {
    const usuarioAdmin = verificarToken(request)

    if (!usuarioAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário autenticado é super admin no banco
    const { data: adminData, error: adminError } = await supabase
      .from('usuarios')
      .select('is_super_admin')
      .eq('id_usuarios', usuarioAdmin.id)
      .single()

    if (adminError || !adminData?.is_super_admin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas super administradores podem visualizar anúncios.' },
        { status: 403 }
      )
    }

    const { data: anuncios, error } = await supabase
      .from('anuncios')
      .select(`
        *,
        criador:usuarios (
          id_usuarios,
          nome,
          email
        ),
        lojas:anuncios_lojas (
          loja:lojas (
            id_lojas,
            nome_loja
          )
        )
      `)
      .order('data_criacao', { ascending: false })

    if (error) {
      console.error('Erro ao buscar anúncios:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar anúncios' },
        { status: 500 }
      )
    }

    return NextResponse.json(anuncios || [])
  } catch (error: any) {
    console.error('Erro na API de listar anúncios admin:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar anúncio (apenas super admin)
export async function POST(request: NextRequest) {
  try {
    const usuarioAdmin = verificarToken(request)

    if (!usuarioAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário autenticado é super admin no banco
    const { data: adminData, error: adminError } = await supabase
      .from('usuarios')
      .select('is_super_admin')
      .eq('id_usuarios', usuarioAdmin.id)
      .single()

    if (adminError || !adminData?.is_super_admin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas super administradores podem criar anúncios.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { titulo, mensagem, tipo, enviado_para_todas, lojas_ids, data_expiracao } = body

    if (!titulo || !mensagem) {
      return NextResponse.json(
        { error: 'Título e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar anúncio
    const dadosAnuncio: any = {
      titulo: titulo.trim(),
      mensagem: mensagem.trim(),
      tipo: tipo || 'info',
      enviado_para_todas: enviado_para_todas || false,
      criado_por: usuarioAdmin.id,
      ativo: true
    }

    // Adicionar data_expiracao apenas se fornecida
    if (data_expiracao && data_expiracao.trim() !== '') {
      dadosAnuncio.data_expiracao = data_expiracao
    }

    console.log('Dados do anúncio a ser criado:', dadosAnuncio)
    
    const { data: anuncio, error: erroAnuncio } = await supabase
      .from('anuncios')
      .insert(dadosAnuncio)
      .select()
      .single()

    if (erroAnuncio) {
      console.error('Erro ao criar anúncio:', erroAnuncio)
      console.error('Detalhes do erro:', JSON.stringify(erroAnuncio, null, 2))
      return NextResponse.json(
        { error: `Erro ao criar anúncio: ${erroAnuncio.message || 'Erro desconhecido'}` },
        { status: 500 }
      )
    }

    console.log('Anúncio criado com sucesso:', anuncio)

    // Se não for para todas, associar às lojas específicas
    if (!enviado_para_todas && lojas_ids && Array.isArray(lojas_ids) && lojas_ids.length > 0) {
      console.log('Associando anúncio a lojas específicas:', lojas_ids)
      const anunciosLojas = lojas_ids.map((lojaId: number) => ({
        anuncios_id_anuncios: anuncio.id_anuncios,
        lojas_id_lojas: lojaId
      }))

      console.log('Dados para inserir em anuncios_lojas:', anunciosLojas)

      const { data: anunciosLojasInseridos, error: erroLojas } = await supabase
        .from('anuncios_lojas')
        .insert(anunciosLojas)
        .select()

      if (erroLojas) {
        console.error('Erro ao associar lojas ao anúncio:', erroLojas)
        console.error('Detalhes do erro:', JSON.stringify(erroLojas, null, 2))
        // Retornar erro, mas o anúncio já foi criado
        return NextResponse.json(
          { 
            success: true, 
            anuncio,
            warning: 'Anúncio criado, mas houve erro ao associar lojas. Verifique manualmente.',
            error: erroLojas.message
          },
          { status: 201 }
        )
      }
      
      console.log('Lojas associadas com sucesso:', anunciosLojasInseridos)
    } else if (enviado_para_todas) {
      console.log('Anúncio enviado para todas as lojas')
    } else {
      console.log('Nenhuma loja selecionada e não é para todas')
    }

    // Buscar anúncio completo com relacionamentos
    const { data: anuncioCompleto, error: erroBusca } = await supabase
      .from('anuncios')
      .select(`
        *,
        criador:usuarios (
          id_usuarios,
          nome,
          email
        ),
        lojas:anuncios_lojas (
          loja:lojas (
            id_lojas,
            nome_loja
          )
        )
      `)
      .eq('id_anuncios', anuncio.id_anuncios)
      .single()

    if (erroBusca) {
      console.error('Erro ao buscar anúncio completo:', erroBusca)
      // Retornar mesmo assim com o anúncio básico
      return NextResponse.json({ 
        success: true, 
        anuncio: anuncio 
      }, { status: 201 })
    }

    console.log('Anúncio completo retornado:', anuncioCompleto)

    return NextResponse.json({ 
      success: true, 
      anuncio: anuncioCompleto || anuncio 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Erro na API de criar anúncio admin:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

