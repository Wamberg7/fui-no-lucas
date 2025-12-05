# 🔐 Sistema de Super Administrador

## Visão Geral

O sistema de super administrador permite acesso exclusivo ao dashboard administrativo, onde é possível:
- Visualizar todas as lojas cadastradas
- Ver estatísticas de vendas de cada loja
- Aprovar ou rejeitar solicitações de carteira (PIX)
- Gerenciar todas as operações do sistema

## Como Criar um Super Admin

### 1. Execute o Script SQL

Execute o script `database/criar_super_admin.sql` no SQL Editor do Supabase:

```sql
-- Adicionar coluna para identificar super admins
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_usuarios_super_admin ON usuarios(is_super_admin);
```

### 2. Criar Usuário Super Admin

Você pode criar um super admin de duas formas:

#### Opção A: Via SQL (Recomendado)

```sql
-- Primeiro, gere um hash bcrypt para sua senha
-- Use: https://bcrypt-generator.com/
-- Exemplo: senha "admin123" = $2a$10$rOzJqZqZqZqZqZqZqZqZqOZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq

INSERT INTO usuarios (nome, email, telefone, senha, tipo_conta, is_super_admin)
VALUES (
  'Super Administrador',
  'admin@dashboard.com',
  '+5511999999999',
  '$2a$10$SEU_HASH_AQUI', -- Substitua pelo hash da sua senha
  'dono_loja',
  true
);
```

#### Opção B: Tornar Usuário Existente em Super Admin

```sql
-- Tornar um usuário existente em super admin
UPDATE usuarios 
SET is_super_admin = true 
WHERE email = 'seu-email@exemplo.com';
```

## Como Acessar o Dashboard Admin

### 1. Acesse a Página de Login Admin

Navegue para: `http://localhost:3000/auth/admin/login`

### 2. Faça Login

- **Email**: O email do usuário super admin
- **Senha**: A senha configurada

### 3. Dashboard Admin

Após o login bem-sucedido, você será redirecionado para `/admin` onde poderá:

#### Aba "Lojas"
- Ver todas as lojas cadastradas
- Estatísticas gerais (Total de Lojas, Total de Vendas, Receita Total)
- Buscar lojas por nome, usuário ou email
- Ver detalhes de cada loja:
  - Nome da loja e email
  - Proprietário e telefone
  - Total de vendas
  - Receita total
  - Status da loja

#### Aba "Aprovações de Carteira"
- Ver solicitações pendentes de carteira
- Filtrar por status (Pendentes, Aprovados, Rejeitados)
- Ver detalhes completos de cada solicitação:
  - Dados do usuário (nome, email, telefone)
  - CPF
  - Nome completo
  - Chave PIX
- Aprovar ou rejeitar solicitações
- Adicionar observações ao aprovar/rejeitar

## Segurança

### Proteções Implementadas

1. **Autenticação Exclusiva**: 
   - Login separado em `/auth/admin/login`
   - Verifica se o usuário tem `is_super_admin = true`

2. **Proteção de Rotas**:
   - Todas as APIs de admin verificam se o usuário é super admin
   - A página `/admin` redireciona para login se não for super admin

3. **Token JWT**:
   - Token inclui flag `isSuperAdmin: true`
   - Validação em todas as requisições

### Boas Práticas

1. ✅ **Use senha forte** para o super admin
2. ✅ **Não compartilhe** as credenciais
3. ✅ **Mude a senha** regularmente
4. ✅ **Use HTTPS** em produção
5. ✅ **Monitore** os acessos ao dashboard admin

## Estrutura de Arquivos

```
app/
├── auth/
│   └── admin/
│       └── login/
│           └── page.tsx          # Página de login do super admin
├── (dashboard)/
│   └── admin/
│       └── page.tsx               # Dashboard administrativo
└── api/
    ├── auth/
    │   └── admin/
    │       └── login/
    │           └── route.ts      # API de login do super admin
    └── admin/
        ├── lojas/
        │   └── route.ts           # API para listar lojas
        └── carteira-pendente/
            ├── route.ts           # API para gerenciar solicitações
            └── [id]/
                └── route.ts       # API para aprovar/rejeitar

database/
└── criar_super_admin.sql          # Script para criar sistema de super admin
```

## Fluxo de Aprovação de Carteira

1. **Usuário solicita carteira**:
   - Vai em Configurações > Pagamentos > Carteira > Configurar
   - Preenche CPF, Nome Completo e Chave PIX
   - Clica em "Salvar"
   - Solicitação é criada com status "pendente"

2. **Super Admin aprova**:
   - Acessa `/admin`
   - Vai na aba "Aprovações de Carteira"
   - Visualiza detalhes da solicitação
   - Clica em "Aprovar" ou "Rejeitar"
   - Pode adicionar observações

3. **Status atualizado**:
   - Solicitação muda para "aprovado" ou "rejeitado"
   - Data de aprovação é registrada
   - Usuário que aprovou é registrado

## Troubleshooting

### Erro: "Acesso negado. Apenas super administradores podem acessar."

**Solução**: Verifique se o usuário tem `is_super_admin = true` no banco de dados:

```sql
SELECT id_usuarios, nome, email, is_super_admin 
FROM usuarios 
WHERE email = 'seu-email@exemplo.com';
```

### Erro: "Credenciais inválidas ou usuário não é super admin"

**Solução**: 
1. Verifique se o email está correto
2. Verifique se a senha está correta
3. Verifique se `is_super_admin = true` no banco

### Não consigo acessar `/admin`

**Solução**: 
1. Certifique-se de estar logado como super admin
2. Acesse primeiro `/auth/admin/login`
3. Faça login com credenciais de super admin
4. Você será redirecionado automaticamente

## Notas Importantes

- ⚠️ O link "Admin" foi **removido do sidebar** para segurança
- ⚠️ Apenas acesse via URL direta: `/admin` ou `/auth/admin/login`
- ⚠️ Todos os usuários podem criar solicitações de carteira, mas apenas super admins podem aprovar
- ⚠️ O dashboard admin mostra dados de **todas as lojas**, não apenas do usuário logado


