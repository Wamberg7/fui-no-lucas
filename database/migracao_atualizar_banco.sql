-- Script de Migração para adicionar colunas faltantes
-- Execute este script no seu banco de dados MySQL

USE `trabalhoberg`;

-- Adicionar coluna imagem_capa na tabela livros (se não existir)
ALTER TABLE `livros` 
ADD COLUMN IF NOT EXISTS `imagem_capa` VARCHAR(255) NULL AFTER `ano_publicado`;

-- Adicionar coluna series_id_series na tabela livros (se não existir)
ALTER TABLE `livros` 
ADD COLUMN IF NOT EXISTS `series_id_series` INT NULL AFTER `autores_id_autores`;

-- Adicionar índice para series_id_series (se não existir)
ALTER TABLE `livros` 
ADD INDEX IF NOT EXISTS `fk_livros_series_idx` (`series_id_series` ASC);

-- Adicionar foreign key para series (se não existir)
-- Primeiro, verifique se a constraint já existe antes de adicionar
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'trabalhoberg' 
    AND TABLE_NAME = 'livros' 
    AND CONSTRAINT_NAME = 'fk_livros_series'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE `livros` 
     ADD CONSTRAINT `fk_livros_series`
     FOREIGN KEY (`series_id_series`)
     REFERENCES `trabalhoberg`.`series` (`id_series`)
     ON DELETE SET NULL
     ON UPDATE NO ACTION',
    'SELECT "Constraint fk_livros_series já existe" AS mensagem'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migração concluída com sucesso!' AS resultado;

