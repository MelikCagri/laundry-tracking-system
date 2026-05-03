import { PrismaClient, MachineType, MachineStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed database...');

  // Delete existing data to prevent duplicates on multiple runs
  await prisma.queue.deleteMany({});
  await prisma.log.deleteMany({});
  await prisma.machine.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared existing data.');

  // Create 5 Washers and 3 Dryers on Floor 1
  const machines = [];

  for (let i = 1; i <= 5; i++) {
    machines.push({
      floor: 1,
      type: MachineType.WASHER,
      status: MachineStatus.BOS,
    });
  }

  for (let i = 1; i <= 3; i++) {
    machines.push({
      floor: 1,
      type: MachineType.DRYER,
      status: MachineStatus.BOS,
    });
  }

  await prisma.machine.createMany({
    data: machines,
  });

  console.log(`Created ${machines.length} machines on Floor 1.`);

  // Create a test user
  const user = await prisma.user.create({
    data: {
      phone: '+905551234567',
    },
  });

  console.log(`Created test user with phone ${user.phone}`);

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
