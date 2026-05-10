# Proje Analizi ve Önceliklendirilmiş Yapılacaklar Listesi

`spec.md` dosyasındaki "Güncel Durum ve Yapılacaklar" bölümüne dayanarak hazırlanan analiz raporu aşağıdadır. Görevler önem derecesine göre (P0-P2) kategorize edilmiştir.

## 📊 Genel Durum Analizi

Projenin temel iskeleti (Floor 1, 8 makine) kurulmuş durumda ancak sistemin ölçeklenmesi, güvenliği ve kararlılığı için kritik eksikler bulunmaktadır. Özellikle rol yönetimi ve dökümantasyonun güncelliği birincil öncelik taşımaktadır.

---

## 🛠 Önceliklendirilmiş Yapılacaklar Listesi

### 🔴 P0: Kritik ve Acil (Temel Altyapı)
1.  **Dökümantasyon Güncellemesi (`spec.md`): [tamamlandı]**
    *   **Neden:** Mevcut kod ile döküman arasında farklılıklar var. Yanlış döküman yanlış geliştirmeye yol açar.
    *   **Eylem:** Tüm `spec.md` dosyasını mevcut backend ve frontend yapısına göre güncellemek.
2.  **Admin ve Öğrenci Rollerinin Tanımlanması: [tamamlandı]**
    *   **Neden:** Güvenlik ve yetki kontrolü eksik. Öğrencilerin makine silme/ekleme yetkisi olmamalı.
    *   **Eylem:** Backend'de JWT veya benzeri bir yöntemle rol kontrolü (RBAC) eklemek, Frontend'de admin paneli taslağı oluşturmak.
3.  **Veritabanı Genişletme (Floor 2 ve A Blok): [tamamlandı]**
    *   **Neden:** Sistem şu an çok kısıtlı bir kapsamda.
    *   **Eylem:** Diğer katların ve blokların makinelerini veritabanına eklemek ve sistem limitlerini test etmek.

### 🟡 P1: Yüksek Öncelik (Stabilite ve Mimari)
4.  **Kapsamlı Fonksiyonel Testler:**
    *   **Neden:** Mantıksal hataların (aynı anda iki makine kullanımı vb.) önlenmesi gerekiyor.
    *   **Eylem:** Antigravity araçları ile senaryo bazlı (Race condition, yetkisiz erişim) testlerin yapılması ve raporlanması.
5.  **Mimari Düzenleme (Execution Katmanı): [tamamlandı]**
    *   **Neden:** 3 katmanlı mimari (Directive-Orchestration-Execution) kurallarına uyum sağlamak.
    *   **Eylem:** `backend` içindeki geçici DB scriptlerini `execution/` klasörüne taşımak ve deterministic hale getirmek.

### 🔵 P2: Orta Öncelik (Kullanıcı Deneyimi)
6.  **Bildirim Sistemi Entegrasyonu:**
    *   **Neden:** Çamaşırı biten kullanıcıyı uyarmak sistemin ana amaçlarından biri.
    *   **Eylem:** Web Push API veya e-posta servislerinin araştırılıp prototipinin yapılması.
7.  **Mobil Uyumluluk (Responsive Design) Testleri:**
    *   **Neden:** Öğrenciler sistemi %90 oranında mobilden kullanacaktır.
    *   **Eylem:** Farklı ekran boyutlarında UI testlerinin yapılması ve gerekirse Tailwind ile düzeltmelerin uygulanması.

---

## 🚀 Sonraki Adımlar

Bu rapor onaylandığında, **P0** seviyesinden başlayarak sırayla uygulama aşamasına geçebiliriz.

> [!IMPORTANT]
> Herhangi bir kod değişikliğine başlamadan önce **Dökümantasyon Güncellemesi (P0)** maddesinin tamamlanması, projenin geri kalanının tutarlı olması için şiddetle tavsiye edilir.
