const express = require("express");
const router = require("./routes/routes");
const { connect } = require("./config/rabbitmq");
const { connectConsumer, disconnectConsumer } = require("./config/kafka");

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.use("/api", router);

process.on('SIGTERM', async () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  await disconnectConsumer();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recebido. Encerrando servidor...');
  await disconnectConsumer();
  process.exit(0);
});

app.listen(PORT, async () => {
  console.log(`Servidor de pagamentos rodando na porta ${PORT}`);

  await connect();

  connectConsumer().catch(error => {
    console.error('Falha ao conectar o Kafka Consumer:', error);
  });
});