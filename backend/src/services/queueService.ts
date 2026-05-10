import prisma from '../lib/prisma';

// Join queue for a machine
export const joinQueue = async (machineId: string, userId: string) => {
  // Validate user exists (prevents FK errors from stale localStorage sessions)
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found. Please re-authenticate.');

  // Anti-spam #1: Aynı makine için zaten sırada mı?
  const existingForMachine = await prisma.queue.findFirst({
    where: { machineId, userId, status: 'WAITING' },
  });
  if (existingForMachine) throw new Error('Already in queue for this machine');

  // Anti-spam #2: Herhangi bir başka makinenin sırasında mı?
  const existingAnywhere = await prisma.queue.findFirst({
    where: { userId, status: 'WAITING' },
  });
  if (existingAnywhere) throw new Error('Already in queue for another machine. Please leave that queue first');

  const entry = await prisma.queue.create({
    data: { machineId, userId },
  });

  // Kişinin kaçıncı sırada olduğunu hesapla
  const position = await prisma.queue.count({
    where: { machineId, status: 'WAITING', joinedAt: { lte: entry.joinedAt } },
  });

  return { ...entry, position };
};

// Leave queue for a machine
export const leaveQueue = async (machineId: string, userId: string) => {
  const entry = await prisma.queue.findFirst({
    where: { machineId, userId, status: 'WAITING' },
  });
  if (!entry) throw new Error('Not in queue for this machine');

  return prisma.queue.update({
    where: { id: entry.id },
    data: { status: 'CANCELLED' },
  });
};

// Get queue info for a machine
export const getQueueInfo = async (machineId: string) => {
  const count = await prisma.queue.count({
    where: { machineId, status: 'WAITING' },
  });
  return { machineId, waitingCount: count };
};
// Get all active queue entries for a user (with position)
export const getUserQueues = async (userId: string) => {
  const entries = await prisma.queue.findMany({
    where: { userId, status: 'WAITING' },
    select: { machineId: true, joinedAt: true },
  });

  // Her makine için kullanıcının kaçıncı sırada olduğunu hesapla
  const withPositions = await Promise.all(
    entries.map(async (entry) => {
      const position = await prisma.queue.count({
        where: {
          machineId: entry.machineId,
          status: 'WAITING',
          joinedAt: { lte: entry.joinedAt },
        },
      });
      return { machineId: entry.machineId, position };
    })
  );

  return withPositions;
};
