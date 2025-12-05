import { BaseGateway, GatewayConfig, GatewayMetadata, PaymentRequest, PaymentResponse } from './base'

export class PushinPayGateway extends BaseGateway {
  private apiUrl = 'https://api.pushinpay.com.br' // URL base da API do Pushin Pay

  getMetadata(): GatewayMetadata {
    return {
      name: 'pushinpay',
      displayName: 'Pushin Pay',
      icon: 'credit-card',
      supportedMethods: ['pix', 'credit_card', 'debit_card'],
      requiresCredentials: true,
      credentialFields: [
        {
          key: 'api_key',
          label: 'API Key',
          type: 'text',
          required: true,
          placeholder: 'Digite sua API Key do Pushin Pay'
        },
        {
          key: 'secret_key',
          label: 'Secret Key',
          type: 'password',
          required: true,
          placeholder: 'Digite sua Secret Key do Pushin Pay'
        }
      ]
    }
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (!this.validateConfig(['api_key', 'secret_key'])) {
        return {
          success: false,
          error: 'Credenciais do Pushin Pay não configuradas'
        }
      }

      // Preparar requisição para Pushin Pay
      const payload = {
        amount: request.amount,
        description: request.description,
        payment_method: 'pix', // Por padrão, usar PIX
        customer: request.customer,
        metadata: request.metadata
      }

      // Fazer requisição para API do Pushin Pay
      const response = await fetch(`${this.apiUrl}/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.api_key}`,
          'X-Secret-Key': this.config.secret_key
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Erro ao criar pagamento no Pushin Pay'
        }
      }

      return {
        success: true,
        payment_id: data.id,
        qr_code: data.qr_code,
        payment_link: data.payment_link
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erro ao processar pagamento'
      }
    }
  }

  async verifyPayment(paymentId: string): Promise<{ status: string; paid: boolean }> {
    try {
      if (!this.validateConfig(['api_key', 'secret_key'])) {
        throw new Error('Credenciais do Pushin Pay não configuradas')
      }

      const response = await fetch(`${this.apiUrl}/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.api_key}`,
          'X-Secret-Key': this.config.secret_key
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao verificar pagamento')
      }

      return {
        status: data.status,
        paid: data.status === 'paid' || data.status === 'approved'
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao verificar pagamento')
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      if (!this.validateConfig(['api_key', 'secret_key'])) {
        return false
      }

      // Fazer uma requisição de teste para validar as credenciais
      const response = await fetch(`${this.apiUrl}/v1/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.api_key}`,
          'X-Secret-Key': this.config.secret_key
        }
      })

      return response.ok
    } catch (error) {
      return false
    }
  }
}

