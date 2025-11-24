const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';
const QUEUE_NAME = 'pagamentos-aprovados';

let channel = null;
let connection = null;

async function connect() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log('Conectado ao RabbitMQ (Pagamentos)');

    connection.on('error', (err) => {
      console.error('Erro na conexão RabbitMQ:', err);
    });

    connection.on('close', () => {
      console.warn('Conexão RabbitMQ fechada. Tentando reconectar...');
      setTimeout(connect, 5000);
    });

    return channel;
  } catch (error) {
    console.error('Erro ao conectar ao RabbitMQ:', error.message);
    setTimeout(connect, 5000);
  }
}

async function publishToQueue(message) {
  try {
    if (!channel) {
      await connect();
    }

    const messageBuffer = Buffer.from(JSON.stringify(message));
    channel.sendToQueue(QUEUE_NAME, messageBuffer, { persistent: true });
    console.log('Mensagem publicada na fila:', message);
    return true;
  } catch (error) {
    console.error('Erro ao publicar mensagem:', error.message);
    return false;
  }
}

async function close() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
  } catch (error) {
    console.error('Erro ao fechar conexão RabbitMQ:', error.message);
  }
}

module.exports = {
  connect,
  publishToQueue,
  close,
  QUEUE_NAME
};
