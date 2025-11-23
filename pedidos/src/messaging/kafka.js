const { Kafka } = require('kafkajs');

class KafkaProducer {
  constructor() {
    const brokers = (process.env.KAFKA_BROKERS || 'kafka:9092').split(',');
    this.kafka = new Kafka({ clientId: 'pedidos-service', brokers });
    this.producer = this.kafka.producer();
    this._connected = false;
  }

  async connect() {
    if (this._connected) return;
    await this.producer.connect();
    this._connected = true;
    console.log('Kafka Producer conectado (pedidos)');
  }

  async publishPaymentIntent(payload) {
    if (!this._connected) await this.connect();
    const message = { value: JSON.stringify(payload) };
    await this.producer.send({
      topic: process.env.KAFKA_TOPIC_ORDER_PAYMENTS || 'order.payment.create',
      messages: [message],
    });
  }

  async disconnect() {
    if (!this._connected) return;
    await this.producer.disconnect();
    this._connected = false;
    console.log('Kafka Producer desconectado (pedidos)');
  }
}

const kafkaProducer = new KafkaProducer();
module.exports = { kafkaProducer };
