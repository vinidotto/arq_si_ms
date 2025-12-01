require('dotenv').config();
const express = require("express");
const router = require("./routes/routes");
const { limiter, payloadLimiter } = require("./middleware/rateLimiter");
const { cacheMiddleware } = require("./middleware/redisCache");

const app = express();
const PORT = process.env.PORT || 3003; 

app.set('trust proxy', 1);
app.use(payloadLimiter);
app.use(express.json());
app.use(limiter);

// Cache para GET /api/orders/:id com TTL de 30 dias (2592000 segundos)
app.get(/^\/api\/orders\/[^/]+$/, cacheMiddleware(2592000));

app.use("/api", router);

// Inicializar Kafka Producer
const { kafkaProducer } = require('./messaging/kafka');
kafkaProducer.connect().catch(err => {
  console.error('Erro ao conectar ao Kafka (producer):', err.message);
});

process.on('SIGINT', async () => {
  await kafkaProducer.disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Servidor de pedidos rodando na porta ${PORT}`);
});
