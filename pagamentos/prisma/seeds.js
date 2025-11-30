const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de payments');

  await prisma.orderPayment.deleteMany({});

  const typePayments = [
    { name: 'Cartão de Crédito' },
    { name: 'Cartão de Débito' },
    { name: 'PIX' },
  ];

  const createdTypes = {};
  for (const typePayment of typePayments) {
    const type = await prisma.typePayment.upsert({
      where: { name: typePayment.name },
      update: typePayment,
      create: typePayment,
    });
    createdTypes[typePayment.name] = type;
  }

  console.log('Payment types created successfully!');

  const order1Id = "507f1f77bcf86cd799439011"; // Pedido 1
  const order2Id = "507f1f77bcf86cd799439022"; // Pedido 2
  const order3Id = "507f1f77bcf86cd799439033"; // Pedido 3

  const user1Id = "507f1f77bcf86cd799439101";
  const user2Id = "507f1f77bcf86cd799439102";
  const user3Id = "507f1f77bcf86cd799439103";

  const productNotebookId = "507f1f77bcf86cd799439201";
  const productMouseId = "507f1f77bcf86cd799439202";
  const productTecladoId = "507f1f77bcf86cd799439203";
  const productMonitorId = "507f1f77bcf86cd799439204";
  const productWebcamId = "507f1f77bcf86cd799439205";

  await prisma.orderPayment.create({
    data: {
      orderId: order1Id,
      userId: user1Id,
      value: 4349.79,
      status: 'APROVADO',
      typePaymentId: createdTypes['PIX'].id,
      productSnapshots: [
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
      ]
    },
  });

  await prisma.orderPayment.create({
    data: {
      orderId: order2Id,
      userId: user2Id,
      value: 2998.00,
      status: 'PENDENTE',
      typePaymentId: createdTypes['Cartão de Débito'].id,
      productSnapshots: [
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
      ]
    },
  });

  await prisma.orderPayment.create({
    data: {
      orderId: order3Id,
      userId: user3Id,
      value: 1349.70,
      status: 'APROVADO',
      typePaymentId: createdTypes['Cartão de Crédito'].id,
      productSnapshots: [
        {
          productId: productMouseId,
          name: "Mouse Logitech MX Master",
          price: 449.90,
          quantity: 3
        }
      ]
    },
  });

  console.log('Finalizado seed de payments com sucesso!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
