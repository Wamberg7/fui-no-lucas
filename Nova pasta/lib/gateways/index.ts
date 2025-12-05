import { BaseGateway } from './base'
import { CarteiraGateway } from './carteira'
import { PushinPayGateway } from './pushinpay'

// Factory para criar instâncias de gateways
export function createGateway(type: string, config: any): BaseGateway | null {
  switch (type) {
    case 'carteira':
      return new CarteiraGateway(config)
    case 'pushinpay':
      return new PushinPayGateway(config)
    default:
      return null
  }
}

// Lista de gateways disponíveis
export const availableGateways = [
  {
    type: 'carteira',
    name: 'Carteira',
    description: 'Sistema interno de pagamentos via PIX'
  },
  {
    type: 'pushinpay',
    name: 'Pushin Pay',
    description: 'Gateway de pagamento Pushin Pay'
  }
]

// Exportar tipos
export * from './base'
export { CarteiraGateway } from './carteira'
export { PushinPayGateway } from './pushinpay'

