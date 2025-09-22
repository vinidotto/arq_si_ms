const { PrismaClient } = require("@prisma/client");
const axios = require('axios');

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
      axios.get(`http://localhost:3002/api/products/${product.productId}`)
    );
    console.log("TENTANDO BUSCAR PRODUTOS...");
    try {
      const productDetailResponses = await Promise.all(productDetailPromises);
      const productsFromService = productDetailResponses.map(response => response.data);
      console.log("BUSQUEI PRODUTOS...");

      for (let i = 0; i < data.products.length; i++) {
        const requestedProduct = data.products[i];
        const productInStock = productsFromService.find(p => p.id === requestedProduct.productId);

        if (!productInStock) {
          throw new Error(`Produto com ID ${requestedProduct.productId} não encontrado.`);
        }

        if (productInStock.stock < requestedProduct.quantity) {
          throw new Error(`Estoque insuficiente para o produto: ${productInStock.name}. Disponível: ${productInStock.stock}, Solicitado: ${requestedProduct.quantity}`);
        }
        console.log("3. Criando pedido snap...");

        productSnapshots.push({
          productId: productInStock.id,
          name: productInStock.name,
          price: productInStock.price,
          quantity: requestedProduct.quantity,
        });
        calculatedTotalValue += productInStock.price * requestedProduct.quantity;
      }

      const totalPaid = paymentMethods.reduce((sum, method) => sum + method.value, 0);
      if (totalPaid.toFixed(2) !== calculatedTotalValue.toFixed(2)) {
        throw new Error(`A soma dos pagamentos (${totalPaid}) não corresponde ao valor total do pedido (${calculatedTotalValue}).`);
      }

      const orderToCreate = {
        userId: data.userId,
        totalValue: calculatedTotalValue,
        products: productSnapshots,
        status: 'AGUARDANDO_PAGAMENTO',
      };

      const newOrder = await prisma.order.create({ data: orderToCreate });
      console.log("3. Criando pedido no banco de dados...");

      try { // salvar a tentativa de pagamento
        console.log("4. Registrando intenção de pagamento no serviço de pagamentos...");

        const paymentCreationPromises = paymentMethods.map(method =>
          axios.post("http://localhost:3004/api/payments", {
            orderId: newOrder.id,
            value: method.value,
            typePaymentId: method.typeId
          })
        );
        await Promise.all(paymentCreationPromises);
        console.log("-> SUCESSO: Intenção de pagamento registrada.");

        console.log("--- FINALIZADO COM SUCESSO ---");
      } catch (paymentError) {
        throw new Error(`O pedido foi criado, mas houve um erro ao registrar a intenção de pagamento: ${paymentError.message}`);
      }

      // 5. Retornar o pedido criado
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