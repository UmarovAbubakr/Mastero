import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  
  // Clear existing data
  await prisma.transaction.deleteMany({});
  await prisma.proposal.deleteMany({});
  await prisma.work.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.bookingSlot.deleteMany({});
  await prisma.jobRequest.deleteMany({});
  await prisma.worker.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Creating Premium Workers...');

  // 1. Create Ultra Worker
  const userUltra = await prisma.user.create({
    data: {
      email: 'ultra@mastero.tj',
      name: 'Алишер Ультра',
      password: 'password123', // In a real app, hash this
      role: 'worker',
      subscriptionTier: 'ULTRA',
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      worker: {
        create: {
          skills: 'Сантехник, Электрик, Ремонт под ключ',
          category: 'repair_house',
          about: 'Лучший мастер в городе с премиум подпиской Ultra. Выполняю работы любой сложности.',
          price: 150,
          city: 'Dushanbe',
          verified: true,
          rating: 5.0,
          completedOrders: 124,
        }
      }
    }
  });

  // 2. Create Pro Worker
  const userPro = await prisma.user.create({
    data: {
      email: 'pro@mastero.tj',
      name: 'Мадина Про',
      password: 'password123',
      role: 'worker',
      subscriptionTier: 'PRO',
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      worker: {
        create: {
          skills: 'Дизайн интерьера, 3D Визуализация',
          category: 'designer',
          about: 'Профессиональный дизайнер. Помогу создать уют в вашем доме.',
          price: 200,
          city: 'Dushanbe',
          verified: true,
          rating: 4.8,
          completedOrders: 45,
        }
      }
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
