#!/bin/sh
set -e

echo "Aguardando Kong inicializar..."
until curl -s http://kong:8001/status > /dev/null 2>&1; do
  sleep 3
done

echo "Configurando Kong..."

# CLIENTE SERVICE
curl -s -X POST http://kong:8001/services --data "name=cliente-service" --data "url=http://cliente-service:3001/api"
curl -s -X POST http://kong:8001/services/cliente-service/routes --data "name=users" --data "paths[]=/users" --data "strip_path=false"

# PRODUTO SERVICE
curl -s -X POST http://kong:8001/services --data "name=produto-service" --data "url=http://produto-service:3002/api"
curl -s -X POST http://kong:8001/services/produto-service/routes --data "name=products" --data "paths[]=/products" --data "strip_path=false"

# PEDIDOS SERVICE
curl -s -X POST http://kong:8001/services --data "name=pedidos-service" --data "url=http://pedidos-service:3003/api"
curl -s -X POST http://kong:8001/services/pedidos-service/routes --data "name=orders" --data "paths[]=/orders" --data "strip_path=false"

# PAGAMENTOS SERVICE
curl -s -X POST http://kong:8001/services --data "name=pagamentos-service" --data "url=http://pagamentos-service:3004/api"
curl -s -X POST http://kong:8001/services/pagamentos-service/routes --data "name=payments" --data "paths[]=/payments" --data "strip_path=false"
curl -s -X POST http://kong:8001/services/pagamentos-service/routes --data "name=type-payments" --data "paths[]=/type-payments" --data "strip_path=false"

# PLUGINS GLOBAIS
curl -s -X POST http://kong:8001/plugins --data "name=rate-limiting" --data "config.minute=10" --data "config.policy=local"
curl -s -X POST http://kong:8001/plugins --data "name=request-size-limiting" --data "config.allowed_payload_size=200"

# CACHE REDIS
curl -s -X POST http://kong:8001/routes/users/plugins --data "name=proxy-cache" --data "config.strategy=redis" --data "config.redis.host=redis" --data "config.redis.port=6379" --data "config.content_type[]=application/json" --data "config.cache_ttl=86400" --data "config.response_code[]=200"

curl -s -X POST http://kong:8001/routes/products/plugins --data "name=proxy-cache" --data "config.strategy=redis" --data "config.redis.host=redis" --data "config.redis.port=6379" --data "config.content_type[]=application/json" --data "config.cache_ttl=14400" --data "config.response_code[]=200"

curl -s -X POST http://kong:8001/routes/orders/plugins --data "name=proxy-cache" --data "config.strategy=redis" --data "config.redis.host=redis" --data "config.redis.port=6379" --data "config.content_type[]=application/json" --data "config.cache_ttl=2592000" --data "config.response_code[]=200"

curl -s -X POST http://kong:8001/routes/type-payments/plugins --data "name=proxy-cache" --data "config.strategy=redis" --data "config.redis.host=redis" --data "config.redis.port=6379" --data "config.content_type[]=application/json" --data "config.cache_ttl=31536000" --data "config.response_code[]=200"

echo "Kong configurado com sucesso!"
