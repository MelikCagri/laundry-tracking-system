# 📋 Çamaşırhane Takip Sistemi - Yapılacaklar Listesi (To-Do List)

Bu liste, sistemin kullanıcı deneyimini iyileştirmek ve fiziksel yurt yapısına tam uyum sağlamak için planlanan geliştirmeleri içerir.

---

## 🔔 1. Bildirim Sistemi İyileştirmesi
- [x] **Bildirim Çanı:** Ana sayfaya (Dashboard) şık bir bildirim çanı ikonu eklenecek. Kullanıcı izin vermediyse bu çan üzerinde bir uyarı işareti çıkacak.
- [x] **Direkt Sor:** İzin alma işlemi sadece banner ile değil, kullanıcı "Sıraya Gir" veya "Başlat" dediğinde eğer izin yoksa bir popup ile "Bildirimleri açmak ister misiniz?" şeklinde sorulacak.

## ⏳ 2. Zaman Girişi Modernizasyonu
- [x] **Saat/Dakika Dönüşümü:** Makine başlatırken sadece dakika girmek yerine (örn: 120 dk), daha anlaşılır bir "Saat:Dakika" seçicisi veya hazır butonlar (1 Saat, 1.5 Saat vb.) eklenecek.

## 🧺 3. Erken Çamaşır Teslimi
- [ ] **Erken Bitirme Opsiyonu:** Çamaşırı makinede belirtilen süreden önce biten kullanıcılar için "Çamaşırlarımı Aldım / Erken Bitir" butonu eklenecek. Bu sayede makine sistemde daha hızlı "BİTTİ" veya "BOŞ" durumuna geçebilecek.

## 🏢 4. Blok ve Altyapı Güncellemeleri
- [x] **B Blok -> C Blok Dönüşümü:** Mevcut "B" bloğu veritabanı, backend ve frontend seviyesinde "C" bloğu olarak yeniden adlandırılacak.
- [x] **Yeni Blokların Eklenmesi:** Diğer bloklar (D, E, F vb.) sisteme tanımlanacak. 
    - *Teknik:* Prisma `Block` enum'u güncellenecek ve `adminController` validasyonları genişletilecek.

## 🗺️ 5. Görsel ve Fiziksel Uyumluluk (Krokiler)
- [x] **Yeni Blok Krokileri:** Eklenen yeni bloklar için kat planlarına uygun görsel krokiler (SVG veya görsel) hazırlanıp `LayoutModal` sistemine entegre edilecek.
- [x] **Kroki-Makine Sayısı Senkronizasyonu:** Bazı katlarda sistemdeki makine sayısı ile krokideki yerleşim uyuşmuyor. Bu tutarsızlık, her katın fiziksel yerleşimine göre tek tek kontrol edilip düzeltilecek.

---

## 📌 Öncelik Sıralaması (Öneri)
1.  **Blok Dönüşümü ve Yeni Bloklar:** (Sistemin temel yapısı olduğu için en önce bu yapılmalı)
2.  **Kroki Düzenlemeleri:** (Kullanıcı güveni için fiziksel doğruluk önemli)
3.  **Bildirim ve Zaman Girişi:** (Kullanıcı deneyimi iyileştirmesi)
4.  **Erken Bitirme:** (Operasyonel verimlilik)
