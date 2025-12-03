# 💳 API de Pagamentos

Documentação completa da API de pagamentos para integração com sites externos.

## 🔗 Endpoints

### 1. Criar Pagamento

**POST** `/api/pagamentos`

Cria uma nova venda com informações de pagamento e retorna o link para processar o pagamento.

#### Request Body:
```json
{
  "usuarios_id_usuarios": 1,
  "itens": [
    {
      "produtos_id_produtos": 1,
      "quantidade": 2
    },
    {
      "produtos_id_produtos": 3,
      "quantidade": 1
    }
  ],
  "metodo_pagamento": "pix",
  "observacoes": "Pedido via site",
  "dados_pagamento": {
    "cliente_ip": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  }
}
```

#### Métodos de Pagamento Disponíveis:
- `dinheiro`
- `cartao_credito`
- `cartao_debito`
- `pix`
- `boleto`
- `transferencia`

#### Response (201):
```json
{
  "id_vendas": 123,
  "usuarios_id_usuarios": 1,
  "total": 199.80,
  "status": "pendente",
  "status_pagamento": "pendente",
  "metodo_pagamento": "pix",
  "id_transacao": "TXN-1234567890-abc123",
  "link_pagamento": "https://api.pagamento.com/pix/TXN-1234567890-abc123",
  "data_venda": "2025-01-15T10:30:00Z",
  "mensagem": "Pagamento criado com sucesso. Use o link_pagamento para processar o pagamento."
}
```

### 2. Buscar Pagamento

**GET** `/api/pagamentos/[id]`

Busca os detalhes de um pagamento específico.

#### Response (200):
```json
{
  "id_vendas": 123,
  "total": 199.80,
  "status_pagamento": "aprovado",
  "metodo_pagamento": "pix",
  "id_transacao": "TXN-1234567890-abc123",
  "link_pagamento": "https://api.pagamento.com/pix/TXN-1234567890-abc123",
  "data_pagamento": "2025-01-15T10:35:00Z",
  "usuario": {
    "id_usuarios": 1,
    "nome": "João Silva",
    "email": "joao@example.com"
  },
  "itens": [
    {
      "id_itens_venda": 1,
      "quantidade": 2,
      "preco_unitario": 99.90,
      "subtotal": 199.80,
      "produto": {
        "id_produtos": 1,
        "nome_produto": "Produto Exemplo",
        "preco": 99.90
      }
    }
  ]
}
```

### 3. Listar Pagamentos

**GET** `/api/pagamentos`

Lista todos os pagamentos com filtros opcionais.

#### Query Parameters:
- `status_pagamento`: Filtrar por status (pendente, processando, aprovado, rejeitado, cancelado, reembolsado)
- `metodo_pagamento`: Filtrar por método (dinheiro, cartao_credito, cartao_debito, pix, boleto, transferencia)
- `limit`: Limitar número de resultados

#### Exemplo:
```
GET /api/pagamentos?status_pagamento=aprovado&limit=10
```

### 4. Atualizar Status do Pagamento

**PUT** `/api/pagamentos/[id]`

Atualiza o status de um pagamento. Quando o status é alterado para "aprovado", o estoque é automaticamente atualizado.

#### Request Body:
```json
{
  "status_pagamento": "aprovado",
  "dados_pagamento": {
    "gateway_response": "...",
    "transaction_id": "..."
  }
}
```

#### Status Disponíveis:
- `pendente`
- `processando`
- `aprovado` - Atualiza estoque automaticamente
- `rejeitado`
- `cancelado`
- `reembolsado`

### 5. Webhook de Pagamento

**POST** `/api/pagamentos/webhook`

Endpoint para receber notificações de gateways de pagamento (Stripe, Mercado Pago, etc.).

#### Request Body:
```json
{
  "id_transacao": "TXN-1234567890-abc123",
  "status_pagamento": "aprovado",
  "dados_pagamento": {
    "gateway": "stripe",
    "payment_intent_id": "pi_1234567890",
    "amount": 19980,
    "currency": "brl"
  }
}
```

#### Response (200):
```json
{
  "success": true,
  "venda": {
    "id_vendas": 123,
    "status_pagamento": "aprovado",
    "status": "concluida"
  }
}
```

## 📝 Exemplo de Integração

### JavaScript/TypeScript

```typescript
// Criar pagamento
async function criarPagamento(produtos: Array<{id: number, quantidade: number}>) {
  const response = await fetch('https://seu-site.com/api/pagamentos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      usuarios_id_usuarios: 1,
      itens: produtos,
      metodo_pagamento: 'pix',
      observacoes: 'Compra via site'
    })
  })

  const pagamento = await response.json()
  
  // Redirecionar para o link de pagamento
  if (pagamento.link_pagamento) {
    window.location.href = pagamento.link_pagamento
  }
  
  return pagamento
}

// Verificar status do pagamento
async function verificarPagamento(idVenda: number) {
  const response = await fetch(`https://seu-site.com/api/pagamentos/${idVenda}`)
  const pagamento = await response.json()
  
  return pagamento.status_pagamento
}

// Atualizar status (após confirmação do gateway)
async function atualizarStatusPagamento(idVenda: number, status: string) {
  const response = await fetch(`https://seu-site.com/api/pagamentos/${idVenda}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status_pagamento: status
    })
  })
  
  return await response.json()
}
```

### PHP

```php
<?php
// Criar pagamento
function criarPagamento($produtos) {
    $data = [
        'usuarios_id_usuarios' => 1,
        'itens' => $produtos,
        'metodo_pagamento' => 'pix',
        'observacoes' => 'Compra via site'
    ];
    
    $ch = curl_init('https://seu-site.com/api/pagamentos');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}
?>
```

## 🔒 Segurança

1. **Validação**: Sempre valide os dados antes de enviar
2. **HTTPS**: Use sempre HTTPS em produção
3. **Autenticação**: Considere adicionar autenticação por API key
4. **Rate Limiting**: Implemente limite de requisições por IP
5. **Webhook**: Valide a assinatura do webhook do gateway de pagamento

## 🚀 Próximos Passos

1. Execute o script SQL para adicionar os campos de pagamento:
   ```sql
   -- Execute: database/adicionar_campos_pagamento.sql
   ```

2. Integre com um gateway de pagamento real (Stripe, Mercado Pago, etc.)

3. Configure o webhook no gateway para apontar para:
   ```
   https://seu-site.com/api/pagamentos/webhook
   ```

4. Teste o fluxo completo de pagamento

