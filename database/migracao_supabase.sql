-- Script de migração para Supabase (PostgreSQL)
-- Este script adapta a estrutura MySQL para PostgreSQL

-- Criar extensão se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de autores
CREATE TABLE IF NOT EXISTS autores (
  id_autores SERIAL PRIMARY KEY,
  nome_autor VARCHAR(100) NOT NULL,
  nacionalidade VARCHAR(50) NOT NULL,
  data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_nome_autor ON autores(nome_autor);

-- Tabela de séries
CREATE TABLE IF NOT EXISTS series (
  id_series SERIAL PRIMARY KEY,
  nome_serie VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_nome_serie ON series(nome_serie);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuarios SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  telefone VARCHAR(20),
  senha VARCHAR(255),
  tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'leitor' CHECK (tipo_usuario IN ('admin', 'leitor')),
  tipo_conta VARCHAR(20) DEFAULT 'cliente' CHECK (tipo_conta IN ('cliente', 'dono_loja')),
  data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_nome_usuario ON usuarios(nome);
CREATE INDEX IF NOT EXISTS idx_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_tipo_usuario ON usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_tipo_conta ON usuarios(tipo_conta);

-- Tabela de livros
CREATE TABLE IF NOT EXISTS livros (
  id_livros SERIAL PRIMARY KEY,
  titulos VARCHAR(255) NOT NULL,
  ano_publicado INTEGER,
  imagem_capa VARCHAR(255),
  autores_id_autores INTEGER NOT NULL,
  series_id_series INTEGER,
  preco DECIMAL(10,2) DEFAULT 0.00,
  estoque INTEGER DEFAULT 0,
  disponivel_venda BOOLEAN DEFAULT false,
  CONSTRAINT fk_livros_autores 
    FOREIGN KEY (autores_id_autores) 
    REFERENCES autores(id_autores) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
  CONSTRAINT fk_livros_series 
    FOREIGN KEY (series_id_series) 
    REFERENCES series(id_series) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS fk_livros_autores_idx ON livros(autores_id_autores);
CREATE INDEX IF NOT EXISTS fk_livros_series_idx ON livros(series_id_series);
CREATE INDEX IF NOT EXISTS idx_titulo ON livros(titulos);
CREATE INDEX IF NOT EXISTS idx_ano ON livros(ano_publicado);

-- Tabela de lojas
CREATE TABLE IF NOT EXISTS lojas (
  id_lojas SERIAL PRIMARY KEY,
  nome_loja VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  descricao TEXT,
  logo VARCHAR(255),
  usuarios_id_usuarios INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'pendente', 'suspensa', 'cancelada')),
  data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_slug ON lojas(slug);
CREATE INDEX IF NOT EXISTS idx_usuario_dono ON lojas(usuarios_id_usuarios);
CREATE INDEX IF NOT EXISTS idx_status ON lojas(status);

ALTER TABLE lojas 
  ADD CONSTRAINT fk_lojas_usuarios 
  FOREIGN KEY (usuarios_id_usuarios) 
  REFERENCES usuarios(id_usuarios) 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE;

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
  id_vendas SERIAL PRIMARY KEY,
  data_venda TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuarios_id_usuarios INTEGER NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'concluida' CHECK (status IN ('pendente', 'concluida', 'cancelada')),
  observacoes TEXT
);

CREATE INDEX IF NOT EXISTS idx_data_venda ON vendas(data_venda);
CREATE INDEX IF NOT EXISTS idx_usuario ON vendas(usuarios_id_usuarios);
CREATE INDEX IF NOT EXISTS idx_status_venda ON vendas(status);

ALTER TABLE vendas 
  ADD CONSTRAINT fk_vendas_usuarios 
  FOREIGN KEY (usuarios_id_usuarios) 
  REFERENCES usuarios(id_usuarios) 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE;

-- Tabela de itens de venda
CREATE TABLE IF NOT EXISTS itens_venda (
  id_itens_venda SERIAL PRIMARY KEY,
  vendas_id_vendas INTEGER NOT NULL,
  livros_id_livros INTEGER NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_venda ON itens_venda(vendas_id_vendas);
CREATE INDEX IF NOT EXISTS idx_livro ON itens_venda(livros_id_livros);
CREATE INDEX IF NOT EXISTS idx_venda_livro ON itens_venda(vendas_id_vendas, livros_id_livros);

ALTER TABLE itens_venda 
  ADD CONSTRAINT fk_itens_venda_vendas 
  FOREIGN KEY (vendas_id_vendas) 
  REFERENCES vendas(id_vendas) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE,
  ADD CONSTRAINT fk_itens_venda_livros 
  FOREIGN KEY (livros_id_livros) 
  REFERENCES livros(id_livros) 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE;

-- Habilitar Row Level Security (RLS)
ALTER TABLE autores ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE livros ENABLE ROW LEVEL SECURITY;
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_venda ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para leitura pública (ajuste conforme necessário)
CREATE POLICY "Permitir leitura pública de autores" ON autores FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de séries" ON series FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de livros" ON livros FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de vendas" ON vendas FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de itens_venda" ON itens_venda FOR SELECT USING (true);

-- Nota: Para produção, ajuste as políticas RLS conforme suas necessidades de segurança

