# Divergence.AI — UI Specification v3 (Claude Code)
## HTML structure, CSS classes, and interaction logic for implementation

---

## STATE MANAGEMENT STATE TREE

```
App State:
├── visibility
│   ├── recentSessions: boolean (default true)
│   ├── contextSnapshot: boolean (default true)
│   ├── recentActivity: boolean (default true)
│   ├── tokenUsage: boolean (default true)
│   ├── modelStatus: boolean (default true)
│   ├── quickTools: boolean (default false)
│   └── activeSession: boolean (default false)
├── sidebarAccordion
│   └── openSection: string | null (only one open at a time)
├── textarea
│   ├── value: string
│   ├── isTyping: boolean
│   └── typingDebounceTimer: number
├── stateDetection
│   ├── isDetected: boolean
│   ├── emotion: string | null
│   ├── rsd: 'high' | 'low' | null
│   ├── interest: 'low' | 'medium' | 'high' | null
│   ├── cognitiveMode: string | null
│   ├── explanation: string
│   └── isDismissed: boolean
├── formState
│   ├── model: string (default "Opus 4.8")
│   ├── directness: string (default "Level 2")
│   └── technique: string (default "Socratic")
├── dropdowns
│   ├── modelOpen: boolean
│   ├── directnessOpen: boolean
│   ├── techniqueOpen: boolean
│   └── attachOpen: boolean
├── modals
│   ├── download: boolean
│   ├── context: boolean
│   ├── loadTemplate: boolean
│   ├── import: boolean
│   ├── debate: boolean
│   ├── consensus: boolean
│   └── synthesis: boolean
├── answer
│   ├── text: string
│   ├── confidence: number (0-100)
│   ├── isLoading: boolean
│   └── error: string | null
├── feedback
│   └── rating: number (1-5) | null
├── transparency
│   ├── isOpen: boolean
│   ├── routingDetails: object
│   ├── techniquesDetails: object
│   └── confidenceDetails: object
└── multiAI
    ├── isOpen: boolean
    ├── debateModels: array
    ├── consensusScore: number
    └── synthesisOutput: string
```

---

## VISIBILITY TOGGLE SYSTEM (Priority: Implement First)

### HTML Structure
```html
<!-- Right Sidebar Container -->
<aside class="sidebar-right">
  
  <!-- Visibility Toggle Button -->
  <button class="visibility-toggle" aria-label="Toggle sidebar visibility options">
    <svg class="visibility-toggle__icon"><!-- gear icon --></svg>
  </button>
  
  <!-- Visibility Dropdown (hidden by default) -->
  <div class="visibility-dropdown" role="menu">
    <div class="visibility-dropdown__header">Sidebar Visibility</div>
    
    <label class="visibility-checkbox">
      <input type="checkbox" data-toggle="recent-sessions" checked>
      <span>Recent Sessions</span>
    </label>
    
    <label class="visibility-checkbox">
      <input type="checkbox" data-toggle="context-snapshot" checked>
      <span>Context Snapshot</span>
    </label>
    
    <label class="visibility-checkbox">
      <input type="checkbox" data-toggle="recent-activity" checked>
      <span>Recent Activity</span>
    </label>
    
    <label class="visibility-checkbox">
      <input type="checkbox" data-toggle="token-usage" checked>
      <span>Token Usage</span>
    </label>
    
    <label class="visibility-checkbox">
      <input type="checkbox" data-toggle="model-status" checked>
      <span>Model Status</span>
    </label>
    
    <label class="visibility-checkbox">
      <input type="checkbox" data-toggle="quick-tools">
      <span>Quick Tools</span>
    </label>
    
    <label class="visibility-checkbox">
      <input type="checkbox" data-toggle="active-session">
      <span>Active Session</span>
    </label>
    
    <button class="visibility-dropdown__reset">Reset to defaults</button>
  </div>
  
  <!-- Sidebar Sections (controlled by checkboxes) -->
  <div class="sidebar-sections">
    <!-- Accordion sections here -->
  </div>
  
</aside>
```

### CSS for Visibility Toggle
```css
.visibility-toggle {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-default);
  z-index: 200;
}

.visibility-toggle:hover {
  background: var(--color-bg-hover);
  box-shadow: var(--glow-accent);
}

.visibility-toggle__icon {
  width: 20px;
  height: 20px;
  fill: var(--color-secondary);
}

.visibility-dropdown {
  display: none;
  position: absolute;
  top: 50px;
  right: var(--spacing-md);
  width: 280px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  z-index: 210;
  box-shadow: var(--glow-subtle);
}

.visibility-dropdown.active {
  display: block;
}

.visibility-dropdown__header {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
  font-weight: 600;
}

.visibility-checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
  cursor: pointer;
}

.visibility-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.visibility-checkbox span {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.visibility-dropdown__reset {
  margin-top: var(--spacing-lg);
  width: 100%;
  padding: var(--spacing-md) 0;
  background: var(--color-bg-hover);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-default);
}

.visibility-dropdown__reset:hover {
  background: var(--color-bg-active);
}
```

---

## STATE DETECTION DISPLAY

### HTML Structure
```html
<div class="state-detection" id="state-detection" style="display: none;">
  <div class="state-detection__header">
    <span>STATE DETECTION</span>
    <button class="state-detection__dismiss" aria-label="Dismiss state detection">×</button>
  </div>
  
  <div class="state-detection__pills">
    <span class="state-detection__pill state-detection__pill--emotion"></span>
    <span class="state-detection__pill state-detection__pill--rsd"></span>
    <span class="state-detection__pill state-detection__pill--interest"></span>
    <span class="state-detection__pill state-detection__pill--cognitive"></span>
  </div>
  
  <div class="state-detection__explanation"></div>
  
  <button class="state-detection__adjust">Adjust</button>
</div>
```

### CSS for State Detection
```css
.state-detection {
  margin-top: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-bg-main);
  border-left: 2px solid var(--color-secondary);
  border-radius: var(--radius-md);
  animation: slideDown 0.3s ease-in;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.state-detection__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.state-detection__dismiss {
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  font-size: 20px;
  transition: var(--transition-default);
}

.state-detection__dismiss:hover {
  color: var(--color-text-secondary);
}

.state-detection__pills {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.state-detection__pill {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-hover);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.state-detection__pill--emotion {
  background: rgba(255, 107, 53, 0.2);
  color: var(--color-warning);
}

.state-detection__pill--rsd {
  background: rgba(255, 59, 48, 0.2);
  color: var(--color-error);
}

.state-detection__pill--interest {
  background: rgba(0, 255, 153, 0.2);
  color: var(--color-success);
}

.state-detection__pill--cognitive {
  background: rgba(0, 102, 255, 0.2);
  color: var(--color-primary);
}

.state-detection__explanation {
  font-size: var(--font-size-base);
  color: var(--color-text-tertiary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-md);
}

.state-detection__adjust {
  align-self: flex-end;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-hover);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: var(--transition-default);
}

.state-detection__adjust:hover {
  background: var(--color-bg-active);
  border-color: var(--color-primary);
}
```

### JavaScript for State Detection
```javascript
// Initialize state detection system
const stateDetectionSystem = {
  debounceTimer: null,
  debounceDelay: 300,
  isDetected: false,
  isDismissed: false,
  
  // Start typing detection (debounced)
  onTextareaInput() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (!this.isDismissed) {
        this.detectState();
      }
    }, this.debounceDelay);
  },
  
  // Detect emotional state from textarea content
  detectState() {
    const textarea = document.querySelector('.input-textarea');
    const text = textarea.value.toLowerCase();
    
    // Simple heuristic detection (replace with actual ML/API call)
    const stateData = {
      emotion: null,
      rsd: null,
      interest: null,
      cognitiveMode: null,
      explanation: ''
    };
    
    // Detect emotion
    if (text.includes('overwhelm') || text.includes('stressed') || text.includes('anxious')) {
      stateData.emotion = 'Overwhelmed';
    } else if (text.includes('calm') || text.includes('clear')) {
      stateData.emotion = 'Calm';
    }
    
    // Detect RSD (Relational Shame Deflection)
    if (text.includes('people think') || text.includes('embarrass') || text.includes('judge')) {
      stateData.rsd = 'High';
    } else {
      stateData.rsd = 'Low';
    }
    
    // Detect interest level
    if (text.includes('?')) {
      stateData.interest = 'High';
    }
    
    // Set cognitive mode based on content
    if (text.includes('how') || text.includes('why')) {
      stateData.cognitiveMode = 'Analytical';
    }
    
    // Generate explanation
    if (stateData.emotion) {
      stateData.explanation = `You sound ${stateData.emotion.toLowerCase()}. I told the AI to be extra supportive and break things down.`;
    }
    
    // Display if any state detected
    if (stateData.emotion || stateData.rsd === 'High' || stateData.interest === 'High') {
      this.displayStateDetection(stateData);
      this.isDetected = true;
    }
  },
  
  // Display state detection UI
  displayStateDetection(stateData) {
    const container = document.getElementById('state-detection');
    const pillsContainer = container.querySelector('.state-detection__pills');
    const explanation = container.querySelector('.state-detection__explanation');
    
    // Clear existing pills
    pillsContainer.innerHTML = '';
    
    // Add emotion pill
    if (stateData.emotion) {
      const pill = document.createElement('span');
      pill.className = 'state-detection__pill state-detection__pill--emotion';
      pill.textContent = `Emotion: ${stateData.emotion}`;
      pillsContainer.appendChild(pill);
    }
    
    // Add RSD pill
    if (stateData.rsd) {
      const pill = document.createElement('span');
      pill.className = 'state-detection__pill state-detection__pill--rsd';
      pill.textContent = `RSD: ${stateData.rsd}`;
      pillsContainer.appendChild(pill);
    }
    
    // Add interest pill
    if (stateData.interest) {
      const pill = document.createElement('span');
      pill.className = 'state-detection__pill state-detection__pill--interest';
      pill.textContent = `Interest: ${stateData.interest}`;
      pillsContainer.appendChild(pill);
    }
    
    // Add cognitive mode pill
    if (stateData.cognitiveMode) {
      const pill = document.createElement('span');
      pill.className = 'state-detection__pill state-detection__pill--cognitive';
      pill.textContent = `Mode: ${stateData.cognitiveMode}`;
      pillsContainer.appendChild(pill);
    }
    
    // Set explanation
    explanation.textContent = stateData.explanation;
    
    // Show container
    container.style.display = 'block';
  },
  
  // Dismiss state detection
  dismissStateDetection() {
    document.getElementById('state-detection').style.display = 'none';
    this.isDismissed = true;
  },
  
  // Initialize event listeners
  init() {
    const textarea = document.querySelector('.input-textarea');
    const dismissBtn = document.querySelector('.state-detection__dismiss');
    const adjustBtn = document.querySelector('.state-detection__adjust');
    
    if (textarea) {
      textarea.addEventListener('input', () => this.onTextareaInput());
    }
    
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => this.dismissStateDetection());
    }
    
    if (adjustBtn) {
      adjustBtn.addEventListener('click', () => this.openAdjustModal());
    }
  },
  
  openAdjustModal() {
    // TODO: Implement adjust modal
    console.log('Open adjust state modal');
  }
};

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  stateDetectionSystem.init();
});
```

---

## MODAL SYSTEM

### HTML Structure
```html
<!-- Modal Backdrop -->
<div class="modal-backdrop" id="modal-backdrop"></div>

<!-- Download Modal -->
<div class="modal modal--download" id="modal-download">
  <div class="modal__content">
    <div class="modal__header">
      <h2 class="modal__title">Download answer</h2>
      <button class="modal__close">&times;</button>
    </div>
    
    <div class="modal__body">
      <div class="modal__section">
        <label class="modal__checkbox">
          <input type="checkbox" name="answer-text" checked>
          <span>Answer text</span>
        </label>
        <label class="modal__checkbox">
          <input type="checkbox" name="confidence" checked>
          <span>Confidence</span>
        </label>
        <label class="modal__checkbox">
          <input type="checkbox" name="rating">
          <span>Rating</span>
        </label>
        <label class="modal__checkbox">
          <input type="checkbox" name="transparency-details">
          <span>Transparency details</span>
        </label>
        <label class="modal__checkbox">
          <input type="checkbox" name="state-detection-pills">
          <span>State detection pills</span>
        </label>
      </div>
      
      <div class="modal__section">
        <label for="format-select">Format</label>
        <select id="format-select" class="dropdown">
          <option>Markdown</option>
          <option>HTML</option>
          <option>JSON</option>
          <option>PDF</option>
        </select>
      </div>
    </div>
    
    <div class="modal__footer">
      <button class="button button--secondary" id="modal-download-copy">Copy</button>
      <button class="button button--primary" id="modal-download-btn">Download</button>
      <button class="button button--secondary" id="modal-download-cancel">Cancel</button>
    </div>
  </div>
</div>

<!-- Context Management Modal -->
<div class="modal modal--context" id="modal-context">
  <div class="modal__content">
    <div class="modal__header">
      <h2 class="modal__title">Manage Context</h2>
      <button class="modal__close">&times;</button>
    </div>
    
    <div class="modal__body">
      <div class="modal__section">
        <h3 class="modal__subtitle">Loaded Context</h3>
        <div class="context-list" id="context-list"></div>
      </div>
      
      <div class="modal__section">
        <h3 class="modal__subtitle">Add Context</h3>
        <div class="context-actions">
          <button class="button button--secondary" id="context-upload">Upload file</button>
          <button class="button button--secondary" id="context-paste-text">Paste text</button>
          <button class="button button--secondary" id="context-paste-url">Paste URL</button>
          <button class="button button--secondary" id="context-create-var">Create variable</button>
        </div>
      </div>
    </div>
    
    <div class="modal__footer">
      <button class="button button--secondary" id="modal-context-close">Close</button>
    </div>
  </div>
</div>

<!-- Import Modal -->
<div class="modal modal--import" id="modal-import">
  <div class="modal__content">
    <div class="modal__header">
      <h2 class="modal__title">Import</h2>
      <button class="modal__close">&times;</button>
    </div>
    
    <div class="modal__body">
      <div class="import-options">
        <button class="import-option" data-import="conversation">
          <span>Import previous conversation</span>
        </button>
        <button class="import-option" data-import="file">
          <span>Import from file</span>
        </button>
        <button class="import-option" data-import="variables">
          <span>Import variables</span>
        </button>
        <button class="import-option" data-import="prompts">
          <span>Import saved prompts</span>
        </button>
      </div>
    </div>
    
    <div class="modal__footer">
      <button class="button button--secondary" id="modal-import-cancel">Cancel</button>
    </div>
  </div>
</div>
```

### CSS for Modals
```css
.modal-backdrop {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(13, 11, 15, 0.8);
  z-index: 290;
}

.modal-backdrop.active {
  display: block;
}

.modal {
  display: none;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 500px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  z-index: 300;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal.active {
  display: block;
}

.modal__content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-subtle);
}

.modal__title {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0;
}

.modal__close {
  background: transparent;
  border: none;
  font-size: 24px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: var(--transition-default);
}

.modal__close:hover {
  color: var(--color-text-secondary);
}

.modal__body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  max-height: 60vh;
}

.modal__section {
  margin-bottom: var(--spacing-2xl);
}

.modal__section:last-child {
  margin-bottom: 0;
}

.modal__subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-md) 0;
  font-weight: 600;
}

.modal__checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
  cursor: pointer;
}

.modal__checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.modal__footer {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border-subtle);
  justify-content: flex-end;
}

.modal__footer .button {
  flex: 0 1 auto;
}
```

### JavaScript for Modals
```javascript
const modalSystem = {
  currentModal: null,
  
  openModal(modalId) {
    // Close previous modal if open
    if (this.currentModal) {
      this.closeModal(this.currentModal);
    }
    
    const modal = document.getElementById(modalId);
    const backdrop = document.getElementById('modal-backdrop');
    
    if (modal) {
      modal.classList.add('active');
      backdrop.classList.add('active');
      this.currentModal = modalId;
      
      // Trap focus in modal
      this.setupModalFocus(modal);
    }
  },
  
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const backdrop = document.getElementById('modal-backdrop');
    
    if (modal) {
      modal.classList.remove('active');
      backdrop.classList.remove('active');
      this.currentModal = null;
    }
  },
  
  setupModalFocus(modal) {
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      } else if (e.key === 'Escape') {
        this.closeModal(this.currentModal);
      }
    });
    
    firstElement?.focus();
  },
  
  init() {
    // Download modal
    document.getElementById('modal-download-cancel')?.addEventListener('click', () => {
      this.closeModal('modal-download');
    });
    
    // Context modal
    document.getElementById('modal-context-close')?.addEventListener('click', () => {
      this.closeModal('modal-context');
    });
    
    // Import modal
    document.getElementById('modal-import-cancel')?.addEventListener('click', () => {
      this.closeModal('modal-import');
    });
    
    // Close on backdrop click (if sticky behavior not desired, remove this)
    // document.getElementById('modal-backdrop')?.addEventListener('click', () => {
    //   this.closeModal(this.currentModal);
    // });
    
    // Close buttons (X)
    document.querySelectorAll('.modal__close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        this.closeModal(modal?.id);
      });
    });
  }
};

window.addEventListener('DOMContentLoaded', () => {
  modalSystem.init();
});
```

---

## MAIN INPUT AREA

### HTML Structure
```html
<div class="input-card">
  <h3 class="input-card__title">What's on your mind?</h3>
  
  <!-- Textarea -->
  <textarea 
    class="input-textarea"
    placeholder="Type how you actually think..."
  ></textarea>
  
  <!-- State Detection Display (conditional) -->
  <div class="state-detection" id="state-detection" style="display: none;">
    <!-- State detection content -->
  </div>
  
  <!-- Control Row 1 -->
  <div class="control-row">
    <select class="dropdown dropdown--model">
      <option>Opus 4.8 — smartest</option>
      <option>Opus fast</option>
      <option>Haiku</option>
    </select>
    
    <select class="dropdown dropdown--directness">
      <option>Directness Level 2</option>
      <option>Directness Level 1</option>
      <option>Directness Level 3</option>
    </select>
    
    <select class="dropdown dropdown--technique">
      <option>Socratic</option>
      <option>Quote-First</option>
      <option>Chain-of-Thought</option>
      <!-- More techniques -->
    </select>
  </div>
  
  <!-- Control Row 2 -->
  <div class="control-row control-row--buttons">
    <button class="button button--secondary" id="attach-btn">
      📎 Attach
    </button>
    
    <button class="button button--secondary" id="context-btn">
      Context >
    </button>
    
    <button class="button button--primary" id="submit-btn">
      ⚡ TRANSLATE & ASK →
    </button>
  </div>
  
  <!-- Quick Actions -->
  <div class="quick-actions">
    <div class="quick-actions__label">QUICK ACTIONS</div>
    <button class="button button--secondary">New Session</button>
    <button class="button button--secondary">Load Template</button>
    <button class="button button--secondary">Saved Prompts</button>
    <button class="button button--secondary">Duplicate Session</button>
    <button class="button button--icon">…</button>
  </div>
</div>
```

---

## SIDEBAR ACCORDION SYSTEM

### HTML Structure
```html
<div class="sidebar-accordion">
  <!-- Each accordion section -->
  <div class="accordion-section" data-section="recent-sessions">
    <button class="accordion-header" data-accordion="recent-sessions">
      <span>RECENT SESSIONS</span>
      <span class="accordion-header__icon">▼</span>
    </button>
    <div class="accordion-content">
      <!-- Section content -->
    </div>
  </div>
  
  <!-- More sections -->
</div>
```

### CSS for Accordion
```css
.accordion-header {
  width: 100%;
  padding: var(--spacing-lg);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-border-subtle);
  color: var(--color-secondary);
  font-weight: 600;
  font-size: var(--font-size-base);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: var(--transition-default);
}

.accordion-header:hover {
  background: var(--color-bg-hover);
}

.accordion-header__icon {
  transition: transform 0.18s ease;
}

.accordion-header.collapsed .accordion-header__icon {
  transform: rotate(-90deg);
}

.accordion-content {
  display: none;
  padding: var(--spacing-lg);
  max-height: calc(100vh - 400px);
  overflow-y: auto;
}

.accordion-content.active {
  display: block;
}
```

### JavaScript for Accordion (Revolving-Door)
```javascript
const accordionSystem = {
  openSection: null,
  
  init() {
    const headers = document.querySelectorAll('.accordion-header');
    
    headers.forEach(header => {
      header.addEventListener('click', (e) => {
        const section = header.dataset.accordion;
        this.toggleSection(section, header);
      });
    });
  },
  
  toggleSection(sectionName, headerElement) {
    const content = headerElement.nextElementSibling;
    
    // Close previously open section
    if (this.openSection && this.openSection !== sectionName) {
      this.closeSection(this.openSection);
    }
    
    // Toggle current section
    content.classList.toggle('active');
    headerElement.classList.toggle('collapsed');
    
    // Update state
    this.openSection = content.classList.contains('active') ? sectionName : null;
  },
  
  closeSection(sectionName) {
    const header = document.querySelector(`[data-accordion="${sectionName}"]`);
    const content = header?.nextElementSibling;
    
    if (content) {
      content.classList.remove('active');
      header.classList.add('collapsed');
    }
  }
};

window.addEventListener('DOMContentLoaded', () => {
  accordionSystem.init();
});
```

---

**Version:** 3.0 (With State Detection, Modals, and Accordion System)
**Purpose:** Claude Code implementation reference
**Status:** Complete and locked
**Last Updated:** 6/29/2026

