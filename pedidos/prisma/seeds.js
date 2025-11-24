const { PrismaClient } = require("@prisma/client");
const { ObjectId } = require("bson");

const prisma = new PrismaClient();

async function main() {
  const product1Id = new ObjectId().toString();
  const product2Id = new ObjectId().toString();
  const product3Id = new ObjectId().toString();

  const user1Id = new ObjectId().toString();
  const user2Id = new ObjectId().toString();

  const order1 = {
    userId: user1Id,
    status: "AGUARDANDO_PAGAMENTO",
    products: [
      {
        productId: product1Id,
        name: "Smartphone X100",
        price: 1999.9,
        quantity: 1
      },
      {
        productId: product2Id,
        name: "Fone Bluetooth Wave",
        price: 299.0,
        quantity: 2
      }
    ],
    totalValue: 1999.9 + 2 * 299.0
  };

  // Pedido 2
  const order2 = {
    userId: user2Id,
    status: "PAGO",
    products: [
      {
        productId: product3Id,
        name: "Teclado Mecânico MK200",
        price: 399.99,
        quantity: 1
      }
    ],
    totalValue: 399.99
  };

  // Criação em lote
  await prisma.order.createMany({
    data: [order1, order2]
  });

  console.log("Orders seed executed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
