-- Script para criar tabela de webhooks do Discord
-- Execute este script no SQL Editor do Supabase

-- Tabela de configurações de webhook Discord
CREATE TABLE IF NOT EXISTS webhooks_discord (
  id_webhook_discord SERIAL PRIMARY KEY,
  usuarios_id_usuarios INTEGER NOT NULL,
  lojas_id_lojas INTEGER,
  webhook_url TEXT NOT NULL,
  nome_webhook VARCHAR(255),
  notificar_vendas_publico BOOLEAN NOT NULL DEFAULT false,
  notificar_vendas_admin BOOLEAN NOT NULL DEFAULT false,
  notificar_estoque_baixo BOOLEAN NOT NULL DEFAULT false,
  notificar_saque_afiliado BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_webhooks_discord_usuario 
    FOREIGN KEY (usuarios_id_usuarios) 
    REFERENCES usuarios(id_usuarios) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT fk_webhooks_discord_loja 
    FOREIGN KEY (lojas_id_lojas) 
    REFERENCES lojas(id_lojas) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_webhooks_discord_usuario ON webhooks_discord(usuarios_id_usuarios);
CREATE INDEX IF NOT EXISTS idx_webhooks_discord_loja ON webhooks_discord(lojas_id_lojas);
CREATE INDEX IF NOT EXISTS idx_webhooks_discord_ativo ON webhooks_discord(ativo);

-- Desabilitar RLS para desenvolvimento (ou criar políticas adequadas)
ALTER TABLE webhooks_discord DISABLE ROW LEVEL SECURITY;

-- Verificar se foi criada corretamente
SELECT 
    tablename, 
    schemaname
FROM pg_tables 
WHERE tablename = 'webhooks_discord';

