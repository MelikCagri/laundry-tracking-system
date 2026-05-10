# 🧺 KYK Çamaşırhanesi Takip Sistemi

> Yurt öğrencileri için gerçek zamanlı çamaşırhane makine takip ve bildirim sistemi.

---

## 📋 Proje Hakkında

KYK yurtlarında çamaşırhane makinelerinin meşgul olup olmadığını kontrol etmek için kat kat aşağı inme sorununu ortadan kaldırmak amacıyla geliştirilmiş bir web uygulamasıdır. Öğrenciler telefon numaralarıyla sisteme giriş yaparak:

- Makinelerin anlık durumunu görüntüleyebilir
- Makinelerini başlatıp süre takibi yapabilir
- Sıraya girip sıraları gelince **push bildirimi** alabilir
- Makine bitişinde otomatik bildirim alabilir

---

## ✨ Özellikler

### Kullanıcı Tarafı
- 📱 **Telefon ile giriş** — Kayıt gerekmez, numara girilince otomatik oturum açılır
- 🏠 **Çoklu blok/kat desteği** — A & B Blok, Kat 1 & 2 filtresi
- 🟢 **Anlık makine durumu** — Boş / Dolu / Süre Bitti / Arızalı
- ⏱️ **Kalan süre gösterimi** — Dolu makinelerde dakika sayacı
- 📋 **Sıra sistemi** — Birden fazla makineye aynı anda sıraya girilebilir, sıra pozisyonu gösterilir
- 🔔 **Web Push bildirimleri** — Çamaşır bitmeden 10 dk önce ve bitince bildirim
- 🚀 **"Sıra Sizde" banneri** — Sıra gelince "Kullan / Atla" seçenekleriyle ekranda otomatik belirir
- 💬 **WhatsApp ile makine sahibine ulaş** — BITTI durumundaki makine sahibine mesaj gönder
- ⚠️ **Sorun bildirme** — "Sistem boş gösteriyor ama dolu" veya "Makine arızalı" raporlama

### Admin Paneli
- 🔐 JWT tabanlı admin girişi
- ➕ Yeni makine ekleme (Blok, Kat, Tip)
- 🗑️ Makine silme
- 🔄 Makineyi zorla sıfırlama
- 🔧 Makine durumunu manuel değiştirme

---

## 🛠️ Teknoloji Stack'i

### Backend
| Teknoloji | Kullanım |
|---|---|
| **Node.js + Express** | REST API sunucusu |
| **TypeScript** | Tip güvenliği |
| **Prisma ORM** | Veritabanı erişim katmanı |
| **PostgreSQL** | Ana veritabanı |
| **web-push** | Web Push API bildirimleri (VAPID) |
| **node-cron** | Zamanlayıcı (dakikada 1 çalışır) |
| **JWT** | Admin kimlik doğrulama |

### Frontend
| Teknoloji | Kullanım |
|---|---|
| **React + TypeScript** | UI framework |
| **Vite** | Build tool |
| **Tailwind CSS** | Stil |
| **react-hot-toast** | Toast bildirimleri |
| **Service Worker** | Push notification alımı |

---

## 🗄️ Veritabanı Şeması

```
User          → id, phone, pushSubscription
Machine       → id, block (A/B), floor, type (WASHER/DRYER), status, activeUserId, endTime
Queue         → id, machineId, userId, status (WAITING/COMPLETED/CANCELLED/SKIPPED), notifiedAt
Log           → id, userId, machineId, actionType, createdAt
```

---

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL veritabanı

### 1. Repoyu klonla

```bash
git clone <repo-url>
cd laundry-tracking-system
```

### 2. Backend kurulumu

```bash
cd backend
npm install
```

`.env` dosyası oluştur:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/laundry_db"
JWT_SECRET="gizli-bir-anahtar"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="sifre123"
VAPID_PUBLIC_KEY="<vapid-public-key>"
VAPID_PRIVATE_KEY="<vapid-private-key>"
VAPID_CONTACT="mailto:admin@example.com"
```

> VAPID anahtarları oluşturmak için: `npx web-push generate-vapid-keys`

Veritabanını başlat:

```bash
npx prisma migrate dev
npx prisma db seed   # Örnek makineler eklemek için
```

Backend'i başlat:

```bash
npm run dev
```

### 3. Frontend kurulumu

```bash
cd frontend
npm install
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışır.

---

## 📱 Bildirim Sistemi

Sistem **Web Push API** kullanır — herhangi bir uygulama indirmeden tarayıcı üzerinden bildirim gönderilir.

| Bildirim | Tetikleyici |
|---|---|
| ⏳ **10 Dakika Kaldı** | Makine bitimine 9–10 dk kala (tam 1 kez) |
| ✅ **Çamaşır Bitti** | Süre dolunca (ilk 1 dakika içinde 1 kez) |
| 🚀 **Sıra Sizde** | Makine boşalınca sıradaki kullanıcıya |

> **iOS notu:** Safari'de bildirim alabilmek için sitenin Ana Ekrana eklenmesi (PWA olarak) gerekir.

---

## 🔗 API Uç Noktaları

### Kullanıcı
| Metod | URL | Açıklama |
|---|---|---|
| POST | `/api/users/identify` | Telefon ile giriş / kayıt |
| GET | `/api/users/:id/queues` | Kullanıcının aktif sıraları |
| GET | `/api/users/:id/pending-turn` | Bekleyen "sıra sizde" kontrolü |
| GET | `/api/users/vapid-public-key` | Push için VAPID anahtarı |
| POST | `/api/users/push-subscription` | Push aboneliği kaydet |

### Makine
| Metod | URL | Açıklama |
|---|---|---|
| GET | `/api/machines` | Tüm makineleri listele |
| POST | `/api/machines/:id/start` | Makineyi başlat |
| POST | `/api/machines/:id/finish` | Makineyi bitir |
| POST | `/api/machines/:id/clear` | Makineyi boşalt |
| POST | `/api/machines/:id/extend` | Süreyi uzat |
| POST | `/api/machines/:id/report` | Sorun bildir |

### Kuyruk
| Metod | URL | Açıklama |
|---|---|---|
| GET | `/api/machines/:id/queue` | Sıra bilgisi |
| POST | `/api/machines/:id/queue/join` | Sıraya gir |
| DELETE | `/api/machines/:id/queue/leave` | Sıradan ayrıl |
| DELETE | `/api/machines/:id/queue/skip` | Sırayı atla |

### Admin
| Metod | URL | Açıklama |
|---|---|---|
| POST | `/api/admin/login` | Admin girişi |
| POST | `/api/admin/machines` | Yeni makine ekle |
| DELETE | `/api/admin/machines/:id` | Makine sil |
| POST | `/api/admin/machines/:id/force-reset` | Zorla sıfırla |
| PATCH | `/api/admin/machines/:id/status` | Durum değiştir |

---

## 🧪 Test

Admin paneline erişmek için: `http://localhost:5173/admin`

Varsayılan giriş bilgileri `.env` dosyasındaki `ADMIN_USERNAME` ve `ADMIN_PASSWORD` değerlerinden gelir.

---

## 📁 Proje Yapısı

```
laundry-tracking-system/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Veritabanı şeması
│   └── src/
│       ├── controllers/        # HTTP istek işleyicileri
│       ├── services/           # İş mantığı (makine, kuyruk, bildirim, cron)
│       ├── routes/             # Express router tanımları
│       └── index.ts            # Sunucu giriş noktası
├── frontend/
│   ├── public/
│   │   └── service-worker.js   # Push bildirim alıcısı
│   └── src/
│       ├── components/
│       │   ├── feature/        # Makine kartı, modal, banner vb.
│       │   └── ui/             # Genel modal bileşenleri
│       ├── pages/              # Dashboard, Admin
│       └── services/           # API çağrıları, auth, push
├── directives/                 # Proje SOP'ları
└── spec.md                     # Teknik spesifikasyon
```

---

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
