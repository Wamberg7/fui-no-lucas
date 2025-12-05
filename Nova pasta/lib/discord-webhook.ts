/**
 * Utilitário para enviar notificações via webhook do Discord
 */

export interface DiscordWebhookConfig {
  webhook_url: string
  nome_webhook?: string
}

export interface DiscordEmbed {
  title?: string
  description?: string
  color?: number
  fields?: Array<{
    name: string
    value: string
    inline?: boolean
  }>
  footer?: {
    text: string
  }
  timestamp?: string
}

/**
 * Envia uma mensagem simples para o Discord via webhook
 */
export async function enviarWebhookDiscord(
  webhookUrl: string,
  content: string,
  embeds?: DiscordEmbed[]
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        embeds: embeds || [],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro ao enviar webhook Discord:', errorText)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao enviar webhook Discord:', error)
    return false
  }
}

/**
 * Cria um embed formatado para notificação de venda
 */
export function criarEmbedVenda(dadosVenda: {
  id: number
  total: number
  metodo_pagamento: string
  cliente?: string
  produtos?: string
  data?: string
}): DiscordEmbed {
  return {
    title: '💰 Nova Venda Realizada',
    description: `Uma nova venda foi realizada na sua loja!`,
    color: 0x00ff00, // Verde
    fields: [
      {
        name: 'ID da Venda',
        value: `#${dadosVenda.id}`,
        inline: true,
      },
      {
        name: 'Valor Total',
        value: `R$ ${dadosVenda.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        inline: true,
      },
      {
        name: 'Método de Pagamento',
        value: dadosVenda.metodo_pagamento,
        inline: true,
      },
      ...(dadosVenda.cliente ? [{
        name: 'Cliente',
        value: dadosVenda.cliente,
        inline: false,
      }] : []),
      ...(dadosVenda.produtos ? [{
        name: 'Produtos',
        value: dadosVenda.produtos,
        inline: false,
      }] : []),
    ],
    footer: {
      text: dadosVenda.data || new Date().toLocaleString('pt-BR'),
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Cria um embed formatado para notificação de estoque baixo
 */
export function criarEmbedEstoqueBaixo(dadosEstoque: {
  produto: string
  estoque_atual: number
  estoque_minimo: number
}): DiscordEmbed {
  return {
    title: '⚠️ Estoque Baixo',
    description: `O produto "${dadosEstoque.produto}" está com estoque baixo!`,
    color: 0xffaa00, // Laranja
    fields: [
      {
        name: 'Produto',
        value: dadosEstoque.produto,
        inline: true,
      },
      {
        name: 'Estoque Atual',
        value: `${dadosEstoque.estoque_atual} unidades`,
        inline: true,
      },
      {
        name: 'Estoque Mínimo',
        value: `${dadosEstoque.estoque_minimo} unidades`,
        inline: true,
      },
    ],
    footer: {
      text: 'Considere repor o estoque',
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Cria um embed formatado para notificação de saque
 */
export function criarEmbedSaque(dadosSaque: {
  id: number
  valor: number
  afiliado: string
  status: string
}): DiscordEmbed {
  return {
    title: '💸 Solicitação de Saque',
    description: `Um afiliado solicitou um saque.`,
    color: 0x0099ff, // Azul
    fields: [
      {
        name: 'ID do Saque',
        value: `#${dadosSaque.id}`,
        inline: true,
      },
      {
        name: 'Valor',
        value: `R$ ${dadosSaque.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        inline: true,
      },
      {
        name: 'Afiliado',
        value: dadosSaque.afiliado,
        inline: false,
      },
      {
        name: 'Status',
        value: dadosSaque.status,
        inline: true,
      },
    ],
    footer: {
      text: 'Acesse o painel para processar',
    },
    timestamp: new Date().toISOString(),
  }
}

