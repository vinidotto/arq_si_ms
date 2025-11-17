const express = require("express");
const router = require("./routes/routes");
const { rabbitmqProducer } = require("./messaging/rabbitmq");

const app = express();
const PORT = process.env.PORT || 3004; 

app.use(express.json());

app.use("/api", router);

// Inicializar RabbitMQ Producer
rabbitmqProducer.connect().catch(err => {
  console.error('Erro ao conectar ao RabbitMQ:', err.message);
});

process.on('SIGINT', async () => {
  await rabbitmqProducer.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Servidor de pagamentos rodando na porta ${PORT}`);
});