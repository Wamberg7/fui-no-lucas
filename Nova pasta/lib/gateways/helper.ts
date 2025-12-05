import { supabase } from '@/lib/supabase'
import { createGateway } from './index'
import type { PaymentRequest, PaymentResponse } from './base'

// Buscar gateway ativo para uma loja
export async function getActiveGateway(lojaId: number): Promise<{ tipo: string; config: any } | null> {
  try {
    // Primeiro, tentar buscar gateway específico da loja
    const { data: gateway, error } = await supabase
      .from('gateways_carteira')
      .select('*')
      .eq('lojas_id_lojas', lojaId)
      .eq('ativo', true)
      .eq('configurado', true)
      .order('data_configuracao', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!error && gateway) {
      return {
        tipo: gateway.gateway_tipo,
        config: gateway.credenciais || {}
      }
    }

    // Se não encontrou gateway específico, buscar gateway padrão global
    // Buscar primeira loja para pegar o gateway padrão
    const { data: primeiraLoja } = await supabase
      .from('lojas')
      .select('id_lojas')
      .limit(1)
      .maybeSingle()

    if (primeiraLoja) {
      // Buscar gateway padrão ativo da primeira loja (que serve como referência global)
      const { data: gatewayPadrao } = await supabase
        .from('gateways_carteira')
        .select('*')
        .eq('lojas_id_lojas', primeiraLoja.id_lojas)
        .eq('ativo', true)
        .order('data_configuracao', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (gatewayPadrao) {
        return {
          tipo: gatewayPadrao.gateway_tipo,
          config: gatewayPadrao.credenciais || {}
        }
      }
    }

    // Fallback: retornar carteira como padrão
    return {
      tipo: 'carteira',
      config: {}
    }
  } catch (error) {
    console.error('Erro ao buscar gateway ativo:', error)
    // Fallback: retornar carteira como padrão
    return {
      tipo: 'carteira',
      config: {}
    }
  }
}

// Processar pagamento usando o gateway configurado
export async function processPaymentWithGateway(
  lojaId: number,
  paymentRequest: PaymentRequest
): Promise<PaymentResponse> {
  try {
    // Buscar gateway ativo
    const gatewayInfo = await getActiveGateway(lojaId)

    if (!gatewayInfo) {
      return {
        success: false,
        error: 'Nenhum gateway de pagamento configurado ou ativo'
      }
    }

    // Criar instância do gateway
    const gateway = createGateway(gatewayInfo.tipo, gatewayInfo.config)

    if (!gateway) {
      return {
        success: false,
        error: `Gateway ${gatewayInfo.tipo} não suportado`
      }
    }

    // Processar pagamento
    const result = await gateway.createPayment(paymentRequest)

    return result
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao processar pagamento'
    }
  }
}

