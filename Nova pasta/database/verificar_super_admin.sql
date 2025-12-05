-- Script para verificar e corrigir super administrador
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar todos os usuários e seus status de super admin
SELECT 
    id_usuarios,
    nome,
    email,
    telefone,
    is_super_admin,
    tipo_conta,
    data_cadastro,
    CASE 
        WHEN is_super_admin = true THEN '✓ É Super Admin'
        WHEN is_super_admin = false THEN '✗ NÃO é Super Admin'
        WHEN is_super_admin IS NULL THEN '⚠ NULL - Precisa ser definido'
        ELSE '⚠ Valor desconhecido: ' || is_super_admin::text
    END as status
FROM usuarios 
ORDER BY is_super_admin DESC, email;

-- 2. Garantir que a coluna existe e é do tipo correto
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- 3. Tornar o usuário admin@dashboard.com super admin (se existir)
UPDATE usuarios 
SET is_super_admin = true 
WHERE email = 'admin@dashboard.com';

-- 4. Se você quiser tornar outro usuário super admin, substitua o email abaixo:
-- UPDATE usuarios 
-- SET is_super_admin = true 
-- WHERE email = 'SEU_EMAIL_AQUI@exemplo.com';

-- 5. Verificar novamente após a correção
SELECT 
    id_usuarios,
    nome,
    email,
    is_super_admin,
    CASE 
        WHEN is_super_admin = true THEN '✓ Super Admin ativado'
        ELSE '✗ Não é Super Admin'
    END as status
FROM usuarios 
WHERE email = 'admin@dashboard.com' OR is_super_admin = true;

