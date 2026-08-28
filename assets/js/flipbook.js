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

    // Dynamic prominent sizing to fill viewport with high readability
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const isMobile = winW <= 768;

    let singlePageWidth, singlePageHeight;

    if (isMobile) {
      // Single page portrait mode for mobile
      const targetWidth = Math.min(winW - 20, 600);
      singlePageWidth = targetWidth;
      singlePageHeight = singlePageWidth / aspectRatio;
    } else {
      // Prominent double-page spread for desktop / tablets
      // Target 80% to 86% of viewport height (minimum 700px on desktop)
      const targetHeight = Math.max(700, Math.min(winH * 0.84, 940));
      let bookHeight = targetHeight;
      let bookWidth = (bookHeight * aspectRatio) * 2;

      // Ensure it leaves comfortable breathing room for sidebar navigation arrows
      const maxAllowedWidth = Math.min(winW - 160, 1560);
      if (bookWidth > maxAllowedWidth) {
        bookWidth = maxAllowedWidth;
        bookHeight = (bookWidth / 2) / aspectRatio;
      }

      singlePageWidth = bookWidth / 2;
      singlePageHeight = bookHeight;
    }

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
      maxShadowOpacity: 0.35,
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
