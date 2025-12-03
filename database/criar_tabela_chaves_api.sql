-- Script para criar tabela de chaves API
-- Execute este script no SQL Editor do Supabase

-- Criar tabela para armazenar chaves API dos usuários
CREATE TABLE IF NOT EXISTS chaves_api (
  id_chave_api SERIAL PRIMARY KEY,
  usuarios_id_usuarios INTEGER NOT NULL REFERENCES usuarios(id_usuarios) ON DELETE CASCADE,
  chave_api VARCHAR(255) NOT NULL UNIQUE,
  nome_chave VARCHAR(100) NOT NULL DEFAULT 'Chave Principal',
  ativa BOOLEAN NOT NULL DEFAULT true,
  ultimo_uso TIMESTAMP,
  data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_expiracao TIMESTAMP,
  permissoes JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT fk_chaves_api_usuarios FOREIGN KEY (usuarios_id_usuarios) 
    REFERENCES usuarios(id_usuarios) ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_chaves_api_usuario ON chaves_api(usuarios_id_usuarios);
CREATE INDEX IF NOT EXISTS idx_chaves_api_chave ON chaves_api(chave_api);
CREATE INDEX IF NOT EXISTS idx_chaves_api_ativa ON chaves_api(ativa);

-- Comentários
COMMENT ON TABLE chaves_api IS 'Armazena as chaves API geradas para cada usuário';
COMMENT ON COLUMN chaves_api.chave_api IS 'Chave API única gerada para o usuário (formato: sk_live_...)';
COMMENT ON COLUMN chaves_api.nome_chave IS 'Nome descritivo da chave (ex: "Chave Principal", "Chave para Site")';
COMMENT ON COLUMN chaves_api.ativa IS 'Indica se a chave está ativa e pode ser usada';
COMMENT ON COLUMN chaves_api.ultimo_uso IS 'Data e hora do último uso da chave';
COMMENT ON COLUMN chaves_api.permissoes IS 'Permissões específicas da chave (JSON)';

