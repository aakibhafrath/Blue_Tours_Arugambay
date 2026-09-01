/* ==========================================================================
   BLUE TOURS ARUGAMBAY - GALLERY FILTER & LIGHTBOX MODULE
   ========================================================================== */

class Gallery {
  constructor() {
    this.filterButtons = document.querySelectorAll('.btn-filter');
    this.galleryItems = document.querySelectorAll('.gallery-item');
    this.lightbox = document.getElementById('lightbox');
    
    if (this.lightbox) {
      this.lightboxImg = this.lightbox.querySelector('.lightbox-img');
      this.lightboxCaption = this.lightbox.querySelector('.lightbox-caption');
      this.closeBtn = this.lightbox.querySelector('.btn-lightbox-close');
      this.prevBtn = this.lightbox.querySelector('.btn-lightbox-prev');
      this.nextBtn = this.lightbox.querySelector('.btn-lightbox-next');
    }

    this.visibleItems = [];
    this.currentIndex = 0;

    // Mobile Swipe coordinates
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  init() {
    this.updateVisibleItems();
    this.addEventListeners();
  }

  addEventListeners() {
    // 1. Filter buttons Click handler
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Toggle Active
        this.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-filter');
        this.filterGallery(category);
      });
    });

    // 2. Lightbox Open triggers
    this.galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-item-title')?.textContent || '';
        
        // Find index of clicked item in the visible items list
        this.currentIndex = this.visibleItems.indexOf(item);
        this.openLightbox(img.src, title);
      });
    });

    // 3. Lightbox Close & Nav triggers
    if (this.lightbox) {
      this.closeBtn.addEventListener('click', () => this.closeLightbox());
      
      // Close by clicking background overlay
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

  filterGallery(category) {
    this.galleryItems.forEach(item => {
      const itemCat = item.getAttribute('data-category');
      
      if (category === 'all' || itemCat === category) {
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
        }, 300); // match transition timing
      }
    });

    // Update list of visible elements for Lightbox slider loop
    setTimeout(() => this.updateVisibleItems(), 350);
  }

  updateVisibleItems() {
    this.visibleItems = Array.from(this.galleryItems).filter(item => item.style.display !== 'none');
  }

  openLightbox(src, caption) {
    if (!this.lightbox) return;
    this.lightboxImg.src = src;
    this.lightboxCaption.textContent = caption;
    this.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // stop page scroll
  }

  closeLightbox() {
    if (!this.lightbox) return;
    this.lightbox.classList.remove('active');
    document.body.style.overflow = ''; // restore scroll
  }

  navigate(direction) {
    if (this.visibleItems.length <= 1) return;
    
    this.currentIndex += direction;
    
    // Boundary checks
    if (this.currentIndex < 0) {
      this.currentIndex = this.visibleItems.length - 1;
    } else if (this.currentIndex >= this.visibleItems.length) {
      this.currentIndex = 0;
    }

    const targetItem = this.visibleItems[this.currentIndex];
    const img = targetItem.querySelector('img');
    const title = targetItem.querySelector('.gallery-item-title')?.textContent || '';

    // Smooth transition
    this.lightboxImg.style.opacity = '0.3';
    setTimeout(() => {
      this.lightboxImg.src = img.src;
      this.lightboxCaption.textContent = title;
      this.lightboxImg.style.opacity = '1';
    }, 150);
  }

  handleSwipeGesture() {
    const swipeThreshold = 50; // px
    if (this.touchEndX < this.touchStartX - swipeThreshold) {
      // Swiped Left -> Next
      this.navigate(1);
    } else if (this.touchEndX > this.touchStartX + swipeThreshold) {
      // Swiped Right -> Previous
      this.navigate(-1);
    }
  }
}

window.Gallery = Gallery;
