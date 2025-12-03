-- Script para criar tabela de configurações de gateways de pagamento
-- Execute este script no phpMyAdmin ou via linha de comando MySQL

USE `trabalhoberg`;

-- Criar tabela de configurações de pagamento
CREATE TABLE IF NOT EXISTS `gateways_pagamento` (
  `id_gateway` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(50) NOT NULL COMMENT 'Nome do gateway (mercadopago, paypal, etc)',
  `display_name` VARCHAR(100) NOT NULL COMMENT 'Nome para exibição',
  `ativo` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Se o gateway está ativo',
  `credenciais` TEXT NULL COMMENT 'JSON com credenciais e configurações',
  `configurado` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Se está configurado',
  `data_configuracao` DATETIME NULL,
  PRIMARY KEY (`id_gateway`),
  UNIQUE INDEX `idx_nome` (`nome` ASC)
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- Inserir gateways disponíveis
INSERT INTO `gateways_pagamento` (`nome`, `display_name`, `ativo`, `configurado`) VALUES
('mercadopago', 'Mercado Pago', 0, 0),
('paypal', 'PayPal', 0, 0),
('pix', 'PIX', 0, 0),
('stripe', 'Stripe', 0, 0);

-- Adicionar campo de método de pagamento usado na tabela vendas
ALTER TABLE `vendas` 
ADD COLUMN `gateway_pagamento` VARCHAR(50) NULL COMMENT 'Gateway usado para o pagamento',
ADD COLUMN `id_pagamento_gateway` VARCHAR(255) NULL COMMENT 'ID do pagamento no gateway',
ADD COLUMN `status_pagamento` ENUM('pendente', 'aprovado', 'rejeitado', 'cancelado') NULL DEFAULT 'pendente';

