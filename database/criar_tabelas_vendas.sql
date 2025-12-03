-- Script para criar tabelas de vendas e adicionar campos de preço/estoque aos livros
-- Execute este script no phpMyAdmin ou via linha de comando MySQL

USE `trabalhoberg`;

-- Adicionar campos de preço e estoque à tabela livros
ALTER TABLE `livros` 
ADD COLUMN `preco` DECIMAL(10,2) NULL DEFAULT 0.00 COMMENT 'Preço de venda do livro',
ADD COLUMN `estoque` INT NULL DEFAULT 0 COMMENT 'Quantidade em estoque',
ADD COLUMN `disponivel_venda` TINYINT(1) NULL DEFAULT 0 COMMENT 'Indica se o livro está disponível para venda';

-- Criar tabela de vendas
CREATE TABLE IF NOT EXISTS `vendas` (
  `id_vendas` INT NOT NULL AUTO_INCREMENT,
  `data_venda` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usuarios_id_usuarios` INT NOT NULL COMMENT 'Cliente que realizou a compra',
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pendente', 'concluida', 'cancelada') NOT NULL DEFAULT 'concluida',
  `observacoes` TEXT NULL,
  PRIMARY KEY (`id_vendas`),
  INDEX `idx_data_venda` (`data_venda` ASC),
  INDEX `idx_usuario` (`usuarios_id_usuarios` ASC),
  INDEX `idx_status` (`status` ASC),
  CONSTRAINT `fk_vendas_usuarios`
    FOREIGN KEY (`usuarios_id_usuarios`)
    REFERENCES `usuarios` (`id_usuarios`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- Criar tabela de itens de venda
CREATE TABLE IF NOT EXISTS `itens_venda` (
  `id_itens_venda` INT NOT NULL AUTO_INCREMENT,
  `vendas_id_vendas` INT NOT NULL,
  `livros_id_livros` INT NOT NULL,
  `quantidade` INT NOT NULL DEFAULT 1,
  `preco_unitario` DECIMAL(10,2) NOT NULL COMMENT 'Preço no momento da venda',
  `subtotal` DECIMAL(10,2) NOT NULL COMMENT 'quantidade * preco_unitario',
  PRIMARY KEY (`id_itens_venda`),
  INDEX `idx_venda` (`vendas_id_vendas` ASC),
  INDEX `idx_livro` (`livros_id_livros` ASC),
  CONSTRAINT `fk_itens_venda_vendas`
    FOREIGN KEY (`vendas_id_vendas`)
    REFERENCES `vendas` (`id_vendas`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_itens_venda_livros`
    FOREIGN KEY (`livros_id_livros`)
    REFERENCES `livros` (`id_livros`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- Criar índice composto para otimizar buscas
ALTER TABLE `itens_venda`
ADD INDEX `idx_venda_livro` (`vendas_id_vendas`, `livros_id_livros`);

