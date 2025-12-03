# 🛍️ Dashboard de Gestão de Produtos

Dashboard completa para gerenciar produtos, categorias, vendas e estoque, com API REST própria e integração ao Supabase.

## 🚀 Funcionalidades

### Dashboard Principal
- **Estatísticas em tempo real**: Total de produtos, categorias, vendas e receita
- **Gestão de estoque**: Visualização de produtos disponíveis e sem estoque
- **Ações rápidas**: Acesso rápido às principais funcionalidades

### Gestão de Produtos
- ✅ Listar produtos com busca e filtros
- ✅ Criar novos produtos
- ✅ Editar produtos existentes
- ✅ Deletar produtos
- ✅ Controle de estoque e disponibilidade
- ✅ Produtos em destaque

### Gestão de Categorias
- ✅ Listar categorias
- ✅ Criar novas categorias
- ✅ Editar categorias
- ✅ Deletar categorias
- ✅ Ativar/desativar categorias

### Gestão de Vendas
- ✅ Visualizar histórico de vendas
- ✅ Filtrar vendas por status
- ✅ Estatísticas de receita
- ✅ Detalhes de cada venda

### API REST
- `GET /api/produtos` - Listar produtos
- `POST /api/produtos` - Criar produto
- `GET /api/produtos/[id]` - Buscar produto
- `PUT /api/produtos/[id]` - Atualizar produto
- `DELETE /api/produtos/[id]` - Deletar produto
- `GET /api/categorias` - Listar categorias
- `POST /api/categorias` - Criar categoria
- `GET /api/categorias/[id]` - Buscar categoria
- `PUT /api/categorias/[id]` - Atualizar categoria
- `DELETE /api/categorias/[id]` - Deletar categoria
- `GET /api/vendas` - Listar vendas
- `POST /api/vendas` - Criar venda (com atualização automática de estoque)
- `GET /api/estatisticas` - Estatísticas gerais

## 📋 Pré-requisitos

- Node.js 18.17+ (ou 20+ recomendado)
- Conta no Supabase
- Banco de dados configurado no Supabase

## 🔧 Instalação

1. **Instale as dependências:**
```bash
npm install
```

2. **Configure as variáveis de ambiente:**
   - Crie o arquivo `.env.local` na raiz do projeto
   - Adicione suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

3. **Execute o script SQL no Supabase:**
   - Acesse o SQL Editor no Supabase
   - Execute o arquivo `database/migracao_produtos_supabase.sql`

4. **Execute o projeto:**
```bash
npm run dev
```

5. **Acesse no navegador:**
```
http://localhost:3000
```

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas:

- **usuarios**: Usuários do sistema
- **categorias**: Categorias de produtos
- **produtos**: Produtos cadastrados
- **vendas**: Registro de vendas
- **itens_venda**: Itens de cada venda
- **lojas**: Lojas (opcional, para multi-loja)

## 📁 Estrutura do Projeto

```
├── app/
│   ├── api/                    # API REST
│   │   ├── produtos/          # Endpoints de produtos
│   │   ├── categorias/        # Endpoints de categorias
│   │   ├── vendas/            # Endpoints de vendas
│   │   └── estatisticas/      # Endpoint de estatísticas
│   ├── produtos/              # Páginas de produtos
│   ├── categorias/            # Páginas de categorias
│   ├── vendas/                # Páginas de vendas
│   ├── page.tsx               # Dashboard principal
│   └── layout.tsx             # Layout principal
├── components/                # Componentes reutilizáveis
├── lib/
│   └── supabase.ts           # Cliente Supabase e tipos
└── database/
    └── migracao_produtos_supabase.sql  # Script de migração
```

## 🎨 Tecnologias Utilizadas

- **Next.js 13** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Supabase** - Backend e banco de dados
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

## 🔒 Segurança

⚠️ **Importante**: As políticas RLS (Row Level Security) devem ser configuradas adequadamente em produção. O script SQL inclui políticas básicas para desenvolvimento.

## 📝 Uso da API

### Exemplo: Criar um produto

```javascript
const response = await fetch('/api/produtos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nome_produto: 'Produto Exemplo',
    descricao: 'Descrição do produto',
    categorias_id_categorias: 1,
    preco: 99.90,
    estoque: 10,
    disponivel_venda: true,
    tipo_produto: 'digital',
    destaque: false
  })
})

const produto = await response.json()
```

### Exemplo: Criar uma venda

```javascript
const response = await fetch('/api/vendas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    usuarios_id_usuarios: 1,
    itens: [
      {
        produtos_id_produtos: 1,
        quantidade: 2
      }
    ],
    observacoes: 'Venda realizada via API'
  })
})

const venda = await response.json()
```

## 🤝 Suporte

Para problemas ou dúvidas:
1. Verifique se as variáveis de ambiente estão configuradas
2. Confirme que as tabelas foram criadas no Supabase
3. Verifique as políticas RLS no Supabase
4. Consulte o console do navegador para erros

## 📄 Licença

Este projeto é de uso livre para fins educacionais e comerciais.
