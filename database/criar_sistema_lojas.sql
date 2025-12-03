-- Script para criar sistema de lojas
-- Execute este script no phpMyAdmin ou via linha de comando MySQL

USE `trabalhoberg`;

-- Criar tabela de lojas
CREATE TABLE IF NOT EXISTS `lojas` (
  `id_lojas` INT NOT NULL AUTO_INCREMENT,
  `nome_loja` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL COMMENT 'URL amigável da loja',
  `descricao` TEXT NULL,
  `logo` VARCHAR(255) NULL COMMENT 'URL da logo da loja',
  `usuarios_id_usuarios` INT NOT NULL COMMENT 'Dono da loja',
  `status` ENUM('ativa', 'pendente', 'suspensa', 'cancelada') NOT NULL DEFAULT 'ativa',
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_lojas`),
  UNIQUE INDEX `idx_slug` (`slug` ASC),
  INDEX `idx_usuario_dono` (`usuarios_id_usuarios` ASC),
  INDEX `idx_status` (`status` ASC),
  CONSTRAINT `fk_lojas_usuarios`
    FOREIGN KEY (`usuarios_id_usuarios`)
    REFERENCES `usuarios` (`id_usuarios`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- Adicionar coluna para diferenciar tipo de usuário
-- 0 = cliente (só compra), 1 = dono de loja (pode acessar dashboard)
ALTER TABLE `usuarios` 
ADD COLUMN IF NOT EXISTS `tipo_conta` ENUM('cliente', 'dono_loja') NOT NULL DEFAULT 'cliente' AFTER `tipo_usuario`,
ADD INDEX IF NOT EXISTS `idx_tipo_conta` (`tipo_conta` ASC);

-- Criar tabela para rastrear produtos por loja (opcional - para multi-loja)
-- Por enquanto, vamos deixar os produtos da loja principal
-- Mas podemos adicionar isso depois se necessário

