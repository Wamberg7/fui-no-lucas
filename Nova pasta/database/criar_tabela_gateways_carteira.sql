-- Script para criar tabela de configurações de gateways de pagamento para carteira
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de configurações de gateways de pagamento por loja
CREATE TABLE IF NOT EXISTS gateways_carteira (
  id_gateway_carteira SERIAL PRIMARY KEY,
  lojas_id_lojas INTEGER NOT NULL,
  gateway_tipo VARCHAR(50) NOT NULL, -- 'carteira', 'pushinpay', 'mercadopago', etc
  ativo BOOLEAN NOT NULL DEFAULT false,
  configurado BOOLEAN NOT NULL DEFAULT false,
  credenciais JSONB, -- Armazena as credenciais específicas de cada gateway
  data_configuracao TIMESTAMP WITH TIME ZONE,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_gateways_carteira_lojas 
    FOREIGN KEY (lojas_id_lojas) 
    REFERENCES lojas(id_lojas) 
    ON DELETE CASCADE,
  UNIQUE(lojas_id_lojas, gateway_tipo)
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_gateways_carteira_loja ON gateways_carteira(lojas_id_lojas);
CREATE INDEX IF NOT EXISTS idx_gateways_carteira_tipo ON gateways_carteira(gateway_tipo);
CREATE INDEX IF NOT EXISTS idx_gateways_carteira_ativo ON gateways_carteira(ativo) WHERE ativo = true;

-- Habilitar RLS (Row Level Security)
ALTER TABLE gateways_carteira ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajuste conforme necessário)
CREATE POLICY "Permitir leitura de gateways" ON gateways_carteira FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de gateways" ON gateways_carteira FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de gateways" ON gateways_carteira FOR UPDATE USING (true);
CREATE POLICY "Permitir deleção de gateways" ON gateways_carteira FOR DELETE USING (true);

