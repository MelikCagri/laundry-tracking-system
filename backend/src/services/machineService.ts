import prisma from '../lib/prisma';
import { MachineStatus } from '@prisma/client';
import { sendNotificationToUser } from './notificationService';

// Get all machines
export const getAllMachines = async () => {
  return prisma.machine.findMany({
    orderBy: [{ block: 'asc' }, { floor: 'asc' }, { type: 'desc' }, { id: 'asc' }],
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
  // Fix 3: Validate user exists first to avoid FK constraint errors
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found. Please re-authenticate.');

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
  // Makine sıfırlandığında REPORT_FULL loglarını temizle (sayaç sıfırlansın)
  await prisma.log.deleteMany({
    where: { machineId, actionType: 'REPORT_FULL' },
  });

  // Sıradaki ilk kişiyi bul ve durumunu COMPLETED yap (Bildirim atılacak yer burası)
  const nextInQueue = await prisma.queue.findFirst({
    where: { machineId, status: 'WAITING' },
    orderBy: { joinedAt: 'asc' },
  });

  if (nextInQueue) {
    // Mark notifiedAt so the cron job can timeout the queue entry if user doesn't respond
    await prisma.queue.update({
      where: { id: nextInQueue.id },
      data: { status: 'COMPLETED', notifiedAt: new Date() },
    });
    // Send "your turn" push notification
    await sendNotificationToUser(nextInQueue.userId, {
      title: '🚀 Sıra Sizde!',
      body: 'Çamaşır makinesi boşaldı. Makineyi kullanmak ister misiniz?',
      url: '/',
      tag: `queue-turn-${nextInQueue.machineId}`,
    });
  }

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

// Report a machine (FULL: 3+ reports → DOLU | BROKEN: 10+ reports → BOZUK)
export const reportMachine = async (
  machineId: string,
  userId: string,
  issueType: 'FULL' | 'BROKEN'
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found. Please re-authenticate.');

  const machine = await prisma.machine.findUnique({ where: { id: machineId } });
  if (!machine) throw new Error('Machine not found');

  const actionType = issueType === 'FULL' ? 'REPORT_FULL' : 'REPORT_BROKEN';

  // Anti-spam: Aynı kullanıcı bu makineye aynı tipte daha önce rapor atmış mı?
  const existingReport = await prisma.log.findFirst({
    where: { machineId, userId, actionType },
  });
  if (existingReport) throw new Error(`You have already reported this machine as ${issueType}`);

  await prisma.log.create({
    data: { userId, machineId, actionType },
  });

  // Count unique user reports for this machine and issue type
  const reportCount = await prisma.log.count({
    where: { machineId, actionType },
  });

  if (issueType === 'FULL' && reportCount >= 3 && machine.status === MachineStatus.BOS) {
    await prisma.machine.update({
      where: { id: machineId },
      data: { status: MachineStatus.DOLU },
    });
    return { reported: true, autoUpdated: true, newStatus: 'DOLU', reportCount };
  }

  if (issueType === 'BROKEN' && reportCount >= 10) {
    await prisma.machine.update({
      where: { id: machineId },
      data: { status: MachineStatus.BOZUK },
    });
    return { reported: true, autoUpdated: true, newStatus: 'BOZUK', reportCount };
  }

  return { reported: true, autoUpdated: false, reportCount };
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

// ─────────────────────────────────────────────
// ADMIN-ONLY FUNCTIONS
// ─────────────────────────────────────────────

const GHOST_ADMIN_PHONE = '0000000000';

// Ghost Admin ID'sini veritabanından çek
const getGhostAdminId = async (): Promise<string> => {
  const admin = await prisma.user.findUnique({ where: { phone: GHOST_ADMIN_PHONE } });
  if (!admin) throw new Error('Ghost Admin not found in DB. Please run the seed script.');
  return admin.id;
};

// [ADMIN] Yeni makine ekle
export const createMachine = async (floor: number, type: 'WASHER' | 'DRYER', block: 'A' | 'B') => {
  return prisma.machine.create({
    data: { floor, type, block },
  });
};

// [ADMIN] Makine sil
export const deleteMachine = async (machineId: string) => {
  // İlişkili log ve kuyruk kayıtlarını sil
  await prisma.log.deleteMany({ where: { machineId } });
  await prisma.queue.deleteMany({ where: { machineId } });
  return prisma.machine.delete({ where: { id: machineId } });
};

// [ADMIN] Makineyi zorla sıfırla (Force Reset)
export const forceResetMachine = async (machineId: string) => {
  const adminId = await getGhostAdminId();

  await prisma.log.deleteMany({ where: { machineId, actionType: 'REPORT_FULL' } });

  const updated = await prisma.machine.update({
    where: { id: machineId },
    data: {
      status: MachineStatus.BOS,
      activeUserId: null,
      endTime: null,
      durationMinutes: null,
      userNote: null,
    },
  });

  await prisma.log.create({
    data: { userId: adminId, machineId, actionType: 'FINISH' },
  });

  return updated;
};

// [ADMIN] Makine durumunu manuel olarak değiştir
export const setMachineStatus = async (machineId: string, status: MachineStatus) => {
  const adminId = await getGhostAdminId();

  const updated = await prisma.machine.update({
    where: { id: machineId },
    data: { status },
  });

  await prisma.log.create({
    data: { userId: adminId, machineId, actionType: 'FINISH' },
  });

  return updated;
};

// [ADMIN] Tüm logları getir
export const getAllLogs = async () => {
  return prisma.log.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { phone: true } },
      machine: { select: { block: true, floor: true, type: true } },
    },
    take: 200, // Son 200 log
  });
};
