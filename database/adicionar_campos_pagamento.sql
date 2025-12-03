-- Script para adicionar campos de pagamento às vendas
-- Execute este script no SQL Editor do Supabase

-- Adicionar colunas de pagamento à tabela vendas
ALTER TABLE vendas 
ADD COLUMN IF NOT EXISTS metodo_pagamento VARCHAR(50) DEFAULT 'dinheiro' CHECK (metodo_pagamento IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto', 'transferencia')),
ADD COLUMN IF NOT EXISTS status_pagamento VARCHAR(50) DEFAULT 'pendente' CHECK (status_pagamento IN ('pendente', 'processando', 'aprovado', 'rejeitado', 'cancelado', 'reembolsado')),
ADD COLUMN IF NOT EXISTS id_transacao VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS link_pagamento TEXT NULL,
ADD COLUMN IF NOT EXISTS data_pagamento TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS dados_pagamento JSONB NULL;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_metodo_pagamento ON vendas(metodo_pagamento);
CREATE INDEX IF NOT EXISTS idx_status_pagamento ON vendas(status_pagamento);
CREATE INDEX IF NOT EXISTS idx_id_transacao ON vendas(id_transacao);

-- Comentários nas colunas (PostgreSQL)
COMMENT ON COLUMN vendas.metodo_pagamento IS 'Método de pagamento utilizado';
COMMENT ON COLUMN vendas.status_pagamento IS 'Status do pagamento';
COMMENT ON COLUMN vendas.id_transacao IS 'ID da transação no gateway de pagamento';
COMMENT ON COLUMN vendas.link_pagamento IS 'Link para pagamento (PIX, boleto, etc)';
COMMENT ON COLUMN vendas.data_pagamento IS 'Data e hora do pagamento';
COMMENT ON COLUMN vendas.dados_pagamento IS 'Dados adicionais do pagamento em formato JSON';

