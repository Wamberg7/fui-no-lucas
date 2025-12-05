# Solução de Erro no Login Admin

Se você está recebendo o erro "E-mail ou senha incorretos" ao tentar fazer login como super admin, siga estes passos:

## 1. Verificar se o usuário existe e está configurado corretamente

Execute no SQL Editor do Supabase:

```sql
SELECT 
    id_usuarios,
    nome,
    email,
    is_super_admin,
    tipo_conta
FROM usuarios 
WHERE email = 'admin@dashboard.com';
```

## 2. Se o usuário não existir

### Opção A: Criar usuário com hash de senha válido

1. Gere um hash bcrypt para sua senha:
   ```bash
   node scripts/gerar-hash-senha.js sua_senha_aqui
   ```

2. Execute o SQL gerado no Supabase, ou use:

```sql
-- Substitua 'SEU_HASH_AQUI' pelo hash gerado pelo script
INSERT INTO usuarios (nome, email, telefone, senha, tipo_conta, is_super_admin, data_cadastro)
VALUES (
  'Super Administrador',
  'admin@dashboard.com',
  '+5511999999999',
  'SEU_HASH_AQUI', -- Cole o hash gerado aqui
  'dono_loja',
  true,
  CURRENT_DATE
);
```

### Opção B: Usar o script SQL existente

Execute o arquivo `database/criar_super_admin.sql` no Supabase, mas **IMPORTANTE**: você precisa gerar um hash bcrypt válido primeiro.

## 3. Se o usuário existir mas não for super admin

Execute:

```sql
UPDATE usuarios 
SET is_super_admin = true 
WHERE email = 'admin@dashboard.com';
```

## 4. Se a senha estiver incorreta

1. Gere um novo hash para a senha desejada:
   ```bash
   node scripts/gerar-hash-senha.js nova_senha
   ```

2. Atualize a senha no banco:
```sql
UPDATE usuarios 
SET senha = 'HASH_GERADO_AQUI'
WHERE email = 'admin@dashboard.com';
```

## 5. Verificar via API (opcional)

Você pode verificar o status do usuário acessando:
```
GET /api/admin/verificar-admin?email=admin@dashboard.com
```

## Senha Padrão

Se você não alterou nada, a senha padrão esperada é `admin123`, mas você precisa ter um hash bcrypt válido no banco de dados.

## Gerar Hash Manualmente

Se não tiver Node.js disponível, use um gerador online:
- https://bcrypt-generator.com/
- https://www.bcrypt.fr/

Cole o hash gerado no script SQL.

