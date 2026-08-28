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

    // Calculate dimensions to fit viewport while keeping PDF aspect ratio
    const stage = document.querySelector('.viewer-stage');
    const availableWidth = (stage ? stage.clientWidth : window.innerWidth) - 40;
    const availableHeight = (stage ? stage.clientHeight : window.innerHeight) - 40;

    const isMobile = window.innerWidth <= 768;
    const aspectRatio = baseWidth / baseHeight;

    let singlePageWidth, singlePageHeight;

    if (isMobile) {
      // Single page portrait
      singlePageHeight = Math.min(availableHeight, availableWidth / aspectRatio);
      singlePageWidth = singlePageHeight * aspectRatio;
    } else {
      // Double page spread: 2 pages side-by-side
      const maxBookWidth = availableWidth * 0.92;
      const maxBookHeight = availableHeight * 0.92;

      let bookHeight = maxBookHeight;
      let bookWidth = (bookHeight * aspectRatio) * 2;

      if (bookWidth > maxBookWidth) {
        bookWidth = maxBookWidth;
        bookHeight = (bookWidth / 2) / aspectRatio;
      }

      singlePageWidth = Math.round(bookWidth / 2);
      singlePageHeight = Math.round(bookHeight);
    }

    // Initialize StPageFlip
    this.pageFlip = new window.St.PageFlip(this.containerEl, {
      width: singlePageWidth,
      height: singlePageHeight,
      size: 'fixed',
      minWidth: 300,
      maxWidth: 1200,
      minHeight: 400,
      maxHeight: 1600,
      showCover: true,
      maxShadowOpacity: 0.5,
      mobileScrollSupport: true,
      usePortrait: isMobile,
      autoSize: true,
      drawShadow: true,
      flippingTime: 700,
      useMouseEvents: true,
      swipeDistance: 30
    });

    // Load DOM elements
    const pageElements = document.querySelectorAll('.flipbook-container .page');
    this.pageFlip.loadFromHTML(pageElements);

    // Event Listeners
    this.pageFlip.on('flip', (e) => {
      this.currentPage = e.data;
      soundManager.playFlip();
      this.notifyPageChange(this.currentPage);
    });

    this.pageFlip.on('changeOrientation', (e) => {
      // Orientation changed (e.g. window resize)
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
