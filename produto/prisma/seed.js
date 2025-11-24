const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting product seed...');

  const products = [
    {
      name: 'Notebook Dell Inspiron',
      description: 'Notebook Dell Inspiron 15 com Intel Core i5, 8GB RAM, 256GB SSD',
      price: 3499.99,
      stock: 15,
    },
    {
      name: 'Mouse Logitech MX Master',
      description: 'Mouse sem fio Logitech MX Master 3 com sensor de alta precisão',
      price: 449.90,
      stock: 50,
    },
    {
      name: 'Teclado Mecânico Keychron K2',
      description: 'Teclado mecânico sem fio Keychron K2 com switches Gateron Brown',
      price: 699.00,
      stock: 30,
    },
    {
      name: 'Monitor LG 27" 4K',
      description: 'Monitor LG UltraFine 27 polegadas 4K UHD IPS',
      price: 2299.00,
      stock: 20,
    },
    {
      name: 'Webcam Logitech C920',
      description: 'Webcam Logitech C920 Full HD 1080p com microfone embutido',
      price: 399.90,
      stock: 40,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: product,
      create: product,
    });
  }

  console.log('Product seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
