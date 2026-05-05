# Kullanım Senaryosu Diyagramı (Use Case Diagram)

Bu diyagram, sistemdeki aktörlerin (Öğrenci, Admin ve Sistem Otomasyonu) hangi eylemleri gerçekleştirebildiğini gösterir.

```mermaid
flowchart LR
    %% Aktörler (Actors)
    User((Öğrenci))
    Admin((Admin))
    System[[Sistem Otomasyonu]]

    %% Öğrenci Kullanım Senaryoları
    subgraph O_Eylemleri [Öğrenci Eylemleri]
        direction TB
        UC1(Makine Durumlarını Görüntüle)
        UC2(Boş Makineyi Başlat)
        UC3(Çamaşırı Alıp Makineyi Boşalt)
        UC4(Kullanım Süresini Uzat)
        UC5(Dolu Makine İçin Sıraya Gir/Çık)
        UC6(Makine Arızalı / Dolu Raporla)
    end

    %% Admin Kullanım Senaryoları
    subgraph A_Eylemleri [Admin Yönetim Eylemleri]
        direction TB
        UC7(Yeni Makine Ekle)
        UC8(Makine Bilgilerini Düzenle / Sil)
        UC9(Makineyi Zorla Sıfırla / Reset)
        UC10(Makine Durumunu Manuel Değiştir)
        UC11(Sistem Loglarını İncele)
    end

    %% Otomatik Sistem Eylemleri
    subgraph S_Eylemleri [Otomatik İş Kuralları]
        direction TB
        UC12(3 Raporda Otomatik DOLU Yap)
        UC13(10 Raporda Otomatik BOZUK Yap)
        UC14(Spam/Tekrarlı İşlemleri Engelle)
    end

    %% İlişkiler (Öğrenci)
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6

    %% İlişkiler (Admin) - Admin aynı zamanda görüntüleyebilir
    Admin --> UC1
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11

    %% İlişkiler (Sistem)
    UC6 -. tetikler .-> System
    System --> UC12
    System --> UC13
    System --> UC14
```

### Diyagramın Özeti:
1. **Öğrenci (User):** Temel makine kullanım, sıraya girme ve raporlama eylemlerini gerçekleştirir.
2. **Admin:** Sistemi denetleme, makine yönetimi ve zorunlu müdahale haklarına sahiptir.
3. **Sistem Otomasyonu:** Öğrencilerin gönderdiği raporları arka planda dinler. Spam kısıtlamalarını uygular ve eşik değerlere (3 ve 10) ulaşıldığında makine durumunu kimseye sormadan günceller.
