-- Script para criar tabela de saques
-- Execute este script no SQL Editor do Supabase

-- Tabela de saques
CREATE TABLE IF NOT EXISTS saques (
  id_saques SERIAL PRIMARY KEY,
  usuarios_id_usuarios INTEGER NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'concluido', 'cancelado', 'rejeitado')),
  chave_pix VARCHAR(255) NOT NULL,
  data_solicitacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_processamento TIMESTAMP NULL,
  id_transacao_pix VARCHAR(255) NULL,
  observacoes TEXT NULL,
  CONSTRAINT fk_saques_usuarios 
    FOREIGN KEY (usuarios_id_usuarios) 
    REFERENCES usuarios(id_usuarios) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usuario_saque ON saques(usuarios_id_usuarios);
CREATE INDEX IF NOT EXISTS idx_status_saque ON saques(status);
CREATE INDEX IF NOT EXISTS idx_data_solicitacao ON saques(data_solicitacao DESC);

-- Tabela de saldo (opcional - para rastrear saldo do usuário)
CREATE TABLE IF NOT EXISTS saldo_usuarios (
  id_saldo SERIAL PRIMARY KEY,
  usuarios_id_usuarios INTEGER NOT NULL UNIQUE,
  saldo_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  saldo_disponivel DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  saldo_pendente DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_saldo_usuarios 
    FOREIGN KEY (usuarios_id_usuarios) 
    REFERENCES usuarios(id_usuarios) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usuario_saldo ON saldo_usuarios(usuarios_id_usuarios);

-- Habilitar RLS
ALTER TABLE saques ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldo_usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Permitir leitura de saques próprios" ON saques FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de saques" ON saques FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de saques" ON saques FOR UPDATE USING (true);

CREATE POLICY "Permitir leitura de saldo próprio" ON saldo_usuarios FOR SELECT USING (true);
CREATE POLICY "Permitir atualização de saldo" ON saldo_usuarios FOR UPDATE USING (true);

-- Função para atualizar saldo quando uma venda é aprovada
CREATE OR REPLACE FUNCTION atualizar_saldo_venda()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status_pagamento = 'aprovado' AND OLD.status_pagamento != 'aprovado' THEN
    INSERT INTO saldo_usuarios (usuarios_id_usuarios, saldo_total, saldo_disponivel)
    VALUES (NEW.usuarios_id_usuarios, NEW.total, NEW.total)
    ON CONFLICT (usuarios_id_usuarios) 
    DO UPDATE SET 
      saldo_total = saldo_usuarios.saldo_total + NEW.total,
      saldo_disponivel = saldo_usuarios.saldo_disponivel + NEW.total,
      data_atualizacao = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar saldo automaticamente
CREATE TRIGGER trigger_atualizar_saldo
AFTER UPDATE ON vendas
FOR EACH ROW
WHEN (NEW.status_pagamento = 'aprovado' AND OLD.status_pagamento != 'aprovado')
EXECUTE FUNCTION atualizar_saldo_venda();

-- Nota: Para produção, ajuste as políticas RLS conforme suas necessidades de segurança

