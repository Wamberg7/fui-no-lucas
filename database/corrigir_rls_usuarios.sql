-- Corrigir RLS para permitir cadastro de usuários
-- Execute este script no SQL Editor do Supabase

-- Opção 1: Desabilitar RLS na tabela usuarios (mais simples)
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- OU Opção 2: Criar política que permite INSERT (mais seguro)
-- Primeiro, certifique-se de que RLS está habilitado
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir cadastro de novos usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir inserção de usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir cadastro público" ON usuarios;

-- Criar política para permitir INSERT (cadastro de novos usuários)
CREATE POLICY "Permitir cadastro de novos usuários"
ON usuarios
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Criar política para permitir SELECT (leitura)
DROP POLICY IF EXISTS "Permitir leitura de usuários" ON usuarios;
CREATE POLICY "Permitir leitura de usuários"
ON usuarios
FOR SELECT
TO anon, authenticated
USING (true);

-- Criar política para permitir UPDATE (atualização)
DROP POLICY IF EXISTS "Permitir atualização de usuários" ON usuarios;
CREATE POLICY "Permitir atualização de usuários"
ON usuarios
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'usuarios';

