
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const workers = await prisma.worker.findMany({
      include: {
        user: true
      }
    });
    console.log('Workers count:', workers.length);
    console.log('First worker:', JSON.stringify(workers[0], null, 2));
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
