require('dotenv').config();
const express = require("express");
const router = require("./routes/routes");
const { rabbitmqProducer } = require("./messaging/rabbitmq");
const { kafkaConsumer } = require('./messaging/kafka');
const { limiter, payloadLimiter } = require("./middleware/rateLimiter");
const { cacheMiddleware } = require("./middleware/redisCache");

const app = express();
const PORT = process.env.PORT || 3002; 

app.set('trust proxy', 1);
app.use(payloadLimiter);
app.use(express.json());
app.use(limiter);

// Cache para GET /api/type-payments com TTL infinito (0 = sem expiracao)
app.get("/api/type-payments", cacheMiddleware(-1));

app.use("/api", router);

// Inicializar RabbitMQ Producer
rabbitmqProducer.connect().catch(err => {
  console.error('Erro ao conectar ao RabbitMQ:', err.message);
});
// Inicializar Kafka Consumer para receber intenções de pagamento publicadas por pedidos
kafkaConsumer.connect().catch(err => {
  console.error('Erro ao conectar ao Kafka (consumer):', err.message);
});

process.on('SIGINT', async () => {
  await rabbitmqProducer.close();
  await kafkaConsumer.disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Servidor de pagamentos rodando na porta ${PORT}`);
});
