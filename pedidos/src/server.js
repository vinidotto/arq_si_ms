const express = require("express");
const router = require("./routes/routes");

const app = express();
const PORT = process.env.PORT || 3003; 

app.use(express.json());

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