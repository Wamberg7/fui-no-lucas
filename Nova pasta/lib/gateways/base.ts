// Interface base para todos os gateways de pagamento
export interface GatewayConfig {
  [key: string]: any
}

export interface PaymentRequest {
  amount: number
  description: string
  customer?: {
    name?: string
    email?: string
    document?: string
  }
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  success: boolean
  payment_id?: string
  qr_code?: string
  payment_link?: string
  error?: string
}

export interface GatewayMetadata {
  name: string
  displayName: string
  icon?: string
  supportedMethods: string[]
  requiresCredentials: boolean
  credentialFields: Array<{
    key: string
    label: string
    type: 'text' | 'password' | 'email'
    required: boolean
    placeholder?: string
  }>
}

// Classe abstrata base para gateways
export abstract class BaseGateway {
  protected config: GatewayConfig

  constructor(config: GatewayConfig) {
    this.config = config
  }

  // Métodos abstratos que devem ser implementados por cada gateway
  abstract getMetadata(): GatewayMetadata
  abstract createPayment(request: PaymentRequest): Promise<PaymentResponse>
  abstract verifyPayment(paymentId: string): Promise<{ status: string; paid: boolean }>
  abstract validateCredentials(): Promise<boolean>

  // Método para validar configuração básica
  protected validateConfig(requiredFields: string[]): boolean {
    return requiredFields.every(field => this.config[field] !== undefined && this.config[field] !== '')
  }
}

