#!/bin/bash

# Criar usuário
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "email": "teste@email.com"
  }' \
  http://localhost:8000/users

# Criar produto 1
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook",
    "description": "Notebook Dell",
    "price": 3500.00,
    "stock": 10
  }' \
  http://localhost:8000/products

# Criar produto 2
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mouse",
    "description": "Mouse Logitech",
    "price": 150.00,
    "stock": 50
  }' \
  http://localhost:8000/products

# Criar tipo de pagamento 1
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cartão de Crédito"
  }' \
  http://localhost:8000/type-payments

# Criar tipo de pagamento 2
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "PIX"
  }' \
  http://localhost:8000/type-payments

# Listar produtos
curl -X GET http://localhost:8000/products

# Buscar usuário por ID
curl -X GET http://localhost:8000/users/e26022db-e826-4b56-a46b-c1958c26e966

# Listar tipos de pagamento
curl -X GET http://localhost:8000/type-payments

# Criar pedido
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "e26022db-e826-4b56-a46b-c1958c26e966",
    "products": [
      {
        "productId": "ec40399b-d90b-4c33-953f-52666b0ad341",
        "quantity": 2
      }
    ],
    "paymentMethods": [
      {
        "typeId": "23568b40-add6-4e16-bfc9-a09b3bcaa7a3"
      }
    ]
  }' \
  http://localhost:8000/orders

# Buscar pedido por ID
curl -X GET http://localhost:8000/orders/692ce80d17ece268668a02be

# Buscar pagamentos por pedido (para pegar o ID do pagamento)
curl -X GET http://localhost:8000/payments/order/692ce80d17ece268668a02be

# Processar pagamento
curl -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "value": 3499.99
  }' \
  http://localhost:8000/payments/f95d7bae-e55e-446b-8104-cf986ce4959d/process

# Buscar pagamentos por pedido novamente (verificar processamento)
curl -X GET http://localhost:8000/payments/order/692ce80d17ece268668a02be

# Atualizar usuário
curl -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User Atualizado"
  }' \
  http://localhost:8000/users/e26022db-e826-4b56-a46b-c1958c26e966

# Atualizar estoque do produto
curl -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5
  }' \
  http://localhost:8000/products/ec40399b-d90b-4c33-953f-52666b0ad341/stock

# Atualizar status do pedido
curl -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CANCELADO"
  }' \
  http://localhost:8000/orders/692ce80d17ece268668a02be/status
