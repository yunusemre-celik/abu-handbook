# Antalya Bilim Üniversitesi - Dijital Öğrenci El Kitabı (Digital Flipbook)

Bu web uygulaması, Antalya Bilim Üniversitesi Öğrenci Başlangıç El Kitabı'nı modern, interaktif ve 3D sayfa çevirme efektli bir dijital el kitabına dönüştürür. Sıfır backend bağımlılığıyla doğrudan **GitHub Pages** üzerinde çalışacak şekilde geliştirilmiştir.

---

##  Öne Çıkan Özellikler

1. **GitHub Pages Uyumlu (Zero Backend / Zero Build):**
   - Herhangi bir derleme (build) komutuna ihtiyaç duymaz.
   - Tüm yollar görecelidir (`./`), alt dizinlerde (ör. `https://kullaniciadi.github.io/abu-handbook/`) 404 hatası vermez.
2. **Yüksek Çözünürlüklü Sayfa İşleme (Mozilla PDF.js):**
   - Retina ekranlar için optimize edilmiş `devicePixelRatio` canvas render motoru.
3. **Gerçekçi 3D Sayfa Çevirme (StPageFlip):**
   - Masaüstünde çift sayfa (spread), mobil ve dikey cihazlarda tek sayfa (portrait) modu.
   - Sürükle-bırak sayfa çevirme fiziği ve yumuşak gölgelendirmeler.
4. **İnteraktif YouTube Lightbox / Hotspot Katmanı:**
   - 1. sayfada üst-orta alanda konumlandırılmış, nabız animasyonlu (pulsing) interaktif video rehber butonu.
   - Tıklandığında YouTube videosunu (`eJqzn6EeHRc`) responsive 16:9 modal pencerede oynatır.
   - Koordinatlar ve video bilgileri `config/hotspots.json` üzerinden dinamik yönetilir.
5. **Kapsamlı Kontrol Çubuğu (Floating UI Toolbar):**
   - Sayfa numaraları ve doğrudan sayfaya gitme desteği.
   - Yakınlaştırma / Uzaklaştırma / Sıfırlama (Zoom & Pan).
   - Tam Ekran modu (Fullscreen API).
   - Sayfa çevirme ses efekti (Aç/Kapat desteği).
   - Sol taraftan açılan hızlı sayfa önizleme çekmecesi (Thumbnails Drawer).
   - Orijinal PDF'i indirme butonu.

---

##  Proje Dizin Yapısı

```text
abu-handbook-flipbook/
├── index.html                      # Ana HTML5 giriş sayfası
├── config/
│   └── hotspots.json              # Dinamik hotspot ve video koordinatları
├── assets/
│   ├── pdf/
│   │   └── student-handbook-abu.pdf # Kaynak PDF dosyası
│   ├── css/
│   │   ├── style.css              # Ana tema ve global layout
│   │   ├── flipbook.css           # Flipbook sahnesi ve sayfa stilleri
│   │   ├── hotspots.css           # Hotspot butonları ve animasyonlar
│   │   ├── modal.css              # YouTube Lightbox / Modal
│   │   └── toolbar.css            # Alt kontrol çubuğu ve Thumbnails
│   └── js/
│       ├── app.js                 # Ana uygulama yöneticisi
│       ├── pdf-loader.js          # PDF.js render sistemi
│       ├── flipbook.js            # StPageFlip entegrasyonu
│       ├── hotspot-manager.js     # Hotspot katmanı oluşturucu
│       ├── modal-player.js        # YouTube modal yöneticisi
│       ├── sound-manager.js       # Sayfa çevirme ses sentezleyici
│       └── toolbar.js             # UI navigasyon ve kısayollar
└── README.md
```

---

##  GitHub Pages Üzerinde Yayınlama

1. GitHub'da yeni bir repository (depo) oluşturun (örneğin: `abu-handbook`).
2. Bu klasörün içindeki tüm dosyaları deponuza yükleyin (push edin):
   ```bash
   git init
   git add .
   git commit -m "feat: initial flipbook release"
   git branch -M main
   git remote add origin https://github.com/<kullanici-adiniz>/<repo-adiniz>.git
   git push -u origin main
   ```
3. GitHub deponuzda **Settings (Ayarlar)** > **Pages** menüsüne gidin.
4. **Source** kısmında **Deploy from a branch** seçin, **Branch** olarak `main` ve `/ (root)` seçip **Save** butonuna tıklayın.
5. 1-2 dakika içinde siteniz `https://<kullanici-adiniz>.github.io/<repo-adiniz>/` adresinde canlıya geçecektir!

---

## ⌨️ Klavye Kısayolları

- **Sağ Ok / PageDown:** Sonraki Sayfa
- **Sol Ok / PageUp:** Önceki Sayfa
- **Home:** İlk Sayfa (Kapak)
- **End:** Son Sayfa
- **F:** Tam Ekran Aç / Kapat
- **M:** Sayfa Sesini Aç / Kapat
- **T:** Sayfa Küçük Resimler Çekmecesini Aç / Kapat
- **+ / - / 0:** Yakınlaştır / Uzaklaştır / Boyutu Sıfırla
- **ESC:** Video Modalını Kapat
