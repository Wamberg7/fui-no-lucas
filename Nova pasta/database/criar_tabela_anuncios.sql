-- Script para criar tabela de anúncios/avisos
-- Execute este script no SQL Editor do Supabase

-- Tabela de anúncios
CREATE TABLE IF NOT EXISTS anuncios (
  id_anuncios SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'info' CHECK (tipo IN ('info', 'aviso', 'importante', 'promocao')),
  enviado_para_todas BOOLEAN NOT NULL DEFAULT false,
  criado_por INTEGER NOT NULL,
  data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_expiracao TIMESTAMP NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT fk_anuncios_criado_por 
    FOREIGN KEY (criado_por) 
    REFERENCES usuarios(id_usuarios) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE
);

-- Tabela de relacionamento anúncios-lojas (para anúncios enviados para lojas específicas)
CREATE TABLE IF NOT EXISTS anuncios_lojas (
  id_anuncios_lojas SERIAL PRIMARY KEY,
  anuncios_id_anuncios INTEGER NOT NULL,
  lojas_id_lojas INTEGER NOT NULL,
  lido BOOLEAN NOT NULL DEFAULT false,
  data_leitura TIMESTAMP NULL,
  CONSTRAINT fk_anuncios_lojas_anuncio 
    FOREIGN KEY (anuncios_id_anuncios) 
    REFERENCES anuncios(id_anuncios) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT fk_anuncios_lojas_loja 
    FOREIGN KEY (lojas_id_lojas) 
    REFERENCES lojas(id_lojas) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  UNIQUE(anuncios_id_anuncios, lojas_id_lojas)
);

CREATE INDEX IF NOT EXISTS idx_anuncios_criado_por ON anuncios(criado_por);
CREATE INDEX IF NOT EXISTS idx_anuncios_ativo ON anuncios(ativo);
CREATE INDEX IF NOT EXISTS idx_anuncios_data_expiracao ON anuncios(data_expiracao);
CREATE INDEX IF NOT EXISTS idx_anuncios_lojas_anuncio ON anuncios_lojas(anuncios_id_anuncios);
CREATE INDEX IF NOT EXISTS idx_anuncios_lojas_loja ON anuncios_lojas(lojas_id_lojas);
CREATE INDEX IF NOT EXISTS idx_anuncios_lojas_lido ON anuncios_lojas(lido);

-- Desabilitar RLS para desenvolvimento (ou criar políticas adequadas)
ALTER TABLE anuncios DISABLE ROW LEVEL SECURITY;
ALTER TABLE anuncios_lojas DISABLE ROW LEVEL SECURITY;

-- Verificar se foram criadas corretamente
SELECT 
    tablename, 
    schemaname
FROM pg_tables 
WHERE tablename IN ('anuncios', 'anuncios_lojas');

