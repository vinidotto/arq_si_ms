const amqp = require('amqplib');

class RabbitMQConsumer {
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
            
            // Configurar prefetch para processar uma mensagem por vez
            this.channel.prefetch(1);
            
            console.log('RabbitMQ Consumer conectado com sucesso');
            console.log(`Aguardando mensagens na fila: ${this.queue}`);
            
            this.startConsuming();
        } catch (error) {
            console.error('Erro ao conectar ao RabbitMQ:', error.message);
            // Tentar reconectar após 5 segundos
            setTimeout(() => this.connect(), 5000);
        }
    }

    startConsuming() {
        this.channel.consume(this.queue, (msg) => {
            if (msg !== null) {
                try {
                    const message = JSON.parse(msg.content.toString());
                    this.handleMessage(message);
                    this.channel.ack(msg);
                } catch (error) {
                    console.error('Erro ao processar mensagem:', error.message);
                    // Rejeitar mensagem e não recolocar na fila
                    this.channel.nack(msg, false, false);
                }
            }
        });
    }

    handleMessage(message) {
        const { customerName, orderId } = message;
        console.log('\n============================================');
        console.log(`   ${customerName}, seu pedido foi PAGO com sucesso`);
        console.log(`   e será despachado em breve!`);
        console.log(`   ID do Pedido: ${orderId}`);
        console.log('============================================\n');
    }

    async close() {
        try {
            if (this.channel) await this.channel.close();
            if (this.connection) await this.connection.close();
            console.log('RabbitMQ Consumer desconectado');
        } catch (error) {
            console.error('Erro ao fechar conexão RabbitMQ:', error.message);
        }
    }
}

const rabbitmqConsumer = new RabbitMQConsumer();

module.exports = { rabbitmqConsumer };
