/**
 * Hotspot Manager - Loads config/hotspots.json and injects interactive elements onto pages
 */

import { modalPlayer } from './modal-player.js';

export class HotspotManager {
  constructor(configUrl = './config/hotspots.json') {
    this.configUrl = configUrl;
    this.hotspots = [];
  }

  async loadConfig() {
    try {
      const response = await fetch(this.configUrl);
      if (!response.ok) {
        throw new Error(`Hotspot konfigürasyonu yüklenemedi: ${response.statusText}`);
      }
      const data = await response.json();
      this.hotspots = data.hotspots || [];
    } catch (e) {
      console.warn('Hotspot config load warning:', e);
      this.hotspots = [];
    }
  }

  renderHotspotsForPage(pageNum, pageElement) {
    const pageHotspots = this.hotspots.filter(h => h.page === pageNum);
    if (!pageHotspots.length) return;

    let overlay = pageElement.querySelector('.hotspot-layer');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'hotspot-layer';
      pageElement.appendChild(overlay);
    }

    pageHotspots.forEach(hotspot => {
      const item = document.createElement('div');
      item.className = 'hotspot-item';
      item.id = `hotspot-${hotspot.id}`;

      // Position styling
      if (hotspot.position) {
        if (hotspot.position.top) item.style.top = hotspot.position.top;
        if (hotspot.position.bottom) item.style.bottom = hotspot.position.bottom;
        if (hotspot.position.left) item.style.left = hotspot.position.left;
        if (hotspot.position.right) item.style.right = hotspot.position.right;
        if (hotspot.position.transform) item.style.transform = hotspot.position.transform;
      }

      if (hotspot.type === 'youtube') {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'hotspot-youtube';
        btn.setAttribute('aria-label', hotspot.title);
        btn.innerHTML = `
          <span class="play-icon">
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </span>
          <span>${hotspot.subtitle || 'Videolu Anlatım'}</span>
        `;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          modalPlayer.open(hotspot.videoId, hotspot.title);
        });

        item.appendChild(btn);
      } else if (hotspot.type === 'link') {
        const link = document.createElement('a');
        link.className = 'hotspot-link';
        link.href = hotspot.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', hotspot.title);
        link.innerHTML = `
          <svg viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          <span>${hotspot.badge || 'Portala Git'}</span>
        `;

        link.addEventListener('click', (e) => {
          e.stopPropagation();
        });

        item.appendChild(link);
      }

      overlay.appendChild(item);
    });
  }
}
