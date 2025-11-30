const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.client.createMany({
    data: [
      {
        name: "Alice Johnson",
        email: "alice@example.com",
      },
      {
        name: "Bob Smith",
        email: "bob@example.com",
      },
      {
        name: "Charlie Brown",
        email: "charlie@example.com",
      }
    ]
  });

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
