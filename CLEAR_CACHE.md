# Como limpar o cache do Next.js

O erro de "two parallel pages" está sendo causado pelo cache do Next.js que ainda está detectando arquivos antigos.

## Solução:

1. **Pare o servidor Next.js** (pressione `Ctrl+C` no terminal onde está rodando)

2. **Delete a pasta `.next` manualmente:**
   - Feche o VS Code/Cursor
   - Navegue até a pasta do projeto
   - Delete a pasta `.next` (pode estar bloqueada, tente novamente após fechar tudo)

3. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

## Alternativa (se não conseguir deletar .next):

Reinicie o computador e depois delete a pasta `.next` e reinicie o servidor.

