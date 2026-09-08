/* ==========================================================================
   BLUE TOURS ARUGAMBAY - GALLERY FILTER & LIGHTBOX MODULE (DYNAMIC CMS ENABLED)
   ========================================================================== */

class Gallery {
  constructor() {
    this.container = document.querySelector('.gallery-masonry');
    this.filterButtons = document.querySelectorAll('.btn-filter');
    this.galleryItems = document.querySelectorAll('.gallery-item');
    this.lightbox = document.getElementById('lightbox');
    
    if (this.lightbox) {
      this.lightboxImg = this.lightbox.querySelector('.lightbox-img');
      this.lightboxCaption = this.lightbox.querySelector('.lightbox-caption');
      this.closeBtn = this.lightbox.querySelector('.btn-lightbox-close');
      this.prevBtn = this.lightbox.querySelector('.btn-lightbox-prev');
      this.nextBtn = this.lightbox.querySelector('.btn-lightbox-next');
      this.lightboxBox = this.lightbox.querySelector('.lightbox-content-box');
      
      // Ensure video element exists in lightbox
      let lightboxVideo = this.lightbox.querySelector('.lightbox-video');
      if (!lightboxVideo) {
        lightboxVideo = document.createElement('video');
        lightboxVideo.className = 'lightbox-video';
        lightboxVideo.controls = true;
        lightboxVideo.style.maxWidth = '100%';
        lightboxVideo.style.maxHeight = '75dvh';
        lightboxVideo.style.borderRadius = 'var(--radius-sm)';
        lightboxVideo.style.display = 'none';
        if (this.lightboxImg && this.lightboxImg.parentNode) {
          this.lightboxImg.parentNode.insertBefore(lightboxVideo, this.lightboxCaption);
        }
      }
      this.lightboxVideo = lightboxVideo;
    }

    this.visibleItems = [];
    this.currentIndex = 0;
    this.currentCategory = 'all';

    // Mobile Swipe coordinates
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  async init() {
    // 1. Initial binding for existing static items
    this.refreshGalleryItems();
    this.addEventListeners();

    // 2. Load dynamic items from Supabase CMS in the background
    await this.loadSupabaseGallery();
  }

  async loadSupabaseGallery() {
    if (!window.BlueToursSupabase || !window.BlueToursSupabase.isConfigured()) {
      return; // Fallback smoothly to static images
    }

    const client = window.BlueToursSupabase.getClient();
    if (!client || !this.container) return;

    try {
      const { data, error } = await client
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase gallery fetch notice:', error.message);
        return;
      }

      if (data && data.length > 0) {
        this.prependDynamicItems(data);
      }
    } catch (err) {
      console.warn('Supabase dynamic gallery offline, using fallback items:', err);
    }
  }

  prependDynamicItems(items) {
    if (!this.container) return;

    // Build document fragment with dynamic items
    const fragment = document.createDocumentFragment();

    items.forEach(item => {
      const isVideo = item.media_type === 'video';
      const div = document.createElement('div');
      div.className = 'gallery-item';
      
      // Map category to filter attributes
      let cat = (item.category || 'safari').toLowerCase();
      if (cat === 'surfing') cat = 'surf';
      if (cat === 'camping') cat = 'camp';
      div.setAttribute('data-category', cat);
      div.setAttribute('data-dynamic', 'true');

      const title = this.escapeHtml(item.title);
      const categoryLabel = this.escapeHtml(item.category.toUpperCase());

      if (isVideo) {
        div.innerHTML = `
          <video width="100%" height="auto" preload="metadata" muted playsinline loop>
            <source src="${item.media_url}" type="video/mp4">
          </video>
          <div class="gallery-item-overlay">
            <span class="gallery-item-category">${categoryLabel} (VIDEO)</span>
            <h3 class="gallery-item-title">${title}</h3>
          </div>
        `;
      } else {
        div.innerHTML = `
          <img src="${item.media_url}" alt="${title}" loading="lazy">
          <div class="gallery-item-overlay">
            <span class="gallery-item-category">${categoryLabel}</span>
            <h3 class="gallery-item-title">${title}</h3>
          </div>
        `;
      }

      fragment.appendChild(div);
    });

    // Insert at beginning of masonry layout
    this.container.insertBefore(fragment, this.container.firstChild);

    // Refresh collection & re-bind triggers
    this.refreshGalleryItems();
    this.bindItemClickEvents();
    this.filterGallery(this.currentCategory);
  }

  refreshGalleryItems() {
    this.galleryItems = document.querySelectorAll('.gallery-item');
    this.updateVisibleItems();
  }

  addEventListeners() {
    // 1. Filter buttons Click handler
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-filter');
        this.currentCategory = category;
        this.filterGallery(category);
      });
    });

    // 2. Lightbox Open triggers
    this.bindItemClickEvents();

    // 3. Lightbox Close & Nav triggers
    if (this.lightbox) {
      this.closeBtn.addEventListener('click', () => this.closeLightbox());
      
      this.lightbox.addEventListener('click', (e) => {
        if (e.target === this.lightbox) this.closeLightbox();
      });

      this.prevBtn.addEventListener('click', () => this.navigate(-1));
      this.nextBtn.addEventListener('click', () => this.navigate(1));

      // Keyboard Controls
      document.addEventListener('keydown', (e) => {
        if (!this.lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') this.closeLightbox();
        if (e.key === 'ArrowLeft') this.navigate(-1);
        if (e.key === 'ArrowRight') this.navigate(1);
      });

      // Swipe Gestures for Mobile
      this.lightbox.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      });

      this.lightbox.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipeGesture();
      });
    }
  }

  bindItemClickEvents() {
    this.galleryItems.forEach(item => {
      if (item._clickBound) return;
      item._clickBound = true;

      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const video = item.querySelector('video');
        const title = item.querySelector('.gallery-item-title')?.textContent || '';
        
        this.currentIndex = this.visibleItems.indexOf(item);

        if (video) {
          const src = video.querySelector('source')?.src || video.src;
          this.openLightbox(src, title, 'video');
        } else if (img) {
          this.openLightbox(img.src, title, 'image');
        }
      });
    });
  }

  filterGallery(category) {
    this.galleryItems.forEach(item => {
      const itemCat = (item.getAttribute('data-category') || '').toLowerCase();
      
      const match = (
        category === 'all' || 
        itemCat === category ||
        (category === 'safari' && (itemCat === 'safari' || itemCat === 'wildlife')) ||
        (category === 'surf' && (itemCat === 'surf' || itemCat === 'surfing')) ||
        (category === 'camp' && (itemCat === 'camp' || itemCat === 'camping')) ||
        (category === 'beach' && itemCat === 'beach')
      );

      if (match) {
        item.style.display = 'block';
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        }, 10);
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
          item.style.display = 'none';
        }, 300);
      }
    });

    setTimeout(() => this.updateVisibleItems(), 350);
  }

  updateVisibleItems() {
    this.visibleItems = Array.from(this.galleryItems).filter(item => item.style.display !== 'none');
  }

  openLightbox(src, caption, type = 'image') {
    if (!this.lightbox) return;

    if (type === 'video') {
      if (this.lightboxImg) this.lightboxImg.style.display = 'none';
      if (this.lightboxVideo) {
        this.lightboxVideo.style.display = 'block';
        this.lightboxVideo.src = src;
        this.lightboxVideo.play().catch(() => {});
      }
    } else {
      if (this.lightboxVideo) {
        this.lightboxVideo.pause();
        this.lightboxVideo.style.display = 'none';
      }
      if (this.lightboxImg) {
        this.lightboxImg.style.display = 'block';
        this.lightboxImg.src = src;
      }
    }

    if (this.lightboxCaption) {
      this.lightboxCaption.textContent = caption;
    }

    this.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    if (!this.lightbox) return;
    if (this.lightboxVideo) {
      this.lightboxVideo.pause();
      this.lightboxVideo.src = '';
    }
    this.lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  navigate(direction) {
    if (this.visibleItems.length <= 1) return;
    
    this.currentIndex += direction;
    
    if (this.currentIndex < 0) {
      this.currentIndex = this.visibleItems.length - 1;
    } else if (this.currentIndex >= this.visibleItems.length) {
      this.currentIndex = 0;
    }

    const targetItem = this.visibleItems[this.currentIndex];
    const img = targetItem.querySelector('img');
    const video = targetItem.querySelector('video');
    const title = targetItem.querySelector('.gallery-item-title')?.textContent || '';

    if (video) {
      const src = video.querySelector('source')?.src || video.src;
      this.openLightbox(src, title, 'video');
    } else if (img) {
      if (this.lightboxImg) this.lightboxImg.style.opacity = '0.3';
      setTimeout(() => {
        this.openLightbox(img.src, title, 'image');
        if (this.lightboxImg) this.lightboxImg.style.opacity = '1';
      }, 150);
    }
  }

  handleSwipeGesture() {
    const swipeThreshold = 50;
    if (this.touchEndX < this.touchStartX - swipeThreshold) {
      this.navigate(1);
    } else if (this.touchEndX > this.touchStartX + swipeThreshold) {
      this.navigate(-1);
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

window.Gallery = Gallery;
