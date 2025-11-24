const express = require("express");
const router = require("./routes/routes");
const { connectProducer, disconnectProducer } = require("./config/kafka");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.use("/api", router);

connectProducer().catch(error => {
  console.error('Falha ao conectar o Kafka Producer:', error);
});

process.on('SIGTERM', async () => {
  console.log('Encerrando servidor');
  await disconnectProducer();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recebido. Encerrando servidor');
  await disconnectProducer();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Servidor de pedidos rodando na porta ${PORT}`);
});