-- Script para criar sistema de permissões de usuários
-- Execute este script no phpMyAdmin ou via linha de comando MySQL

USE `trabalhoberg`;

-- Criar tabela de permissões de usuários
CREATE TABLE IF NOT EXISTS `permissoes_usuario` (
  `id_permissoes_usuario` INT NOT NULL AUTO_INCREMENT,
  `usuarios_id_usuarios` INT NOT NULL,
  `acesso_receita` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Acesso à Receita',
  `gerenciar_catalogo` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Gerenciar Catálogo',
  `gerenciar_loja` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Gerenciar Loja',
  `gerenciar_integracoes` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Gerenciar Integrações',
  `gerenciar_meios_pagamento` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Gerenciar Meios de Pagamento',
  `personalizacao` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Personalização',
  `sistema_fraude` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Sistema de Fraude',
  `gerenciar_notificacoes` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Gerenciar Notificações',
  `gerenciar_vendas` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Gerenciar Vendas',
  `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_permissoes_usuario`),
  UNIQUE INDEX `idx_usuario_permissao` (`usuarios_id_usuarios` ASC),
  CONSTRAINT `fk_permissoes_usuario`
    FOREIGN KEY (`usuarios_id_usuarios`)
    REFERENCES `usuarios` (`id_usuarios`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- Criar tabela de convites (opcional, para sistema de convites)
CREATE TABLE IF NOT EXISTS `convites` (
  `id_convite` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `criado_por` INT NOT NULL COMMENT 'ID do usuário que criou o convite',
  `status` ENUM('pendente', 'aceito', 'expirado', 'cancelado') NOT NULL DEFAULT 'pendente',
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_expiracao` DATETIME NULL,
  `permissoes` JSON NULL COMMENT 'Permissões que serão concedidas ao aceitar',
  PRIMARY KEY (`id_convite`),
  INDEX `idx_email` (`email` ASC),
  INDEX `idx_token` (`token` ASC),
  INDEX `idx_status` (`status` ASC),
  CONSTRAINT `fk_convites_criado_por`
    FOREIGN KEY (`criado_por`)
    REFERENCES `usuarios` (`id_usuarios`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

