# 🛒 E-Commerce - Arquitetura de Microserviços

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

Sistema de e-commerce desenvolvido com arquitetura de microserviços, comunicação assíncrona via RabbitMQ e orquestração com Docker Compose.

---

## 🎯 Sobre o Projeto

Sistema de e-commerce modular e escalável que implementa:

- ✅ **Arquitetura de Microserviços** - Serviços independentes e desacoplados
- ✅ **Comunicação Assíncrona** - RabbitMQ para mensageria
- ✅ **Event-Driven** - Notificações em tempo real
- ✅ **Multi-Database** - PostgreSQL e MongoDB
- ✅ **Containerização** - Docker e Docker Compose
- ✅ **ORM Moderno** - Prisma para ambos os bancos
- ✅ **Simulação de Pagamentos** 

---

## 🚀 Tecnologias

### Backend
- **Node.js 18** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma ORM** - ORM moderno para PostgreSQL e MongoDB
- **Axios** - Cliente HTTP para comunicação entre serviços

### Mensageria
- **RabbitMQ 3.13** - Message broker AMQP
- **amqplib** - Cliente RabbitMQ para Node.js

### Bancos de Dados
- **PostgreSQL 15** - Clientes, Produtos e Pagamentos
- **MongoDB 6.0** - Pedidos (com Replica Set)


### Ferramentas de Gestão
- **PgAdmin 4** - Interface para PostgreSQL
- **Mongo Express** - Interface para MongoDB
- **RabbitMQ Management** - Interface para RabbitMQ
- **Konga** - Interface de Gerenciamento do KONG
- **KONG API Gateway 3.4** - Rate limiting e roteamento centralizado

### API Gateway
- **KONG 3.4** - Gateway unificado para todos os serviços
- **Rate Limiting** - 10 requisições/minuto por padrão
- **Redis Cache** - TTLs configuráveis por rota

---

### Notificações Service
- **Porta:** 3005
- **Responsabilidade:** Consumir eventos e notificar clientes
- **Características:** Consumer RabbitMQ
- **Funcionamento:** Console log simulando notificação

---

## ⚙️ Pré-requisitos

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Git**

---

## 📦 Instalação

### 1. Clone o Repositório
```bash
git clone https://github.com/vinidotto/arq_si_ms.git
cd arq_si_ms
```

### 2. Inicie os Serviços

#### Docker Compose Manual
```bash
docker compose up -d
```

### 3. Verifique o Status
```bash
docker compose ps
```

Todos os containers devem estar com status `running` ou `healthy`.

---

## 🌐 Acessar os Serviços

### API Gateway (KONG)
- **URL:** http://localhost:9000
- **Admin API:** http://localhost:8001
- **Porta:** 9000 (proxy), 8001 (admin)

### Gerenciamento KONG (Konga)
- **URL:** http://localhost:1337
- **Conexão inicial:**
  - Name: `Local Kong`
  - Kong Admin URL: `http://kong:8001`
  - Clique em **CREATE CONNECTION**
- Depois poderá acessar o Dashboard com todos os serviços e rotas já configurados

### Bancos de Dados & Ferramentas
- **PgAdmin:** http://localhost:5050 (user: admin@admin.com / password: admin)
- **Mongo Express:** http://localhost:8081
- **RabbitMQ Management:** http://localhost:15672 (user: admin / password: admin)

### Endpoints dos Serviços (via KONG)
```bash
# Clientes
curl http://localhost:9000/api/clients
curl http://localhost:9000/api/clientes

# Produtos
curl http://localhost:9000/api/products
curl http://localhost:9000/api/produtos

# Pedidos
curl http://localhost:9000/api/orders
curl http://localhost:9000/api/pedidos

# Pagamentos
curl http://localhost:9000/api/payments
curl http://localhost:9000/api/pagamentos
curl http://localhost:9000/api/type-payments
```

---

### Comandos CLI

#### RabbitMQ
```bash
# Ver status das filas
docker exec rabbitmq rabbitmqctl list_queues name messages consumers

# Ver conexões
docker exec rabbitmq rabbitmqctl list_connections

# Ver consumidores
docker exec rabbitmq rabbitmqctl list_consumers
```

Ver mais comandos: `RABBITMQ_CLI.md`

#### Docker
```bash
# Status dos containers
docker compose ps

# Uso de recursos
docker stats

# Logs em tempo real
docker compose logs -f
```

---


## 🔒 Variáveis de Ambiente
Crie um arquivo `.env` na raiz:

```env
# MongoDB
DATABASE_URL="mongodb://orders-db:27017/pedidosdb?replicaSet=rs0&directConnection=true"

# RabbitMQ (Opcional - já tem no docker-compose)
RABBITMQ_URL="amqp://admin:admin@rabbitmq:5672"
```

### MongoDB Replica Set
```bash
# Reiniciar do zero
docker compose down orders-db orders-db-init
docker volume rm arq_si_ms_orders_mongo_data
docker compose up -d orders-db
docker compose up orders-db-init
```

## 👥 Autores

- **Vinicios Dotto** - [@vinidotto](https://github.com/vinidotto)
- **Hirruá Souza** - [@Hirrua](https://github.com/Hirrua)

---
