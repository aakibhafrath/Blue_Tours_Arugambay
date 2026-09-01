/* ==========================================================================
   BLUE TOURS ARUGAMBAY - AI CHAT ASSISTANT
   ========================================================================== */

class AIAssistant {
  constructor() {
    this.widget = document.querySelector('.ai-assistant-widget');
    if (!this.widget) return;
    
    this.toggleBtn = this.widget.querySelector('.ai-toggle-btn');
    this.chatWindow = this.widget.querySelector('.ai-chat-window');
    this.closeBtn = this.widget.querySelector('.btn-ai-close');
    this.messagesContainer = this.widget.querySelector('.ai-chat-messages');
    this.inputField = this.widget.querySelector('.ai-chat-input');
    this.sendBtn = this.widget.querySelector('.btn-ai-send');

    // Conversation Bank / Match Matrix (Pricing removed - direct contact CTA)
    this.responses = {
      greeting: [
        "Hi! Welcome to Blue Tours Arugambay. I am your local travel assistant. How may I help you plan your Sri Lankan adventure today?",
        "Hello traveler! Pleased to meet you. I am here to help you customize your dream vacation in Arugam Bay. What experiences are you looking for?"
      ],
      safari: [
        "Our safari adventures in Yala, Kumana, and Kalu Oya are spectacular! Famous for wild leopards, elephant herds, sloth bears, and hundreds of bird species. We offer half-day and full-day custom tours in open-top 4x4 safari jeeps with local expert trackers. Contact us directly on WhatsApp (+94 77 613 0013) for pricing and package details!",
        "Kumana and Yala Safaris are must-do experiences! Our local guides are experts at spotting leopards and nesting birds. We use open-top customized 4x4 safari jeeps for the best photography angles. Would you like to check availability?"
      ],
      surf: [
        "Arugam Bay is a world-renowned surfing paradise! We offer certified ISA lessons for beginners, intermediate, and advanced surfers with board rentals and rash guards included. Contact us on WhatsApp (+94 77 613 0013) for lesson timings, pricing, and availability!",
        "Whether you want to learn the basics at Baby Point or surf the clean barrels at Main Point or Elephant Rock, our certified instructors will guide you. Would you like to check lesson availability?"
      ],
      lagoon: [
        "Our Lagoon Boat Safari takes you through the beautiful mangroves of Kottukal or Urani. It's peaceful and perfect for spotting crocodiles, monkeys, peacocks, and eagles, especially during our Sunset Tour! Contact us for pricing and package details."
      ],
      tuktuk: [
        "Our Tuk Tuk Safari is a fun local adventure! We visit hidden beaches (like Peanut Farm or Lighthouse Point), explore local villages, and stop for fresh coconut water and photography. A true authentic experience! Contact us for details."
      ],
      taxi: [
        "We provide reliable, air-conditioned private transfers all over Sri Lanka. Popular routes include Colombo Airport (BIA), Ella, Yala, Mirissa, Kandy, Galle, and Trincomalee. Our vehicles are spacious and perfect for families with surfboards. Contact us for private transfer quotes!"
      ],
      camping: [
        "Experience our Beach Camping package! Spend the night under the stars, enjoy a campfire BBQ dinner (fresh fish/seafood), stargazing, and wake up to a beach breakfast. All gear is premium and comfortable. Contact Basheer on WhatsApp for pricing and package details!"
      ],
      booking: [
        "Booking is easy! You can use our online inquiry tool, message Basheer directly on WhatsApp at +94 77 613 0013, or fill out the contact form below. We confirm details and custom rates within minutes!"
      ],
      contact: [
        "You can reach our manager Basheer directly via email at arbasheer82@gmail.com, or call/WhatsApp at +94 77 613 0013 or +94 75 515 3878. We are open 24/7 for support."
      ],
      fallback: [
        "That sounds like an amazing plan! Please contact our manager, Basheer, directly at +94 77 613 0013 on WhatsApp or email arbasheer82@gmail.com for pricing, availability, and customized package details!",
        "I want to make sure you get the most accurate details. Please message us on WhatsApp at +94 77 613 0013, and our local team will assist you immediately with pricing and packages!"
      ]
    };
  }

  init() {
    if (!this.widget) return;
    this.addEventListeners();
    
    // Send initial greeting after 2 seconds
    setTimeout(() => {
      if (this.messagesContainer.children.length === 0) {
        this.addMessage(this.responses.greeting[0], 'bot');
      }
    }, 2000);
  }

  addEventListeners() {
    this.toggleBtn.addEventListener('click', () => this.toggleWindow());
    this.closeBtn.addEventListener('click', () => this.toggleWindow(false));
    
    this.sendBtn.addEventListener('click', () => this.handleSendMessage());
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSendMessage();
    });
  }

  toggleWindow(force) {
    const isShowing = force !== undefined ? force : !this.chatWindow.classList.contains('show');
    if (isShowing) {
      this.chatWindow.classList.add('show');
      this.inputField.focus();
    } else {
      this.chatWindow.classList.remove('show');
    }
  }

  handleSendMessage() {
    const text = this.inputField.value.trim();
    if (!text) return;

    // Add user message
    this.addMessage(text, 'user');
    this.inputField.value = '';

    // Show typing indicator
    this.showTypingIndicator(true);

    // Simulate natural thinking delay
    setTimeout(() => {
      this.showTypingIndicator(false);
      const reply = this.analyzeInput(text);
      this.addMessage(reply, 'bot');
    }, 1200);
  }

  addMessage(text, sender) {
    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg ${sender}`;
    msgEl.innerText = text;
    
    this.messagesContainer.appendChild(msgEl);
    this.scrollToBottom();
  }

  showTypingIndicator(show) {
    const existing = this.messagesContainer.querySelector('.chat-typing');
    if (show && !existing) {
      const typingEl = document.createElement('div');
      typingEl.className = 'chat-typing';
      typingEl.innerHTML = `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      `;
      this.messagesContainer.appendChild(typingEl);
      this.scrollToBottom();
    } else if (!show && existing) {
      existing.remove();
    }
  }

  analyzeInput(input) {
    const text = input.toLowerCase();
    
    if (text.includes('safari') || text.includes('jeep') || text.includes('kumana') || text.includes('leopard') || text.includes('elephant') || text.includes('wildlife')) {
      return this.getRandomResponse('safari');
    }
    if (text.includes('surf') || text.includes('waves') || text.includes('instructor') || text.includes('board')) {
      return this.getRandomResponse('surf');
    }
    if (text.includes('lagoon') || text.includes('boat') || text.includes('crocodile') || text.includes('mangrove')) {
      return this.getRandomResponse('lagoon');
    }
    if (text.includes('tuk') || text.includes('three wheel') || text.includes('village') || text.includes('local')) {
      return this.getRandomResponse('tuktuk');
    }
    if (text.includes('taxi') || text.includes('airport') || text.includes('pickup') || text.includes('transfer') || text.includes('destination') || text.includes('transport') || text.includes('colombo') || text.includes('ella') || text.includes('yala') || text.includes('mirissa') || text.includes('trinco') || text.includes('kandy')) {
      return this.getRandomResponse('taxi');
    }
    if (text.includes('camp') || text.includes('bbq') || text.includes('night') || text.includes('tent')) {
      return this.getRandomResponse('camping');
    }
    if (text.includes('book') || text.includes('schedule') || text.includes('reserve') || text.includes('calendar') || text.includes('pay')) {
      return this.getRandomResponse('booking');
    }
    if (text.includes('contact') || text.includes('phone') || text.includes('whatsapp') || text.includes('number') || text.includes('email') || text.includes('address') || text.includes('location')) {
      return this.getRandomResponse('contact');
    }
    if (text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('ayubowan')) {
      return this.getRandomResponse('greeting');
    }

    return this.getRandomResponse('fallback');
  }

  getRandomResponse(key) {
    const list = this.responses[key];
    return list[Math.floor(Math.random() * list.length)];
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}

window.AIAssistant = AIAssistant;
