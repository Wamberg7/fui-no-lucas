-- ============================================
-- Script para corrigir RLS na tabela lojas
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Opção 1: Desabilitar RLS (mais simples para desenvolvimento)
ALTER TABLE lojas DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desabilitado
SELECT 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS Habilitado'
        ELSE 'RLS Desabilitado'
    END as status
FROM pg_tables 
WHERE tablename = 'lojas';

-- ============================================
-- OPÇÃO 2: Criar políticas adequadas (se preferir manter RLS)
-- ============================================
-- Descomente as linhas abaixo se quiser usar políticas em vez de desabilitar RLS

/*
-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura de lojas" ON lojas;
DROP POLICY IF EXISTS "Permitir inserção de lojas" ON lojas;
DROP POLICY IF EXISTS "Permitir atualização de lojas" ON lojas;
DROP POLICY IF EXISTS "Permitir exclusão de lojas" ON lojas;

-- Habilitar RLS
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura (todos podem ver)
CREATE POLICY "Permitir leitura de lojas" ON lojas
  FOR SELECT
  USING (true);

-- Política para permitir inserção (usuários autenticados podem criar)
CREATE POLICY "Permitir inserção de lojas" ON lojas
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir atualização (usuários podem atualizar suas lojas)
CREATE POLICY "Permitir atualização de lojas" ON lojas
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Política para permitir exclusão (usuários podem excluir suas lojas)
CREATE POLICY "Permitir exclusão de lojas" ON lojas
  FOR DELETE
  USING (true);
*/
