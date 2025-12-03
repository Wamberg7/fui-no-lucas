-- ============================================
-- SCRIPT DE ATUALIZAÇÃO DO BANCO DE DADOS
-- Execute este script no phpMyAdmin ou MySQL
-- ============================================

USE `trabalhoberg`;

-- Verificar e adicionar coluna imagem_capa (se não existir)
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'trabalhoberg' 
    AND TABLE_NAME = 'livros' 
    AND COLUMN_NAME = 'imagem_capa'
);

SET @sql1 = IF(@col_exists = 0,
    'ALTER TABLE `livros` ADD COLUMN `imagem_capa` VARCHAR(255) NULL AFTER `ano_publicado`',
    'SELECT "Coluna imagem_capa já existe" AS mensagem'
);

PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- Verificar e adicionar coluna series_id_series (se não existir)
SET @col_exists2 = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'trabalhoberg' 
    AND TABLE_NAME = 'livros' 
    AND COLUMN_NAME = 'series_id_series'
);

SET @sql2 = IF(@col_exists2 = 0,
    'ALTER TABLE `livros` ADD COLUMN `series_id_series` INT NULL AFTER `autores_id_autores`',
    'SELECT "Coluna series_id_series já existe" AS mensagem'
);

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Verificar e adicionar índice (se não existir)
SET @idx_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'trabalhoberg' 
    AND TABLE_NAME = 'livros' 
    AND INDEX_NAME = 'fk_livros_series_idx'
);

SET @sql3 = IF(@idx_exists = 0,
    'ALTER TABLE `livros` ADD INDEX `fk_livros_series_idx` (`series_id_series` ASC)',
    'SELECT "Índice fk_livros_series_idx já existe" AS mensagem'
);

PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

-- Verificar e adicionar foreign key (se não existir)
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'trabalhoberg' 
    AND TABLE_NAME = 'livros' 
    AND CONSTRAINT_NAME = 'fk_livros_series'
);

SET @sql4 = IF(@fk_exists = 0,
    'ALTER TABLE `livros` ADD CONSTRAINT `fk_livros_series` FOREIGN KEY (`series_id_series`) REFERENCES `series` (`id_series`) ON DELETE SET NULL ON UPDATE NO ACTION',
    'SELECT "Foreign key fk_livros_series já existe" AS mensagem'
);

PREPARE stmt4 FROM @sql4;
EXECUTE stmt4;
DEALLOCATE PREPARE stmt4;

SELECT '✅ Atualização do banco concluída!' AS resultado;

