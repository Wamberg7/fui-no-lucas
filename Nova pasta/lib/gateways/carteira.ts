import { BaseGateway, GatewayConfig, GatewayMetadata, PaymentRequest, PaymentResponse } from './base'

export class CarteiraGateway extends BaseGateway {
  getMetadata(): GatewayMetadata {
    return {
      name: 'carteira',
      displayName: 'Carteira',
      icon: 'wallet',
      supportedMethods: ['pix'],
      requiresCredentials: true,
      credentialFields: [
        {
          key: 'cpf',
          label: 'CPF',
          type: 'text',
          required: true,
          placeholder: '000.000.000-00'
        },
        {
          key: 'nome_completo',
          label: 'Nome Completo',
          type: 'text',
          required: true,
          placeholder: 'Digite seu nome completo'
        },
        {
          key: 'chave_pix',
          label: 'Chave PIX',
          type: 'text',
          required: true,
          placeholder: 'Digite sua chave PIX'
        }
      ]
    }
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (!this.validateConfig(['cpf', 'nome_completo', 'chave_pix'])) {
        return {
          success: false,
          error: 'Configuração da Carteira incompleta'
        }
      }

      // A Carteira usa o sistema interno de pagamentos
      // O pagamento será processado internamente
      return {
        success: true,
        payment_id: `carteira-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        payment_link: null
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erro ao processar pagamento'
      }
    }
  }

  async verifyPayment(paymentId: string): Promise<{ status: string; paid: boolean }> {
    // A verificação será feita através do sistema interno
    // Retornar status pendente por padrão
    return {
      status: 'pending',
      paid: false
    }
  }

  async validateCredentials(): Promise<boolean> {
    // Validar se os campos obrigatórios estão preenchidos
    return this.validateConfig(['cpf', 'nome_completo', 'chave_pix'])
  }
}

