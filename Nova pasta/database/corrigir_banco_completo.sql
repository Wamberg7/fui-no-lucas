-- Script completo para corrigir o banco de dados
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar coluna tipo_usuario se não existir
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS tipo_usuario VARCHAR(20) DEFAULT 'dono_loja' CHECK (tipo_usuario IN ('admin', 'leitor', 'dono_loja'));

-- Atualizar registros existentes que não têm tipo_usuario
UPDATE usuarios 
SET tipo_usuario = CASE 
  WHEN tipo_conta = 'dono_loja' THEN 'dono_loja'
  ELSE 'leitor'
END
WHERE tipo_usuario IS NULL;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_tipo_usuario ON usuarios(tipo_usuario);

-- 2. Adicionar coluna usuarios_id_usuarios nas tabelas produtos e categorias
-- Para que cada usuário tenha seus próprios produtos e categorias

-- Adicionar coluna em categorias
ALTER TABLE categorias 
ADD COLUMN IF NOT EXISTS usuarios_id_usuarios INTEGER REFERENCES usuarios(id_usuarios) ON DELETE CASCADE;

-- Adicionar coluna em produtos
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS usuarios_id_usuarios INTEGER REFERENCES usuarios(id_usuarios) ON DELETE CASCADE;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_categorias_usuario ON categorias(usuarios_id_usuarios);
CREATE INDEX IF NOT EXISTS idx_produtos_usuario ON produtos(usuarios_id_usuarios);

-- NÃO atualizar dados antigos - eles devem ser deletados
-- Se você quiser manter dados antigos, descomente as linhas abaixo:
-- UPDATE categorias 
-- SET usuarios_id_usuarios = (SELECT id_usuarios FROM usuarios WHERE tipo_conta = 'dono_loja' LIMIT 1)
-- WHERE usuarios_id_usuarios IS NULL;
-- 
-- UPDATE produtos 
-- SET usuarios_id_usuarios = (SELECT id_usuarios FROM usuarios WHERE tipo_conta = 'dono_loja' LIMIT 1)
-- WHERE usuarios_id_usuarios IS NULL;

-- IMPORTANTE: Para limpar dados antigos sem usuarios_id_usuarios, execute o script:
-- database/limpar_dados_antigos.sql

-- Comentários
COMMENT ON COLUMN usuarios.tipo_usuario IS 'Tipo de usuário: admin, leitor ou dono_loja';
COMMENT ON COLUMN categorias.usuarios_id_usuarios IS 'ID do usuário dono desta categoria';
COMMENT ON COLUMN produtos.usuarios_id_usuarios IS 'ID do usuário dono deste produto';

