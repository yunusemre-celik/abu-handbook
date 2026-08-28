/**
 * Flipbook Controller - Wraps and configures StPageFlip
 * Fully responsive for Desktop, Tablet, and Mobile
 */

import { soundManager } from './sound-manager.js';

export class FlipbookController {
  constructor(containerEl, options = {}) {
    this.containerEl = containerEl;
    this.options = options;
    this.pageFlip = null;
    this.currentPage = 0;
    this.totalPages = 0;
    this.onPageChangeCallbacks = [];
    this.pagesData = [];
    this.baseWidth = 595;
    this.baseHeight = 842;
  }

  init(pagesData, baseWidth, baseHeight) {
    if (!window.St || !window.St.PageFlip) {
      throw new Error('StPageFlip kütüphanesi yüklenemedi.');
    }

    this.pagesData = pagesData;
    this.totalPages = pagesData.length;
    this.baseWidth = (typeof baseWidth === 'number' && baseWidth > 0) ? baseWidth : 595;
    this.baseHeight = (typeof baseHeight === 'number' && baseHeight > 0) ? baseHeight : 842;

    const { width, height, isMobile } = this.calculateDimensions();

    const minW = 100;
    const maxW = 3000;
    const minH = 100;
    const maxH = 3000;

    // Initialize StPageFlip
    this.pageFlip = new window.St.PageFlip(this.containerEl, {
      width: Math.max(minW, Math.min(maxW, width)),
      height: Math.max(minH, Math.min(maxH, height)),
      size: 'fixed',
      minWidth: minW,
      maxWidth: maxW,
      minHeight: minH,
      maxHeight: maxH,
      showCover: true,
      maxShadowOpacity: 0.35,
      mobileScrollSupport: true,
      usePortrait: isMobile,
      autoSize: true,
      drawShadow: true,
      flippingTime: 600,
      useMouseEvents: true,
      swipeDistance: 20
    });

    // Load DOM elements
    const pageElements = this.containerEl.querySelectorAll('.page');
    this.pageFlip.loadFromHTML(pageElements);

    // Event Listeners
    this.pageFlip.on('flip', (e) => {
      this.currentPage = e.data;
      soundManager.playFlip();
      this.notifyPageChange(this.currentPage);
    });

    // Initial page notification
    this.notifyPageChange(0);

    // Handle Orientation & Window Resize dynamically
    this.initResponsiveListener();
  }

  calculateDimensions() {
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const isMobile = winW <= 768;
    const aspectRatio = this.baseWidth / this.baseHeight;

    let singlePageWidth, singlePageHeight;

    if (isMobile) {
      // Mobile Single Page Portrait: Fits comfortably on screen with header & toolbar room
      const maxAvailableWidth = winW - 16;
      const maxAvailableHeight = Math.max(360, winH - 150);

      let pageH = maxAvailableHeight;
      let pageW = pageH * aspectRatio;

      if (pageW > maxAvailableWidth) {
        pageW = maxAvailableWidth;
        pageH = pageW / aspectRatio;
      }

      singlePageWidth = Math.round(pageW);
      singlePageHeight = Math.round(pageH);
    } else {
      // Desktop / Tablet Double-Page Spread
      const targetHeight = Math.max(680, Math.min(winH * 0.84, 940));
      let bookHeight = targetHeight;
      let bookWidth = (bookHeight * aspectRatio) * 2;

      const maxAllowedWidth = Math.min(winW - 140, 1560);
      if (bookWidth > maxAllowedWidth) {
        bookWidth = maxAllowedWidth;
        bookHeight = (bookWidth / 2) / aspectRatio;
      }

      singlePageWidth = Math.round(bookWidth / 2);
      singlePageHeight = Math.round(bookHeight);
    }

    return {
      width: singlePageWidth,
      height: singlePageHeight,
      isMobile
    };
  }

  initResponsiveListener() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!this.pageFlip) return;
        const { width, height } = this.calculateDimensions();
        try {
          if (typeof this.pageFlip.update === 'function') {
            this.pageFlip.update();
          }
        } catch (e) {
          // ignore resize sync notices
        }
      }, 250);
    });
  }

  onPageChange(callback) {
    this.onPageChangeCallbacks.push(callback);
  }

  notifyPageChange(pageIndex) {
    this.onPageChangeCallbacks.forEach(cb => cb(pageIndex, this.totalPages));
  }

  flipNext() {
    if (this.pageFlip) {
      this.pageFlip.flipNext('top');
    }
  }

  flipPrev() {
    if (this.pageFlip) {
      this.pageFlip.flipPrev('top');
    }
  }

  turnToPage(pageIndex) {
    if (this.pageFlip && pageIndex >= 0 && pageIndex < this.totalPages) {
      this.pageFlip.turnToPage(pageIndex);
    }
  }

  getCurrentPageIndex() {
    return this.currentPage;
  }
}
