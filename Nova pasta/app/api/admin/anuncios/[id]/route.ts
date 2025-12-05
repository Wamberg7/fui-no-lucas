import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verificarToken } from '@/lib/auth'

// DELETE - Excluir anúncio (apenas super admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Acesso negado. Apenas super administradores podem excluir anúncios.' },
        { status: 403 }
      )
    }

    const { id } = params

    // Verificar se o anúncio existe
    const { data: anuncioExistente, error: erroBusca } = await supabase
      .from('anuncios')
      .select('id_anuncios, criado_por')
      .eq('id_anuncios', id)
      .single()

    if (erroBusca || !anuncioExistente) {
      return NextResponse.json(
        { error: 'Anúncio não encontrado' },
        { status: 404 }
      )
    }

    // Excluir relacionamentos primeiro (anuncios_lojas será excluído automaticamente por CASCADE)
    // Mas vamos excluir manualmente para garantir
    await supabase
      .from('anuncios_lojas')
      .delete()
      .eq('anuncios_id_anuncios', id)

    // Excluir o anúncio
    const { error: erroExclusao } = await supabase
      .from('anuncios')
      .delete()
      .eq('id_anuncios', id)

    if (erroExclusao) {
      console.error('Erro ao excluir anúncio:', erroExclusao)
      return NextResponse.json(
        { error: `Erro ao excluir anúncio: ${erroExclusao.message || 'Erro desconhecido'}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Anúncio excluído com sucesso'
    })
  } catch (error: any) {
    console.error('Erro na API de excluir anúncio admin:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

