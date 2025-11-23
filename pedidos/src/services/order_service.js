const { PrismaClient } = require("@prisma/client");
const axios = require('axios');
const { kafkaProducer } = require('../messaging/kafka');

const prisma = new PrismaClient();

const orderService = {
  async create(data) {
    const { userId, products, paymentMethods } = data;
    if (!userId || !products || !paymentMethods || products.length === 0 || paymentMethods.length === 0) {
      throw new Error('UserId, products e paymentMethods são obrigatórios.');
    }

    const productSnapshots = [];
    let calculatedTotalValue = 0;

    const productDetailPromises = data.products.map(product =>
      axios.get(`http://produto-service:3002/api/products/${product.productId}`)
    );
    try {
      const productDetailResponses = await Promise.all(productDetailPromises);
      const productsFromService = productDetailResponses.map(response => response.data);

      for (let i = 0; i < data.products.length; i++) {
        const requestedProduct = data.products[i];
        const productInStock = productsFromService.find(p => p.id === requestedProduct.productId);

        if (!productInStock) {
          throw new Error(`Produto com ID ${requestedProduct.productId} não encontrado.`);
        }

        if (productInStock.stock < requestedProduct.quantity) {
          throw new Error(`Estoque insuficiente para o produto: ${productInStock.name}. Disponível: ${productInStock.stock}, Solicitado: ${requestedProduct.quantity}`);
        }

        productSnapshots.push({
          productId: productInStock.id,
          name: productInStock.name,
          price: productInStock.price,
          quantity: requestedProduct.quantity,
        });
        calculatedTotalValue += productInStock.price * requestedProduct.quantity;
      }

      const orderToCreate = {
        userId: data.userId,
        totalValue: calculatedTotalValue,
        products: productSnapshots,
        status: 'AGUARDANDO_PAGAMENTO',
      };

      const newOrder = await prisma.order.create({ data: orderToCreate });

      try {
        // Publicar intenção de pagamento via Kafka para o serviço de pagamentos processar
        const { kafkaProducer } = require('../messaging/kafka');

        const publishPromises = paymentMethods.map(method =>
          kafkaProducer.publishPaymentIntent({
            orderId: newOrder.id,
            clientId: data.userId,
            products: productSnapshots,
            productsQuantity: productSnapshots.reduce((sum, p) => sum + p.quantity, 0),
            date: newOrder.createdAt,
            totalValue: calculatedTotalValue,
            typePaymentId: method.typeId,
            typePaymentName: method.typeName || null
          })
        );

        await Promise.all(publishPromises);
      } catch (paymentError) {

        await prisma.order.delete({
          where: { id: newOrder.id }
        });

        throw new Error(`Houve um erro ao publicar a intenção de pagamento: ${paymentError.message}`);
      }

      return newOrder;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Erro ao comunicar com o serviço de produtos: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  },

  async findByUserId(userId) {
    return prisma.order.findMany({
      where: {
        userId: userId
      }
    });
  },

  async findById(id) {
    return prisma.order.findUnique({
      where: {
        id: id,
      }
    });
  },

  async updateStatus(id, status) {
    const validStatus = ['AGUARDANDO_PAGAMENTO', 'FALHA_NO_PAGAMENTO', 'PAGO', 'CANCELADO'];
    if (!validStatus.includes(status)) {
      throw new Error('Invalid status value');
    }

    if (status === 'PAGO') {
      const order = await prisma.order.findUnique({
        where: { id: id },
      });

      if (!order) {
        throw new Error('Pedido não encontrado para dar baixa no estoque.');
      }

      try {
        const stockUpdatePromises = order.products.map(product =>
          axios.patch(`http://produto-service:3002/api/products/${product.productId}/stock`, {
            quantity: -product.quantity,
          })
        );
        
        await Promise.all(stockUpdatePromises);
        console.log(`Estoque dos produtos do pedido ${id} atualizado com sucesso.`);

      } catch (error) {
        console.error(`ERRO CRÍTICO: O pagamento do pedido ${id} foi aprovado, mas falhou ao dar baixa no estoque.`, error.message);
        throw new Error(`Falha ao dar baixa no estoque: ${error.message}`);
      }
    }

    return prisma.order.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });
  },
};

module.exports = { orderService };