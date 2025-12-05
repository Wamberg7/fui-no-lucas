import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verificarToken } from '@/lib/auth'

// GET - Listar comissões (apenas super admin)
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
        { error: 'Acesso negado. Apenas super administradores podem visualizar comissões.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const lojaId = searchParams.get('loja_id')

    let query = supabase
      .from('comissoes')
      .select(`
        *,
        loja:lojas (
          id_lojas,
          nome_loja
        ),
        usuario:usuarios (
          id_usuarios,
          nome,
          email
        ),
        venda:vendas (
          id_vendas,
          total,
          data_venda
        )
      `)
      .order('data_venda', { ascending: false })

    if (lojaId) {
      query = query.eq('lojas_id_lojas', lojaId)
    }

    const { data: comissoes, error } = await query

    if (error) {
      console.error('Erro ao buscar comissões:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar comissões' },
        { status: 500 }
      )
    }

    // Calcular totais
    const totalGeral = comissoes?.reduce((acc, c) => acc + parseFloat(c.valor_comissao.toString()), 0) || 0

    // Agrupar por loja
    const comissoesPorLoja: { [key: number]: { loja: any, total: number, count: number } } = {}
    
    comissoes?.forEach((comissao) => {
      const lojaId = comissao.lojas_id_lojas
      if (!comissoesPorLoja[lojaId]) {
        comissoesPorLoja[lojaId] = {
          loja: comissao.loja,
          total: 0,
          count: 0
        }
      }
      comissoesPorLoja[lojaId].total += parseFloat(comissao.valor_comissao.toString())
      comissoesPorLoja[lojaId].count += 1
    })

    return NextResponse.json({
      comissoes: comissoes || [],
      totalGeral,
      comissoesPorLoja: Object.values(comissoesPorLoja)
    })
  } catch (error: any) {
    console.error('Erro na API de listar comissões admin:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

