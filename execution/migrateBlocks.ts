import { PrismaClient, Block } from '../backend/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Migrating B block to C block...');
  const updated = await prisma.machine.updateMany({
    where: { block: 'B' as Block },
    data: { block: 'C' as Block },
  });
  console.log(`Updated ${updated.count} machines from B to C.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
