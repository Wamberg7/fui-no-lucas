# 🚀 Guia de Instalação Rápida

## Passo 1: Instalar Dependências

```bash
npm install
```

## Passo 2: Configurar Supabase

### 2.1 Criar Projeto no Supabase
1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha os dados do projeto
5. Aguarde a criação (pode levar alguns minutos)

### 2.2 Obter Credenciais
1. No painel do Supabase, vá em **Settings** > **API**
2. Copie a **URL** do projeto
3. Copie a **anon/public key**

### 2.3 Configurar Variáveis de Ambiente
1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**Exemplo:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..exemplo
```

## Passo 3: Criar Banco de Dados no Supabase

### 3.1 Executar Script SQL
1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Abra o arquivo `database/migracao_supabase.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor do Supabase
6. Clique em **Run** ou pressione `Ctrl+Enter`

### 3.2 Verificar Tabelas
1. Vá em **Table Editor** no menu lateral
2. Verifique se as seguintes tabelas foram criadas:
   - `autores`
   - `series`
   - `usuarios`
   - `livros`
   - `lojas`
   - `vendas`
   - `itens_venda`

## Passo 4: Executar o Projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## Passo 5: Inserir Dados de Teste (Opcional)

No SQL Editor do Supabase, execute:

```sql
-- Inserir autores de exemplo
INSERT INTO autores (nome_autor, nacionalidade, data_cadastro) VALUES
('Clarice Lispector', 'Brasil', CURRENT_DATE),
('Machado de Assis', 'Brasil', CURRENT_DATE),
('Jorge Amado', 'Brasil', CURRENT_DATE);

-- Inserir séries de exemplo
INSERT INTO series (nome_serie, descricao, data_cadastro) VALUES
('Harry Potter', 'Série de livros de fantasia sobre um jovem bruxo', CURRENT_DATE),
('O Senhor dos Anéis', 'Trilogia épica de fantasia', CURRENT_DATE);

-- Inserir livros de exemplo
INSERT INTO livros (titulos, ano_publicado, autores_id_autores, series_id_series, preco, estoque, disponivel_venda) VALUES
('A Hora da Estrela', 1977, 1, NULL, 29.90, 10, true),
('Dom Casmurro', 1899, 2, NULL, 24.90, 15, true),
('Capitães da Areia', 1937, 3, NULL, 27.90, 8, true);
```

## ✅ Pronto!

Sua dashboard está configurada e pronta para uso!

## 🔧 Solução de Problemas

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env.local` existe
- Confirme que as variáveis estão corretas
- Reinicie o servidor de desenvolvimento (`npm run dev`)

### Erro: "relation does not exist"
- Execute o script `migracao_supabase.sql` no Supabase
- Verifique se todas as tabelas foram criadas

### Dashboard não carrega dados
- Verifique as políticas RLS no Supabase
- Confirme que as políticas de leitura estão ativas
- Verifique o console do navegador para erros

### Erros de TypeScript
- Execute `npm install` novamente
- Verifique se todas as dependências foram instaladas
- Reinicie o editor/IDE

