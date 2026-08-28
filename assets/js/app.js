/**
 * Main Application Orchestrator - ABU Student Handbook Flipbook
 */

import { PdfLoader } from './pdf-loader.js';
import { HotspotManager } from './hotspot-manager.js';
import { FlipbookController } from './flipbook.js';
import { ToolbarController } from './toolbar.js';
import { modalPlayer } from './modal-player.js';

class App {
  constructor() {
    this.pdfPath = './assets/pdf/student-handbook-abu.pdf';
    this.configPath = './config/hotspots.json';

    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingText = document.getElementById('loading-text');
    this.loadingProgress = document.getElementById('loading-progress');
    this.flipbookContainer = document.getElementById('flipbook-container');
    
    this.pdfLoader = null;
    this.hotspotManager = null;
    this.flipbook = null;
    this.toolbar = null;
  }

  async start() {
    try {
      // 1. Hotspot konfigürasyonunu yükle
      this.hotspotManager = new HotspotManager(this.configPath);
      await this.hotspotManager.loadConfig();

      // 2. PDF Dosyasını yükle ve render et
      this.pdfLoader = new PdfLoader(this.pdfPath, {
        onProgress: (percent, text) => {
          if (this.loadingProgress) this.loadingProgress.textContent = `%${percent}`;
          if (this.loadingText) this.loadingText.textContent = text;
        }
      });

      const pdfData = await this.pdfLoader.load();

      // 3. Sayfa 0 (Kapak & Video Penceresi) + PDF Sayfaları DOM'unu Üret
      const allPagesData = this.buildAllPagesDOM(pdfData.pages);

      // 4. StPageFlip motorunu başlat
      this.flipbook = new FlipbookController(this.flipbookContainer);
      this.flipbook.init(allPagesData, pdfData.pageWidth, pdfData.pageHeight);

      // 5. Araç Çubuğu ve Thumbnail Çekmecesini bağla
      this.toolbar = new ToolbarController(this.flipbook);
      this.toolbar.renderThumbnails(allPagesData);

      // 6. Yükleme ekranını kapat
      setTimeout(() => {
        if (this.loadingScreen) {
          this.loadingScreen.classList.add('hidden');
        }
      }, 400);

      // 7. Yeniden boyutlandırma dinleyicisi
      this.initResizeHandler(pdfData);

    } catch (error) {
      console.error('Uygulama başlatma hatası:', error);
      if (this.loadingText) {
        this.loadingText.textContent = 'Bir hata oluştu: ' + error.message;
        this.loadingText.style.color = '#ef4444';
      }
    }
  }

  buildAllPagesDOM(pdfPages) {
    if (!this.flipbookContainer) return [];
    this.flipbookContainer.innerHTML = '';

    const allPages = [];

    // --- SAYFA 0: KAPAK & PENCERE ŞEKLİNDE VİDEO OYNATICI ---
    const coverPageEl = document.createElement('div');
    coverPageEl.className = 'page cover-page';
    coverPageEl.dataset.pageNumber = '0';

    coverPageEl.innerHTML = `
      <div class="cover-content">
        <div class="cover-header">
          <div class="cover-logo-row">
            <img src="./assets/images/abu_crest_512.png" alt="Arma" class="cover-crest">
            <div>
              <div class="cover-uni-title">ANTALYA BİLİM ÜNİVERSİTESİ</div>
              <div class="cover-dept-title">Bilgi İşlem Daire Başkanlığı</div>
            </div>
          </div>
          <div class="cover-main-heading">
            <h1 class="cover-handbook-title">Öğrenci Başlangıç El Kitabı</h1>
            <span class="cover-badge-tag">Dijital Rehber & Video Anlatım</span>
          </div>
        </div>

        <!-- Video Penceresi -->
        <div class="cover-video-window">
          <div class="window-header">
            <div class="window-controls">
              <span class="window-dot red"></span>
              <span class="window-dot yellow"></span>
              <span class="window-dot green"></span>
            </div>
            <div class="window-title">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <span>Rehber Video Oynatıcı</span>
            </div>
            <button class="window-expand-btn" id="cover-video-expand-btn" title="Büyük Ekranda Aç" aria-label="Büyüt">
              <svg viewBox="0 0 24 24">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </button>
          </div>
          <div class="window-screen">
            <iframe 
              src="https://www.youtube-nocookie.com/embed/eJqzn6EeHRc?rel=0&modestbranding=1&enablejsapi=1" 
              title="Antalya Bilim Üniversitesi Rehber Videosu" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen>
            </iframe>
          </div>
        </div>

        <!-- Kapak Alt Bilgi -->
        <div class="cover-footer">
          <span>Akademik Bilgi Sistemleri</span>
          <div class="cover-guide-text">
            <span>Sayfayı Çevirin</span>
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
      </div>
    `;

    // Expand butonunu modal yöneticisine bağla
    const expandBtn = coverPageEl.querySelector('#cover-video-expand-btn');
    if (expandBtn) {
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modalPlayer.open('eJqzn6EeHRc', 'Antalya Bilim Üniversitesi - Rehber Videosu');
      });
    }

    this.flipbookContainer.appendChild(coverPageEl);

    // Kapak sayfası verisini listeye ekle
    allPages.push({
      pageNum: 0,
      isCover: true,
      thumbDataUrl: './assets/images/abu_crest_512.png',
      topic: 'Kapak & Video Penceresi'
    });

    // --- SAYFA 1 - 7: PDF SAYFALARI ---
    pdfPages.forEach((page) => {
      const pageEl = document.createElement('div');
      pageEl.className = 'page';
      pageEl.dataset.pageNumber = page.pageNum;

      const pageContent = document.createElement('div');
      pageContent.className = 'page-content';

      const img = document.createElement('img');
      img.className = 'page-canvas';
      img.src = page.dataUrl;
      img.alt = `Sayfa ${page.pageNum}`;
      img.draggable = false;

      pageContent.appendChild(img);

      // Hotspot Katmanını Sayfaya Ekle
      this.hotspotManager.renderHotspotsForPage(page.pageNum, pageContent);

      pageEl.appendChild(pageContent);
      this.flipbookContainer.appendChild(pageEl);

      allPages.push({
        pageNum: page.pageNum,
        isCover: false,
        thumbDataUrl: page.thumbDataUrl,
        topic: this.getTopicForPage(page.pageNum)
      });
    });

    return allPages;
  }

  getTopicForPage(pageNum) {
    const topics = {
      1: 'Kablosuz İnternet (ABU-Student)',
      2: 'E-Posta Kullanımı (Office 365)',
      3: 'Şifre Yenileme (RMP)',
      4: 'Öğrenci Bilgi Sistemi (S.I.S)',
      5: 'SIS Giriş Ekranı',
      6: 'Öğretim Yönetim Sistemi (E-Ders)',
      7: 'Uzaktan Eğitim Sistemi (Kampüs)'
    };
    return topics[pageNum] || `Bölüm ${pageNum}`;
  }

  initResizeHandler(pdfData) {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Yeniden boyutlandırma
      }, 300);
    });
  }
}

// DOM hazır olduğunda başlat
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.start();
});
