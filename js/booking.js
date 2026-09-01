/* ==========================================================================
   BLUE TOURS ARUGAMBAY - INTERACTIVE BOOKING ENGINE (INQUIRY ONLY - NO PRICES)
   ========================================================================== */

class BookingEngine {
  constructor(currencyConverter) {
    this.converter = currencyConverter;

    // Dom selections
    this.modal = document.getElementById('bookingModal');
    this.closeBtn = document.getElementById('closeBookingModal');
    this.bookingForm = document.getElementById('bookingForm');
    
    // Form Inputs
    this.packageSelect = document.getElementById('bookPackage');
    this.dateInput = document.getElementById('bookDate');
    this.guestsInput = document.getElementById('bookGuests');
    this.nameInput = document.getElementById('bookName');
    this.emailInput = document.getElementById('bookEmail');
    this.phoneInput = document.getElementById('bookPhone');
    
    // Add-on checkboxes
    this.addonSafari = document.getElementById('addonSafari');
    this.addonSurf = document.getElementById('addonSurf');
    this.addonLagoon = document.getElementById('addonLagoon');
    this.addonCamping = document.getElementById('addonCamping');
    this.addonTaxi = document.getElementById('addonTaxi');

    this.whatsappBtn = document.getElementById('btnSubmitWhatsApp');
  }

  init() {
    this.setupDateConstraint();
    this.addEventListeners();
  }

  setupDateConstraint() {
    if (!this.dateInput) return;
    // Set minimum booking date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  addEventListeners() {
    // 1. Open triggers across the site (services, popular services, hero and nav buttons)
    document.querySelectorAll('.trigger-booking').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const preSelectPackage = trigger.getAttribute('data-package');
        this.openModal(preSelectPackage);
      });
    });

    // 2. Close trigger
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeModal());
    }
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }

    // 3. Submit buttons
    if (this.whatsappBtn) {
      this.whatsappBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.submitToWhatsApp();
      });
    }

    if (this.bookingForm) {
      this.bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitToEmail();
      });
    }
  }

  openModal(packageName) {
    if (!this.modal) return;
    
    if (packageName && this.packageSelect) {
      this.packageSelect.value = packageName;
    }
    
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  getBookingDetails() {
    const pkg = this.packageSelect ? this.packageSelect.options[this.packageSelect.selectedIndex].text : 'Custom Tour';
    const date = (this.dateInput && this.dateInput.value) || 'Not selected';
    const guests = (this.guestsInput && this.guestsInput.value) || '1';
    const name = (this.nameInput && this.nameInput.value.trim()) || 'Client';
    const email = (this.emailInput && this.emailInput.value.trim()) || 'Not provided';
    const phone = (this.phoneInput && this.phoneInput.value.trim()) || 'Not provided';
    
    const addons = [];
    if (this.addonSafari?.checked) addons.push("Kumana National Park Safari");
    if (this.addonSurf?.checked) addons.push(`Certified Surf Lessons (${guests} pax)`);
    if (this.addonLagoon?.checked) addons.push("Mangrove Lagoon Boat Tour");
    if (this.addonCamping?.checked) addons.push(`Beach Overnight Camping & BBQ (${guests} pax)`);
    if (this.addonTaxi?.checked) addons.push("Air-conditioned Airport / Island Transfer");

    return {
      pkg, date, guests, name, email, phone, addons
    };
  }

  submitToWhatsApp() {
    if (!this.validateForm()) return;
    
    const d = this.getBookingDetails();
    const addonsList = d.addons.length > 0 ? d.addons.join(", ") : "None";

    const text = 
`🌴 *BLUE TOURS ARUGAMBAY - TOUR INQUIRY* 🌴
--------------------------------------------------
*Name:* ${d.name}
*Phone:* ${d.phone}
*Email:* ${d.email}

*Adventure Details:*
*Selected Plan:* ${d.pkg}
*Preferred Date:* ${d.date}
*Total Guests:* ${d.guests}

*Optional Add-ons / Requests:*
${addonsList}

--------------------------------------------------
*Inquiry:* Please let us know the pricing, package details, and availability.

Looking forward to exploring Sri Lanka with you!
--------------------------------------------------`;

    const waUrl = `https://wa.me/94776130013?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    this.closeModal();
  }

  submitToEmail() {
    if (!this.validateForm()) return;

    const d = this.getBookingDetails();
    const addonsList = d.addons.length > 0 ? d.addons.join(", ") : "None";
    
    const subject = `Blue Tours Inquiry - ${d.name} (${d.pkg})`;
    const body = 
`Hello Basheer,

I would like to make an inquiry for Blue Tours Arugambay.

Client Name: ${d.name}
Phone: ${d.phone}
Email: ${d.email}

Service / Plan: ${d.pkg}
Preferred Date: ${d.date}
Total Guests: ${d.guests}
Add-ons / Preferences: ${addonsList}

Please send pricing, package details, and confirm availability.

Thank you!`;

    const mailUrl = `mailto:arbasheer82@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailUrl;
    this.closeModal();
  }

  validateForm() {
    if (this.dateInput && !this.dateInput.value) {
      alert("Please select a valid booking date.");
      this.dateInput.focus();
      return false;
    }
    if (this.nameInput && !this.nameInput.value.trim()) {
      alert("Please enter your name.");
      this.nameInput.focus();
      return false;
    }
    if ((!this.phoneInput || !this.phoneInput.value.trim()) && (!this.emailInput || !this.emailInput.value.trim())) {
      alert("Please provide at least a Phone number or Email for contact.");
      if (this.phoneInput) this.phoneInput.focus();
      return false;
    }
    return true;
  }
}

window.BookingEngine = BookingEngine;
