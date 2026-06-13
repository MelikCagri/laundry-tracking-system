import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Villa makineleri ekleniyor...');

  // 1-10 Arası (Kayıtlı olduğu Kat/Grup: 1)
  for (let i = 1; i <= 10; i++) {
    await prisma.machine.create({
      data: {
        block: 'Villa',
        floor: 1,
        type: 'WASHER',
        status: 'BOS'
      }
    });
    await prisma.machine.create({
      data: {
        block: 'Villa',
        floor: 1,
        type: 'DRYER',
        status: 'BOS'
      }
    });
  }
  console.log('1-10 arası (Grup 1) 10 çamaşır ve 10 kurutma eklendi.');

  // 11-19 Arası (Kayıtlı olduğu Kat/Grup: 2)
  for (let i = 11; i <= 19; i++) {
    await prisma.machine.create({
      data: {
        block: 'Villa',
        floor: 2,
        type: 'WASHER',
        status: 'BOS'
      }
    });
    await prisma.machine.create({
      data: {
        block: 'Villa',
        floor: 2,
        type: 'DRYER',
        status: 'BOS'
      }
    });
  }
  console.log('11-19 arası (Grup 2) 9 çamaşır ve 9 kurutma eklendi.');

  console.log('Toplam 38 makine başarıyla Supabase veritabanına eklendi!');
}

main()
  .catch((e) => {
    console.error('Hata oluştu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
