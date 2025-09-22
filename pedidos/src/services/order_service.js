const { PrismaClient } = require("@prisma/client");
const axios = require('axios');

const prisma = new PrismaClient();

const orderService = {
  async create(data) {
    if (!data.userId || !data.products || data.products.length === 0) {
      throw new Error('UserId and products are required');
    }

    const productSnapshots = [];
    let calculatedTotalValue = 0;

    const productDetailPromises = data.products.map(product =>
      axios.get(`http://localhost:3002/api/products/${product.productId}`)
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

      return prisma.order.create({
        data: orderToCreate
      });

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