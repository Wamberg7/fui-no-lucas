-- Script para verificar se a tabela carteira_pendente existe e está correta
-- Execute este script no SQL Editor do Supabase

-- Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'carteira_pendente'
) AS tabela_existe;

-- Se a tabela não existir, execute o script criar_tabela_carteira_pendente.sql primeiro

-- Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'carteira_pendente'
ORDER BY ordinal_position;

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_solicitacoes FROM carteira_pendente;

-- Verificar solicitações pendentes
SELECT * FROM carteira_pendente WHERE status = 'pendente' ORDER BY data_solicitacao DESC;

