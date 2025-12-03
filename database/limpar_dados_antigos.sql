-- Script para limpar dados antigos que não têm usuarios_id_usuarios
-- Execute este script APÓS executar corrigir_banco_completo.sql
-- ATENÇÃO: Este script vai DELETAR produtos e categorias que não têm usuarios_id_usuarios

-- Deletar produtos sem usuarios_id_usuarios (dados antigos)
DELETE FROM produtos 
WHERE usuarios_id_usuarios IS NULL;

-- Deletar categorias sem usuarios_id_usuarios (dados antigos)
DELETE FROM categorias 
WHERE usuarios_id_usuarios IS NULL;

-- Deletar vendas sem usuarios_id_usuarios (dados antigos)
DELETE FROM vendas 
WHERE usuarios_id_usuarios IS NULL;

-- Deletar TODOS os saldos antigos (para garantir que cada usuário comece do zero)
-- ATENÇÃO: Isso vai deletar TODOS os saldos. Cada usuário terá que começar do zero.
DELETE FROM saldo_usuarios;

-- Ou, se preferir manter saldos válidos, apenas deletar os sem usuarios_id_usuarios:
-- DELETE FROM saldo_usuarios WHERE usuarios_id_usuarios IS NULL;

-- Deletar saques sem usuarios_id_usuarios (dados antigos)
DELETE FROM saques 
WHERE usuarios_id_usuarios IS NULL;

-- Comentário: Este script remove todos os dados que não estão associados a um usuário
-- Isso garante que cada usuário veja apenas seus próprios dados

