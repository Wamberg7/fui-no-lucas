-- Script para criar tabela de carteiras pendentes de aprovação
-- Execute este script no SQL Editor do Supabase

-- Criar tabela para armazenar dados da carteira pendentes de aprovação
CREATE TABLE IF NOT EXISTS carteira_pendente (
  id_carteira_pendente SERIAL PRIMARY KEY,
  usuarios_id_usuarios INTEGER NOT NULL REFERENCES usuarios(id_usuarios) ON DELETE CASCADE,
  cpf VARCHAR(14) NOT NULL,
  nome_completo VARCHAR(255) NOT NULL,
  chave_pix VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  observacoes TEXT,
  aprovado_por INTEGER REFERENCES usuarios(id_usuarios),
  data_solicitacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_aprovacao TIMESTAMP,
  CONSTRAINT fk_carteira_pendente_usuario FOREIGN KEY (usuarios_id_usuarios) 
    REFERENCES usuarios(id_usuarios) ON DELETE CASCADE
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_carteira_pendente_usuario ON carteira_pendente(usuarios_id_usuarios);
CREATE INDEX IF NOT EXISTS idx_carteira_pendente_status ON carteira_pendente(status);
CREATE INDEX IF NOT EXISTS idx_carteira_pendente_cpf ON carteira_pendente(cpf);

-- Comentários
COMMENT ON TABLE carteira_pendente IS 'Armazena solicitações de carteira pendentes de aprovação';
COMMENT ON COLUMN carteira_pendente.status IS 'Status: pendente, aprovado, rejeitado';

