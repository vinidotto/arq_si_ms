const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'pedidos-service',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
  retry: {
    initialRetryTime: 300,
    retries: 10
  }
});

const producer = kafka.producer();

const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka Producer conectado com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar Kafka Producer:', error);
    setTimeout(connectProducer, 5000);
  }
};

const publishOrderCreated = async (orderData) => {
  try {
    await producer.send({
      topic: 'order-created',
      messages: [
        {
          key: orderData.id,
          value: JSON.stringify(orderData),
          headers: {
            'event-type': 'order.created',
            'timestamp': new Date().toISOString()
          }
        }
      ]
    });
    console.log(`Mensagem publicada no Kafka para o pedido ${orderData.id}`);
  } catch (error) {
    console.error('Erro ao publicar mensagem no Kafka:', error);
    throw error;
  }
};

const disconnectProducer = async () => {
  try {
    await producer.disconnect();
    console.log('Kafka Producer desconectado');
  } catch (error) {
    console.error('Erro ao desconectar Kafka Producer:', error);
  }
};

module.exports = {
  connectProducer,
  publishOrderCreated,
  disconnectProducer
};
