/* ==========================================================================
   BLUE TOURS ARUGAMBAY - WEATHER & CURRENCY WIDGET MODULES
   ========================================================================== */

// --- 1. Weather Widget Simulator (Calibrated for Arugam Bay) ---
class WeatherWidget {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    this.temperatures = [30, 31, 32, 33, 29];
    this.conditions = [
      { text: "Sunny & Ocean Breeze", icon: "☀️", surf: "Excellent Waves" },
      { text: "Partly Cloudy", icon: "⛅", surf: "Good Swell" },
      { text: "Clear Skies", icon: "☀️", surf: "Perfect Surfing" },
      { text: "Tropical Calm", icon: "☀️", surf: "Clean Offshore Winds" }
    ];
  }

  init() {
    if (!this.element) return;
    this.render();
    // Refresh every 10 minutes (simulated)
    setInterval(() => this.render(), 600000);
  }

  generateWeather() {
    const hr = new Date().getHours();
    const isNight = hr < 6 || hr > 18;
    
    let temp = this.temperatures[Math.floor(Math.random() * this.temperatures.length)];
    let cond = this.conditions[Math.floor(Math.random() * this.conditions.length)];
    
    if (isNight) {
      temp -= 4; // Cooler at night
      cond = { text: "Stargazing Clear", icon: "🌙", surf: "Calm Tide" };
    }

    const wind = Math.floor(Math.random() * 8) + 12; // 12-20 km/h is typical
    const humidity = Math.floor(Math.random() * 15) + 70; // 70-85% humidity

    return {
      temp,
      text: cond.text,
      icon: cond.icon,
      surf: cond.surf,
      wind,
      humidity
    };
  }

  render() {
    const data = this.generateWeather();
    this.element.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
        <span style="font-size: 1.5rem;">${data.icon}</span>
        <div style="text-align: left;">
          <div style="font-weight: 800; font-size: 0.95rem; color: white;">Arugam Bay: ${data.temp}°C</div>
          <div style="font-size: 0.75rem; color: #94A3B8;">${data.text} | Wind: ${data.wind} km/h</div>
          <div style="font-size: 0.7rem; color: #00B4D8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Surf: ${data.surf}</div>
        </div>
      </div>
    `;
  }
}

// --- 2. Currency Converter Widget ---
class CurrencyConverter {
  constructor(rates = {}) {
    // Current rates approximate relative to LKR base
    this.rates = {
      LKR: 1,
      USD: 300,  // 1 USD = 300 LKR
      EUR: 325,  // 1 EUR = 325 LKR
      GBP: 385,  // 1 GBP = 385 LKR
      AUD: 200   // 1 AUD = 200 LKR
    };
    
    this.symbols = {
      LKR: "Rs.",
      USD: "$",
      EUR: "€",
      GBP: "£",
      AUD: "A$"
    };

    this.currentCurrency = "USD"; // Default display currency
  }

  setCurrency(curr) {
    if (this.rates[curr]) {
      this.currentCurrency = curr;
      this.updatePrices();
    }
  }

  convert(amountLkr, toCurrency = this.currentCurrency) {
    const rate = this.rates[toCurrency];
    const converted = amountLkr / rate;
    
    // Formatting rules
    if (toCurrency === "LKR") {
      // Round to nearest 500
      return Math.round(converted / 500) * 500;
    }
    // Round to whole numbers for others
    return Math.round(converted);
  }

  formatPrice(amountLkr, toCurrency = this.currentCurrency) {
    const converted = this.convert(amountLkr, toCurrency);
    const symbol = this.symbols[toCurrency];
    
    if (toCurrency === "LKR") {
      return `${symbol} ${converted.toLocaleString()}`;
    }
    return `${symbol}${converted}`;
  }

  updatePrices() {
    // Find all elements with class 'price-convert'
    // They must have data-price-lkr attribute containing base LKR price
    const priceElements = document.querySelectorAll('.price-convert');
    priceElements.forEach(el => {
      const basePriceLkr = parseFloat(el.getAttribute('data-price-lkr'));
      if (!isNaN(basePriceLkr)) {
        el.textContent = this.formatPrice(basePriceLkr);
      }
    });

    // Also update any currency indicators/labels on page
    document.querySelectorAll('.currency-indicator').forEach(el => {
      el.textContent = this.currentCurrency;
    });
  }
}

// Write to global window scope explicitly for safety
window.WeatherWidget = WeatherWidget;
window.CurrencyConverter = CurrencyConverter;
