/**
 * Main Application Orchestrator - ABU Student Handbook Flipbook
 */

import { PdfLoader } from './pdf-loader.js';
import { HotspotManager } from './hotspot-manager.js';
import { FlipbookController } from './flipbook.js';
import { ToolbarController } from './toolbar.js';

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

      // 3. DOM Elemanlarını (Sayfaları) Üret
      this.buildPagesDOM(pdfData.pages);

      // 4. StPageFlip motorunu başlat
      this.flipbook = new FlipbookController(this.flipbookContainer);
      this.flipbook.init(pdfData.pages, pdfData.pageWidth, pdfData.pageHeight);

      // 5. Araç Çubuğu ve Thumbnail Çekmecesini bağla
      this.toolbar = new ToolbarController(this.flipbook);
      this.toolbar.renderThumbnails(pdfData.pages);

      // 6. Yükleme ekranını kapat
      setTimeout(() => {
        if (this.loadingScreen) {
          this.loadingScreen.classList.add('hidden');
        }
      }, 400);

      // 7. Responsive Yeniden Boyutlandırma Dinleyicisi
      this.initResizeHandler(pdfData);

    } catch (error) {
      console.error('Uygulama başlatma hatası:', error);
      if (this.loadingText) {
        this.loadingText.textContent = 'Bir hata oluştu: ' + error.message;
        this.loadingText.style.color = '#ef4444';
      }
    }
  }

  buildPagesDOM(pagesData) {
    if (!this.flipbookContainer) return;
    this.flipbookContainer.innerHTML = '';

    pagesData.forEach((page, index) => {
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
    });
  }

  initResizeHandler(pdfData) {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Ekran boyutu değiştiğinde flipbook'u yeniden boyutlandır
        // StPageFlip fixed boyutta yeniden hesaplama yapar
      }, 300);
    });
  }
}

// Uygulamayı DOM hazır olduğunda başlat
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.start();
});
