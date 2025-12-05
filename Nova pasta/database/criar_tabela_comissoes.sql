-- Script para criar tabela de comissões
-- Execute este script no SQL Editor do Supabase

-- Tabela de comissões
CREATE TABLE IF NOT EXISTS comissoes (
  id_comissoes SERIAL PRIMARY KEY,
  vendas_id_vendas INTEGER NOT NULL,
  lojas_id_lojas INTEGER NOT NULL,
  usuarios_id_usuarios INTEGER NOT NULL,
  valor_venda DECIMAL(10,2) NOT NULL,
  taxa_fixa DECIMAL(10,2) NOT NULL DEFAULT 0.50,
  taxa_percentual DECIMAL(5,2) NOT NULL DEFAULT 3.00,
  valor_comissao DECIMAL(10,2) NOT NULL,
  metodo_pagamento VARCHAR(50) NOT NULL,
  data_venda TIMESTAMP NOT NULL,
  data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comissoes_vendas 
    FOREIGN KEY (vendas_id_vendas) 
    REFERENCES vendas(id_vendas) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
  CONSTRAINT fk_comissoes_lojas 
    FOREIGN KEY (lojas_id_lojas) 
    REFERENCES lojas(id_lojas) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
  CONSTRAINT fk_comissoes_usuarios 
    FOREIGN KEY (usuarios_id_usuarios) 
    REFERENCES usuarios(id_usuarios) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comissoes_loja ON comissoes(lojas_id_lojas);
CREATE INDEX IF NOT EXISTS idx_comissoes_usuario ON comissoes(usuarios_id_usuarios);
CREATE INDEX IF NOT EXISTS idx_comissoes_venda ON comissoes(vendas_id_vendas);
CREATE INDEX IF NOT EXISTS idx_comissoes_data ON comissoes(data_venda DESC);

-- Desabilitar RLS para desenvolvimento (ou criar políticas adequadas)
ALTER TABLE comissoes DISABLE ROW LEVEL SECURITY;

-- Verificar se foi criada corretamente
SELECT 
    tablename, 
    schemaname
FROM pg_tables 
WHERE tablename = 'comissoes';

