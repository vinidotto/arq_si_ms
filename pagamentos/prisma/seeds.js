const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting payment types seed...');

  const typePayments = [
    { name: 'Cartão de Crédito' },
    { name: 'Cartão de Débito' },
    { name: 'PIX' },
  ];

  for (const typePayment of typePayments) {
    await prisma.typePayment.upsert({
      where: { name: typePayment.name },
      update: typePayment,
      create: typePayment,
    });
  }

  console.log('Payment types seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding payment types:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
