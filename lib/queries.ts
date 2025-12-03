import { supabase } from './supabase'
import type { Autor, Livro, Serie, Usuario, Venda, ItemVenda } from './supabase'

// Estatísticas Gerais
export async function getEstatisticasGerais() {
  try {
    const [livros, autores, series, usuarios, vendas] = await Promise.all([
      supabase.from('livros').select('id_livros', { count: 'exact', head: true }),
      supabase.from('autores').select('id_autores', { count: 'exact', head: true }),
      supabase.from('series').select('id_series', { count: 'exact', head: true }),
      supabase.from('usuarios').select('id_usuarios', { count: 'exact', head: true }),
      supabase.from('vendas').select('*')
    ])

    const totalVendas = vendas.data?.length || 0
    const vendasConcluidas = vendas.data?.filter(v => v.status === 'concluida') || []
    const receitaTotal = vendasConcluidas.reduce((acc, v) => acc + (v.total || 0), 0)

    return {
      totalLivros: livros.count || 0,
      totalAutores: autores.count || 0,
      totalSeries: series.count || 0,
      totalUsuarios: usuarios.count || 0,
      totalVendas,
      receitaTotal: receitaTotal.toFixed(2)
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas gerais:', error)
    return {
      totalLivros: 0,
      totalAutores: 0,
      totalSeries: 0,
      totalUsuarios: 0,
      totalVendas: 0,
      receitaTotal: '0.00'
    }
  }
}

// Vendas por período
export async function getVendasPorPeriodo(dias: number = 30) {
  try {
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - dias)

    const { data, error } = await supabase
      .from('vendas')
      .select('*')
      .eq('status', 'concluida')
      .gte('data_venda', dataInicio.toISOString())
      .order('data_venda', { ascending: true })

    if (error) {
      console.error('Erro ao buscar vendas por período:', error)
      return []
    }

    // Agrupar por dia
    const vendasPorDia: { [key: string]: number } = {}
    data?.forEach(venda => {
      const data = new Date(venda.data_venda).toISOString().split('T')[0]
      vendasPorDia[data] = (vendasPorDia[data] || 0) + (venda.total || 0)
    })

    return Object.entries(vendasPorDia).map(([data, valor]) => ({
      data,
      valor: Number(valor)
    }))
  } catch (error) {
    console.error('Erro ao buscar vendas por período:', error)
    return []
  }
}

// Livros mais vendidos
export async function getLivrosMaisVendidos(limite: number = 10) {
  try {
    // Buscar itens de venda
    const { data: itens, error: errorItens } = await supabase
      .from('itens_venda')
      .select('livros_id_livros, quantidade')

    if (errorItens) {
      console.error('Erro ao buscar itens de venda:', errorItens)
      return []
    }

    if (!itens || itens.length === 0) return []

  // Agrupar por livro
  const vendasPorLivro: { [key: number]: number } = {}
  itens.forEach(item => {
    const livroId = item.livros_id_livros
    vendasPorLivro[livroId] = (vendasPorLivro[livroId] || 0) + (item.quantidade || 0)
  })

  // Buscar informações dos livros
  const livroIds = Object.keys(vendasPorLivro).map(Number)
  const { data: livros, error: errorLivros } = await supabase
    .from('livros')
    .select(`
      id_livros,
      titulos,
      preco,
      autores_id_autores,
      autores (id_autores, nome_autor)
    `)
    .in('id_livros', livroIds)

  if (errorLivros) {
    console.error('Erro ao buscar livros:', errorLivros)
    return []
  }

  // Combinar dados
  const resultado = (livros || []).map(livro => {
    const autor = Array.isArray(livro.autores) ? livro.autores[0] : livro.autores
    return {
      livro: {
        id_livros: livro.id_livros,
        titulos: livro.titulos,
        preco: livro.preco,
        autor: autor ? { nome_autor: autor.nome_autor } : null
      },
      total: vendasPorLivro[livro.id_livros] || 0
    }
  })

    return resultado
      .sort((a, b) => b.total - a.total)
      .slice(0, limite)
  } catch (error) {
    console.error('Erro ao buscar livros mais vendidos:', error)
    return []
  }
}

// Estatísticas de estoque
export async function getEstatisticasEstoque() {
  try {
    const { data: livros, error } = await supabase
      .from('livros')
      .select('estoque, disponivel_venda')

    if (error) {
      console.error('Erro ao buscar estoque:', error)
      return {
        totalEstoque: 0,
        livrosDisponiveis: 0,
        livrosSemEstoque: 0,
        totalLivros: 0
      }
    }

    const totalEstoque = livros?.reduce((acc, l) => acc + (l.estoque || 0), 0) || 0
    const livrosDisponiveis = livros?.filter(l => l.disponivel_venda && (l.estoque || 0) > 0).length || 0
    const livrosSemEstoque = livros?.filter(l => (l.estoque || 0) === 0).length || 0

    return {
      totalEstoque,
      livrosDisponiveis,
      livrosSemEstoque,
      totalLivros: livros?.length || 0
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas de estoque:', error)
    return {
      totalEstoque: 0,
      livrosDisponiveis: 0,
      livrosSemEstoque: 0,
      totalLivros: 0
    }
  }
}

// Últimas vendas
export async function getUltimasVendas(limite: number = 10) {
  try {
    const { data: vendas, error: errorVendas } = await supabase
      .from('vendas')
      .select('*')
      .order('data_venda', { ascending: false })
      .limit(limite)

    if (errorVendas) {
      console.error('Erro ao buscar vendas:', errorVendas)
      return []
    }

    if (!vendas || vendas.length === 0) return []

    // Buscar informações dos usuários
    const usuarioIds = [...new Set(vendas.map(v => v.usuarios_id_usuarios))]
    const { data: usuarios } = await supabase
      .from('usuarios')
      .select('id_usuarios, nome, email')
      .in('id_usuarios', usuarioIds)

    const usuariosMap = new Map((usuarios || []).map(u => [u.id_usuarios, u]))

    // Combinar dados
    return vendas.map(venda => ({
      ...venda,
      usuario: usuariosMap.get(venda.usuarios_id_usuarios) || null
    }))
  } catch (error) {
    console.error('Erro ao buscar últimas vendas:', error)
    return []
  }
}

// Autores mais populares
export async function getAutoresMaisPopulares(limite: number = 5) {
  try {
    const { data: livros, error: errorLivros } = await supabase
      .from('livros')
      .select('autores_id_autores')

    if (errorLivros) {
      console.error('Erro ao buscar livros:', errorLivros)
      return []
    }

    if (!livros || livros.length === 0) return []

    // Contar livros por autor
    const contagem: { [key: number]: number } = {}
    livros.forEach(livro => {
      const autorId = livro.autores_id_autores
      contagem[autorId] = (contagem[autorId] || 0) + 1
    })

    // Buscar informações dos autores
    const autorIds = Object.keys(contagem).map(Number)
    const { data: autores, error: errorAutores } = await supabase
      .from('autores')
      .select('id_autores, nome_autor, nacionalidade')
      .in('id_autores', autorIds)

    if (errorAutores) {
      console.error('Erro ao buscar autores:', errorAutores)
      return []
    }

    // Combinar dados
    const resultado = (autores || []).map(autor => ({
      autor,
      total: contagem[autor.id_autores] || 0
    }))

    return resultado
      .sort((a, b) => b.total - a.total)
      .slice(0, limite)
  } catch (error) {
    console.error('Erro ao buscar autores populares:', error)
    return []
  }
}

