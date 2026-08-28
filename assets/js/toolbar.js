/**
 * Toolbar & UI Controller - Handles user interaction, zoom, thumbnails, and keyboard shortcuts
 */

import { soundManager } from './sound-manager.js';

export class ToolbarController {
  constructor(flipbook) {
    this.flipbook = flipbook;
    this.zoomLevel = 1.0;
    this.minZoom = 0.8;
    this.maxZoom = 2.0;
    this.zoomStep = 0.15;

    this.viewportEl = document.querySelector('.flipbook-viewport');
    this.drawerEl = document.querySelector('.thumbnails-drawer');
    this.drawerBodyEl = document.querySelector('.drawer-body');
    this.pageInput = document.getElementById('page-input');
    this.pageTotalEl = document.getElementById('page-total');
    
    this.btnPrev = document.getElementById('btn-prev');
    this.btnNext = document.getElementById('btn-next');
    this.arrowPrev = document.querySelector('.nav-arrow.prev');
    this.arrowNext = document.querySelector('.nav-arrow.next');

    this.btnZoomIn = document.getElementById('btn-zoom-in');
    this.btnZoomOut = document.getElementById('btn-zoom-out');
    this.btnZoomReset = document.getElementById('btn-zoom-reset');
    this.btnFullscreen = document.getElementById('btn-fullscreen');
    this.btnSound = document.getElementById('btn-sound');
    this.btnThumbnails = document.getElementById('btn-thumbnails');
    this.btnCloseDrawer = document.getElementById('btn-close-drawer');
    this.btnDownload = document.getElementById('btn-download');

    this.initEvents();
    this.initKeyboardShortcuts();
    this.updateSoundBtnState();
  }

  initEvents() {
    // Navigation
    if (this.btnPrev) this.btnPrev.addEventListener('click', () => this.flipbook.flipPrev());
    if (this.btnNext) this.btnNext.addEventListener('click', () => this.flipbook.flipNext());
    if (this.arrowPrev) this.arrowPrev.addEventListener('click', () => this.flipbook.flipPrev());
    if (this.arrowNext) this.arrowNext.addEventListener('click', () => this.flipbook.flipNext());

    // Page Input
    if (this.pageInput) {
      this.pageInput.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 1 && val <= this.flipbook.totalPages) {
          this.flipbook.turnToPage(val - 1);
        } else {
          this.updatePageIndicator(this.flipbook.getCurrentPageIndex(), this.flipbook.totalPages);
        }
      });
      this.pageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.pageInput.blur();
        }
      });
    }

    // Zoom
    if (this.btnZoomIn) {
      this.btnZoomIn.addEventListener('click', () => this.setZoom(this.zoomLevel + this.zoomStep));
    }
    if (this.btnZoomOut) {
      this.btnZoomOut.addEventListener('click', () => this.setZoom(this.zoomLevel - this.zoomStep));
    }
    if (this.btnZoomReset) {
      this.btnZoomReset.addEventListener('click', () => this.setZoom(1.0));
    }

    // Fullscreen
    if (this.btnFullscreen) {
      this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
    }

    // Sound
    if (this.btnSound) {
      this.btnSound.addEventListener('click', () => {
        soundManager.toggle();
        this.updateSoundBtnState();
      });
    }

    // Thumbnails Drawer
    if (this.btnThumbnails) {
      this.btnThumbnails.addEventListener('click', () => this.toggleDrawer());
    }
    if (this.btnCloseDrawer) {
      this.btnCloseDrawer.addEventListener('click', () => this.closeDrawer());
    }

    // Download PDF
    if (this.btnDownload) {
      this.btnDownload.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = './assets/pdf/student-handbook-abu.pdf';
        link.download = 'student-handbook-abu.pdf';
        link.click();
      });
    }

    // Flipbook page change subscription
    this.flipbook.onPageChange((pageIndex, totalPages) => {
      this.updatePageIndicator(pageIndex, totalPages);
      this.updateNavButtons(pageIndex, totalPages);
      this.highlightThumbnail(pageIndex);
    });
  }

  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          this.flipbook.flipNext();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          this.flipbook.flipPrev();
          break;
        case 'Home':
          e.preventDefault();
          this.flipbook.turnToPage(0);
          break;
        case 'End':
          e.preventDefault();
          this.flipbook.turnToPage(this.flipbook.totalPages - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          this.toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          soundManager.toggle();
          this.updateSoundBtnState();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          this.toggleDrawer();
          break;
        case '+':
        case '=':
          e.preventDefault();
          this.setZoom(this.zoomLevel + this.zoomStep);
          break;
        case '-':
        case '_':
          e.preventDefault();
          this.setZoom(this.zoomLevel - this.zoomStep);
          break;
        case '0':
          e.preventDefault();
          this.setZoom(1.0);
          break;
      }
    });
  }

  setZoom(level) {
    this.zoomLevel = Math.min(Math.max(level, this.minZoom), this.maxZoom);
    if (this.viewportEl) {
      this.viewportEl.style.transform = `scale(${this.zoomLevel})`;
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  updateSoundBtnState() {
    if (!this.btnSound) return;
    if (soundManager.isEnabled) {
      this.btnSound.classList.add('active');
      this.btnSound.setAttribute('title', 'Sesi Kapat (M)');
      this.btnSound.innerHTML = `
        <svg viewBox="0 0 24 24">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      `;
    } else {
      this.btnSound.classList.remove('active');
      this.btnSound.setAttribute('title', 'Sesi Aç (M)');
      this.btnSound.innerHTML = `
        <svg viewBox="0 0 24 24">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      `;
    }
  }

  updatePageIndicator(pageIndex, totalPages) {
    const currentDisplayPage = pageIndex + 1;
    if (this.pageInput) {
      this.pageInput.value = currentDisplayPage;
    }
    if (this.pageTotalEl) {
      this.pageTotalEl.textContent = `/ ${totalPages}`;
    }
  }

  updateNavButtons(pageIndex, totalPages) {
    const isFirst = pageIndex <= 0;
    const isLast = pageIndex >= totalPages - 1;

    if (this.btnPrev) this.btnPrev.disabled = isFirst;
    if (this.arrowPrev) this.arrowPrev.disabled = isFirst;

    if (this.btnNext) this.btnNext.disabled = isLast;
    if (this.arrowNext) this.arrowNext.disabled = isLast;
  }

  toggleDrawer() {
    if (this.drawerEl) {
      this.drawerEl.classList.toggle('open');
    }
  }

  closeDrawer() {
    if (this.drawerEl) {
      this.drawerEl.classList.remove('open');
    }
  }

  renderThumbnails(pagesData) {
    if (!this.drawerBodyEl) return;
    this.drawerBodyEl.innerHTML = '';

    pagesData.forEach((page, index) => {
      const card = document.createElement('div');
      card.className = `thumb-card ${index === 0 ? 'active' : ''}`;
      card.dataset.pageIndex = index;

      card.innerHTML = `
        <div class="thumb-preview">
          <img src="${page.thumbDataUrl}" alt="Sayfa ${page.pageNum}" loading="lazy">
        </div>
        <span class="thumb-label">Sayfa ${page.pageNum}</span>
      `;

      card.addEventListener('click', () => {
        this.flipbook.turnToPage(index);
        if (window.innerWidth <= 768) {
          this.closeDrawer();
        }
      });

      this.drawerBodyEl.appendChild(card);
    });
  }

  highlightThumbnail(pageIndex) {
    const cards = document.querySelectorAll('.thumb-card');
    cards.forEach((card, idx) => {
      if (idx === pageIndex) {
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        card.classList.remove('active');
      }
    });
  }
}
