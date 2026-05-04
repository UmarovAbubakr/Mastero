import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  
  try {
    await prisma.reaction.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.order.deleteMany();
    await prisma.bookingSlot.deleteMany();
    await prisma.work.deleteMany();
    await prisma.proposal.deleteMany();
    await prisma.jobRequest.deleteMany();
    await prisma.worker.deleteMany();
    await prisma.user.deleteMany();
  } catch (err: any) {
    console.log('Cleanup info:', err.message);
  }

  console.log('Creating accounts...');

  const password = await bcrypt.hash('password123', 10);

  // 1. Normal Master
  const master1 = await prisma.user.create({
    data: {
      email: 'master1@mastero.tj',
      password: password,
      name: 'Алишер Сантехник',
      role: 'worker',
      phone: '992000000001',
      worker: {
        create: {
          skills: 'Сантехника, Установка кранов',
          category: 'plumber',
          about: 'Обычный мастер, работаю быстро и недорого.',
          price: 80,
          city: 'Dushanbe',
          verified: false,
          rating: 4.2,
          completedOrders: 5,
          works: {
            create: [
              { title: 'Замена смесителя', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' },
              { title: 'Ремонт бачка', imageUrl: 'https://images.unsplash.com/photo-1504148455328-4972fefebfee?auto=format&fit=crop&q=80&w=800' }
            ]
          }
        }
      }
    },
    include: { worker: true }
  });

  // 2. Super Master
  const master2 = await prisma.user.create({
    data: {
      email: 'master2@mastero.tj',
      password: password,
      name: 'Абдулло Профи',
      role: 'worker',
      phone: '992000000002',
      worker: {
        create: {
          skills: 'Электрика под ключ, Умный дом, Дизайн освещения',
          category: 'electrician',
          about: 'Сертифицированный специалист с европейским оборудованием. Делаю на века.',
          price: 250,
          city: 'Dushanbe',
          verified: true,
          rating: 5.0,
          completedOrders: 150,
          totalEarnings: 45000,
          works: {
            create: [
              { title: 'Освещение в пентхаусе', imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800' },
              { title: 'Щиток 380В', imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800' },
              { title: 'Умный дом в Сити', imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800' }
            ]
          }
        }
      }
    },
    include: { worker: true }
  });

  // 3. Main Client
  const client = await prisma.user.create({
    data: {
      email: 'client@mastero.tj',
      password: password,
      name: 'Иван Заказчик',
      role: 'client',
      phone: '992000000003',
      bio: 'Постоянно ищу мастеров для своих объектов.'
    }
  });

  // 4. Extra Clients for reviews
  const reviewerNames = ['Мадина', 'Рустам', 'Фарход', 'Елена', 'Сомон', 'Бахтиер', 'Аниса', 'Далер', 'Зухро', 'Саид'];
  const extraClients = [];
  for (let i = 0; i < reviewerNames.length; i++) {
    const c = await prisma.user.create({
      data: {
        email: `client${i}@test.tj`,
        password: password,
        name: reviewerNames[i],
        role: 'client'
      }
    });
    extraClients.push(c);
  }

  console.log('Adding 10 orders and reviews for Super Master...');

  const reviews = [
    { rating: 5, comment: 'Лучший электрик в городе! Все четко.' },
    { rating: 5, comment: 'Очень профессионально, рекомендую.' },
    { rating: 5, comment: 'Сделал умный дом за 2 дня. Фантастика.' },
    { rating: 5, comment: 'Дорого, но оно того стоит. Качество топ.' },
    { rating: 5, comment: 'Все хорошо, немного опоздал, но работу сделал идеально.' },
    { rating: 5, comment: 'Пунктуальный и вежливый мастер.' },
    { rating: 5, comment: 'Спасибо за качественный монтаж щитка.' },
    { rating: 5, comment: 'Работает с очень крутым инструментом. Сразу видно профи.' },
    { rating: 5, comment: 'Абдулло молодец, спас нас от короткого замыкания.' },
    { rating: 5, comment: 'Теперь только к нему!' }
  ];

  for (let i = 0; i < 10; i++) {
    await prisma.order.create({
      data: {
        clientId: extraClients[i].id,
        workerId: master2.worker!.id,
        status: 'completed',
        rating: reviews[i].rating,
        comment: reviews[i].comment,
        createdAt: new Date(Date.now() - i * 86400000) // Different days
      }
    });
  }

  console.log('Adding some active orders...');
  
  // Active orders for master 1
  await prisma.order.create({
    data: {
      clientId: client.id,
      workerId: master1.worker!.id,
      status: 'accepted',
      createdAt: new Date()
    }
  });

  // Pending order for master 2
  await prisma.order.create({
    data: {
      clientId: client.id,
      workerId: master2.worker!.id,
      status: 'pending',
      createdAt: new Date()
    }
  });

  console.log('Adding 5 reviews for Normal Master...');
  const reviews1 = [
    { rating: 4, comment: 'Приехал быстро, кран починил. Все работает.' },
    { rating: 3, comment: 'Нормально, но немного наследил в ванной.' },
    { rating: 5, comment: 'Хороший мастер, взял недорого.' },
    { rating: 4, comment: 'Все ок, рекомендую для простых задач.' },
    { rating: 5, comment: 'Вежливый парень, помог еще и с дверью.' }
  ];

  for (let i = 0; i < 5; i++) {
    await prisma.order.create({
      data: {
        clientId: extraClients[i + 5].id, // Use different clients
        workerId: master1.worker!.id,
        status: 'completed',
        rating: reviews1[i].rating,
        comment: reviews1[i].comment,
        createdAt: new Date(Date.now() - (i + 10) * 86400000)
      }
    });
  }

  console.log('Adding 7 job requests to the Job Board...');
  
  const jobRequests = [
    {
      title: 'Нужно починить кран на кухне',
      description: 'Кран течет уже неделю, нужно заменить прокладку или весь смеситель.',
      category: 'plumber',
      budget: 100,
      city: 'Dushanbe'
    },
    {
      title: 'Установка 5 розеток',
      description: 'В новой комнате нужно развести электрику и установить 5 розеток.',
      category: 'electrician',
      budget: 300,
      city: 'Dushanbe'
    },
    {
      title: 'Поклейка обоев в спальне',
      description: 'Комната 15 кв.м. Обои уже куплены, клей тоже есть. Нужен мастер.',
      category: 'repair_house',
      budget: 1200,
      city: 'Khujand'
    },
    {
      title: 'Сборка кухонного гарнитура',
      description: 'Гарнитур из IKEA (но аналог), нужно собрать и установить столешницу.',
      category: 'furniture',
      budget: 2000,
      city: 'Dushanbe'
    },
    {
      title: 'Генеральная уборка 3-к квартиры',
      description: 'После ремонта осталась пыль и мусор. Нужно все отмыть до блеска.',
      category: 'cleaning',
      budget: 500,
      city: 'Dushanbe'
    },
    {
      title: 'Ремонт холодильника Samsung',
      description: 'Перестал морозить, хотя компрессор шумит. Нужна диагностика.',
      category: 'repair_of_household_appliances',
      budget: 150,
      city: 'Dushanbe'
    },
    {
      title: 'Нужна консультация по умному дому',
      description: 'Хочу сделать управление светом и шторами с Алисы. Нужен совет специалиста.',
      category: 'smart_home',
      budget: 50,
      city: 'Dushanbe'
    }
  ];

  for (const job of jobRequests) {
    await prisma.jobRequest.create({
      data: {
        clientId: client.id,
        ...job,
        status: 'open'
      }
    });
  }

  console.log('\n=========================================');
  console.log('Database reset successfully!');
  console.log('PASSWORD for all: password123');
  console.log('-----------------------------------------');
  console.log('Super Master: master2@mastero.tj');
  console.log('Normal Master: master1@mastero.tj');
  console.log('Client: client@mastero.tj');
  console.log('=========================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
