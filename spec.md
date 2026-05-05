# KYK Çamaşırhane Takip Sistemi - Teknik Şartname (V1)

## 1. Proje Özeti ve Amacı
KYK yurtlarında yetersiz çamaşır ve kurutma makinesi sayısından kaynaklanan sıra bekleme, makinelerin durumunu (dolu/boş) fiziksel olarak kontrol etme zorunluluğu ve unutulan çamaşırlar yüzünden yaşanan mağduriyetleri gidermek amacıyla geliştirilecek web tabanlı bir takip sistemidir. Öğrenciler makinelerin anlık durumunu görebilecek, çamaşır atarken not bırakabilecek ve birbirleriyle senkronize bir şekilde sırayı takip edebileceklerdir.

## 2. Teknoloji Yığını (Tech Stack)

- **Frontend (Arayüz):** React (Vite), TypeScript (.tsx), CSS için Tailwind CSS.
- **Backend (Sunucu):** Node.js ve Express.js (RESTful API mimarisi), Prisma (ORM).
- **Veritabanı:** PostgreSQL.
- **Bildirim Sistemi:** Web Push API veya zamanlanmış görevler (Planlanıyor).

## 3. Kullanıcı Senaryoları (User Stories)

- **Görüntüleme:** Kullanıcı olarak, sisteme girdiğimde katları ve o kattaki çamaşır/kurutma makinelerinin anlık durumlarını (Boş, Dolu, Bitti, Arızalı) görebilmek istiyorum.
- **Kullanım Başlatma:** Kullanıcı olarak, makineyi seçip süre belirterek durumu "Dolu" yapabilmek ve not bırakabilmek istiyorum.
- **Kullanım Bitirme:** Kullanıcı olarak, çamaşırlarımı aldığımda makineyi "Boş" yapabilmek istiyorum.
- **Süre Uzatma:** Kullanıcı olarak, ihtiyaç halinde sistem üzerinden süreyi uzatabilmek istiyorum.
- **Hata Raporlama:** Kullanıcı olarak, fiziksel durumu sistemdekiyle uyuşmayan veya arızalı makineleri raporlayabilmek istiyorum.
- **Sıraya Girme (Kuyruk):** Kullanıcı olarak, dolu olan bir makine için sıraya girebilmek ve sırayı takip edebilmek istiyorum.

## 4. Veritabanı Modelleri (Prisma / PostgreSQL)

### 1. Kullanıcılar (User) Tablosu
Sisteme giren öğrencilerin temel kimlik bilgilerini tutar.

- `id`: String (UUID, PK)
- `phone`: String (Unique - Kimlik tespiti için kullanılır)
- `createdAt`: DateTime

### 2. Makineler (Machine) Tablosu
Cihazların sabit bilgileri ve anlık durumları.

- `id`: String (UUID, PK)
- `floor`: Int (Katta bulunduğu yer)
- `type`: Enum (WASHER, DRYER)
- `status`: Enum (BOS, DOLU, BITTI, BOZUK)
- `activeUserId`: String (FK - Şu an kullanan kullanıcı)
- `endTime`: DateTime (İşlemin biteceği zaman)
- `durationMinutes`: Int (Toplam işlem süresi)
- `userNote`: String (Kullanıcı notu)

### 3. İşlem Geçmişi (Log) Tablosu
Sistem üzerindeki tüm aksiyonların kaydı.

- `id`: String (UUID, PK)
- `userId`: String (FK)
- `machineId`: String (FK)
- `actionType`: Enum (START, EXTEND, REPORT_BROKEN, FINISH)
- `createdAt`: DateTime

### 4. Kuyruk (Queue) Tablosu
Makineler için oluşturulan sıralar.

- `id`: String (UUID, PK)
- `machineId`: String (FK)
- `userId`: String (FK)
- `joinedAt`: DateTime
- `status`: Enum (WAITING, COMPLETED, CANCELLED, SKIPPED)

## 5. Güncel Durum ve Yapılacaklar (Reminders / Notes)

1. **Veritabanı ve Bağlantılar:** Frontend, Backend ve Database bağlantısı şu an sadece "Floor 1"deki 8 makine için yapıldı. A Blok "Floor 2" kısmı henüz duruyor. Veritabanı ve sistem limitleri kontrol edilip ne kadar makine eklenebileceğine bakılacak.
2. **Test Edilmesi Gereken Senaryolar:** Şu an yalnızca makine yüklenirken kullanıcı numarası isteniyor ve sisteme kaydediliyor, başka işlemlerde numara sorulmuyor. "Sıraya girme, makine doldurma ve sıradan çıkma" temel olarak test edildi ancak aşağıdaki gibi detaylı testlerin "Antigravity" kullanılarak yaptırılıp raporlanması gerekiyor:
   - Aynı kullanıcı makineyi doldurup geri boşaltabiliyor mu?
   - Bir kullanıcı aynı anda başka bir makineyi de doldurabiliyor mu?
   - Makine süresi bittiğinde "mesaj at" butonu düzgün çıkıyor mu?
3. **Bildirim ve Mobil Kullanım:** Bildirim gönderme özelliği henüz eklenmedi. Ayrıca sistemin telefonda (mobil görünümde) kullanımı henüz test edilmedi.
4. **Veritabanı Scripti ve Dokümantasyon Güncellemesi:** Veritabanını (database) doldurma scripti şu an geçici olarak `backend` klasörü içine yazıldı. Daha iyi bir yapı olması adına bunu `execution` klasörüne (katmanına) taşımaya bakılacak. Ayrıca mevcut durumda `spec.md` de yazılanlardan farklı bazı değişiklikler yapıldı. Yeni çalışmalara başlamadan önce `spec.md`'nin güncel duruma uygun olarak tamamen güncellenmesi gerekiyor.

5. **Sistemde Admin , user rolleri tanımlanmadı:**  Sistemde admin , user rolleri tanımlanmadı. Bu roller frontend ve backend için tanımlanmalı ve gerekli yerlere yetkiler verilmelidir.  Özellikle makine ekleme , silme , güncelleme yetkisi admin kullanıcılarda olmalı. Student kullanıcıları sadece makine kullanma yetkisine sahip olmalı.