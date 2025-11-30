const { PrismaClient } = require("@prisma/client");
const { ObjectId } = require("bson");

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de orders');

  await prisma.order.deleteMany({});

  const order1Id = "507f1f77bcf86cd799439011";
  const order2Id = "507f1f77bcf86cd799439022";
  const order3Id = "507f1f77bcf86cd799439033";

  const user1Id = "507f1f77bcf86cd799439101";
  const user2Id = "507f1f77bcf86cd799439102";
  const user3Id = "507f1f77bcf86cd799439103";

  const productNotebookId = "507f1f77bcf86cd799439201";
  const productMouseId = "507f1f77bcf86cd799439202";
  const productTecladoId = "507f1f77bcf86cd799439203";
  const productMonitorId = "507f1f77bcf86cd799439204";
  const productWebcamId = "507f1f77bcf86cd799439205";

  await prisma.order.create({
    data: {
      id: order1Id,
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
    }
  });

  await prisma.order.create({
    data: {
      id: order2Id,
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
    }
  });

  await prisma.order.create({
    data: {
      id: order3Id,
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
    }
  });

  console.log('Seed de orders criada com sucesso!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
