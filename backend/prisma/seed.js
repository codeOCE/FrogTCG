const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const cards = [
    {
      name: "Bog Blitz Hopper",
      rarity: "rare",
      imageUrl: "/cards/placeholder1.jpg"
    },
    {
      name: "Swamp Sentinel",
      rarity: "common",
      imageUrl: "/cards/placeholder2.jpg"
    },
    {
      name: "Tadpole Titan",
      rarity: "epic",
      imageUrl: "/cards/placeholder3.jpg"
    },
    {
      name: "Mire Mage",
      rarity: "uncommon",
      imageUrl: "/cards/placeholder4.jpg"
    }
  ];

  for (const card of cards) {
    await prisma.card.upsert({
      where: { name: card.name },
      update: {},
      create: card
    });
  }

  console.log("Card database seeded!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
