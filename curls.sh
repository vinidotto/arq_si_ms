#!/bin/bash

BASE_URL="http://localhost:8000"
RANDOM_SUFFIX=$(date +%s)

echo "Criando Usuário"
USER_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Teste User Dinamico $RANDOM_SUFFIX\",
    \"email\": \"teste_dinamico_$RANDOM_SUFFIX@email.com\"
  }" \
  $BASE_URL/users)

USER_ID=$(echo $USER_RESPONSE | jq -r '.id')
echo "Usuário criado com ID: $USER_ID"

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

echo "Criando Tipo de Pagamento"
PAY_TYPE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Cartão de Crédito $RANDOM_SUFFIX\"
  }" \
  $BASE_URL/type-payments)

PAY_TYPE_ID=$(echo $PAY_TYPE_RESPONSE | jq -r '.id')
echo "Tipo Pagamento criado com ID: $PAY_TYPE_ID"

echo "Listando produtos"
curl -s -X GET $BASE_URL/products | jq .

echo "Buscando usuário pelo ID"
curl -s -X GET $BASE_URL/users/$USER_ID | jq .

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

echo "Buscando o pedido criado"
curl -s -X GET $BASE_URL/orders/$ORDER_ID | jq .

echo "Buscando pagamento do pedido"
PAYMENT_RESPONSE=$(curl -s -X GET $BASE_URL/payments/order/$ORDER_ID)

PAYMENT_ID=$(echo $PAYMENT_RESPONSE | jq -r '.[0].id')
echo "Pagamento ID: $PAYMENT_ID"

echo "Processando pagamento"
curl -s -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "value": 7000.00
  }' \
  $BASE_URL/payments/$PAYMENT_ID/process | jq .

echo "Atualizando usuário"
curl -s -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User Atualizado"
  }' \
  $BASE_URL/users/$USER_ID | jq .

echo "Atualizando estoque"
curl -s -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5
  }' \
  $BASE_URL/products/$PROD1_ID/stock | jq .

echo "Cancelando pedido"
curl -s -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CANCELADO"
  }' \
  $BASE_URL/orders/$ORDER_ID/status | jq .

echo "Criando Produto 2"
PROD2_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Mouse $RANDOM_SUFFIX\",
    \"description\": \"Mouse Logitech\",
    \"price\": 150.00,
    \"stock\": 50
  }" \
  $BASE_URL/products)

PROD2_ID=$(echo $PROD2_RESPONSE | jq -r '.id')
echo "Produto 2 criado com ID: $PROD2_ID"

echo "Criando Produto 3"
PROD3_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Teclado $RANDOM_SUFFIX\",
    \"description\": \"Teclado Mecânico\",
    \"price\": 650.00,
    \"stock\": 30
  }" \
  $BASE_URL/products)

PROD3_ID=$(echo $PROD3_RESPONSE | jq -r '.id')
echo "Produto 3 criado com ID: $PROD3_ID"

echo "Criando Tipo de Pagamento PIX"
PAY_TYPE2_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"PIX $RANDOM_SUFFIX\"
  }" \
  $BASE_URL/type-payments)

PAY_TYPE2_ID=$(echo $PAY_TYPE2_RESPONSE | jq -r '.id')
echo "Tipo Pagamento PIX criado com ID: $PAY_TYPE2_ID"

echo "Criando Tipo de Pagamento Boleto"
PAY_TYPE3_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Boleto $RANDOM_SUFFIX\"
  }" \
  $BASE_URL/type-payments)

PAY_TYPE3_ID=$(echo $PAY_TYPE3_RESPONSE | jq -r '.id')
echo "Tipo Pagamento Boleto criado com ID: $PAY_TYPE3_ID"

echo "Listando todos os usuários"
curl -s -X GET $BASE_URL/users | jq .

echo "Listando todos os tipos de pagamento"
curl -s -X GET $BASE_URL/type-payments | jq .

echo "Criando segundo pedido com múltiplos produtos"
ORDER2_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"products\": [
      {
        \"productId\": \"$PROD2_ID\",
        \"quantity\": 3
      },
      {
        \"productId\": \"$PROD3_ID\",
        \"quantity\": 1
      }
    ],
    \"paymentMethods\": [
      {
        \"typeId\": \"$PAY_TYPE2_ID\"
      }
    ]
  }" \
  $BASE_URL/orders)

ORDER2_ID=$(echo $ORDER2_RESPONSE | jq -r '.id')
echo "Segundo pedido criado com ID: $ORDER2_ID"

echo "Listando todos os pedidos"
curl -s -X GET $BASE_URL/orders | jq .

echo "Buscando produto específico por ID"
curl -s -X GET $BASE_URL/products/$PROD2_ID | jq .

echo "Atualizando produto 2"
curl -s -X PATCH \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Mouse Atualizado $RANDOM_SUFFIX\",
    \"description\": \"Mouse Logitech Atualizado\",
    \"price\": 180.00
  }" \
  $BASE_URL/products/$PROD2_ID | jq .

echo "Deletando produto 3"
curl -s -X DELETE $BASE_URL/products/$PROD3_ID | jq .

echo "Verificando produtos após deleção"
curl -s -X GET $BASE_URL/products | jq .

echo "Buscando pagamentos do segundo pedido"
PAYMENT2_RESPONSE=$(curl -s -X GET $BASE_URL/payments/order/$ORDER2_ID)
PAYMENT2_ID=$(echo $PAYMENT2_RESPONSE | jq -r '.[0].id')
echo "Pagamento 2 ID: $PAYMENT2_ID"

echo "Processando segundo pagamento"
curl -s -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "value": 1100.00
  }' \
  $BASE_URL/payments/$PAYMENT2_ID/process | jq .

echo "Atualizando status do segundo pedido para ENVIADO"
curl -s -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ENVIADO"
  }' \
  $BASE_URL/orders/$ORDER2_ID/status | jq .

echo "Deletando usuário"
curl -s -X DELETE $BASE_URL/users/$USER_ID | jq .

echo "Teste completo finalizado!"
