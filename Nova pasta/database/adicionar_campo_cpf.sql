-- Adicionar campo CPF e Discord à tabela de usuários
-- Execute este script no SQL Editor do Supabase

ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14),
ADD COLUMN IF NOT EXISTS discord VARCHAR(100),
ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS telefone_verificado BOOLEAN DEFAULT false;

-- Criar índice único apenas para CPF não nulo
CREATE UNIQUE INDEX IF NOT EXISTS idx_cpf_unique ON usuarios(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_verificado ON usuarios(email_verificado);

-- Comentários
COMMENT ON COLUMN usuarios.cpf IS 'CPF do usuário (formato: 000.000.000-00) - Opcional';
COMMENT ON COLUMN usuarios.discord IS 'ID do Discord do usuário - Opcional';
COMMENT ON COLUMN usuarios.email_verificado IS 'Indica se o e-mail foi verificado';
COMMENT ON COLUMN usuarios.telefone_verificado IS 'Indica se o telefone foi verificado';

