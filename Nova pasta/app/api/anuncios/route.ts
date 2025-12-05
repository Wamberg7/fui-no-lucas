import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verificarToken } from '@/lib/auth'

// GET - Listar anúncios para a loja do usuário logado
export async function GET(request: NextRequest) {
  try {
    const usuario = verificarToken(request)

    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar loja do usuário
    const { data: loja, error: erroLoja } = await supabase
      .from('lojas')
      .select('id_lojas')
      .eq('usuarios_id_usuarios', usuario.id)
      .limit(1)
      .maybeSingle()

    if (erroLoja) {
      console.error('Erro ao buscar loja:', erroLoja)
      return NextResponse.json(
        { error: 'Erro ao buscar loja' },
        { status: 500 }
      )
    }

    const agora = new Date().toISOString()

    // Buscar anúncios enviados para todas as lojas (ativos e não expirados)
    let queryTodos = supabase
      .from('anuncios')
      .select(`
        *,
        criador:usuarios (
          id_usuarios,
          nome
        )
      `)
      .eq('ativo', true)
      .eq('enviado_para_todas', true)

    const { data: anunciosTodosRaw, error: erroTodos } = await queryTodos

    // Filtrar anúncios não expirados manualmente
    const anunciosTodos = anunciosTodosRaw?.filter((a: any) => 
      !a.data_expiracao || new Date(a.data_expiracao) > new Date()
    ) || []

    if (erroTodos) {
      console.error('Erro ao buscar anúncios para todas:', erroTodos)
    }

    // Se o usuário tem loja, buscar anúncios específicos para ela
    let anunciosEspecificos: any[] = []
    if (loja) {
      console.log('Buscando anúncios específicos para loja:', loja.id_lojas)
      const { data: anunciosLojas, error: erroAnunciosLojas } = await supabase
        .from('anuncios_lojas')
        .select(`
          anuncio:anuncios (
            *,
            criador:usuarios (
              id_usuarios,
              nome
            )
          )
        `)
        .eq('lojas_id_lojas', loja.id_lojas)

      if (erroAnunciosLojas) {
        console.error('Erro ao buscar anúncios específicos:', erroAnunciosLojas)
      } else if (anunciosLojas) {
        console.log('Anúncios específicos encontrados:', anunciosLojas)
        anunciosEspecificos = anunciosLojas
          .map((al: any) => al.anuncio)
          .filter((a: any) => {
            if (!a) return false
            // Verificar se está ativo
            if (!a.ativo) return false
            // Verificar se não expirou
            if (a.data_expiracao && new Date(a.data_expiracao) <= new Date()) return false
            return true
          })
        console.log('Anúncios específicos filtrados:', anunciosEspecificos)
      }
    } else {
      console.log('Usuário não tem loja associada')
    }

    // Combinar anúncios (remover duplicatas)
    const todosAnuncios = [
      ...(anunciosTodos || []).filter((a: any) => !a.data_expiracao || new Date(a.data_expiracao) > new Date()),
      ...anunciosEspecificos
    ]
    const anunciosUnicos = todosAnuncios.filter((anuncio, index, self) =>
      index === self.findIndex((a) => a && anuncio && a.id_anuncios === anuncio.id_anuncios)
    )

    // Ordenar por data de criação (mais recentes primeiro)
    anunciosUnicos.sort((a, b) => 
      new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
    )

    return NextResponse.json(anunciosUnicos || [])
  } catch (error: any) {
    console.error('Erro na API de listar anúncios:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

