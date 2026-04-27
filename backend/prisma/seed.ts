import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const systemCategories = [
  { name: 'Hogar', icon: 'home', color: '#FF6B6B' },
  { name: 'Transporte', icon: 'car', color: '#4ECDC4' },
  { name: 'Bienestar', icon: 'heart', color: '#FFD93D' },
  { name: 'Deudas', icon: 'credit-card', color: '#95E1D3' },
  { name: 'Ahorro', icon: 'piggy-bank', color: '#F38181' },
  { name: 'Generosidad', icon: 'gift', color: '#AA96DA' },
  { name: 'Otros', icon: 'tag', color: '#FCBAD3' },
];

async function main() {
  console.log('Start seeding system categories...');

  for (const category of systemCategories) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: category.name,
        is_system: true,
      },
    });

    if (!existingCategory) {
      const created = await prisma.category.create({
        data: {
          name: category.name,
          icon: category.icon,
          color: category.color,
          is_system: true,
        },
      });
      console.log(`Created system category: ${created.name}`);
    } else {
      console.log(`System category ${category.name} already exists`);
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
