# Rol, Metod ve Kurallar Tanımlaması

Bu doküman, sistemdeki Admin ve Öğrenci (User) rollerinin yetki sınırlarını, kullanabilecekleri metodları ve iş mantığı kurallarını tanımlar.

---

## 👨‍🎓 Öğrenci (User) Rolü
Öğrenciler sistemin temel kullanıcılarıdır. Sadece makine kullanımı ve sistemin düzenli işlemesine yardımcı olacak raporlamaları yapabilirler.

### Yetkiler:
- **Görüntüleme:** Tüm kat ve makineleri listeleme.
- **Kullanım Başlatma:** Boş bir makineyi başlatma (Süre ve not belirterek).
- **Bitirme:** Kendi kullandığı makineyi durdurma/boşaltma.
- **Süre Uzatma:** Kendi kullandığı makinenin süresini uzatma (Örn: +15 dk).
- **Sıralama:** Dolu bir makine için sıraya girme ve sıradan çıkma.
- **Raporlama (Gelişmiş):** Sisteme girilmemiş ama fiziksel olarak "Dolu" olan veya "Bozuk" olan makineleri bildirme.

### Kısıtlamalar (Anti-Spam & Güvenlik):
- **Tekil İşlem:** Bir kullanıcı, aynı makine için art arda birden fazla raporlama yapamaz.
- **Tekil Sıra:** Bir kullanıcı, aynı anda tek bir makinenin sırasında olabilir.
- **Kendi İşlemi:** Bir öğrenci sadece kendi başlattığı işlemi bitirebilir veya uzatabilir.

### Metodlar (Backend/API Taslağı):
- `getMachines()`
- `identifyUser(phone)`
- `startMachine(machineId, duration, note)`
- `extendMachineTime(machineId, extraMinutes)`
- `finishMachine(machineId)`
- `joinQueue(machineId)`
- `leaveQueue(machineId)`
- `reportIssue(machineId, issueType)`

---

## 🔑 Admin Rolü
Adminler sistemi yöneten ve yapılandıran yetkili kullanıcılardır. Öğrencilerin tüm yetkilerine ek olarak aşağıdaki yönetimsel güçlere sahiptirler.

### Yetkiler:
- **Makine Yönetimi:** Yeni makine oluşturma, silme ve detaylarını (kat, tip vb.) düzenleme.
- **Sistem Müdahalesi:** Herhangi bir makineyi resetleme veya durdurma.
- **Manuel Durum Değişimi:** Bildirilen arızaları onaylayıp makineyi manuel olarak `BOZUK` veya `BOŞ` yapma.
- **Denetim:** Tüm kullanıcı loglarını izleme.

### Metodlar (Backend/API Taslağı):
- `createMachine(data)`
- `updateMachine(machineId, data)`
- `deleteMachine(machineId)`
- `forceResetMachine(machineId)`
- `setMachineStatus(machineId, status)`
- `getAllLogs()`

---

## ⚙️ Otomatik Sistem Kuralları (Business Logic)
1. **Dolu Raporu Kuralı:** Eğer "Boş" durumdaki bir makine, farklı kullanıcılar tarafından **3 kez "Dolu"** olarak raporlanırsa, sistem makineyi otomatik `DOLU` yapar.
2. **Arıza Raporu Kuralı:** Eğer bir makine, farklı kullanıcılar tarafından **10 kez "Bozuk"** olarak raporlanırsa, sistem makineyi otomatik `BOZUK` yapar.

---

## 🛡 Güvenlik ve Mimari Kararlar
- **Admin Girişi (.env Yöntemi):** Adminler, standart akıştan bağımsız olarak gizli bir `/admin` rotası üzerinden (kullanıcı adı ve şifre ile) giriş yapacaklardır. Hesap bilgileri `.env` dosyasında saklanacaktır.
- **Loglama ve Hayalet Kullanıcı (Option B):** Admin işlemleri, `User` tablosuna manuel eklenecek olan tek bir "Sistem Admini" (Phone: 0000000000) hesabına bağlanarak `Log` tablosuna kaydedilecektir.
- **Yetki Kontrolü:** Admin rotaları `isAdmin` middleware'i ile korunacaktır.

---

# 🚀 UYGULAMA YOL HARİTASI (IMPLEMENTATION PLAN)

Modelin kotasının dolması veya oturumun kapanması durumunda, sonraki yapay zeka asistanına **"roles_and_methods.md dosyasındaki Step X'te kaldık, oradan devam et"** diyebilirsiniz.

### 🟩 Faz 1: Backend Altyapısı [Tamamlandı, Test EDİLDİ]
- **Step 1:** `.env` dosyasına Admin kimlik bilgilerini (JSON formatında) ve JWT secret key'i eklemek. Prisma (veya manuel bir DB sorgusu) kullanarak `User` tablosuna "0000000000" numaralı Hayalet Admin (Ghost User) hesabını eklemek (Böylece loglar patlamaz).
- **Step 2:** Backend'de `authRoutes` oluşturup gizli `/api/admin/login` endpoint'ini yazmak. `.env`'den kontrol edip JWT token dönen yapıyı kurmak. Ardından diğer route'ları korumak için `isAdmin` middleware'ini oluşturmak.
- **Step 3:** Mevcut `User` endpoint'lerini güncellemek. `extendMachineTime` metodunu backend'de oluşturmak. `reportIssue` metodunu `FULL` ve `BROKEN` tiplerini destekleyecek şekilde genişletmek.

### 🟨 Faz 2: Backend İş Mantığı (Business Logic) [Tamamlandı, Test Edilmedi]
- **Step 4:** Anti-Spam kontrollerini eklemek. Bir kullanıcının aynı makineyi iki kez raporlamasını veya aynı anda iki sıraya girmesini engelleyen veritabanı sorgularını middleware veya controller içine yazmak.
- **Step 5:** Otomatik kuralları kodlamak. Her `reportIssue` çağrıldığında o makinenin toplam rapor sayısını (`count`) veritabanından çekip, eşiği geçerse (Dolu için 3, Bozuk için 10) makinenin durumunu (`status`) otomatik güncelleyen fonksiyonu yazmak.
- **Step 6:** Sadece adminlerin çağırabileceği `createMachine`, `deleteMachine`, `forceResetMachine` vb. endpoint'leri yazıp bunları `isAdmin` middleware'i ile sarmalamak. Admin işlemlerinde `userId` olarak Step 1'de oluşturulan Hayalet Admin ID'sini kullanmak.

### 🟦 Faz 3: Frontend Entegrasyonu
- **Step 7:** React router'a gizli `/admin` rotasını eklemek. Bu sayfaya sadece kullanıcı adı ve şifre isteyen basit bir form koymak ve giriş başarılı olduğunda JWT token'ı `localStorage`'a kaydetmek.
- **Step 8:** Öğrenci arayüzünü (User UI) güncellemek. Dolu makinelere tıklayınca açılan modal'a "Süreyi Uzat" butonu (sadece aktif kullanıcı için) eklemek. Raporlama modal'ına "Dolu" veya "Bozuk" seçeneklerini koymak.
- **Step 9:** Admin Dashboard (Kontrol Paneli) arayüzünü kodlamak. Sadece admin girişliyse görünen bu ekranda tüm makineleri listeleyen, düzenleme/silme yapılabilen ve yeni makine eklenebilen admin paneli bileşenlerini (components) oluşturmak.
