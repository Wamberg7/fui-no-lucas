-- Script de migração para Supabase (PostgreSQL) - Sistema de Produtos
-- Versão 2 - Com tratamento de tabelas existentes
-- Execute este script no SQL Editor do Supabase

-- Criar extensão se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- REMOVER TABELAS ANTIGAS (se existirem)
-- ============================================
-- Remover em ordem reversa devido às foreign keys
DROP TABLE IF EXISTS itens_venda CASCADE;
DROP TABLE IF EXISTS vendas CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS lojas CASCADE;
-- Não remover usuarios se já tiver dados importantes

-- ============================================
-- CRIAR TABELAS
-- ============================================

-- Tabela de usuários (base) - apenas criar se não existir
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuarios SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  telefone VARCHAR(20),
  senha VARCHAR(255),
  tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'leitor' CHECK (tipo_usuario IN ('admin', 'leitor')),
  tipo_conta VARCHAR(20) DEFAULT 'cliente' CHECK (tipo_conta IN ('cliente', 'dono_loja')),
  data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_nome_usuario ON usuarios(nome);
CREATE INDEX IF NOT EXISTS idx_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_tipo_usuario ON usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_tipo_conta ON usuarios(tipo_conta);

-- Tabela de categorias
CREATE TABLE categorias (
  id_categorias SERIAL PRIMARY KEY,
  nome_categoria VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  icone VARCHAR(50),
  ativo BOOLEAN NOT NULL DEFAULT true,
  data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nome_categoria ON categorias(nome_categoria);
CREATE INDEX idx_ativo ON categorias(ativo);

-- Tabela de produtos
CREATE TABLE produtos (
  id_produtos SERIAL PRIMARY KEY,
  nome_produto VARCHAR(255) NOT NULL,
  descricao TEXT,
  imagem_produto VARCHAR(255),
  categorias_id_categorias INTEGER NOT NULL,
  preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estoque INTEGER NOT NULL DEFAULT 0,
  disponivel_venda BOOLEAN NOT NULL DEFAULT false,
  tipo_produto VARCHAR(20) NOT NULL DEFAULT 'digital' CHECK (tipo_produto IN ('digital', 'fisico')),
  envio_automatico BOOLEAN NOT NULL DEFAULT true,
  destaque BOOLEAN NOT NULL DEFAULT false,
  data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_produtos_categorias 
    FOREIGN KEY (categorias_id_categorias) 
    REFERENCES categorias(id_categorias) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE
);

CREATE INDEX fk_produtos_categorias_idx ON produtos(categorias_id_categorias);
CREATE INDEX idx_nome_produto ON produtos(nome_produto);
CREATE INDEX idx_disponivel ON produtos(disponivel_venda, estoque);
CREATE INDEX idx_destaque ON produtos(destaque);
CREATE INDEX idx_data_cadastro ON produtos(data_cadastro DESC);

-- Tabela de lojas
CREATE TABLE lojas (
  id_lojas SERIAL PRIMARY KEY,
  nome_loja VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  descricao TEXT,
  logo VARCHAR(255),
  usuarios_id_usuarios INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'pendente', 'suspensa', 'cancelada')),
  data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lojas_usuarios 
    FOREIGN KEY (usuarios_id_usuarios) 
    REFERENCES usuarios(id_usuarios) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE
);

CREATE INDEX idx_slug ON lojas(slug);
CREATE INDEX idx_usuario_dono ON lojas(usuarios_id_usuarios);
CREATE INDEX idx_status ON lojas(status);

-- Tabela de vendas
CREATE TABLE vendas (
  id_vendas SERIAL PRIMARY KEY,
  data_venda TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuarios_id_usuarios INTEGER NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'concluida' CHECK (status IN ('pendente', 'concluida', 'cancelada')),
  observacoes TEXT,
  CONSTRAINT fk_vendas_usuarios 
    FOREIGN KEY (usuarios_id_usuarios) 
    REFERENCES usuarios(id_usuarios) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE
);

CREATE INDEX idx_data_venda ON vendas(data_venda);
CREATE INDEX idx_usuario ON vendas(usuarios_id_usuarios);
CREATE INDEX idx_status_venda ON vendas(status);

-- Tabela de itens de venda
CREATE TABLE itens_venda (
  id_itens_venda SERIAL PRIMARY KEY,
  vendas_id_vendas INTEGER NOT NULL,
  produtos_id_produtos INTEGER NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_itens_venda_vendas 
    FOREIGN KEY (vendas_id_vendas) 
    REFERENCES vendas(id_vendas) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT fk_itens_venda_produtos 
    FOREIGN KEY (produtos_id_produtos) 
    REFERENCES produtos(id_produtos) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE
);

CREATE INDEX idx_venda ON itens_venda(vendas_id_vendas);
CREATE INDEX idx_produto ON itens_venda(produtos_id_produtos);
CREATE INDEX idx_venda_produto ON itens_venda(vendas_id_vendas, produtos_id_produtos);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Remover políticas antigas se existirem
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Habilitar Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_venda ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para leitura pública
CREATE POLICY "Permitir leitura pública de categorias" ON categorias FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de produtos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de vendas" ON vendas FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de itens_venda" ON itens_venda FOR SELECT USING (true);

-- Políticas para inserção/atualização
CREATE POLICY "Permitir inserção de categorias" ON categorias FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de categorias" ON categorias FOR UPDATE USING (true);

CREATE POLICY "Permitir inserção de produtos" ON produtos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de produtos" ON produtos FOR UPDATE USING (true);

CREATE POLICY "Permitir inserção de vendas" ON vendas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de vendas" ON vendas FOR UPDATE USING (true);

CREATE POLICY "Permitir inserção de itens_venda" ON itens_venda FOR INSERT WITH CHECK (true);

-- ============================================
-- DADOS DE EXEMPLO (Opcional)
-- ============================================

-- Inserir algumas categorias de exemplo
INSERT INTO categorias (nome_categoria, descricao, icone, ativo) VALUES
('Eletrônicos', 'Produtos eletrônicos e tecnológicos', 'bi-laptop', true),
('Roupas', 'Roupas e acessórios', 'bi-shirt', true),
('Casa', 'Produtos para casa e decoração', 'bi-house', true),
('Livros', 'Livros físicos e digitais', 'bi-book', true)
ON CONFLICT (nome_categoria) DO NOTHING;

-- Nota: Para produção, ajuste as políticas RLS conforme suas necessidades de segurança

