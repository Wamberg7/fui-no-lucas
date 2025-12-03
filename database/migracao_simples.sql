-- Script de Migração SIMPLES - Execute este no MySQL
-- Use este se o script anterior der erro

USE `trabalhoberg`;

-- Adicionar coluna imagem_capa
ALTER TABLE `livros` 
ADD COLUMN `imagem_capa` VARCHAR(255) NULL AFTER `ano_publicado`;

-- Adicionar coluna series_id_series
ALTER TABLE `livros` 
ADD COLUMN `series_id_series` INT NULL AFTER `autores_id_autores`;

-- Adicionar índice
ALTER TABLE `livros` 
ADD INDEX `fk_livros_series_idx` (`series_id_series` ASC);

-- Adicionar foreign key
ALTER TABLE `livros` 
ADD CONSTRAINT `fk_livros_series`
FOREIGN KEY (`series_id_series`)
REFERENCES `series` (`id_series`)
ON DELETE SET NULL
ON UPDATE NO ACTION;

