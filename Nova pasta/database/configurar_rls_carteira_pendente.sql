-- Script para configurar Row Level Security (RLS) na tabela carteira_pendente
-- Execute este script no SQL Editor do Supabase

-- Primeiro, desabilitar RLS temporariamente para permitir inserções via API
-- (Se você estiver usando autenticação do Supabase, pode manter RLS habilitado e criar políticas)

-- Opção 1: Desabilitar RLS (mais simples para APIs externas)
ALTER TABLE carteira_pendente DISABLE ROW LEVEL SECURITY;

-- OU Opção 2: Manter RLS habilitado e criar políticas (mais seguro)
-- Descomente as linhas abaixo se quiser usar RLS com políticas:

/*
-- Habilitar RLS
ALTER TABLE carteira_pendente ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários podem ver suas próprias solicitações" ON carteira_pendente;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias solicitações" ON carteira_pendente;
DROP POLICY IF EXISTS "Super admins podem ver todas as solicitações" ON carteira_pendente;
DROP POLICY IF EXISTS "Super admins podem atualizar solicitações" ON carteira_pendente;

-- Política para permitir INSERT para qualquer usuário autenticado
-- (A API já valida o usuário, então podemos permitir INSERT)
CREATE POLICY "Permitir INSERT para usuários autenticados"
  ON carteira_pendente FOR INSERT
  WITH CHECK (true);

-- Política para usuários verem suas próprias solicitações
CREATE POLICY "Usuários podem ver suas próprias solicitações"
  ON carteira_pendente FOR SELECT
  USING (true); -- Permitir todos verem (a API já filtra por usuário)

-- Política para super admins verem todas as solicitações
CREATE POLICY "Super admins podem ver todas as solicitações"
  ON carteira_pendente FOR SELECT
  USING (true);

-- Política para super admins atualizarem solicitações
CREATE POLICY "Super admins podem atualizar solicitações"
  ON carteira_pendente FOR UPDATE
  USING (true);
*/

-- Verificar se RLS está desabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'carteira_pendente';

