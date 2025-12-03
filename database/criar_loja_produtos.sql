-- Script para transformar sistema de livros em loja de produtos digitais
-- Execute este script no phpMyAdmin ou via linha de comando MySQL

USE `trabalhoberg`;

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS `categorias` (
  `id_categorias` INT NOT NULL AUTO_INCREMENT,
  `nome_categoria` VARCHAR(100) NOT NULL,
  `descricao` TEXT NULL,
  `icone` VARCHAR(50) NULL COMMENT 'Ícone da categoria (bi-*)',
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_categorias`),
  UNIQUE INDEX `idx_nome_categoria` (`nome_categoria` ASC),
  INDEX `idx_ativo` (`ativo` ASC)
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS `produtos` (
  `id_produtos` INT NOT NULL AUTO_INCREMENT,
  `nome_produto` VARCHAR(255) NOT NULL,
  `descricao` TEXT NULL,
  `imagem_produto` VARCHAR(255) NULL,
  `categorias_id_categorias` INT NOT NULL,
  `preco` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `estoque` INT NOT NULL DEFAULT 0 COMMENT 'Quantidade disponível',
  `disponivel_venda` TINYINT(1) NOT NULL DEFAULT 0,
  `tipo_produto` ENUM('digital', 'fisico') NOT NULL DEFAULT 'digital',
  `envio_automatico` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Para produtos digitais',
  `destaque` TINYINT(1) NOT NULL DEFAULT 0,
  `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_produtos`),
  INDEX `fk_produtos_categorias_idx` (`categorias_id_categorias` ASC),
  INDEX `idx_nome_produto` (`nome_produto` ASC),
  INDEX `idx_disponivel` (`disponivel_venda` ASC, `estoque` ASC),
  INDEX `idx_destaque` (`destaque` ASC),
  INDEX `idx_data_cadastro` (`data_cadastro` DESC),
  CONSTRAINT `fk_produtos_categorias`
    FOREIGN KEY (`categorias_id_categorias`)
    REFERENCES `trabalhoberg`.`categorias` (`id_categorias`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- Atualizar tabela de itens_venda para usar produtos ao invés de livros
ALTER TABLE `itens_venda` 
ADD COLUMN `produtos_id_produtos` INT NULL AFTER `livros_id_livros`,
ADD INDEX `fk_itens_venda_produtos_idx` (`produtos_id_produtos` ASC);

-- Adicionar foreign key para produtos
ALTER TABLE `itens_venda`
ADD CONSTRAINT `fk_itens_venda_produtos`
  FOREIGN KEY (`produtos_id_produtos`)
  REFERENCES `produtos` (`id_produtos`)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- NOTA: Nenhuma categoria será criada automaticamente.
-- Você precisa criar categorias manualmente através do painel administrativo antes de cadastrar produtos.

