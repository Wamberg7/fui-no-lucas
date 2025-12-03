import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Criar cliente apenas se as variáveis estiverem configuradas
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

// Tipos para o banco de dados
export interface Categoria {
  id_categorias: number
  nome_categoria: string
  descricao: string | null
  icone: string | null
  ativo: boolean
  data_cadastro: string
}

export interface Produto {
  id_produtos: number
  nome_produto: string
  descricao: string | null
  imagem_produto: string | null
  categorias_id_categorias: number
  preco: number
  estoque: number
  disponivel_venda: boolean
  tipo_produto: 'digital' | 'fisico'
  envio_automatico: boolean
  destaque: boolean
  data_cadastro: string
  categoria?: Categoria
}

export interface Usuario {
  id_usuarios: number
  nome: string
  email: string | null
  telefone: string | null
  cpf: string | null
  discord: string | null
  tipo_usuario: 'admin' | 'leitor'
  tipo_conta: 'cliente' | 'dono_loja' | null
  data_cadastro: string
}

export interface Venda {
  id_vendas: number
  data_venda: string
  usuarios_id_usuarios: number
  total: number
  status: 'pendente' | 'concluida' | 'cancelada'
  observacoes: string | null
  metodo_pagamento?: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto' | 'transferencia'
  status_pagamento?: 'pendente' | 'processando' | 'aprovado' | 'rejeitado' | 'cancelado' | 'reembolsado'
  id_transacao?: string | null
  link_pagamento?: string | null
  data_pagamento?: string | null
  dados_pagamento?: any
  usuario?: Usuario
}

export interface ItemVenda {
  id_itens_venda: number
  vendas_id_vendas: number
  produtos_id_produtos: number
  quantidade: number
  preco_unitario: number
  subtotal: number
  produto?: Produto
}

export interface Loja {
  id_lojas: number
  nome_loja: string
  slug: string
  descricao: string | null
  logo: string | null
  usuarios_id_usuarios: number
  status: 'ativa' | 'pendente' | 'suspensa' | 'cancelada'
  data_criacao: string
  data_atualizacao: string
}
