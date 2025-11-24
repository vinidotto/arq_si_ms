const amqp = require('amqplib');
const { notificationService } = require('../services/notification_service');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';
const QUEUE_NAME = 'pagamentos-aprovados';

let channel = null;
let connection = null;

async function connect() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log('Conectado ao RabbitMQ (Notificações)');

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

async function startConsumer() {
  try {
    if (!channel) {
      await connect();
    }

    console.log(`Aguardando mensagens na fila: ${QUEUE_NAME}`);

    channel.consume(
      QUEUE_NAME,
      async (message) => {
        if (message) {
          try {
            const content = JSON.parse(message.content.toString());
            console.log('Mensagem recebida da fila:', content);

            await notificationService.notifyOrderPaid(content);

            channel.ack(message);
            console.log('Mensagem processada com sucesso');
          } catch (error) {
            console.error('Erro ao processar mensagem:', error.message);
            channel.nack(message, false, false);
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error('Erro ao iniciar consumer:', error.message);
    setTimeout(startConsumer, 5000);
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
  startConsumer,
  close,
  QUEUE_NAME
};
