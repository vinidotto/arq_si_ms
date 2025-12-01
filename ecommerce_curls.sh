#!/bin/bash

GATEWAY_URL="http://localhost:9000"

echo "========================================"
echo "E-Commerce API - Collection de Curls"
echo "========================================"
echo ""

echo "### CLIENTS ###"
echo ""

echo "1. Criar novo cliente"
curl --request POST \
  --url "${GATEWAY_URL}/api/clients" \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "João Silva",
    "email": "joao@example.com"
  }'
echo ""
echo ""

echo "2. Listar todos os clientes"
curl --request GET \
  --url "${GATEWAY_URL}/api/clients"
echo ""
echo ""

echo "3. Buscar cliente por ID (ajuste o ID conforme necessário)"
curl --request GET \
  --url "${GATEWAY_URL}/api/clients/1"
echo ""
echo ""

echo "4. Atualizar cliente (ajuste o ID conforme necessário)"
curl --request PATCH \
  --url "${GATEWAY_URL}/api/clients/1" \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "João Silva Atualizado",
    "email": "joao.novo@example.com"
  }'
echo ""
echo ""

echo "5. Deletar cliente (ajuste o ID conforme necessário)"
curl --request DELETE \
  --url "${GATEWAY_URL}/api/clients/1"
echo ""
echo ""

echo "### PRODUCTS ###"
echo ""

echo "6. Criar novo produto"
curl --request POST \
  --url "${GATEWAY_URL}/api/products" \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "Notebook Dell",
    "description": "Notebook de alta performance",
    "price": 3999.99,
    "stock": 50
  }'
echo ""
echo ""

echo "7. Listar todos os produtos"
curl --request GET \
  --url "${GATEWAY_URL}/api/products"
echo ""
echo ""

echo "8. Buscar produto por ID (ajuste o ID conforme necessário)"
curl --request GET \
  --url "${GATEWAY_URL}/api/products/1"
echo ""
echo ""

echo "9. Atualizar produto (ajuste o ID conforme necessário)"
curl --request PATCH \
  --url "${GATEWAY_URL}/api/products/1" \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "Notebook Dell Pro",
    "price": 4499.99,
    "stock": 45
  }'
echo ""
echo ""

echo "10. Atualizar estoque do produto (ajuste o ID conforme necessário)"
curl --request PATCH \
  --url "${GATEWAY_URL}/api/products/1/stock" \
  --header 'Content-Type: application/json' \
  --data '{
    "quantity": -5
  }'
echo ""
echo ""

echo "11. Deletar produto (ajuste o ID conforme necessário)"
curl --request DELETE \
  --url "${GATEWAY_URL}/api/products/1"
echo ""
echo ""

echo "### PAYMENTS - TYPE PAYMENTS ###"
echo ""

echo "12. Criar novo tipo de pagamento"
curl --request POST \
  --url "${GATEWAY_URL}/api/type-payments" \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "Cartão de Crédito"
  }'
echo ""
echo ""

echo "13. Listar tipos de pagamento"
curl --request GET \
  --url "${GATEWAY_URL}/api/type-payments"
echo ""
echo ""

echo "### ORDERS ###"
echo ""

echo "14. Criar novo pedido"
curl --request POST \
  --url "${GATEWAY_URL}/api/orders" \
  --header 'Content-Type: application/json' \
  --data '{
    "userId": "user-123",
    "products": [
      {
        "productId": "product-1",
        "quantity": 2
      }
    ],
    "paymentMethods": [
      {
        "typeId": "payment-type-1",
        "typeName": "Cartão de Crédito"
      }
    ]
  }'
echo ""
echo ""

echo "15. Listar pedidos de um usuário"
curl --request GET \
  --url "${GATEWAY_URL}/api/orders?userID=user-123"
echo ""
echo ""

echo "16. Buscar pedido por ID (ajuste o ID conforme necessário)"
curl --request GET \
  --url "${GATEWAY_URL}/api/orders/1"
echo ""
echo ""

echo "17. Atualizar status do pedido"
echo "Status válidos: AGUARDANDO_PAGAMENTO, FALHA_NO_PAGAMENTO, PAGO, CANCELADO"
curl --request PATCH \
  --url "${GATEWAY_URL}/api/orders/1/status" \
  --header 'Content-Type: application/json' \
  --data '{
    "status": "PAGO"
  }'
echo ""
echo ""

echo "### PAYMENTS - PROCESS PAYMENTS ###"
echo ""

echo "18. Criar novo pagamento (ajuste os IDs conforme necessário)"
curl --request POST \
  --url "${GATEWAY_URL}/api/payments" \
  --header 'Content-Type: application/json' \
  --data '{
    "orderId": "order-1",
    "value": 7999.98,
    "typePaymentId": "payment-type-1"
  }'
echo ""
echo ""

echo "19. Processar pagamento (ajuste o ID do pagamento conforme necessário)"
curl --request PATCH \
  --url "${GATEWAY_URL}/api/payments/1/process" \
  --header 'Content-Type: application/json' \
  --data '{
    "value": 7999.98
  }'
echo ""
echo ""

echo "20. Buscar pagamentos por ID do pedido (ajuste o orderId conforme necessário)"
curl --request GET \
  --url "${GATEWAY_URL}/api/payments/order/order-1"
echo ""
echo ""

echo "### NOTIFICATIONS ###"
echo ""

echo "21. Notificar que pedido foi pago (ajuste o pedidoId conforme necessário)"
curl --request POST \
  --url "${GATEWAY_URL}/api/notifications/order-paid" \
  --header 'Content-Type: application/json' \
  --data '{
    "pedidoId": "order-1",
    "clienteEmail": "joao@example.com",
    "valor": 7999.98
  }'
echo ""
echo ""
