/**
 * PDF Loader - Loads PDF using Mozilla PDF.js and renders high-DPI canvases
 */

export class PdfLoader {
  constructor(pdfPath, options = {}) {
    this.pdfPath = pdfPath;
    this.options = {
      scale: options.scale || 2.0, // High quality scale
      thumbScale: options.thumbScale || 0.4,
      onProgress: options.onProgress || (() => {}),
      ...options
    };
    this.pdfDoc = null;
    this.pagesData = [];
    this.pageWidth = 595;
    this.pageHeight = 842;
  }

  async load() {
    if (!window.pdfjsLib) {
      throw new Error('PDF.js kütüphanesi yüklenemedi.');
    }

    // Set worker source
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // Set verbosity level to ERRORS to keep console clean from TrueType font warnings
    if (window.pdfjsLib.VerbosityLevel) {
      window.pdfjsLib.GlobalWorkerOptions.verbosity = window.pdfjsLib.VerbosityLevel.ERRORS;
    }

    this.options.onProgress(10, 'Katalog yükleniyor...');

    const loadingTask = window.pdfjsLib.getDocument({
      url: this.pdfPath,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
      verbosity: window.pdfjsLib.VerbosityLevel ? window.pdfjsLib.VerbosityLevel.ERRORS : 0
    });

    loadingTask.onProgress = (progress) => {
      if (progress.total > 0) {
        const percent = Math.min(Math.round((progress.loaded / progress.total) * 40) + 10, 50);
        this.options.onProgress(percent, `İndiriliyor: %${percent}`);
      }
    };

    this.pdfDoc = await loadingTask.promise;
    const numPages = this.pdfDoc.numPages;

    this.options.onProgress(50, `Sayfalar işleniyor (0/${numPages})...`);

    // Render all pages
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await this.pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: this.options.scale });
      const thumbViewport = page.getViewport({ scale: this.options.thumbScale });

      if (pageNum === 1) {
        // Base dimensions (at scale 1.0)
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        this.pageWidth = unscaledViewport.width || 595;
        this.pageHeight = unscaledViewport.height || 842;
      }

      // Render Main High-Res Page
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: false });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      await page.render(renderContext).promise;

      // Render Thumbnail Page
      const thumbCanvas = document.createElement('canvas');
      const thumbCtx = thumbCanvas.getContext('2d', { alpha: false });
      thumbCanvas.width = thumbViewport.width;
      thumbCanvas.height = thumbViewport.height;

      await page.render({
        canvasContext: thumbCtx,
        viewport: thumbViewport
      }).promise;

      this.pagesData.push({
        pageNum,
        canvas,
        dataUrl: canvas.toDataURL('image/jpeg', 0.92),
        thumbDataUrl: thumbCanvas.toDataURL('image/jpeg', 0.8),
        width: viewport.width,
        height: viewport.height
      });

      const percent = 50 + Math.round((pageNum / numPages) * 45);
      this.options.onProgress(percent, `Sayfalar hazırlandı (${pageNum}/${numPages})...`);
    }

    this.options.onProgress(100, 'Hazırlandı!');
    return {
      numPages: this.pdfDoc.numPages,
      pageWidth: this.pageWidth,
      pageHeight: this.pageHeight,
      pages: this.pagesData
    };
  }
}
