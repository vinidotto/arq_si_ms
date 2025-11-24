const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de clientes');

  const clients = [
    {
      name: 'João Silva',
      email: 'joao.silva@email.com',
    },
    {
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
    },
    {
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
    },
  ];

  for (const client of clients) {
    await prisma.client.upsert({
      where: { email: client.email },
      update: client,
      create: client,
    });
  }

  console.log('Seed completada com sucesso!');
}

main()
  .catch((e) => {
    console.error('Error seeding clients:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
