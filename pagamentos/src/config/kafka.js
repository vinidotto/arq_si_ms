const { Kafka } = require('kafkajs');
const { paymentService } = require('../services/payment_service');

const kafka = new Kafka({
  clientId: 'pagamentos-service',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
  retry: {
    initialRetryTime: 300,
    retries: 10
  }
});

const consumer = kafka.consumer({
  groupId: 'pagamentos-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000
});

const connectConsumer = async () => {
  try {
    await consumer.connect();
    console.log('Kafka Consumer conectado com sucesso!');

    await consumer.subscribe({
      topic: 'order-created',
      fromBeginning: false
    });

    console.log('Inscrito no tópico: order-created');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const orderData = JSON.parse(message.value.toString());
          console.log(`Mensagem recebida do Kafka - Pedido ${orderData.id}:`, orderData);

          if (orderData.paymentMethods && orderData.paymentMethods.length > 0) {
            const paymentPromises = orderData.paymentMethods.map(method =>
              paymentService.createPayment({
                orderId: orderData.id,
                userId: orderData.userId,
                value: orderData.totalValue,
                typePaymentId: method.typeId,
                productSnapshots: orderData.products
              })
            );

            await Promise.all(paymentPromises);
            console.log(`Pagamentos criados com sucesso para o pedido ${orderData.id}`);
          } else {
            console.warn(`Nenhum método de pagamento encontrado para o pedido ${orderData.id}`);
          }
        } catch (error) {
          console.error('Erro ao processar mensagem do Kafka:', error);
        }
      }
    });

  } catch (error) {
    console.error('Erro ao conectar Kafka Consumer:', error);
    setTimeout(connectConsumer, 5000);
  }
};

const disconnectConsumer = async () => {
  try {
    await consumer.disconnect();
    console.log('Kafka Consumer desconectado');
  } catch (error) {
    console.error('Erro ao desconectar Kafka Consumer:', error);
  }
};

module.exports = {
  connectConsumer,
  disconnectConsumer
};
