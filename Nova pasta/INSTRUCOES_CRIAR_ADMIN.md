# 🚀 Criar Super Administrador - Instruções Rápidas

## Credenciais de Login
- **Email:** `admin@dashboard.com`
- **Senha:** `admin123`

## Como Criar

### Opção 1: Script Rápido (Recomendado) ⚡

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Abra o arquivo `database/CRIAR_ADMIN_RAPIDO.sql`
4. Copie TODO o conteúdo
5. Cole no SQL Editor do Supabase
6. Clique em **RUN** ou pressione `Ctrl+Enter`

### Opção 2: Script Completo

Use o arquivo `database/criar_admin_completo.sql` que tem mais verificações e mensagens.

## Verificar se Funcionou

Após executar o script, você verá uma tabela mostrando:
- Email: admin@dashboard.com
- É Super Admin?: true
- Status: ✓ PRONTO PARA LOGIN

## Testar Login

1. Acesse: `http://localhost:3000/auth/admin/login`
2. Email: `admin@dashboard.com`
3. Senha: `admin123`
4. Clique em "Entrar como Super Admin"

## ⚠️ Importante

- **Mude a senha depois!** Esta é uma senha padrão.
- O script funciona mesmo se o usuário já existir (ele atualiza)
- O hash bcrypt já está incluído no script, não precisa gerar

## Problemas?

Se ainda der erro:
1. Verifique se executou o script completo
2. Execute: `SELECT * FROM usuarios WHERE email = 'admin@dashboard.com';`
3. Verifique se `is_super_admin = true`

