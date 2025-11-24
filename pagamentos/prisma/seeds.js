const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeder de pagamentos...');

  // ---------------------------
  // Seed dos tipos de pagamento
  const pix = await prisma.typePayment.upsert({
    where: { name: 'PIX' },
    update: {},
    create: { name: 'PIX' },
  });

  const boleto = await prisma.typePayment.upsert({
    where: { name: 'Boleto' },
    update: {},
    create: { name: 'Boleto' },
  });

  const cartao = await prisma.typePayment.upsert({
    where: { name: 'Cartão de Crédito' },
    update: {},
    create: { name: 'Cartão de Crédito' },
  });

  console.log('Tipos de pagamento criados/validados.');

  // ---------------------------
  //Seed de pagamentos de pedidos (OrderPayment)


  const pagamentos = [
    {
      orderId: 'pedido-001',
      value: 199.90,
      status: 'PENDENTE',
      typePaymentId: pix.id
    },
    {
      orderId: 'pedido-002',
      value: 89.50,
      status: 'APROVADO',
      typePaymentId: boleto.id
    },
    {
      orderId: 'pedido-003',
      value: 120.00,
      status: 'RECUSADO',
      typePaymentId: cartao.id
    }
  ];

  await prisma.orderPayment.createMany({ data: pagamentos });

  console.log('Pagamentos de pedidos criados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
