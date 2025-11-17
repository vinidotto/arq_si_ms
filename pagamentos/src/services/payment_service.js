const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { rabbitmqProducer } = require('../messaging/rabbitmq');
const prisma = new PrismaClient();

const paymentService = {
    async createTypePayment({ name }) {
        if (!name) {
            throw new Error('O nome do tipo de pagamento é obrigatório.');
        }

        const existingType = await prisma.typePayment.findFirst({
            where: { name: name }
        });

        if (existingType) {
            throw new Error('Este tipo de pagamento já existe.');
        }

        return prisma.typePayment.create({ data: { name } });
    },

    async getAllTypePayments() {
        return prisma.typePayment.findMany();
    },


    async createPayment(data) {
        console.log('DADOS RECEBIDOS NA CREATE PAYMENT:', data);

        const { orderId, value, typePaymentId } = data;
        if (!orderId || !value || !typePaymentId) {
            throw new Error('orderId, value e typePaymentId são obrigatórios.');
        }

        const paymentType = await prisma.typePayment.findUnique({ where: { id: typePaymentId } });
        if (!paymentType) {
            throw new Error(`Tipo de pagamento com ID ${typePaymentId} não encontrado.`);
        }

        return prisma.orderPayment.create({
            data: {
                orderId,
                value,
                typePaymentId,
                status: 'PENDENTE',
            },
        });
    },

    async findByOrderId(orderId) {
        return prisma.orderPayment.findMany({
            where: { orderId: orderId },
            include: {
                typePayment: { select: { name: true } }
            },
        });
    },

    async processPayment(paymentId, data) {
        const { value } = data;
        if (value === undefined) {
            throw new Error('O campo "value" é obrigatório no corpo da requisição.');
        }

        const payment = await prisma.orderPayment.findUnique({ where: { id: paymentId } });

        if (!payment) throw new Error(`Pagamento com ID ${paymentId} não encontrado.`);
        if (payment.status !== 'PENDENTE') throw new Error(`Este pagamento já foi processado. Status: ${payment.status}`);

        if (value !== parseFloat(payment.value)) {
            throw new Error(`O valor informado não corresponde ao valor do pedido.`);
        }

        const isSuccess = Math.random() > 0.2;
        const newStatus = isSuccess ? 'APROVADO' : 'RECUSADO';

        const updatedPayment = await prisma.orderPayment.update({
            where: { id: paymentId },
            data: { status: newStatus },
        });

        const orderStatus = isSuccess ? 'PAGO' : 'CANCELADO';
        try {
            await axios.patch(`http://pedidos-service:3003/api/orders/${payment.orderId}/status`, {
                status: orderStatus,
            });
        } catch (error) {
            console.error(`Falha ao atualizar o status do pedido ${payment.orderId}:`, error.message);
        }

        if (isSuccess) {
            try {
                // Buscar dados do pedido
                const orderResponse = await axios.get(`http://pedidos-service:3003/api/orders/${payment.orderId}`);
                const orderData = orderResponse.data || {};

                // Buscar dados do cliente
                let customerName = 'Cliente';
                if (orderData.userId) {
                    try {
                        const customerResponse = await axios.get(`http://cliente-service:3001/api/clientes/${orderData.userId}`);
                        customerName = customerResponse.data?.name || 'Cliente';
                    } catch (err) {
                        console.warn('Não foi possível buscar dados do cliente:', err.message);
                    }
                }

                // Publicar mensagem no RabbitMQ
                await rabbitmqProducer.publishPaymentNotification({
                    orderId: payment.orderId,
                    customerName: customerName,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.warn(`Erro ao processar notificação do pedido ${payment.orderId}: ${error.message}`);
            }
        }

        return updatedPayment;
    },
};

module.exports = { paymentService };
