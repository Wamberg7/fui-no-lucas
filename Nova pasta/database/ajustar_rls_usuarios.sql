-- Ajustar políticas RLS para permitir cadastro de novos usuários
-- Execute este script no SQL Editor do Supabase

-- Desabilitar RLS temporariamente para ajustar (ou criar políticas adequadas)
-- Opção 1: Desabilitar RLS (menos seguro, mas funciona)
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- OU Opção 2: Criar políticas que permitam inserção (mais seguro)
-- Primeiro, habilite RLS novamente se foi desabilitado
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política para permitir que qualquer pessoa insira um novo usuário (cadastro)
DROP POLICY IF EXISTS "Permitir cadastro de novos usuários" ON usuarios;
CREATE POLICY "Permitir cadastro de novos usuários"
ON usuarios
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Política para permitir que usuários vejam seus próprios dados
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON usuarios;
CREATE POLICY "Usuários podem ver seus próprios dados"
ON usuarios
FOR SELECT
TO authenticated
USING (auth.uid()::text = id_usuarios::text OR email = auth.email());

-- Política para permitir que usuários atualizem seus próprios dados
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON usuarios;
CREATE POLICY "Usuários podem atualizar seus próprios dados"
ON usuarios
FOR UPDATE
TO authenticated
USING (auth.uid()::text = id_usuarios::text OR email = auth.email())
WITH CHECK (auth.uid()::text = id_usuarios::text OR email = auth.email());

-- Se você não estiver usando autenticação do Supabase Auth, use esta política mais simples:
DROP POLICY IF EXISTS "Permitir cadastro público" ON usuarios;
CREATE POLICY "Permitir cadastro público"
ON usuarios
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura pública" ON usuarios;
CREATE POLICY "Permitir leitura pública"
ON usuarios
FOR SELECT
TO anon, authenticated
USING (true);

-- Comentário
COMMENT ON POLICY "Permitir cadastro de novos usuários" ON usuarios IS 'Permite que qualquer pessoa cadastre um novo usuário';

