#!/bin/bash

BASE_URL="http://localhost:8000"
RANDOM_SUFFIX=$(date +%s)

# 1. Criar usuário e capturar ID
echo "Criando Usuário"
USER_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Teste User Dinamico $RANDOM_SUFFIX\",
    \"email\": \"teste_dinamico_$RANDOM_SUFFIX@email.com\"
  }" \
  $BASE_URL/users)

# Extrai o ID usando jq
USER_ID=$(echo $USER_RESPONSE | jq -r '.id')
echo "Usuário criado com ID: $USER_ID"

# 2. Criar produto 1 e capturar ID
echo "Criando Produto 1"
PROD1_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Notebook $RANDOM_SUFFIX\",
    \"description\": \"Notebook Dell\",
    \"price\": 3500.00,
    \"stock\": 10
  }" \
  $BASE_URL/products)

PROD1_ID=$(echo $PROD1_RESPONSE | jq -r '.id')
echo "Produto 1 criado com ID: $PROD1_ID"

# 3. Criar tipo de pagamento e capturar ID
echo "Criando Tipo de Pagamento"
PAY_TYPE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Cartão de Crédito $RANDOM_SUFFIX\"
  }" \
  $BASE_URL/type-payments)

PAY_TYPE_ID=$(echo $PAY_TYPE_RESPONSE | jq -r '.id')
echo "Tipo Pagamento criado com ID: $PAY_TYPE_ID"

# 4. Listar produtos
echo "Listando produtos"
curl -s -X GET $BASE_URL/products | jq .

# 5. Buscar usuário criado dinamicamente
echo "Buscando usuário pelo ID"
curl -s -X GET $BASE_URL/users/$USER_ID | jq .

# 6. Criar pedido usando os IDs capturados acima
echo "Criando Pedido"
ORDER_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"products\": [
      {
        \"productId\": \"$PROD1_ID\",
        \"quantity\": 2
      }
    ],
    \"paymentMethods\": [
      {
        \"typeId\": \"$PAY_TYPE_ID\"
      }
    ]
  }" \
  $BASE_URL/orders)

ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.id') 
echo "Pedido criado com ID: $ORDER_ID"

# 7. Buscar pedido por ID
echo "Buscando o pedido criado"
curl -s -X GET $BASE_URL/orders/$ORDER_ID | jq .

# 8. Buscar pagamentos por pedido e pegar o ID do pagamento gerado
echo "Buscando pagamento do pedido"
PAYMENT_RESPONSE=$(curl -s -X GET $BASE_URL/payments/order/$ORDER_ID)

# Primeiro item
PAYMENT_ID=$(echo $PAYMENT_RESPONSE | jq -r '.[0].id') 
echo "Pagamento ID: $PAYMENT_ID"

# 9. Processar pagamento
echo "Processando pagamento"
curl -s -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "value": 7000.00
  }' \
  $BASE_URL/payments/$PAYMENT_ID/process | jq .

# 10. Atualizar usuário
echo "Atualizando usuário"
curl -s -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User Atualizado"
  }' \
  $BASE_URL/users/$USER_ID | jq .

# 11. Atualizar estoque
echo "Atualizando estoque"
curl -s -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5
  }' \
  $BASE_URL/products/$PROD1_ID/stock | jq .

# 12. Cancelar pedido
echo "Cancelando pedido"
curl -s -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CANCELADO"
  }' \
  $BASE_URL/orders/$ORDER_ID/status | jq .
