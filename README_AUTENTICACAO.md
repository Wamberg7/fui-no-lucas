# 🔐 Sistema de Autenticação

Sistema completo de autenticação com cadastro, login e dashboard isolada por usuário.

## 📋 Funcionalidades

### Cadastro
- ✅ Nome completo (obrigatório)
- ✅ E-mail (obrigatório, único)
- ✅ Telefone (obrigatório, formatado)
- ✅ CPF (obrigatório, validado)
- ✅ Senha (mínimo 6 caracteres)
- ✅ Confirmação de senha

### Login
- ✅ Autenticação por e-mail e senha
- ✅ Geração de token JWT
- ✅ Validação de credenciais
- ✅ Redirecionamento automático

### Segurança
- ✅ Senhas criptografadas com bcrypt
- ✅ Tokens JWT com expiração
- ✅ Validação de CPF real
- ✅ Middleware de proteção de rotas
- ✅ Isolamento de dados por usuário

### Dashboard Isolada
- ✅ Cada usuário vê apenas seus dados
- ✅ Produtos, vendas, pagamentos filtrados por usuário
- ✅ Saldo e carteira individuais
- ✅ Configurações por usuário

## 🚀 Como Usar

### 1. Executar Scripts SQL

Execute no Supabase SQL Editor:

1. **Adicionar campo CPF:**
```sql
-- Execute: database/adicionar_campo_cpf.sql
```

2. **Criar tabela de saques (opcional):**
```sql
-- Execute: database/criar_tabela_saques.sql
```

### 2. Configurar Variáveis de Ambiente

No arquivo `.env.local`:
```env
JWT_SECRET=seu-secret-key-super-seguro-aqui-mude-em-producao
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

### 3. Acessar o Sistema

1. **Cadastro:** `/auth/cadastro`
2. **Login:** `/auth/login`
3. **Dashboard:** `/` (após login)

## 🔒 Proteção de Rotas

Todas as rotas da dashboard são protegidas:
- `/` - Dashboard principal
- `/produtos` - Gestão de produtos
- `/categorias` - Gestão de categorias
- `/vendas` - Histórico de vendas
- `/pagamentos` - Gestão de pagamentos
- `/carteira` - Carteira do usuário
- `/configuracoes` - Configurações

## 📝 Validações

### CPF
- Formato: 000.000.000-00
- Validação dos dígitos verificadores
- Verificação de CPF único no sistema

### E-mail
- Formato válido
- E-mail único no sistema

### Telefone
- Formato: (00) 00000-0000
- Validação automática

## 🛡️ Segurança

1. **Senhas:** Criptografadas com bcrypt (10 rounds)
2. **Tokens:** JWT com expiração de 7 dias
3. **Middleware:** Proteção automática de rotas
4. **Isolamento:** Dados filtrados por usuário logado

## 📊 Isolamento de Dados

Todas as APIs filtram dados pelo usuário logado:

- **Produtos:** Apenas produtos do usuário
- **Vendas:** Apenas vendas do usuário
- **Pagamentos:** Apenas pagamentos do usuário
- **Carteira:** Saldo individual
- **Estatísticas:** Dados do usuário logado

## 🔄 Fluxo de Autenticação

1. Usuário faz cadastro → Senha criptografada → Usuário criado
2. Usuário faz login → Validação → Token JWT gerado
3. Token salvo no localStorage
4. Todas as requisições incluem token no header
5. Middleware valida token em cada requisição
6. Dados filtrados pelo ID do usuário

## ⚠️ Importante

- **JWT_SECRET:** Mude em produção para um valor seguro
- **CPF:** Validação real implementada
- **Senhas:** Nunca são retornadas nas respostas
- **Tokens:** Expiração de 7 dias (ajustável)

## 🐛 Solução de Problemas

### Erro: "Não autorizado"
- Verifique se está logado
- Verifique se o token está sendo enviado
- Faça logout e login novamente

### Erro: "CPF inválido"
- Verifique se o CPF está no formato correto
- CPF deve ter 11 dígitos válidos

### Erro: "E-mail já cadastrado"
- Use outro e-mail ou faça login

### Dados não aparecem
- Verifique se está logado
- Verifique se há dados no banco para seu usuário
- Cada usuário vê apenas seus próprios dados

