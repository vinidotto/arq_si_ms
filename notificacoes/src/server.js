require('dotenv').config();
const express = require('express');
const router = require('./routes/routes');
const { rabbitmqConsumer } = require('./messaging/rabbitmq');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use('/api', router);

rabbitmqConsumer.connect().catch(err => {
  console.error('Erro ao conectar ao RabbitMQ:', err.message);
});

process.on('SIGINT', async () => {
  await rabbitmqConsumer.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Serviço de notificações rodando na porta ${PORT}`);
});
