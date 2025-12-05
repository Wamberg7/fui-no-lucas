-- Script para verificar e corrigir usuário admin
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o usuário admin existe e seu status
SELECT 
    id_usuarios,
    nome,
    email,
    telefone,
    is_super_admin,
    tipo_conta,
    data_cadastro
FROM usuarios 
WHERE email = 'admin@dashboard.com';

-- 2. Se o usuário existir mas não for super admin, torná-lo super admin
UPDATE usuarios 
SET is_super_admin = true 
WHERE email = 'admin@dashboard.com';

-- 3. Se o usuário não existir, você precisará criar manualmente ou usar o script criar_super_admin.sql
-- Mas primeiro, gere um hash bcrypt válido para a senha desejada
-- Use: https://bcrypt-generator.com/ ou gere programaticamente

-- Exemplo de criação manual (SUBSTITUA O HASH DA SENHA):
-- INSERT INTO usuarios (nome, email, telefone, senha, tipo_conta, is_super_admin, data_cadastro)
-- VALUES (
--   'Super Administrador',
--   'admin@dashboard.com',
--   '+5511999999999',
--   '$2a$10$SEU_HASH_AQUI', -- Gere um hash bcrypt válido para sua senha
--   'dono_loja',
--   true,
--   CURRENT_DATE
-- );

-- 4. Verificar novamente após a correção
SELECT 
    id_usuarios,
    email,
    is_super_admin,
    CASE 
        WHEN is_super_admin = true THEN '✓ Super Admin ativado'
        ELSE '✗ Não é Super Admin'
    END as status
FROM usuarios 
WHERE email = 'admin@dashboard.com';

