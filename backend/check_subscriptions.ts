import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

webpush.setVapidDetails(
  process.env.VAPID_CONTACT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

type PushSub = webpush.PushSubscription;

const getSubs = (raw: unknown): PushSub[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as PushSub[];
  return [raw as PushSub];
};

async function main() {
  const users = await prisma.user.findMany({
    where: { pushSubscription: { not: undefined } },
    select: { id: true, phone: true, pushSubscription: true },
  });

  console.log(`\n=== Push Subscription Durumu (${users.length} kullanıcı) ===\n`);

  for (const user of users) {
    const subs = getSubs(user.pushSubscription);
    console.log(`📱 ${user.phone} (${user.id.slice(0, 8)}...)`);
    console.log(`   Kayıtlı cihaz sayısı: ${subs.length}`);
    subs.forEach((s, i) => {
      const endpoint = s.endpoint || '(endpoint yok)';
      // Show which push service (FCM, Mozilla, etc.)
      let service = 'Bilinmeyen';
      if (endpoint.includes('fcm.googleapis.com') || endpoint.includes('fcm')) service = 'Chrome/FCM';
      else if (endpoint.includes('mozilla')) service = 'Firefox';
      else if (endpoint.includes('windows.com') || endpoint.includes('notify.windows')) service = 'Edge/WNS';
      else if (endpoint.includes('push.apple.com')) service = 'Safari/APNs';
      console.log(`   Cihaz ${i + 1}: ${service} — ...${endpoint.slice(-30)}`);
    });

    // Send a test notification to all devices
    if (subs.length > 0) {
      console.log(`   → Test bildirimi gönderiliyor...`);
      for (let i = 0; i < subs.length; i++) {
        try {
          await webpush.sendNotification(subs[i], JSON.stringify({
            title: '🧪 Test Bildirimi',
            body: `Cihaz ${i + 1} için test. Bunu görüyorsan bildirimler çalışıyor!`,
            url: '/',
            tag: `test-${Date.now()}`,
          }));
          console.log(`   ✅ Cihaz ${i + 1}: GÖNDERİLDİ`);
        } catch (err: any) {
          console.log(`   ❌ Cihaz ${i + 1}: HATA — ${err.statusCode} ${err.message}`);
        }
      }
    }
    console.log('');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
