const { PrismaClient } = require("@prisma/client");
const { ObjectId } = require("bson");

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de orders');

  await prisma.order.deleteMany({});

  const user1Id = new ObjectId().toString();
  const user2Id = new ObjectId().toString();
  const user3Id = new ObjectId().toString();

  const productNotebookId = new ObjectId().toString();
  const productMouseId = new ObjectId().toString();
  const productTecladoId = new ObjectId().toString();
  const productMonitorId = new ObjectId().toString();
  const productWebcamId = new ObjectId().toString();
  // Pedido 1: João Silva - PAGO
  const order1 = {
    userId: user1Id,
    status: "PAGO",
    products: [
      {
        productId: productNotebookId,
        name: "Notebook Dell Inspiron",
        price: 3499.99,
        quantity: 1
      },
      {
        productId: productMouseId,
        name: "Mouse Logitech MX Master",
        price: 449.90,
        quantity: 1
      },
      {
        productId: productWebcamId,
        name: "Webcam Logitech C920",
        price: 399.90,
        quantity: 1
      }
    ],
    totalValue: 3499.99 + 449.90 + 399.90
  };

  const order2 = {
    userId: user2Id,
    status: "AGUARDANDO_PAGAMENTO",
    products: [
      {
        productId: productTecladoId,
        name: "Teclado Mecânico Keychron K2",
        price: 699.00,
        quantity: 1
      },
      {
        productId: productMonitorId,
        name: "Monitor LG 27\" 4K",
        price: 2299.00,
        quantity: 1
      }
    ],
    totalValue: 699.00 + 2299.00
  };

  const order3 = {
    userId: user3Id,
    status: "PAGO",
    products: [
      {
        productId: productMouseId,
        name: "Mouse Logitech MX Master",
        price: 449.90,
        quantity: 3
      }
    ],
    totalValue: 449.90 * 3
  };

  await prisma.order.createMany({
    data: [order1, order2, order3]
  });

  console.log('Seed de orders criada com sucesso!');
  console.log(`Created 3 orders`);
}

main()
  .catch((e) => {
    console.error('Error seeding orders:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
