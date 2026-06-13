import cron from 'node-cron';
import prisma from '../lib/prisma';
import { sendNotificationToUser } from './notificationService';
import { clearMachine } from './machineService';

const QUEUE_TIMEOUT_MINUTES = 10; // If notified user doesn't act within this time, skip them

/**
 * Runs every minute. Handles two things:
 * 1. Early warning: Notify machine owner when <= 10 min remaining.
 * 2. Timer up: Notify machine owner that time is up.
 * 3. Queue timeout: If a notified user hasn't acted within 10 min, skip to next in queue.
 */
export const startCronJobs = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date();

    // ─── 1 & 2: Machine timer notifications ───────────────────────────────────
    const activeMachines = await prisma.machine.findMany({
      where: { status: 'DOLU', endTime: { not: null }, activeUserId: { not: null } },
      include: { activeUser: true },
    });

    for (const machine of activeMachines) {
      if (!machine.endTime || !machine.activeUserId) continue;

      const msRemaining = machine.endTime.getTime() - now.getTime();
      const minutesRemaining = msRemaining / 60000;

      // Early warning: only fire once in the 9–10 minute window
      // This ensures we send exactly ONE notification when the timer crosses 10 min
      if (minutesRemaining > 9 && minutesRemaining <= 10) {
        await sendNotificationToUser(machine.activeUserId, {
          title: '⏳ Çamaşırınız Bitmek Üzere!',
          body: 'Çamaşırınızın bitmesine yaklaşık 10 dakika kaldı. Hazırlanmaya başlayabilirsiniz.',
          url: '/',
          tag: `timer-warning-${machine.id}`, // tag deduplicates on device
        });
      }

      // Timer up: only fire once in the first minute after expiry (0 to -1 min)
      if (minutesRemaining <= 0 && minutesRemaining > -1) {
        // ← KRİTİK: DB'yi BITTI olarak güncelle
        await prisma.machine.update({
          where: { id: machine.id },
          data: { status: 'BITTI' },
        });

        await sendNotificationToUser(machine.activeUserId, {
          title: '✅ Çamaşırınız Yıkandı!',
          body: 'Süre doldu. Lütfen çamaşırlarınızı alın ve makineyi boşaltın.',
          url: '/',
          tag: `timer-done-${machine.id}`,
        });
      }
    }

    // ─── 2.5: Anonymous Machines Auto-Clear ───────────────────────────────────
    const anonymousMachines = await prisma.machine.findMany({
      where: { status: 'DOLU', endTime: { not: null }, activeUserId: null },
    });

    for (const machine of anonymousMachines) {
      if (!machine.endTime) continue;
      const msRemaining = machine.endTime.getTime() - now.getTime();
      if (msRemaining <= 0) {
        await clearMachine(machine.id);
      }
    }

    // ─── 3: Queue timeout ─────────────────────────────────────────────────────
    // Find COMPLETED queue entries where the user was notified but hasn't acted
    const timeoutCutoff = new Date(now.getTime() - QUEUE_TIMEOUT_MINUTES * 60 * 1000);
    const timedOutEntries = await prisma.queue.findMany({
      where: {
        status: 'COMPLETED',
        notifiedAt: { lte: timeoutCutoff, not: null },
      },
    });

    for (const entry of timedOutEntries) {
      // Skip this entry (mark as SKIPPED)
      await prisma.queue.update({
        where: { id: entry.id },
        data: { status: 'SKIPPED' },
      });

      // Find next WAITING person in queue for this machine
      const nextInQueue = await prisma.queue.findFirst({
        where: { machineId: entry.machineId, status: 'WAITING' },
        orderBy: { joinedAt: 'asc' },
      });

      if (nextInQueue) {
        await prisma.queue.update({
          where: { id: nextInQueue.id },
          data: { status: 'COMPLETED', notifiedAt: new Date() },
        });
        await sendNotificationToUser(nextInQueue.userId, {
          title: '🚀 Sıra Sizde!',
          body: 'Önceki kişi yanıt vermedi. Sıra size geçti! Makineyi kullanmak ister misiniz?',
          url: '/',
          tag: `queue-turn-${entry.machineId}`,
        });
      }
    }
  });

  console.log('[Cron] Notification job started (runs every minute).');
};
