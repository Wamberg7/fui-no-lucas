-- Adicionar coluna tipo_usuario se não existir
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS tipo_usuario VARCHAR(20) DEFAULT 'leitor' CHECK (tipo_usuario IN ('admin', 'leitor', 'dono_loja'));

-- Atualizar registros existentes que não têm tipo_usuario
UPDATE usuarios 
SET tipo_usuario = CASE 
  WHEN tipo_conta = 'dono_loja' THEN 'dono_loja'
  ELSE 'leitor'
END
WHERE tipo_usuario IS NULL;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_tipo_usuario ON usuarios(tipo_usuario);

COMMENT ON COLUMN usuarios.tipo_usuario IS 'Tipo de usuário: admin, leitor ou dono_loja';

