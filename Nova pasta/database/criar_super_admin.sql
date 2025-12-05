-- ============================================
-- SCRIPT COMPLETO: Criar Super Administrador
-- ============================================
-- Email: admin@dashboard.com
-- Senha: senha123
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Garantir que a coluna is_super_admin existe
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_super_admin ON usuarios(is_super_admin);

-- 3. Hash bcrypt válido para senha "senha123" (salt rounds: 10)
-- Atualizar ou criar usuário super admin
DO $$
BEGIN
    -- Verificar se o usuário já existe
  IF EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@dashboard.com') THEN
        -- Atualizar usuário existente
    UPDATE usuarios 
        SET 
            nome = COALESCE(nome, 'Super Administrador'),
            senha = '$2b$10$9UHzEItis/ErNITCf/SvgOTqsawEFs32B1wBeYC8vol6cTIfz6cY.',
            is_super_admin = true,
            tipo_conta = COALESCE(tipo_conta, 'dono_loja'),
            telefone = COALESCE(telefone, '+5511999999999')
    WHERE email = 'admin@dashboard.com';
        
        RAISE NOTICE '✓ Usuário admin@dashboard.com atualizado com sucesso!';
        RAISE NOTICE '  Senha: senha123';
        RAISE NOTICE '  is_super_admin: true';
  ELSE
        -- Criar novo usuário super admin
        INSERT INTO usuarios (nome, email, telefone, senha, tipo_conta, is_super_admin, data_cadastro)
    VALUES (
      'Super Administrador',
      'admin@dashboard.com',
      '+5511999999999',
            '$2b$10$9UHzEItis/ErNITCf/SvgOTqsawEFs32B1wBeYC8vol6cTIfz6cY.',
      'dono_loja',
            true,
            CURRENT_DATE
    );
        
        RAISE NOTICE '✓ Usuário admin@dashboard.com criado com sucesso!';
        RAISE NOTICE '  Senha: senha123';
        RAISE NOTICE '  is_super_admin: true';
  END IF;
END $$;

-- 4. Adicionar comentário na coluna
COMMENT ON COLUMN usuarios.is_super_admin IS 'Indica se o usuário é um super administrador com acesso ao dashboard admin';

-- 5. Verificar se foi criado/atualizado corretamente
SELECT 
    id_usuarios,
    nome,
    email,
    telefone,
    tipo_conta,
    is_super_admin,
    data_cadastro,
    CASE 
        WHEN is_super_admin = true THEN '✓ Super Admin configurado corretamente'
        ELSE '✗ ERRO: Não é Super Admin'
    END as status
FROM usuarios 
WHERE email = 'admin@dashboard.com';
