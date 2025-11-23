const { Kafka } = require('kafkajs');
const { paymentService } = require('../services/payment_service');

class KafkaConsumer {
  constructor() {
    const brokers = (process.env.KAFKA_BROKERS || 'kafka:9092').split(',');
    this.kafka = new Kafka({ clientId: 'pagamentos-service', brokers });
    this.consumer = this.kafka.consumer({ groupId: process.env.KAFKA_CONSUMER_GROUP || 'pagamentos-group' });
    this._connected = false;
  }

  async connect() {
    if (this._connected) return;
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: process.env.KAFKA_TOPIC_ORDER_PAYMENTS || 'order.payment.create', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          console.log('Mensagem Kafka recebida em pagamentos:', payload);

          await paymentService.createPayment({
            orderId: payload.orderId,
            value: payload.totalValue,
            typePaymentId: payload.typePaymentId
          });
        } catch (err) {
          console.error('Erro ao processar mensagem Kafka em pagamentos:', err.message);
        }
      }
    });

    this._connected = true;
    console.log('Kafka Consumer conectado (pagamentos)');
  }

  async disconnect() {
    if (!this._connected) return;
    await this.consumer.disconnect();
    this._connected = false;
    console.log('Kafka Consumer desconectado (pagamentos)');
  }
}

const kafkaConsumer = new KafkaConsumer();
module.exports = { kafkaConsumer };
