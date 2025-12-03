import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Estatísticas gerais
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { verificarToken } = await import('@/lib/auth')
    const usuario = verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar dados apenas do usuário logado
    const [produtos, categorias, vendas, estoque] = await Promise.all([
      supabase.from('produtos').select('id_produtos', { count: 'exact', head: true }).eq('usuarios_id_usuarios', usuario.id),
      supabase.from('categorias').select('id_categorias', { count: 'exact', head: true }).eq('usuarios_id_usuarios', usuario.id),
      supabase.from('vendas').select('*').eq('usuarios_id_usuarios', usuario.id),
      supabase.from('produtos').select('estoque, disponivel_venda').eq('usuarios_id_usuarios', usuario.id)
    ])

    const totalVendas = vendas.data?.length || 0
    const vendasConcluidas = vendas.data?.filter(v => v.status === 'concluida') || []
    const receitaTotal = vendasConcluidas.reduce((acc: number, v: any) => acc + (v.total || 0), 0)

    const totalEstoque = estoque.data?.reduce((acc: number, p: any) => acc + (p.estoque || 0), 0) || 0
    const produtosDisponiveis = estoque.data?.filter((p: any) => p.disponivel_venda && (p.estoque || 0) > 0).length || 0
    const produtosSemEstoque = estoque.data?.filter((p: any) => (p.estoque || 0) === 0).length || 0

    return NextResponse.json({
      totalProdutos: produtos.count || 0,
      totalCategorias: categorias.count || 0,
      totalVendas,
      receitaTotal: receitaTotal.toFixed(2),
      totalEstoque,
      produtosDisponiveis,
      produtosSemEstoque
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
