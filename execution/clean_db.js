const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  console.log('Veritabanı temizleniyor...');
  
  const queueCount = await prisma.queue.deleteMany({});
  console.log(`✓ Queue silindi: ${queueCount.count} kayıt`);
  
  const logCount = await prisma.log.deleteMany({});
  console.log(`✓ Log silindi: ${logCount.count} kayıt`);
  
  const userCount = await prisma.user.deleteMany({});
  console.log(`✓ Kullanıcılar silindi: ${userCount.count} kayıt`);

  const machineReset = await prisma.machine.updateMany({
    data: {
      status: 'BOS',
      activeUserId: null,
      endTime: null,
      durationMinutes: null,
      userNote: null,
    }
  });
  console.log(`✓ Makineler sıfırlandı: ${machineReset.count} makine`);

  await prisma.$disconnect();
  console.log('\n✅ Veritabanı temizleme tamamlandı!');
}

clean().catch(e => {
  console.error('HATA:', e);
  process.exit(1);
});
