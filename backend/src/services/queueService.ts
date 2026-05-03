import prisma from '../lib/prisma';

// Join queue for a machine
export const joinQueue = async (machineId: string, userId: string) => {
  // Check if already in queue
  const existing = await prisma.queue.findFirst({
    where: { machineId, userId, status: 'WAITING' },
  });
  if (existing) throw new Error('Already in queue for this machine');

  return prisma.queue.create({
    data: { machineId, userId },
  });
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
// Get all active queue entries for a user
export const getUserQueues = async (userId: string) => {
  return prisma.queue.findMany({
    where: { userId, status: 'WAITING' },
    select: { machineId: true }
  });
};
