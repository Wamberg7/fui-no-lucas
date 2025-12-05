import { NextRequest, NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'
import { enviarWebhookDiscord, criarEmbedVenda } from '@/lib/discord-webhook'

// POST - Testar webhook Discord
export async function POST(request: NextRequest) {
  try {
    const usuario = verificarToken(request)

    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { webhook_url } = body

    if (!webhook_url || !webhook_url.trim()) {
      return NextResponse.json(
        { error: 'URL do webhook é obrigatória' },
        { status: 400 }
      )
    }

    // Criar uma mensagem de teste
    const embedTeste = {
      title: '✅ Teste de Webhook',
      description: 'Se você está vendo esta mensagem, seu webhook está configurado corretamente!',
      color: 0x00ff00, // Verde
      fields: [
        {
          name: 'Status',
          value: 'Webhook funcionando perfeitamente!',
          inline: false
        },
        {
          name: 'Data do Teste',
          value: new Date().toLocaleString('pt-BR'),
          inline: false
        }
      ],
      footer: {
        text: 'Sistema de Notificações'
      },
      timestamp: new Date().toISOString()
    }

    const sucesso = await enviarWebhookDiscord(webhook_url, '🧪 **Teste de Webhook**', [embedTeste])

    if (sucesso) {
      return NextResponse.json({
        success: true,
        message: 'Webhook testado com sucesso!'
      })
    } else {
      return NextResponse.json(
        { error: 'Falha ao enviar mensagem de teste. Verifique a URL do webhook.' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Erro na API de testar webhook Discord:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

