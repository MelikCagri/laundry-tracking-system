import prisma from '../lib/prisma';
import { MachineStatus } from '@prisma/client';

// Get all machines
export const getAllMachines = async () => {
  return prisma.machine.findMany({
    orderBy: [{ floor: 'asc' }, { type: 'desc' }],
    include: {
      _count: { select: { queueEntries: { where: { status: 'WAITING' } } } },
    },
  });
};

// Start a machine
export const startMachine = async (
  machineId: string,
  userId: string,
  durationMinutes: number,
  userNote?: string
) => {
  const machine = await prisma.machine.findUnique({ where: { id: machineId } });
  if (!machine) throw new Error('Machine not found');
  if (machine.status !== MachineStatus.BOS)
    throw new Error('Machine is not available');

  const endTime = new Date(Date.now() + durationMinutes * 60 * 1000);

  const updated = await prisma.machine.update({
    where: { id: machineId },
    data: {
      status: MachineStatus.DOLU,
      activeUserId: userId,
      durationMinutes,
      endTime,
      userNote: userNote ?? null,
    },
  });

  // Log the action
  await prisma.log.create({
    data: { userId, machineId, actionType: 'START' },
  });

  return updated;
};

// Finish a machine (mark as BITTI)
export const finishMachine = async (machineId: string) => {
  const machine = await prisma.machine.findUnique({ where: { id: machineId } });
  if (!machine) throw new Error('Machine not found');

  return prisma.machine.update({
    where: { id: machineId },
    data: { status: MachineStatus.BITTI },
  });
};

// Clear a machine back to BOS (owner picked up laundry)
export const clearMachine = async (machineId: string) => {
  return prisma.machine.update({
    where: { id: machineId },
    data: {
      status: MachineStatus.BOS,
      activeUserId: null,
      endTime: null,
      durationMinutes: null,
      userNote: null,
    },
  });
};

// Extend a machine's time
export const extendMachine = async (
  machineId: string,
  extraMinutes: number
) => {
  const machine = await prisma.machine.findUnique({ where: { id: machineId } });
  if (!machine) throw new Error('Machine not found');
  if (machine.status !== MachineStatus.DOLU)
    throw new Error('Machine is not currently in use');

  const newEndTime = new Date(
    (machine.endTime?.getTime() ?? Date.now()) + extraMinutes * 60 * 1000
  );
  const newDuration = (machine.durationMinutes ?? 0) + extraMinutes;

  return prisma.machine.update({
    where: { id: machineId },
    data: { endTime: newEndTime, durationMinutes: newDuration },
  });
};

// Report a machine (10+ reports → BOZUK)
export const reportMachine = async (machineId: string, userId: string) => {
  const machine = await prisma.machine.findUnique({ where: { id: machineId } });
  if (!machine) throw new Error('Machine not found');

  await prisma.log.create({
    data: { userId, machineId, actionType: 'REPORT_BROKEN' },
  });

  // Count total REPORT_BROKEN logs for this machine
  const reportCount = await prisma.log.count({
    where: { machineId, actionType: 'REPORT_BROKEN' },
  });

  if (reportCount >= 10) {
    await prisma.machine.update({
      where: { id: machineId },
      data: { status: MachineStatus.BOZUK },
    });
    return { reported: true, broken: true, reportCount };
  }

  return { reported: true, broken: false, reportCount };
};

// Get owner's WhatsApp link for a finished machine
export const getOwnerWhatsApp = async (machineId: string) => {
  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    include: { activeUser: true },
  });
  if (!machine) throw new Error('Machine not found');
  if (machine.status !== MachineStatus.BITTI)
    throw new Error('Machine is not in BITTI status');
  if (!machine.activeUser) throw new Error('No owner found for this machine');

  // Format phone for WhatsApp (remove leading 0, add country code if needed)
  const raw = machine.activeUser.phone.replace(/\D/g, '');
  const waNumber = raw.startsWith('0') ? '90' + raw.slice(1) : raw;
  const waLink = `https://wa.me/${waNumber}`;

  return { whatsappLink: waLink };
};
