-- Solução SIMPLES: Desabilitar RLS na tabela usuarios
-- Execute este script no SQL Editor do Supabase
-- ATENÇÃO: Isso remove a segurança de nível de linha. Use apenas se não estiver usando Supabase Auth.

-- Desabilitar RLS na tabela usuarios
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'usuarios';

-- Se precisar reabilitar depois (não recomendado sem políticas adequadas):
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

