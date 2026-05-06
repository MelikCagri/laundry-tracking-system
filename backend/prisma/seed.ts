import { PrismaClient, MachineType, MachineStatus, Block } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Configuration ─────────────────────────────────────────────────────────
// Adjust these values when expanding to more blocks or floors.
const BLOCKS: Block[] = [Block.A, Block.B];
const FLOORS = [1, 2];
const WASHERS_PER_FLOOR = 5;
const DRYERS_PER_FLOOR = 3;
// ───────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Starting database seed...\n');

  // Clear existing data (safe for development)
  console.log('🗑  Clearing existing data...');
  await prisma.queue.deleteMany({});
  await prisma.log.deleteMany({});
  await prisma.machine.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('   ✓ Done\n');

  // Build machine list for every block/floor combination
  const machines: {
    block: Block;
    floor: number;
    type: MachineType;
    status: MachineStatus;
  }[] = [];

  for (const block of BLOCKS) {
    for (const floor of FLOORS) {
      for (let i = 0; i < WASHERS_PER_FLOOR; i++) {
        machines.push({ block, floor, type: MachineType.WASHER, status: MachineStatus.BOS });
      }
      for (let i = 0; i < DRYERS_PER_FLOOR; i++) {
        machines.push({ block, floor, type: MachineType.DRYER, status: MachineStatus.BOS });
      }
      console.log(
        `   ✓ Block ${block} – Floor ${floor}: ${WASHERS_PER_FLOOR} washers + ${DRYERS_PER_FLOOR} dryers`
      );
    }
  }

  await prisma.machine.createMany({ data: machines });
  console.log(`\n   Total: ${machines.length} machines created.\n`);

  // Create a test user
  const testUser = await prisma.user.create({
    data: { phone: '+905551234567' },
  });
  console.log(`👤 Test user created: ${testUser.phone}`);

  // Create the Ghost Admin user (required for forceReset and setStatus operations)
  await prisma.user.create({
    data: { phone: '0000000000' },
  });
  console.log(`👻 Ghost Admin user created: 0000000000\n`);

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
