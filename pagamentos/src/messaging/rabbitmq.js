const amqp = require('amqplib');

class RabbitMQProducer {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queue = 'payment_notifications';
    }

    async connect() {
        try {
            const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(this.queue, { durable: true });
            console.log('RabbitMQ Producer conectado com sucesso');
        } catch (error) {
            console.error('Erro ao conectar ao RabbitMQ:', error.message);
            // Tentar reconectar após 5 segundos
            setTimeout(() => this.connect(), 5000);
        }
    }

    async publishPaymentNotification(message) {
        try {
            if (!this.channel) {
                console.warn('Canal RabbitMQ não disponível. Tentando reconectar...');
                await this.connect();
            }

            const messageBuffer = Buffer.from(JSON.stringify(message));
            this.channel.sendToQueue(this.queue, messageBuffer, {
                persistent: true
            });
            console.log('Mensagem publicada no RabbitMQ:', message);
        } catch (error) {
            console.error('Erro ao publicar mensagem no RabbitMQ:', error.message);
        }
    }

    async close() {
        try {
            if (this.channel) await this.channel.close();
            if (this.connection) await this.connection.close();
            console.log('RabbitMQ Producer desconectado');
        } catch (error) {
            console.error('Erro ao fechar conexão RabbitMQ:', error.message);
        }
    }
}

const rabbitmqProducer = new RabbitMQProducer();

module.exports = { rabbitmqProducer };
