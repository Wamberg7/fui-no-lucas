-- Adicionar coluna usuarios_id_usuarios nas tabelas produtos e categorias
-- Para que cada usuário tenha seus próprios produtos e categorias

-- Adicionar coluna em categorias
ALTER TABLE categorias 
ADD COLUMN IF NOT EXISTS usuarios_id_usuarios INTEGER REFERENCES usuarios(id_usuarios) ON DELETE CASCADE;

-- Adicionar coluna em produtos (se ainda não tiver)
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS usuarios_id_usuarios INTEGER REFERENCES usuarios(id_usuarios) ON DELETE CASCADE;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_categorias_usuario ON categorias(usuarios_id_usuarios);
CREATE INDEX IF NOT EXISTS idx_produtos_usuario ON produtos(usuarios_id_usuarios);

-- Atualizar categorias existentes para o primeiro usuário (se houver)
-- Isso é apenas para migração - novos registros devem ter usuarios_id_usuarios
UPDATE categorias 
SET usuarios_id_usuarios = (SELECT id_usuarios FROM usuarios LIMIT 1)
WHERE usuarios_id_usuarios IS NULL;

-- Atualizar produtos existentes para o primeiro usuário (se houver)
UPDATE produtos 
SET usuarios_id_usuarios = (SELECT id_usuarios FROM usuarios LIMIT 1)
WHERE usuarios_id_usuarios IS NULL;

COMMENT ON COLUMN categorias.usuarios_id_usuarios IS 'ID do usuário dono desta categoria';
COMMENT ON COLUMN produtos.usuarios_id_usuarios IS 'ID do usuário dono deste produto';

