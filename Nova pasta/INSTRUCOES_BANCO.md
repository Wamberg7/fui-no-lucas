# ⚠️ IMPORTANTE: Execute o Script SQL

O erro "Could not find the 'discord' column" indica que a coluna `discord` ainda não foi criada no banco de dados.

## 🔧 Solução

Execute o seguinte script SQL no **SQL Editor do Supabase**:

```sql
-- Adicionar campo CPF e Discord à tabela de usuários
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
```

## 📍 Onde executar

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Cole o script acima
4. Clique em **Run** ou **Executar**

## ✅ Após executar

Após executar o script, o cadastro funcionará normalmente com os campos opcionais Discord e CPF.

O arquivo do script está em: `database/adicionar_campo_cpf.sql`

