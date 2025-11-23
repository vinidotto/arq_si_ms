const express = require("express");
const router = require("./routes/routes");
const { rabbitmqProducer } = require("./messaging/rabbitmq");
const { kafkaConsumer } = require('./messaging/kafka');

const app = express();
const PORT = process.env.PORT || 3004; 

app.use(express.json());

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