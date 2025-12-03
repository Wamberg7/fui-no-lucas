-- Script para adicionar coluna chave_api na tabela lojas
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna chave_api na tabela lojas
ALTER TABLE lojas 
ADD COLUMN IF NOT EXISTS chave_api VARCHAR(255);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_lojas_chave_api ON lojas(chave_api);

-- Comentário
COMMENT ON COLUMN lojas.chave_api IS 'Chave API da loja para integração externa';

