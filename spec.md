# KYK Çamaşırhane Takip Sistemi - Teknik Şartname (V1)

## 1. Proje Özeti ve Amacı
KYK yurtlarında yetersiz çamaşır ve kurutma makinesi sayısından kaynaklanan sıra bekleme, makinelerin durumunu (dolu/boş) fiziksel olarak kontrol etme zorunluluğu ve unutulan çamaşırlar yüzünden yaşanan mağduriyetleri gidermek amacıyla geliştirilecek web tabanlı bir takip sistemidir. Öğrenciler makinelerin anlık durumunu görebilecek, çamaşır atarken not bırakabilecek ve birbirleriyle senkronize bir şekilde sırayı takip edebileceklerdir.

## 2. Teknoloji Yığını (Tech Stack)

- **Frontend (Arayüz):** React (Vite), TypeScript (.tsx), CSS için Tailwind CSS (Hızlı ve modern tasarım).
- **Backend (Sunucu):** Node.js ve Express.js (RESTful API mimarisi).
- **Bildirim Sistemi:** Web Push API (Tarayıcı üzerinden ücretsiz bildirimler) veya Node.js "node-cron" kütüphanesi ile zamanlanmış görevler (Örn: Çamaşır bitince tetiklenen e-posta/bildirim).
- **Hosting (Ücretsiz Canlıya Alma):** Frontend için Vercel, Backend için Render veya Railway.

## 3. Kullanıcı Senaryoları (User Stories)

- **Görüntüleme:** Kullanıcı olarak, sisteme girdiğimde katları ve o kattaki çamaşır/kurutma makinelerinin anlık durumlarını (Boş, Dolu, Bitti) renk kodlarıyla görebilmek istiyorum.
- **Kullanım Başlatma:** Kullanıcı olarak, çamaşır atacağım makineyi seçip, ne kadar süreceğini belirterek durumu "Dolu" yapabilmek ve arkamdan gelenler için "Biterse üstüne koyabilirsiniz" gibi bir not bırakabilmek istiyorum.
- **Kullanım Bitirme:** Kullanıcı olarak, çamaşırlarımı aldığımda makinenin durumunu "Boş" olarak güncelleyebilmek istiyorum.
- **Süre Uzatma:** Kullanıcı olarak, kurutma makinesindeki çamaşırım kurumadıysa, sistem üzerinden süreyi uzatabilmek istiyorum.
- **Hata Raporlama:** Kullanıcı olarak, sistemde "Boş" görünen ama fiziksel olarak yanına gittiğimde dolu olan bir makineyi "Dolu/Hatalı" olarak raporlayabilmek istiyorum.

## 4. Veritabanı Modelleri (PostgreSQL Modeli)

### 1. Kullanıcılar (Users) Tablosu
Sisteme giren öğrencilerin bilgilerini tutacağız.

- `id`: (Benzersiz kimlik)
- `ad_soyad`: (Metin)
- `oda_numarasi`: (Metin/Sayı)
- `telefon` veya `telegram_id`: (Bildirim göndermek için)

### 2. Makineler (Machines) Tablosu
Yurttaki tüm cihazların sabit listesi ve anlık durumları.

- `id`: (Benzersiz kimlik)
- `kat_numarasi`: (Sayı - Hangi katta olduğu)
- `tip`: (Metin - "Çamaşır" veya "Kurutma")
- `durum`: (Metin - "Boş", "Dolu", "Bitti")
- `aktif_kullanici_id`: (Kullanıcılar tablosuna bağlantı - Şu an kim kullanıyor?)
- `bitis_zamani`: (Tarih/Saat - Sayacın ne zaman sıfırlanacağı)
- `kullanici_notu`: (Metin - Örn: "Biterse üstüne koyabilirsiniz")

### 3. İşlem Geçmişi ve Raporlar (Logs / Reports) Tablosu
Kim, ne zaman, hangi makineyi kullandı? Veya kim sahte "boş" makineyi raporladı? Bu tablo sistemi kötüye kullananları (gamification/ceza) tespit etmek için çok işimize yarayacak.

- `id`: (Benzersiz kimlik)
- `kullanici_id`: (Kullanıcılar tablosuna bağlantı)
- `makine_id`: (Makineler tablosuna bağlantı)
- `islem_tipi`: (Metin - "Kullanım Başladı", "Uzatma Yapıldı", "Hata Raporlandı")
- `olusturulma_tarihi`: (Zaman damgası)
