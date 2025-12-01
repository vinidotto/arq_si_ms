#!/bin/bash

# Esperar KONG estar pronto
echo "Aguardando KONG..."
for i in {1..30}; do
  if curl -s -f http://kong:8001/services > /dev/null 2>&1; then
    echo "✓ KONG está pronto"
    break
  fi
  echo "Tentativa $i..."
  sleep 2
done

# Configurar serviços e rotas do KONG
echo "Configurando serviços e rotas do KONG..."

# ========== CLIENTE SERVICE ==========
echo "Configurando Cliente Service..."

# Criar serviço
curl -X POST http://kong:8001/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "cliente-service",
    "url": "http://cliente-service:3001",
    "protocol": "http",
    "host": "cliente-service",
    "port": 3001
  }' 2>/dev/null || echo "Serviço cliente já existe ou erro"

# Criar rota
curl -X POST http://kong:8001/services/cliente-service/routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "cliente-route",
    "paths": ["/api/clients", "/api/clientes"],
    "strip_path": false,
    "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }' 2>/dev/null || echo "Rota cliente já existe ou erro"

# Adicionar Rate Limiting Plugin
curl -X POST http://kong:8001/services/cliente-service/plugins \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rate-limiting",
    "config": {
      "minute": 10,
      "hour": 300,
      "policy": "local"
    }
  }' 2>/dev/null || echo "Plugin rate-limit cliente já existe ou erro"

# ========== PRODUTO SERVICE ==========
echo "Configurando Produto Service..."

curl -X POST http://kong:8001/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "produto-service",
    "url": "http://produto-service:3002",
    "protocol": "http",
    "host": "produto-service",
    "port": 3002
  }' 2>/dev/null || echo "Serviço produto já existe ou erro"

curl -X POST http://kong:8001/services/produto-service/routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "produto-route",
    "paths": ["/api/products", "/api/produtos"],
    "strip_path": false,
    "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }' 2>/dev/null || echo "Rota produto já existe ou erro"

curl -X POST http://kong:8001/services/produto-service/plugins \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rate-limiting",
    "config": {
      "minute": 10,
      "hour": 300,
      "policy": "local"
    }
  }' 2>/dev/null || echo "Plugin rate-limit produto já existe ou erro"

# ========== PEDIDOS SERVICE ==========
echo "Configurando Pedidos Service..."

curl -X POST http://kong:8001/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pedidos-service",
    "url": "http://pedidos-service:3003",
    "protocol": "http",
    "host": "pedidos-service",
    "port": 3003
  }' 2>/dev/null || echo "Serviço pedidos já existe ou erro"

curl -X POST http://kong:8001/services/pedidos-service/routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pedidos-route",
    "paths": ["/api/orders", "/api/pedidos"],
    "strip_path": false,
    "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }' 2>/dev/null || echo "Rota pedidos já existe ou erro"

curl -X POST http://kong:8001/services/pedidos-service/plugins \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rate-limiting",
    "config": {
      "minute": 10,
      "hour": 300,
      "policy": "local"
    }
  }' 2>/dev/null || echo "Plugin rate-limit pedidos já existe ou erro"

# ========== PAGAMENTOS SERVICE ==========
echo "Configurando Pagamentos Service..."

curl -X POST http://kong:8001/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pagamentos-service",
    "url": "http://pagamentos-service:3002",
    "protocol": "http",
    "host": "pagamentos-service",
    "port": 3002
  }' 2>/dev/null || echo "Serviço pagamentos já existe ou erro"

curl -X POST http://kong:8001/services/pagamentos-service/routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pagamentos-route",
    "paths": ["/api/payments", "/api/pagamentos", "/api/type-payments"],
    "strip_path": false,
    "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }' 2>/dev/null || echo "Rota pagamentos já existe ou erro"

curl -X POST http://kong:8001/services/pagamentos-service/plugins \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rate-limiting",
    "config": {
      "minute": 10,
      "hour": 300,
      "policy": "local"
    }
  }' 2>/dev/null || echo "Plugin rate-limit pagamentos já existe ou erro"

echo "✓ Configuração KONG concluída!"
echo ""
echo "Serviços disponíveis:"
curl -s http://kong:8001/services | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | sort
