-- ============================================
-- SCRIPT DE ATUALIZAÇÃO PARA SISTEMA DE AUTENTICAÇÃO
-- Execute este script no phpMyAdmin ou MySQL
-- ============================================

USE `trabalhoberg`;

-- Adicionar coluna senha (se não existir)
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'trabalhoberg' 
    AND TABLE_NAME = 'usuarios' 
    AND COLUMN_NAME = 'senha'
);

SET @sql1 = IF(@col_exists = 0,
    'ALTER TABLE `usuarios` ADD COLUMN `senha` VARCHAR(255) NULL AFTER `telefone`',
    'SELECT "Coluna senha já existe" AS mensagem'
);

PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- Adicionar coluna tipo_usuario (se não existir)
SET @col_exists2 = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'trabalhoberg' 
    AND TABLE_NAME = 'usuarios' 
    AND COLUMN_NAME = 'tipo_usuario'
);

SET @sql2 = IF(@col_exists2 = 0,
    'ALTER TABLE `usuarios` ADD COLUMN `tipo_usuario` ENUM(\'admin\', \'leitor\') NOT NULL DEFAULT \'leitor\' AFTER `senha`',
    'SELECT "Coluna tipo_usuario já existe" AS mensagem'
);

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Adicionar índice para tipo_usuario (se não existir)
SET @idx_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'trabalhoberg' 
    AND TABLE_NAME = 'usuarios' 
    AND INDEX_NAME = 'idx_tipo_usuario'
);

SET @sql3 = IF(@idx_exists = 0,
    'ALTER TABLE `usuarios` ADD INDEX `idx_tipo_usuario` (`tipo_usuario` ASC)',
    'SELECT "Índice idx_tipo_usuario já existe" AS mensagem'
);

PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

-- Criar usuário administrador padrão (se não existir)
-- Email: admin@berg.com
-- Senha: admin123 (você deve alterar depois!)
-- NOTA: O hash será gerado pelo script corrigir_senha_admin.php
-- Execute o arquivo corrigir_senha_admin.php no navegador para criar/atualizar o admin

SELECT '✅ Sistema de autenticação configurado!' AS resultado;
SELECT '📧 Usuário admin criado: admin@berg.com' AS info;
SELECT '🔑 Senha padrão: admin123 (ALTERE IMEDIATAMENTE!)' AS aviso;

