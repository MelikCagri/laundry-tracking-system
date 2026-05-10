# 🧪 Kullanıcı Senaryoları – KYK Çamaşırhane Takip Sistemi

Bu dosya, sistemin temel işlevselliğini doğrulamak için kullanılacak senaryo kataloğunu içerir.
Testler bu senaryolar üzerinden çalıştırılacak, eksikler bir implementation artifact'ına aktarılacaktır.

---

## Senaryo 1: İlk Kez Kullanan Öğrenci – Makine Doldurma (Temel Akış)

**Kaynak:** Kullanıcı tarafından tanımlandı.

**Aktörler:** Yeni öğrenci (kaydı yok)

**Adımlar:**

1. Öğrenci sisteme girer. Numara girmeden ana sayfayı görür.
2. Blok ve kat seçer, makinelerin durumlarını (Boş/Dolu/Bitti/Arızalı) görüntüler.
3. Boş bir çamaşır makinesi seçer ve "Doldur" aksiyonunu başlatır.
4. Sistem, numara kaydı olmadığı için **bir kereye mahsus** telefon numarası ister.
5. Numara kaydedilir, öğrenciye bir dahili ID atanır.
6. Öğrenci dakika bilgisini girer (örn. 45 dk) ve onaylar.
7. Makine durumu "Dolu" olarak güncellenir, `endTime` hesaplanır.

**Beklenen Sonuç:** Makine "Dolu" görünür, `activeUserId` alanı dolu, `endTime` doğru set edilmiş.

**Başarı Kriteri:** ✅ Sisteme giriş → ✅ Numara kaydı → ✅ Makine doldu

---

## Senaryo 2: Tanınan Öğrenci – Numara Sorulmadan Aksiyon

**Aktörler:** Daha önce kayıtlı öğrenci

**Adımlar:**

1. Daha önce numarasını kaydetmiş öğrenci sisteme tekrar girer.
2. Boş bir makine seçer ve "Doldur" aksiyonunu başlatır.
3. Sistem bu sefer telefon numarası **istemez**, öğrenciyi tanır.
4. Öğrenci süreyi girer, makine dolar.

**Beklenen Sonuç:** Numara sorulmadan işlem tamamlanır.

**Başarı Kriteri:** ✅ LocalStorage / session bazlı kimlik doğrulama çalışıyor.

---

## Senaryo 3: Dolu Makine için Sıraya Girme

**Aktörler:** İkinci bir öğrenci (makine zaten dolu)

**Adımlar:**

1. Öğrenci panele girer, bir makinenin "Dolu" olduğunu görür.
2. "Sıraya Gir" butonuna basar.
3. Numara kaydı yoksa numara istenir, varsa doğrudan sıraya eklenir.
4. Öğrenci sıradaki konumunu görebilir (örn. "2. sıradasınız").

**Beklenen Sonuç:** Queue tablosuna `status: WAITING` ile yeni bir kayıt eklenir.

**Başarı Kriteri:** ✅ Sıra kaydı doğru oluştu → ✅ Konum bilgisi gösterildi.

---

## Senaryo 4: Süre Sonu Bildirimleri

**Aktörler:** Makineyi dolduran öğrenci, bildirim sistemi

**Adımlar:**

1. Öğrenci 45 dakikalık bir yıkama başlatır.
2. 30. dakikada sistem **15 dakika kaldı** bildirimi atar.
3. 45. dakikada makine otomatik olarak "Bitti" durumuna geçer ve **süre doldu** bildirimi atar.

**Beklenen Sonuç:** İki ayrı bildirim doğru zamanda gönderilir.

**⚠️ Mevcut Durum:** Temel sistemi ayağa kaldırmak için bildirim sistemi en son aşamaya bırakıldı.

**Başarı Kriteri:** ⏭️ Sonraya Bırakıldı.

---

## Senaryo 5: Süre Uzatma (Extend)

**Aktörler:** Makinenin aktif kullanıcısı

**Adımlar:**

1. Makine "Dolu" veya "Bitti" durumundayken aktif kullanıcı "Süre Uzat" butonuna basar.
2. Ek süre girer (örn. 15 dk).
3. `endTime` güncellenir, `durationMinutes` artar.
4. Makine durumu "Dolu" olarak kalır veya "Bitti"den "Dolu"ya döner.

**Beklenen Sonuç:** Süre başarıyla uzatılır, Log tablosuna `EXTEND` kaydı düşer.

**Başarı Kriteri:** ✅ endTime güncellendi → ✅ Log kaydı oluştu.

---

## Senaryo 6: Makineyi Boşaltma ve Sıra Tetiklemesi

**Aktörler:** Aktif kullanıcı, sırada bekleyen öğrenci

**Adımlar:**

1. Aktif kullanıcı çamaşırlarını alır ve "Makineyi Boşalt" butonuna basar.
2. Makine durumu "Boş"a döner.
3. Sırada bekleyen varsa **sıradaki kullanıcıya** bildirim gönderilir: "Sıra sizde! Kullanmak ister misiniz?"
4. Kullanıcı "Evet" derse makine ona atanır ve süre girişi açılır.
5. Kullanıcı "Hayır / Atla" derse o kullanıcı `SKIPPED` olarak işaretlenir ve bir sonraki sıradaki uyarılır.

**Beklenen Sonuç:** Sıra mekanizması doğru çalışır, `WAITING → COMPLETED/SKIPPED` geçişleri sağlanır.

**⚠️ Mevcut Durum:** Sıra bildirimi ve skip mekanizması henüz tam test edilmedi.

**Başarı Kriteri:** ✅ Makine boşaldı → ✅ Sıra bildirimi gönderildi → ✅ Queue status güncellendi.

---

## Senaryo 7: Makine Arıza Raporlama

**Aktörler:** Herhangi bir öğrenci

**Adımlar:**

1. Öğrenci fiziksel olarak bozuk olan bir makineyi görür.
2. Panelden o makineyi seçer, "Arıza Bildir" butonuna basar.
3. Belirli bir eşik sayısı raporlamaya ulaşınca (örn. 3 rapor) makine otomatik `BOZUK` durumuna geçer.

**Beklenen Sonuç:** Rapor sayısı eşiği geçince makine kilitlenir.

**Başarı Kriteri:** ✅ Raporlar sayıldı → ✅ Durum BOZUK olarak güncellendi.

---

## Senaryo 8: Admin – Makine Yönetimi

**Aktörler:** Admin kullanıcı

**Adımlar:**

1. Admin kullanıcı sisteme admin kimliğiyle giriş yapar.
2. Yeni bir makine ekler (blok, kat, tip bilgisiyle).
3. Var olan bir makineyi siler veya durumunu manuel olarak "Boş" yapar (force reset).
4. Öğrenci kullanıcı bu işlemleri yapmaya çalışırsa sistem engeller.

**Beklenen Sonuç:** RBAC doğru çalışıyor, yetkisiz erişim engelleniyor.

**Başarı Kriteri:** ✅ Admin işlemleri başarılı → ✅ Student engellendi (403).

---

## Senaryo 9: Aynı Anda İki Makine Kullanımı (Kısıtlama Testi)

**Aktörler:** Tek bir öğrenci

**Adımlar:**

1. Öğrenci zaten bir makinesi dolu durumdayken ikinci bir makineyi doldurmaya çalışır.
2. Sistem bu işlemi engeller mi? (Spec'e göre karar verilmeli)

**⚠️ Karar:** Öğrencilerin birden fazla makine kullanması serbest bırakılmıştır. Kısıtlama uygulanmayacak.

**Başarı Kriteri:** ✅ Serbest (Kısıtlama Yok).

---

## Senaryo 10: Mobil Uyumluluk Kontrolü

**Aktörler:** Mobilden bağlanan öğrenci

**Adımlar:**

1. Öğrenci sisteme telefon tarayıcısından girer.
2. Ana sayfa, makine kartları, modal pencereler ve butonlar düzgün görüntülenir.
3. Tüm aksiyonlar (doldur, sıraya gir, boşalt) dokunmatik ekranda sorunsuz çalışır.

**Beklenen Sonuç:** Hiçbir UI elemanı kırık veya ulaşılmaz değil.

**⚠️ Mevcut Durum:** Temel akışlar test edildikten sonra browser subagent ile mobil cihaz boyutlarında (örn. 390x844) test edildi. Arayüz elemanları duyarlı (responsive) çalışıyor ve taşma yaşanmıyor.

**Başarı Kriteri:** ✅ BAŞARILI.

---

## 📋 Senaryo Durumu Özeti

| # | Senaryo | Durum |
|---|---------|-------|
| 1 | İlk kez kullanan öğrenci – makine doldurma | ⏳ Test edilecek |
| 2 | Tanınan öğrenci – numara sorulmadan aksiyon | ⏳ Test edilecek |
| 3 | Dolu makine için sıraya girme | ⏳ Test edilecek |
| 4 | Süre sonu bildirimleri | ⏭️ Sonraya Bırakıldı |
| 5 | Süre uzatma (extend) | ⏳ Test edilecek |
| 6 | Makineyi boşaltma ve sıra tetiklemesi | ⏳ Test edilecek |
| 7 | Makine arıza raporlama | ⏳ Test edilecek |
| 8 | Admin – makine yönetimi | ⏳ Test edilecek |
| 9 | Aynı anda iki makine kullanımı | ✅ Serbest (Kısıtlama Yok) |
| 10 | Mobil uyumluluk | ✅ Başarılı |

---

> **Sonraki Adım:** Bu senaryolar üzerinden sistemde gezinilecek, her adımın çalışıp çalışmadığı raporlanacak ve eksikler bir **Implementation Artifact** olarak belgelenecektir.
