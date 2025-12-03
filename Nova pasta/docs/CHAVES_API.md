# 🔑 Sistema de Chaves API

## Onde as Chaves API são Salvas?

As chaves API são armazenadas na tabela `chaves_api` no banco de dados Supabase. Cada usuário pode ter múltiplas chaves API para diferentes propósitos.

### Estrutura da Tabela

```sql
CREATE TABLE chaves_api (
  id_chave_api SERIAL PRIMARY KEY,
  usuarios_id_usuarios INTEGER NOT NULL,
  chave_api VARCHAR(255) NOT NULL UNIQUE,
  nome_chave VARCHAR(100) NOT NULL DEFAULT 'Chave Principal',
  ativa BOOLEAN NOT NULL DEFAULT true,
  ultimo_uso TIMESTAMP,
  data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_expiracao TIMESTAMP,
  permissoes JSONB DEFAULT '{}'::jsonb
);
```

## Como Funciona

### 1. **Geração de Chaves**
- As chaves são geradas automaticamente com o formato: `sk_live_` + 64 caracteres hexadecimais aleatórios
- Cada chave é única e criptograficamente segura
- A chave completa é exibida apenas uma vez após a criação

### 2. **Armazenamento**
- **Tabela principal**: `chaves_api` - Armazena todas as chaves API dos usuários
- **Tabela lojas**: `lojas.chave_api` - Armazena a chave API principal da loja (opcional, para compatibilidade)

### 3. **Segurança**
- As chaves são mascaradas na listagem (mostram apenas `sk_live_...` + últimos 8 caracteres)
- Apenas o dono da chave pode visualizar a chave completa
- Chaves podem ser ativadas/desativadas sem deletá-las
- Chaves inativas não podem ser usadas para autenticação

## Endpoints da API

### Listar Chaves API
```
GET /api/chaves-api
```
Retorna todas as chaves do usuário autenticado (mascaradas).

### Criar Nova Chave
```
POST /api/chaves-api
Body: { "nome_chave": "Chave Principal" }
```
Gera uma nova chave API e retorna a chave completa (apenas uma vez).

### Buscar Chave Completa
```
GET /api/chaves-api/[id]
```
Retorna a chave completa (apenas para o dono).

### Atualizar Chave
```
PUT /api/chaves-api/[id]
Body: { "nome_chave": "Novo Nome", "ativa": true }
```
Atualiza nome ou status da chave.

### Deletar Chave
```
DELETE /api/chaves-api/[id]
```
Remove permanentemente a chave API.

## Como Usar

### 1. Criar uma Chave API

Na página de **Configurações > Integrações**, clique em "Nova Chave":
- Digite um nome descritivo (opcional)
- Clique em "Gerar"
- **IMPORTANTE**: Copie e salve a chave imediatamente, ela não será exibida novamente

### 2. Usar a Chave API

Use a chave no header `Authorization` de suas requisições:

```javascript
fetch('https://seu-dominio.com/api/produtos', {
  headers: {
    'Authorization': 'Bearer sk_live_sua_chave_aqui'
  }
})
```

### 3. Gerenciar Chaves

- **Ativar/Desativar**: Clique no botão "Ativar" ou "Desativar" na lista
- **Copiar**: Clique no ícone de copiar para copiar a chave completa
- **Deletar**: Clique no ícone de lixeira para remover permanentemente

## Verificação de Chaves

O sistema verifica automaticamente se a chave é válida através da função `verificarChaveAPI()` em `lib/verificar-chave-api.ts`:

- Verifica se a chave existe
- Verifica se está ativa
- Verifica se não expirou (se tiver data de expiração)
- Atualiza o campo `ultimo_uso`

## Scripts SQL

Execute os seguintes scripts no Supabase SQL Editor:

1. **Criar tabela de chaves API**:
   ```sql
   -- Execute: database/criar_tabela_chaves_api.sql
   ```

2. **Adicionar coluna chave_api na tabela lojas** (opcional, para compatibilidade):
   ```sql
   -- Execute: database/adicionar_chave_api_lojas.sql
   ```

## Boas Práticas

1. ✅ **Nunca compartilhe suas chaves API**
2. ✅ **Use nomes descritivos** para identificar cada chave
3. ✅ **Desative chaves** que não estão mais em uso ao invés de deletá-las
4. ✅ **Monitore o último uso** para identificar chaves não utilizadas
5. ✅ **Delete chaves** que foram comprometidas imediatamente
6. ✅ **Use chaves diferentes** para diferentes ambientes (desenvolvimento, produção)

## Exemplo de Integração

```typescript
// 1. Obter chave API (apenas uma vez após criar)
const chaveAPI = 'sk_live_abc123...' // Salve esta chave em variável de ambiente

// 2. Usar em requisições
async function listarProdutos() {
  const response = await fetch('https://seu-dominio.com/api/produtos', {
    headers: {
      'Authorization': `Bearer ${chaveAPI}`,
      'Content-Type': 'application/json'
    }
  })
  return await response.json()
}
```

## Notas Importantes

- ⚠️ A chave completa é exibida apenas **uma vez** após a criação
- ⚠️ Se você perder a chave, será necessário criar uma nova
- ⚠️ Chaves deletadas não podem ser recuperadas
- ⚠️ Cada usuário só pode ver e gerenciar suas próprias chaves

