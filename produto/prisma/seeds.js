const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: "Smartphone X100",
      description: "Modelo intermediário com câmera de 48MP.",
      price: 1999.90,
      stock: 10,
    },
    {
      name: "Notebook Pro 15",
      description: "Tela Full HD, 16GB RAM e SSD 512GB.",
      price: 5499.00,
      stock: 5,
    },
    {
      name: "Fone Bluetooth Wave",
      description: "Bateria de longa duração e cancelamento de ruído.",
      price: 299.00,
      stock: 20,
    },
    {
      name: "Teclado Mecânico MK200",
      description: "Switch azul, RGB e conexão USB-C.",
      price: 399.99,
      stock: 12,
    },
    {
      name: "Monitor UltraWide 29'",
      description: "Painel IPS, resolução 2560x1080.",
      price: 1399.50,
      stock: 7,
    },
    {
      name: "Mouse Gamer X-Light",
      description: "Sensor óptico 12.000 DPI e design leve.",
      price: 189.90,
      stock: 30,
    }
  ];

  await prisma.product.createMany({
    data: products,
  });

  console.log("Products seed executed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
