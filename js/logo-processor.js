/* ==========================================================================
   BLUE TOURS ARUGAMBAY - DYNAMIC CLIENT-SIDE LOGO PROCESSOR
   ========================================================================== */

(function () {
  // Load Logo.png and crop/process variations client-side using Canvas
  const logoSrc = 'Logo.png';
  const userLogo = new Image();
  userLogo.src = logoSrc;

  userLogo.onload = function () {
    try {
      const W = userLogo.width;
      const H = userLogo.height;

      // Calibrate circular emblem dimensions
      const cy = H * 0.395;       // Center Y of circle emblem
      const cx = W * 0.50;        // Center X
      const r = H * 0.255;        // Radius of circle emblem

      // --- 1. Generate transparent emblem-only icon ---
      const iconCanvas = document.createElement('canvas');
      iconCanvas.width = r * 2;
      iconCanvas.height = r * 2;
      const ctxIcon = iconCanvas.getContext('2d');

      // Apply circular clipping mask
      ctxIcon.beginPath();
      ctxIcon.arc(r, r, r - 2, 0, Math.PI * 2);
      ctxIcon.closePath();
      ctxIcon.clip();

      // Draw emblem section from original image
      ctxIcon.drawImage(userLogo, cx - r, cy - r, r * 2, r * 2, 0, 0, r * 2, r * 2);
      const iconDataUrl = iconCanvas.toDataURL('image/png');

      // --- 2. Generate cropped full logo with transparent background ---
      const cropX = W * 0.32;
      const cropY = H * 0.11;
      const cropW = W * 0.36;
      const cropH = H * 0.78;

      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = cropW;
      fullCanvas.height = cropH;
      const ctxFull = fullCanvas.getContext('2d');
      ctxFull.drawImage(userLogo, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      // Make background transparent (removes textured paper color)
      const fullImgData = ctxFull.getImageData(0, 0, cropW, cropH);
      const dataFull = fullImgData.data;
      for (let i = 0; i < dataFull.length; i += 4) {
        const rVal = dataFull[i];
        const gVal = dataFull[i + 1];
        const bVal = dataFull[i + 2];

        // Match off-white backgrounds (R > 225, G > 225, B > 225)
        if (rVal > 225 && gVal > 225 && bVal > 225) {
          dataFull[i + 3] = 0; // Set transparency
        }
      }
      ctxFull.putImageData(fullImgData, 0, 0);
      const fullTransparentDataUrl = fullCanvas.toDataURL('image/png');

      // --- 3. Generate white/silver version for dark backgrounds ---
      const whiteCanvas = document.createElement('canvas');
      whiteCanvas.width = cropW;
      whiteCanvas.height = cropH;
      const ctxWhite = whiteCanvas.getContext('2d');
      ctxWhite.drawImage(fullCanvas, 0, 0);

      const whiteImgData = ctxWhite.getImageData(0, 0, cropW, cropH);
      const dataWhite = whiteImgData.data;
      for (let i = 0; i < dataWhite.length; i += 4) {
        const rVal = dataWhite[i];
        const gVal = dataWhite[i + 1];
        const bVal = dataWhite[i + 2];
        const aVal = dataWhite[i + 3];

        if (aVal > 0) {
          // Detect dark text/strokes (R < 100, G < 120, B < 180) and shift to white
          if (rVal < 100 && gVal < 120 && bVal < 180) {
            dataWhite[i] = 255;
            dataWhite[i + 1] = 255;
            dataWhite[i + 2] = 255;
          }
        }
      }
      ctxWhite.putImageData(whiteImgData, 0, 0);
      const whiteTransparentDataUrl = whiteCanvas.toDataURL('image/png');

      // --- 4. Apply base64 images to page elements ---
      applyProcessedLogos(iconDataUrl, fullTransparentDataUrl, whiteTransparentDataUrl);

      // Store in window for access across pages (e.g. guidelines playground)
      window.processedUserLogos = {
        icon: iconDataUrl,
        full: fullTransparentDataUrl,
        white: whiteTransparentDataUrl
      };

    } catch (e) {
      console.warn("Client-side logo cropping halted. Using SVG fallbacks.", e);
    }
  };

  function applyProcessedLogos(icon, full, white) {
    // A. Swap circular emblems (supports svg, png, and specific alt attributes)
    document.querySelectorAll('.preloader-emblem img, .ai-avatar, .card-back-left img, [src*="logo-icon.svg"], [src*="logo-icon.png"], [alt="Blue Tours Icon"]').forEach(el => {
      // Keep chat bot avatar icon circular
      if (el.tagName === 'IMG') {
        el.src = icon;
      }
    });

    // B. Swap dark-theme horizontal logos (white text on dark backgrounds)
    document.querySelectorAll('.logo-dark-theme, .hero-logo-box img, .footer-brand img, .flip-card-front img, [src*="logo-white.svg"]').forEach(el => {
      if (el.tagName === 'IMG' && !el.classList.contains('logo-light-theme')) {
        el.src = white;
      }
    });

    // C. Swap light-theme horizontal logos (dark text on light backgrounds)
    document.querySelectorAll('.logo-light-theme, [src*="logo-dark.svg"], [src*="logo-full.svg"], [src*="logo-horizontal.svg"]').forEach(el => {
      if (el.tagName === 'IMG') {
        el.src = full;
      }
    });

    // D. Update guidelines preview boxes if page is guidelines
    const fullPreview = document.querySelector('.logo-preview-box img[alt="Full Color Logo"]');
    if (fullPreview) fullPreview.src = full;

    const darkPreview = document.querySelector('.logo-preview-box img[alt="Dark Version Logo"]');
    if (darkPreview) darkPreview.src = full;

    const whitePreview = document.querySelector('.logo-preview-box img[alt="White Version Logo"]');
    if (whitePreview) whitePreview.src = white;

    const iconPreview = document.querySelector('.logo-preview-box img[alt="Icon Only Logo"]');
    if (iconPreview) iconPreview.src = icon;

    const horizPreview = document.querySelector('.logo-preview-box img[alt="Horizontal Logo"]');
    if (horizPreview) horizPreview.src = full;

    const vertPreview = document.querySelector('.logo-preview-box img[alt="Vertical Logo"]');
    if (vertPreview) vertPreview.src = userLogo.src; // Keep original vertical layout for reference

    const favPreview = document.querySelector('.logo-preview-box img[alt="Favicon Logo"]');
    if (favPreview) favPreview.src = icon;

    const appPreview = document.querySelector('.logo-preview-box img[alt="App Icon Logo"]');
    if (appPreview) appPreview.src = icon;

    const socPreview = document.querySelector('.logo-preview-box img[alt="Social Media Logo"]');
    if (socPreview) socPreview.src = icon;
  }
})();
