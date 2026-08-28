/**
 * Modal Player - Controls YouTube Lightbox / Modal Video Playback
 */

export class ModalPlayer {
  constructor() {
    this.modalEl = document.getElementById('video-modal');
    this.titleEl = document.getElementById('modal-video-title');
    this.containerEl = document.getElementById('modal-iframe-container');
    this.closeBtn = document.getElementById('modal-close-btn');

    this.isOpen = false;
    this.initEvents();
  }

  initEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.modalEl) {
      this.modalEl.addEventListener('click', (e) => {
        if (e.target === this.modalEl) {
          this.close();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open(videoId, title = 'Videolu Anlatım') {
    if (!this.modalEl || !this.containerEl) return;

    if (this.titleEl) {
      this.titleEl.textContent = title;
    }

    // Embed YouTube with autoplay and privacy-enhanced mode
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
    this.containerEl.innerHTML = `
      <iframe 
        src="${embedUrl}" 
        title="${title}" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowfullscreen>
      </iframe>
    `;

    this.modalEl.classList.add('active');
    this.isOpen = true;
  }

  close() {
    if (!this.modalEl) return;

    this.modalEl.classList.remove('active');
    this.isOpen = false;

    // Remove iframe to immediately stop video audio and save memory
    setTimeout(() => {
      if (!this.isOpen && this.containerEl) {
        this.containerEl.innerHTML = '';
      }
    }, 300);
  }
}

export const modalPlayer = new ModalPlayer();
