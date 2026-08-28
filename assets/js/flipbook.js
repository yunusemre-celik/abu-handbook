/**
 * Flipbook Controller - Wraps and configures StPageFlip
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
  }

  init(pagesData, baseWidth, baseHeight) {
    if (!window.St || !window.St.PageFlip) {
      throw new Error('StPageFlip kütüphanesi yüklenemedi.');
    }

    this.totalPages = pagesData.length;

    // Safe base dimensions (A4 fallback if missing)
    const safeBaseWidth = (typeof baseWidth === 'number' && baseWidth > 0) ? baseWidth : 595;
    const safeBaseHeight = (typeof baseHeight === 'number' && baseHeight > 0) ? baseHeight : 842;
    const aspectRatio = safeBaseWidth / safeBaseHeight;

    // Calculate dimensions to fit viewport while keeping PDF aspect ratio
    const stage = document.querySelector('.viewer-stage');
    const stageWidth = stage && stage.clientWidth > 0 ? stage.clientWidth : window.innerWidth;
    const stageHeight = stage && stage.clientHeight > 0 ? stage.clientHeight : window.innerHeight;

    const availableWidth = Math.max(300, stageWidth - 30);
    const availableHeight = Math.max(400, stageHeight - 40);

    const isMobile = window.innerWidth <= 768;

    let singlePageWidth, singlePageHeight;

    if (isMobile) {
      // Single page portrait mode
      const maxHeight = availableHeight * 0.95;
      const maxWidth = availableWidth * 0.95;

      singlePageHeight = Math.min(maxHeight, maxWidth / aspectRatio);
      singlePageWidth = singlePageHeight * aspectRatio;
    } else {
      // Double page spread mode: 2 pages side-by-side
      const maxBookWidth = availableWidth * 0.92;
      const maxBookHeight = availableHeight * 0.92;

      let bookHeight = maxBookHeight;
      let bookWidth = (bookHeight * aspectRatio) * 2;

      if (bookWidth > maxBookWidth) {
        bookWidth = maxBookWidth;
        bookHeight = (bookWidth / 2) / aspectRatio;
      }

      singlePageWidth = bookWidth / 2;
      singlePageHeight = bookHeight;
    }

    // Strict safety clamp to ensure positive integers within wide bounds
    const minW = 100;
    const maxW = 3000;
    const minH = 100;
    const maxH = 3000;

    const finalWidth = Math.max(minW, Math.min(maxW, Math.round(singlePageWidth)));
    const finalHeight = Math.max(minH, Math.min(maxH, Math.round(singlePageHeight)));

    // Initialize StPageFlip
    this.pageFlip = new window.St.PageFlip(this.containerEl, {
      width: finalWidth,
      height: finalHeight,
      size: 'fixed',
      minWidth: minW,
      maxWidth: maxW,
      minHeight: minH,
      maxHeight: maxH,
      showCover: true,
      maxShadowOpacity: 0.4,
      mobileScrollSupport: true,
      usePortrait: isMobile,
      autoSize: true,
      drawShadow: true,
      flippingTime: 650,
      useMouseEvents: true,
      swipeDistance: 25
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
