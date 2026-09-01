/* ==========================================================================
   BLUE TOURS ARUGAMBAY - MAIN INITIALIZER & COORDINATOR
   ========================================================================== */

// --- 1. Multi-Language Dictionary Maps ---
const translations = {
  en: {
    nav_home: "Home",
    nav_about: "About",
    nav_services: "Services",
    nav_popular_services: "Popular Services",
    nav_gallery: "Gallery",
    nav_testimonials: "Testimonials",
    nav_reviews: "Reviews",
    nav_faq: "FAQ",
    nav_contact: "Contact",
    nav_book_now: "Book Now",
    hero_title: "Blue Tours Arugambay",
    hero_subtitle: "Experience unforgettable safaris, lagoon adventures, surfing, camping, and private transportation with trusted local experts.",
    btn_book: "Book Your Adventure",
    btn_popular_services: "Popular Services",
    btn_contact: "Contact Us",
    services_title: "Our Services",
    services_subtitle: "Handpicked tropical adventures led by local specialists in Arugam Bay.",
    popular_services_title: "Popular Services",
    popular_services_subtitle: "Our most requested tropical adventures and island transportation services.",
    why_title: "Why Choose Blue Tours?",
    why_subtitle: "We blend luxury, safety, and local knowledge to deliver once-in-a-lifetime journeys.",
    faq_title: "Frequently Asked Questions",
    faq_subtitle: "Everything you need to know about our safaris, surfing, transfers, and packages.",
    gallery_title: "Visual Gallery",
    gallery_subtitle: "Glimpses of wild safaris, surfing barrels, and golden coastlines.",
    contact_title: "Get In Touch",
    contact_subtitle: "Plan your trip with us. We are available 24/7 on WhatsApp & Email."
  },
  si: {
    nav_home: "මුල් පිටුව",
    nav_about: "අපි ගැන",
    nav_services: "සේවාවන්",
    nav_popular_services: "ජනප්‍රිය සේවාවන්",
    nav_gallery: "ඡායාරූප",
    nav_testimonials: "ප්‍රතිචාර",
    nav_reviews: "පාරිභෝගික ප්‍රතිචාර",
    nav_faq: "ප්‍රශ්න",
    nav_contact: "සම්බන්ධ වන්න",
    nav_book_now: "වෙන්කරන්න",
    hero_title: "බ්ලූ ටුවර්ස් අරුගම්බේ සමඟ පාරාදීසය අත්විඳින්න",
    hero_subtitle: "විශ්වාසවන්ත දේශීය විශේෂඥයින් සමඟ අමතක නොවන සෆාරි, කලපු සංචාර, සර්ෆින්, කඳවුරු බැඳීම සහ පුද්ගලික ප්‍රවාහන සේවා.",
    btn_book: "දැන්ම වෙන්කරන්න",
    btn_popular_services: "ජනප්‍රිය සේවාවන්",
    btn_contact: "අප අමතන්න",
    services_title: "අපගේ සේවාවන්",
    services_subtitle: "දේශීය විශේෂඥයින් විසින් මෙහෙයවනු ලබන අද්විතීය නිවර්තන වික්‍රමාන්විතයන්.",
    popular_services_title: "ජනප්‍රිය සේවාවන්",
    popular_services_subtitle: "වඩාත්ම ජනප්‍රිය සංචාරක සහ ප්‍රවාහන සේවාවන්.",
    why_title: "ඇයි බ්ලූ ටුවර්ස් තෝරාගන්නේ?",
    why_subtitle: "ආරක්ෂාව, සුඛෝපභෝගීත්වය සහ දේශීය දැනුම ඒකාබද්ධ කරමින් ජීවිතයට එක් වරක් ලැබෙන අත්දැකීමක්.",
    faq_title: "නිතර අසන ප්‍රශ්න",
    faq_subtitle: "සෆාරි, සර්ෆින් සහ ප්‍රවාහනය පිළිබඳ ඔබ දැනගත යුතු සියල්ල.",
    gallery_title: "ඡායාරූප ගැලරිය",
    gallery_subtitle: "වනජීවී සෆාරි, සර්ෆින් ක්‍රීඩා සහ රන්වන් වෙරළ තීරයන්හි දර්ශන.",
    contact_title: "අප හා සම්බන්ධ වන්න",
    contact_subtitle: "වට්ස්ඇප් හෝ විද්‍යුත් තැපෑල මඟින් ඕනෑම වේලාවක සම්බන්ධ වන්න."
  },
  ta: {
    nav_home: "முகப்பு",
    nav_about: "எங்களைப் பற்றி",
    nav_services: "சேவைகள்",
    nav_popular_services: "பிரபலமான சேவைகள்",
    nav_gallery: "காட்சியகம்",
    nav_testimonials: "மதிப்புரைகள்",
    nav_reviews: "மதிப்புரைகள்",
    nav_faq: "கேள்விகள்",
    nav_contact: "தொடர்பு கொள்ள",
    nav_book_now: "பதிவு செய்க",
    hero_title: "ப்ளூ டூர்ஸ் அருகம்பே உடன் சொர்க்கத்தை ஆராயுங்கள்",
    hero_subtitle: "உள்ளூர் நிபுணர்களுடன் மறக்க முடியாத சஃபாரிகள், லகூன் சாகசங்கள், சர்பிங், முகாம் மற்றும் தனிப்பட்ட போக்குவரத்து.",
    btn_book: "இப்போதே பதிவு செய்க",
    btn_popular_services: "பிரபலமான சேவைகள்",
    btn_contact: "தொடர்பு கொள்ள",
    services_title: "எங்கள் சேவைகள்",
    services_subtitle: "அருகம்பேவில் உள்ளூர் நிபுணர்களால் வழிநடத்தப்படும் சிறந்த சாகசங்கள்.",
    popular_services_title: "பிரபலமான சேவைகள்",
    popular_services_subtitle: "மிகவும் விரும்பப்படும் சுற்றுலா மற்றும் போக்குவரத்து சேவைகள்.",
    why_title: "ஏன் ப்ளூ டூர்ஸ்?",
    why_subtitle: "பாதுகாப்பு, சொகுசு மற்றும் உள்ளூர் அறிவை இணைத்து சிறந்த பயணங்களை வழங்குகிறோம்.",
    faq_title: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    faq_subtitle: "சஃபாரிகள், சர்பிங் மற்றும் இடமாற்றங்கள் பற்றி நீங்கள் தெரிந்து கொள்ள வேண்டியவை.",
    gallery_title: "புகைப்பட தொகுப்பு",
    gallery_subtitle: "வனவிலங்கு சஃபாரிகள், சர்பிங் மற்றும் அழகான கடற்கரைகளின் காட்சிகள்.",
    contact_title: "தொடர்பு கொள்ளவும்",
    contact_subtitle: "வாட்ஸ்அப் அல்லது மின்னஞ்சல் மூலம் எங்களை 24/7 தொடர்பு கொள்ளலாம்."
  }
};

// --- 2. Main Page Orchestrator ---
class App {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'en';
    
    // Core helpers
    this.currency = new CurrencyConverter();
    this.weather = new WeatherWidget('weatherWidgetContainer');
    this.ai = new AIAssistant();
    this.gallery = new Gallery();
    this.booking = new BookingEngine(this.currency);

    // Dom Cache
    this.preloader = document.getElementById('preloader');
    this.preloaderBar = document.getElementById('preloaderProgressBar');
    this.header = document.querySelector('.header-nav');
    this.scrollProgress = document.getElementById('scrollProgress');
    this.backToTopBtn = document.getElementById('backToTopBtn');
    
    // Theme toggle selectors
    this.themeBtn = document.getElementById('themeToggleBtn');
    this.sunIcon = document.getElementById('sunIcon');
    this.moonIcon = document.getElementById('moonIcon');

    // Language selectors
    this.btnLang = document.getElementById('btnLang');
    this.langDropdown = document.getElementById('langDropdown');

    // Mobile nav
    this.hamburger = document.getElementById('hamburgerMenu');
    this.navMenu = document.getElementById('navMenu');
  }

  init() {
    // A. Start preloader loading simulation
    this.simulatePreloader();

    // B. Initialize Sub-Modules
    this.currency.setCurrency('USD'); // default selection
    this.weather.init();
    this.ai.init();
    this.gallery.init();
    this.booking.init();

    // C. Setup Multi-language and Theme State
    this.applyLanguage(this.currentLanguage);
    this.setupTheme();

    // D. Attach Scroll / Resize Listeners
    window.addEventListener('scroll', () => this.handleScroll());
    window.addEventListener('load', () => this.finishPreloader());
    
    this.setupHamburger();
    this.setupLanguageDropdown();
    this.setupCurrencySelectors();
    this.setupIntersectionObservers();

    // E. Setup scrollspy links
    this.setupScrollSpy();
  }

  // Preloader progress bar loading simulation
  simulatePreloader() {
    let width = 0;
    this.preloaderInterval = setInterval(() => {
      if (width < 85) {
        width += Math.floor(Math.random() * 8) + 2;
        if (this.preloaderBar) this.preloaderBar.style.width = `${width}%`;
      }
    }, 150);
  }

  finishPreloader() {
    clearInterval(this.preloaderInterval);
    if (this.preloaderBar) this.preloaderBar.style.width = '100%';
    
    setTimeout(() => {
      if (this.preloader) {
        this.preloader.classList.add('fade-out');
        document.body.style.overflow = '';
      }
    }, 400);
  }

  // Dynamic language changer
  applyLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);

    // Update active dropdown indicator text
    const langBtnText = document.getElementById('langBtnText');
    if (langBtnText) {
      langBtnText.textContent = lang.toUpperCase();
    }

    // Apply translations
    const dict = translations[lang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // Close mobile nav drawer if open during translation toggle
    if (this.navMenu && this.navMenu.classList.contains('active')) {
      this.toggleMobileNav();
    }
  }

  setupLanguageDropdown() {
    if (!this.btnLang) return;
    
    this.btnLang.addEventListener('click', (e) => {
      e.stopPropagation();
      this.langDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      if (this.langDropdown) this.langDropdown.classList.remove('show');
    });

    document.querySelectorAll('.lang-select-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        this.applyLanguage(lang);
      });
    });
  }

  // Theme settings
  setupTheme() {
    const htmlEl = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || 'dark';
    htmlEl.setAttribute('data-theme', currentTheme);
    this.updateThemeIcons(currentTheme);

    if (this.themeBtn) {
      this.themeBtn.addEventListener('click', () => {
        const activeTheme = htmlEl.getAttribute('data-theme');
        const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
        this.updateThemeIcons(nextTheme);
      });
    }
  }

  updateThemeIcons(theme) {
    if (!this.sunIcon) return;
    if (theme === 'dark') {
      this.sunIcon.style.display = 'block';
      this.moonIcon.style.display = 'none';
    } else {
      this.sunIcon.style.display = 'none';
      this.moonIcon.style.display = 'block';
    }
  }

  // Currency Converter buttons setup
  setupCurrencySelectors() {
    document.querySelectorAll('.btn-curr').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-curr').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const curr = btn.getAttribute('data-curr');
        this.currency.setCurrency(curr);
      });
    });
  }

  // Scroll details (Sticky headers, indicators, and top triggers)
  handleScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // 1. Sticky Nav state
    if (scrollTop > 50) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }

    // 2. Scroll Progress bar
    if (this.scrollProgress) {
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      this.scrollProgress.style.width = `${scrollPercent}%`;
    }

    // 3. Back to top button visibility
    if (this.backToTopBtn) {
      if (scrollTop > 500) {
        this.backToTopBtn.classList.add('show');
      } else {
        this.backToTopBtn.classList.remove('show');
      }
    }
  }

  setupHamburger() {
    if (!this.hamburger) return;
    this.hamburger.addEventListener('click', () => this.toggleMobileNav());
    
    // Close nav links clicking in mobile drawer
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (this.navMenu.classList.contains('active')) {
          this.toggleMobileNav();
        }
      });
    });
  }

  toggleMobileNav() {
    this.hamburger.classList.toggle('active');
    this.navMenu.classList.toggle('active');
  }

  // Observers for stats and page reveals
  setupIntersectionObservers() {
    // 1. Reveal scrolling observer
    const revealCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // Animates once only
        }
      });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
      root: null,
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // 2. Counter animation observer
    const statsCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounters();
          observer.unobserve(entry.target);
        }
      });
    };

    const statsObserver = new IntersectionObserver(statsCallback, {
      root: null,
      threshold: 0.3
    });

    const statsSection = document.getElementById('why-choose-us');
    if (statsSection) statsObserver.observe(statsSection);
  }

  // Counter numbering logic
  animateCounters() {
    document.querySelectorAll('.stat-number').forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const suffix = counter.getAttribute('data-suffix') || '';
      let count = 0;
      const speed = target / 60; // 60 frames approx
      
      const updateCount = () => {
        if (count < target) {
          count += speed;
          counter.textContent = Math.floor(count) + suffix;
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = target + suffix;
        }
      };
      
      updateCount();
    });
  }

  // Scrollspy helper
  setupScrollSpy() {
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      const scrollPos = window.scrollY + 100; // offset

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    });
  }
}

// Instantiate and Run application
const app = new App();
app.init();
