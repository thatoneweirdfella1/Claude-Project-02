# IMPLEMENTATION ROADMAP
## Specific Files, Code Locations & Modification Instructions

---

## PHASE 1: LAYOUT RESTRUCTURING
**Target File:** `index.html`
**Current Status:** Simple 2-column layout (sidebar + main)
**Goal Status:** 3-column layout (top bar + sidebar + main + right sidebar)

### 1.1 Add Top Bar (Lines 63-67 currently)

**Current Code (FIND):**
```html
.app {
  display: flex;
  height: 100vh;
}
```

**New Code (REPLACE WITH):**
```html
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Top Bar: 60px fixed, full width */
.topbar {
  height: 60px;
  background: linear-gradient(135deg, rgba(13,15,20,0.95), rgba(20,25,35,0.95));
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  gap: 20px;
}

/* Main container below topbar */
.app-main {
  display: flex;
  flex: 1;
  margin-top: 60px;
  height: calc(100vh - 60px);
  overflow: hidden;
}
```

### 1.2 Update Sidebar Positioning

**Current Code (FIND):**
```css
.sidebar {
  width: var(--sb-width);
  min-height: 100vh;
  ...
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
}
```

**New Code (REPLACE WITH):**
```css
.sidebar {
  width: 200px;  /* Changed from var(--sb-width) which is 220px */
  min-height: calc(100vh - 60px);  /* Account for top bar */
  background: linear-gradient(135deg, rgba(13,15,20,0.95), rgba(20,25,35,0.95));
  border-right: 1px solid var(--border);
  padding: 20px 10px;
  overflow-y: auto;
  position: relative;  /* Changed from fixed */
  top: auto;
  flex-shrink: 0;
}
```

### 1.3 Update Main Content Area

**Current Code (FIND):**
```css
.main-content {
  margin-left: var(--sb-width);
  width: calc(100% - var(--sb-width));
  height: 100vh;
  overflow-y: auto;
  padding: 40px;
  background: linear-gradient(180deg, rgba(13,15,20,0.1), rgba(13,15,20,0.3));
}
```

**New Code (REPLACE WITH):**
```css
.main-content {
  flex: 1;
  margin-left: 0;  /* No longer fixed position */
  width: auto;
  height: calc(100vh - 60px);  /* Account for top bar */
  overflow-y: auto;
  padding: 40px;
  background: linear-gradient(180deg, rgba(13,15,20,0.1), rgba(13,15,20,0.3));
  border-right: 1px solid var(--border);
}
```

### 1.4 Add Right Sidebar Styles

**ADD NEW CSS (after main-content):**
```css
/* Right Sidebar: 300px, fixed width */
.right-sidebar {
  width: 300px;
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, rgba(13,15,20,0.95), rgba(20,25,35,0.95));
  border-left: 1px solid var(--border);
  padding: 20px;
  overflow-y: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Visibility toggle (gear icon) */
.visibility-toggle {
  align-self: flex-end;
  background: transparent;
  border: none;
  color: var(--accent);
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  transition: all 0.15s ease;
}

.visibility-toggle:hover {
  color: #5aafff;
  transform: rotate(15deg);
}

/* Quick Tools Grid */
.quick-tools {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
}

.quick-tool-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: rgba(74,158,255,0.1);
  border: 1px solid rgba(74,158,255,0.2);
  border-radius: 8px;
  color: var(--text);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;
}

.quick-tool-button:hover {
  background: rgba(74,158,255,0.2);
  border-color: rgba(74,158,255,0.4);
}

.quick-tool-icon {
  font-size: 20px;
}

/* Accordion sections */
.accordion-section {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  cursor: pointer;
  transition: all 0.15s ease;
}

.accordion-header:hover {
  background: rgba(255,255,255,0.08);
}

.accordion-header.expanded {
  background: rgba(255,255,255,0.1);
}

.accordion-title {
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.accordion-chevron {
  font-size: 12px;
  transition: transform 0.15s ease;
}

.accordion-chevron.expanded {
  transform: rotate(90deg);
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.15s ease;
  border-top: 1px solid var(--border);
}

.accordion-content.expanded {
  max-height: 500px;  /* Adjust as needed */
}

.accordion-body {
  padding: 12px 16px;
  color: var(--dim);
  font-size: 13px;
  line-height: 1.5;
}
```

### 1.5 Update HTML Structure

**Current HTML (FIND):**
```html
<div class="app">
  <nav class="sidebar">
    <!-- sidebar content -->
  </nav>
  <main class="main-content">
    <!-- main content -->
  </main>
</div>
```

**New HTML (REPLACE WITH):**
```html
<div class="app">
  <!-- TOP BAR (NEW) -->
  <div class="topbar">
    <div class="topbar-left">
      <!-- Logo/brand can go here -->
    </div>
    <div class="topbar-center">
      <!-- Search, icons, etc. -->
    </div>
    <div class="topbar-right">
      <!-- User profile, notifications, etc. -->
    </div>
  </div>

  <!-- APP MAIN (3-COLUMN LAYOUT) -->
  <div class="app-main">
    <!-- LEFT SIDEBAR -->
    <nav class="sidebar">
      <!-- sidebar content (same as before) -->
    </nav>

    <!-- MAIN CONTENT -->
    <main class="main-content">
      <!-- main content (same as before) -->
    </main>

    <!-- RIGHT SIDEBAR (NEW) -->
    <aside class="right-sidebar">
      <!-- New right sidebar content -->
      <button class="visibility-toggle" onclick="toggleVisibilityMenu()">⚙️</button>
      
      <div class="quick-tools">
        <button class="quick-tool-button" onclick="showPanel('router')">
          <span class="quick-tool-icon">🧭</span>
          <span>Router</span>
        </button>
        <button class="quick-tool-button" onclick="showPanel('techniques')">
          <span class="quick-tool-icon">⚡</span>
          <span>Techniques</span>
        </button>
        <button class="quick-tool-button" onclick="showPanel('prompts')">
          <span class="quick-tool-icon">📝</span>
          <span>Prompts</span>
        </button>
        <button class="quick-tool-button" onclick="showPanel('variables')">
          <span class="quick-tool-icon">🔤</span>
          <span>Variables</span>
        </button>
        <button class="quick-tool-button" onclick="showPanel('checkpoints')">
          <span class="quick-tool-icon">🎯</span>
          <span>Checkpoints</span>
        </button>
        <button class="quick-tool-button" onclick="showPanel('dashboard')">
          <span class="quick-tool-icon">📊</span>
          <span>Dashboard</span>
        </button>
      </div>

      <!-- ACCORDIONS -->
      <div class="accordion-section">
        <div class="accordion-header" onclick="toggleAccordion(this)">
          <span class="accordion-title">Recent Sessions</span>
          <span class="accordion-chevron">▶</span>
        </div>
        <div class="accordion-content">
          <div class="accordion-body">
            <!-- Content here -->
          </div>
        </div>
      </div>

      <div class="accordion-section">
        <div class="accordion-header" onclick="toggleAccordion(this)">
          <span class="accordion-title">Context Snapshot</span>
          <span class="accordion-chevron">▶</span>
        </div>
        <div class="accordion-content">
          <div class="accordion-body">
            <!-- Content here -->
          </div>
        </div>
      </div>

      <div class="accordion-section">
        <div class="accordion-header" onclick="toggleAccordion(this)">
          <span class="accordion-title">Recent Activity</span>
          <span class="accordion-chevron">▶</span>
        </div>
        <div class="accordion-content">
          <div class="accordion-body">
            <!-- Content here -->
          </div>
        </div>
      </div>

      <div class="accordion-section">
        <div class="accordion-header" onclick="toggleAccordion(this)">
          <span class="accordion-title">Token Usage</span>
          <span class="accordion-chevron">▶</span>
        </div>
        <div class="accordion-content">
          <div class="accordion-body">
            <!-- Content here -->
          </div>
        </div>
      </div>

      <div class="accordion-section">
        <div class="accordion-header" onclick="toggleAccordion(this)">
          <span class="accordion-title">Model Status</span>
          <span class="accordion-chevron">▶</span>
        </div>
        <div class="accordion-content">
          <div class="accordion-body">
            <!-- Content here -->
          </div>
        </div>
      </div>

      <div class="accordion-section">
        <div class="accordion-header" onclick="toggleAccordion(this)">
          <span class="accordion-title">Active Session</span>
          <span class="accordion-chevron">▶</span>
        </div>
        <div class="accordion-content">
          <div class="accordion-body">
            <!-- Content here -->
          </div>
        </div>
      </div>
    </aside>
  </div>
</div>
```

### 1.6 Add JavaScript for Accordions

**ADD NEW JAVASCRIPT (in script section):**
```javascript
// Accordion management (revolving-door behavior)
let expandedAccordion = null;

function toggleAccordion(headerElement) {
  const section = headerElement.parentElement;
  const content = section.querySelector('.accordion-content');
  const chevron = headerElement.querySelector('.accordion-chevron');

  // If this accordion is already expanded, collapse it
  if (expandedAccordion === section) {
    content.classList.remove('expanded');
    headerElement.classList.remove('expanded');
    chevron.classList.remove('expanded');
    expandedAccordion = null;
    return;
  }

  // Close previously expanded accordion
  if (expandedAccordion) {
    const prevContent = expandedAccordion.querySelector('.accordion-content');
    const prevHeader = expandedAccordion.querySelector('.accordion-header');
    const prevChevron = prevHeader.querySelector('.accordion-chevron');
    prevContent.classList.remove('expanded');
    prevHeader.classList.remove('expanded');
    prevChevron.classList.remove('expanded');
  }

  // Open new accordion
  content.classList.add('expanded');
  headerElement.classList.add('expanded');
  chevron.classList.add('expanded');
  expandedAccordion = section;
}

// Visibility toggle
function toggleVisibilityMenu() {
  // TODO: Show dropdown menu to toggle visibility of accordion sections
  console.log('Visibility menu clicked');
}
```

### 1.7 Update CSS Variables

**FIND (in :root section):**
```css
:root {
  --sb-width: 220px;
  ...
}
```

**ADD after:**
```css
  --top-bar-height: 60px;
  --left-sidebar-width: 200px;
  --right-sidebar-width: 300px;
  --right-sidebar-hidden: none;  /* 'none' hides, 'flex' shows */
```

---

## PHASE 2: STATE DETECTION DISPLAY
**Target File:** `index.html` (main-content area)
**Goal:** Add state detection pills below textarea

### 2.1 Add State Display HTML

**FIND (after textarea in input-card):**
```html
<textarea id="userInput" class="input-textarea" placeholder="What's on your mind?"></textarea>
```

**ADD AFTER:**
```html
<!-- STATE DETECTION DISPLAY (NEW) -->
<div class="state-detection-container">
  <div class="state-pill emotion-pill">
    <span class="pill-icon">😊</span>
    <span class="pill-label" id="emotionLabel">Neutral</span>
  </div>
  <div class="state-pill rsd-pill">
    <span class="pill-icon">⚠️</span>
    <span class="pill-label" id="rsdLabel">Low RSD</span>
  </div>
  <div class="state-pill interest-pill">
    <span class="pill-icon">⚡</span>
    <span class="pill-label" id="interestLabel">Engaged</span>
  </div>
  <div class="state-pill cognitive-pill">
    <span class="pill-icon">🧠</span>
    <span class="pill-label" id="cognitiveLabel">Normal</span>
  </div>
</div>
```

### 2.2 Add State Detection CSS

**ADD NEW CSS:**
```css
/* State Detection Display */
.state-detection-container {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.state-detection-container.visible {
  opacity: 1;
}

.state-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid;
  background: rgba(255,255,255,0.05);
}

.pill-icon {
  font-size: 14px;
}

.pill-label {
  opacity: 0.9;
}

/* Emotion pill colors */
.emotion-pill {
  border-color: rgba(255,193,7,0.3);
  color: #ffc107;
}

.emotion-pill.anxious {
  border-color: rgba(244,67,54,0.3);
  color: #f44336;
}

.emotion-pill.excited {
  border-color: rgba(76,175,80,0.3);
  color: #4caf50;
}

.emotion-pill.frustrated {
  border-color: rgba(233,30,99,0.3);
  color: #e91e63;
}

/* RSD pill colors */
.rsd-pill {
  border-color: rgba(63,81,181,0.3);
  color: #3f51b5;
}

.rsd-pill.high {
  border-color: rgba(244,67,54,0.3);
  color: #f44336;
}

.rsd-pill.medium {
  border-color: rgba(255,193,7,0.3);
  color: #ffc107;
}

/* Interest pill colors */
.interest-pill {
  border-color: rgba(76,175,80,0.3);
  color: #4caf50;
}

.interest-pill.low {
  border-color: rgba(158,158,158,0.3);
  color: #9e9e9e;
}

/* Cognitive load pill colors */
.cognitive-pill {
  border-color: rgba(103,58,183,0.3);
  color: #673ab7;
}

.cognitive-pill.high {
  border-color: rgba(244,67,54,0.3);
  color: #f44336;
}
```

### 2.3 Add State Detection Logic

**FIND (in JavaScript section, existing detectState function):**
```javascript
function detectState() {
  // ... existing code ...
}
```

**MODIFY to add display logic after state detection:**
```javascript
function detectState() {
  // ... existing detection code ...
  
  // Display state pills (300-500ms after typing pause)
  clearTimeout(stateDisplayTimeout);
  stateDisplayTimeout = setTimeout(() => {
    updateStateDisplay();
  }, 350);  // 350ms = middle of 300-500ms range
}

function updateStateDisplay() {
  const container = document.querySelector('.state-detection-container');
  
  // Update emotion pill
  const emotionLabel = document.getElementById('emotionLabel');
  const emotionPill = document.querySelector('.emotion-pill');
  
  const emotion = learner.detectedState?.emotion || 'neutral';
  emotionLabel.textContent = emotion.charAt(0).toUpperCase() + emotion.slice(1);
  emotionPill.classList.remove('anxious', 'excited', 'frustrated');
  if (emotion !== 'neutral') {
    emotionPill.classList.add(emotion);
  }
  
  // Update RSD pill
  const rsdLabel = document.getElementById('rsdLabel');
  const rsdPill = document.querySelector('.rsd-pill');
  const rsdLevel = learner.detectedState?.rsdLevel || 'low';
  rsdLabel.textContent = (rsdLevel === 'high' ? 'High' : rsdLevel === 'medium' ? 'Medium' : 'Low') + ' RSD';
  rsdPill.classList.remove('high', 'medium');
  if (rsdLevel !== 'low') {
    rsdPill.classList.add(rsdLevel);
  }
  
  // Update interest pill
  const interestLabel = document.getElementById('interestLabel');
  const interestPill = document.querySelector('.interest-pill');
  const interest = learner.detectedState?.interest || 'engaged';
  interestLabel.textContent = interest.charAt(0).toUpperCase() + interest.slice(1);
  interestPill.classList.remove('low');
  if (interest === 'low') {
    interestPill.classList.add('low');
  }
  
  // Update cognitive load pill
  const cognitiveLabel = document.getElementById('cognitiveLabel');
  const cognitivePill = document.querySelector('.cognitive-pill');
  const cogLoad = learner.detectedState?.cognitiveLoad || 'normal';
  cognitiveLabel.textContent = cogLoad.charAt(0).toUpperCase() + cogLoad.slice(1);
  cognitivePill.classList.remove('high');
  if (cogLoad === 'high') {
    cognitivePill.classList.add('high');
  }
  
  // Show container with fade-in
  container.classList.add('visible');
}
```

---

## PHASE 3: CONTROL ROWS RESTRUCTURING
**Target File:** `index.html` (input-card)
**Goal:** Reorganize controls into 3 rows as per spec

### 3.1 Update Control Layout

**CURRENT (FIND - scattered controls):**
```html
<select id="modelSelect">...</select>
<input type="range" id="directnessSlider">
<select id="techniqueSelect">...</select>
<button onclick="showPanel('attach')">Attach</button>
<button onclick="showPanel('context')">Context</button>
<button onclick="run()">TRANSLATE & ASK</button>
```

**NEW (REPLACE WITH - organized rows):**
```html
<!-- CONTROL ROW 1: Model, Directness, Technique -->
<div class="control-row row-1">
  <div class="control-item">
    <label for="modelSelect">Model</label>
    <select id="modelSelect" class="control-select">
      <option value="opus">Claude 3 Opus</option>
      <option value="sonnet" selected>Claude 3 Sonnet</option>
      <option value="haiku">Claude 3 Haiku</option>
    </select>
  </div>

  <div class="control-item">
    <label for="directnessSlider">Directness</label>
    <div class="slider-container">
      <input type="range" id="directnessSlider" min="0" max="100" value="50" class="control-slider">
      <span class="slider-value" id="directnessValue">Balanced</span>
    </div>
  </div>

  <div class="control-item">
    <label for="techniqueSelect">Technique</label>
    <select id="techniqueSelect" class="control-select">
      <option value="analysis">Exploratory Analysis</option>
      <option value="devils-advocate">Devil's Advocate</option>
      <!-- ... other techniques ... -->
    </select>
  </div>
</div>

<!-- CONTROL ROW 2: Attach, Context, Import -->
<div class="control-row row-2">
  <button class="control-button secondary" onclick="showPanel('attach')">
    <span class="button-icon">📎</span>
    <span class="button-text">Attach</span>
  </button>
  <button class="control-button secondary" onclick="showPanel('context')">
    <span class="button-icon">📖</span>
    <span class="button-text">Context</span>
  </button>
  <button class="control-button secondary" onclick="showPanel('import')">
    <span class="button-icon">📥</span>
    <span class="button-text">Import</span>
  </button>
  <div style="flex: 1;"></div><!-- Spacer -->
  <button class="control-button primary" onclick="run()">
    <span class="button-text">TRANSLATE & ASK</span>
    <span class="button-icon">→</span>
  </button>
</div>

<!-- QUICK ACTIONS ROW -->
<div class="control-row quick-actions">
  <button class="action-button" onclick="showPanel('memory')">Recent</button>
  <button class="action-button" onclick="showPanel('templates')">Templates</button>
  <button class="action-button" onclick="showPanel('skills')">Skills</button>
</div>
```

### 3.2 Add Control Row CSS

**ADD NEW CSS:**
```css
/* Control Rows */
.control-row {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  align-items: flex-end;
}

.control-row.row-1 {
  flex-wrap: wrap;
  gap: 12px;
}

.control-row.row-2 {
  justify-content: space-between;
}

.control-row.quick-actions {
  gap: 8px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 120px;
}

.control-item label {
  font-size: 12px;
  color: var(--dim);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.control-select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: rgba(255,255,255,0.05);
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.control-select:hover {
  background: rgba(255,255,255,0.08);
  border-color: var(--accent);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-slider {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--border);
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.control-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  transition: all 0.15s ease;
}

.control-slider::-webkit-slider-thumb:hover {
  width: 18px;
  height: 18px;
  box-shadow: 0 0 8px rgba(74,158,255,0.4);
}

.slider-value {
  font-size: 12px;
  color: var(--dim);
  min-width: 60px;
  text-align: right;
}

.control-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.control-button.secondary {
  background: rgba(74,158,255,0.1);
  color: var(--accent);
  border: 1px solid rgba(74,158,255,0.2);
}

.control-button.secondary:hover {
  background: rgba(74,158,255,0.15);
  border-color: rgba(74,158,255,0.4);
}

.control-button.primary {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  font-weight: 600;
  margin-left: auto;
}

.control-button.primary:hover {
  box-shadow: 0 4px 12px rgba(37,99,235,0.3);
  transform: translateY(-2px);
}

.button-icon {
  font-size: 16px;
  opacity: 0.8;
}

.button-text {
  flex: 1;
}

.action-button {
  padding: 8px 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-button:hover {
  background: rgba(255,255,255,0.1);
  border-color: var(--accent);
  color: var(--accent);
}
```

---

## PHASE 4: MODAL SYSTEM
**Target File:** `index.html`
**Goal:** Convert panels to proper modals

### 4.1 Create Modal Structure

**ADD NEW HTML (before closing body tag):**
```html
<!-- MODAL OVERLAY -->
<div class="modal-overlay" id="modalOverlay" onclick="closeModal()"></div>

<!-- CONTEXT MODAL -->
<div class="modal" id="contextModal">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Add Context</h2>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <!-- Context input and options -->
    </div>
    <div class="modal-footer">
      <button class="modal-button secondary" onclick="closeModal()">Cancel</button>
      <button class="modal-button primary" onclick="applyContext()">Apply Context</button>
    </div>
  </div>
</div>

<!-- DOWNLOAD MODAL -->
<div class="modal" id="downloadModal">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Download Answer</h2>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <!-- Download options (PDF, Markdown, JSON, Text) -->
    </div>
    <div class="modal-footer">
      <button class="modal-button secondary" onclick="closeModal()">Cancel</button>
      <button class="modal-button primary" onclick="downloadAnswer()">Download</button>
    </div>
  </div>
</div>

<!-- MULTI-AI MODAL -->
<div class="modal" id="multiAiModal">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Multi-AI Analysis</h2>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="tab-buttons">
        <button class="tab-button active" onclick="switchTab('debate')">Debate</button>
        <button class="tab-button" onclick="switchTab('consensus')">Consensus</button>
        <button class="tab-button" onclick="switchTab('synthesis')">Synthesis</button>
      </div>
      <div id="debateContent" class="tab-content active">
        <!-- Debate content -->
      </div>
      <div id="consensusContent" class="tab-content">
        <!-- Consensus content -->
      </div>
      <div id="synthesisContent" class="tab-content">
        <!-- Synthesis content -->
      </div>
    </div>
    <div class="modal-footer">
      <button class="modal-button secondary" onclick="closeModal()">Close</button>
    </div>
  </div>
</div>
```

### 4.2 Add Modal CSS

**ADD NEW CSS:**
```css
/* Modal System */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: none;
  z-index: 1999;
  animation: fadeIn 0.2s ease;
}

.modal-overlay.visible {
  display: block;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, rgba(22,25,33,0.98), rgba(29,32,48,0.98));
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 2000;
  display: none;
  animation: slideUp 0.3s ease;
}

.modal.visible {
  display: block;
}

.modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  font-size: 16px;
  color: var(--text);
  font-weight: 500;
}

.modal-close {
  background: none;
  border: none;
  color: var(--dim);
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  transition: all 0.15s ease;
}

.modal-close:hover {
  color: var(--text);
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--border);
}

.modal-button {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-button.primary {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  flex: 1;
}

.modal-button.primary:hover {
  box-shadow: 0 4px 12px rgba(37,99,235,0.3);
}

.modal-button.secondary {
  background: rgba(255,255,255,0.05);
  color: var(--text);
  border: 1px solid var(--border);
}

.modal-button.secondary:hover {
  background: rgba(255,255,255,0.1);
}

/* Tabs inside modals */
.tab-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.tab-button {
  padding: 12px 16px;
  background: none;
  border: none;
  color: var(--dim);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
}

.tab-button.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translate(-50%, 60%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%);
    opacity: 1;
  }
}
```

### 4.3 Add Modal JavaScript

**ADD NEW JAVASCRIPT:**
```javascript
let currentModal = null;

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  const overlay = document.getElementById('modalOverlay');
  
  // Close previous modal if open
  if (currentModal) {
    closeModal();
  }
  
  modal.classList.add('visible');
  overlay.classList.add('visible');
  currentModal = modal;
}

function closeModal() {
  if (currentModal) {
    currentModal.classList.remove('visible');
  }
  document.getElementById('modalOverlay').classList.remove('visible');
  currentModal = null;
}

function switchTab(tabName) {
  // Remove active from all buttons and content
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  // Add active to clicked button and corresponding content
  event.target.classList.add('active');
  document.getElementById(tabName + 'Content').classList.add('active');
}

// Close modal when clicking overlay
document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) {
    closeModal();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeModal();
  }
});
```

---

## PHASE 5: MATERIAL SYSTEM POLISH
**Target File:** `index.html` (CSS variables and styles)
**Goal:** Exact visual compliance with design spec

### 5.1 Update Color Variables

**FIND (in :root section):**
```css
:root {
  --sb-width: 220px;
  --bg-main: #0d0f14;
  --bg-card: #161921;
  --bg-card2: #1d2030;
  --border: #272b3a;
  --text: #e8eaed;
  --dim: #8a9099;
  --accent: #4a9eff;
  --purple: #9b5cff;
  --green: #2dd36f;
  --red: #ff5c5c;
}
```

**REPLACE WITH (exact spec values):**
```css
:root {
  /* Layout */
  --top-bar-height: 60px;
  --left-sidebar-width: 200px;
  --right-sidebar-width: 300px;

  /* Material Colors - Black Marble Base */
  --bg-main: #0B0C0E;  /* Dark marble, slightly lighter than pure black */
  --bg-marble-light: #151618;  /* For subtle variation */

  /* Material Colors - Smoked Glass */
  --bg-card: #1A1823;  /* Dark charcoal with 90% opacity base */
  --bg-card2: #252233;  /* Slightly lighter variant */
  --border: #3A3847;  /* Subtle darker charcoal */

  /* Text Colors */
  --text: #FFFFFF;  /* Pure white for primary text */
  --text-secondary: #C8C9CC;  /* Muted gray (reduced opacity of white) */
  --text-tertiary: #8A8B8E;  /* Further reduced opacity */
  --dim: #8A8B8E;  /* Matching tertiary */

  /* Material Colors - Blue Marble */
  --accent: #4478E5;  /* Deep sapphire blue (upper range of spec) */
  --accent-light: #5588FF;  /* Lighter for hover states */
  --accent-dark: #2B4E9C;  /* Darker for active states */

  /* Brand Colors */
  --purple: #8B5CF6;  /* Brand identity purple */

  /* Semantic Colors */
  --green: #2DD36F;
  --amber: #F5A623;
  --red: #FF5C5C;
  --cyan: #00D9FF;  /* New: Secondary interactive elements */

  /* Material System - Light/Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.25);

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-xxl: 24px;
}
```

### 5.2 Update Card Materials

**FIND (all .input-card, .answer-card, etc.):**
```css
.input-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 20px;
}
```

**REPLACE WITH:**
```css
.input-card {
  background: rgba(26, 24, 35, 0.90);  /* Smoked Glass: 90% opacity */
  backdrop-filter: blur(12px);  /* Glassmorphism effect */
  border: 0.5px solid rgba(58, 56, 71, 0.4);  /* Hairline border */
  border-radius: 12px;  /* Soft, rounded */
  padding: 20px;
  box-shadow: var(--shadow-sm);
}
```

### 5.3 Update Button Materials

**ADD NEW CSS for primary button (Blue Marble):**
```css
.control-button.primary {
  background: linear-gradient(135deg, #2B4E9C, #4478E5);
  color: white;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(74, 120, 229, 0.2);
  transition: all 0.15s ease;
}

.control-button.primary:hover {
  box-shadow: 0 4px 16px rgba(74, 120, 229, 0.3);
  transform: translateY(-1px);
}

.control-button.primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(74, 120, 229, 0.2);
}
```

### 5.4 Add Global Smooth Transitions

**ADD NEW CSS:**
```css
/* Global transitions for premium feel */
* {
  transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

/* Disable on hover to prevent jank */
*:hover {
  transition-duration: 0.15s;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}
```

---

## PHASE 6: INTEGRATION & TESTING CHECKLIST

### 6.1 Functionality Tests
- [ ] All backend API calls work (translate, route, compose, ask)
- [ ] Session persistence works (localStorage)
- [ ] Conversation history maintained
- [ ] State detection logic functional
- [ ] All 12 techniques callable
- [ ] Rating/feedback system works
- [ ] Theme toggle works (dark/light)

### 6.2 Layout Tests
- [ ] Top bar displays correctly (60px, fixed)
- [ ] Left sidebar at 200px width
- [ ] Right sidebar at 300px width
- [ ] Main content area flex-grows
- [ ] No horizontal scrolling
- [ ] No content overlap
- [ ] Responsive at different screen sizes

### 6.3 Component Tests
- [ ] State detection pills appear and update
- [ ] Accordion system works (revolving-door)
- [ ] Visibility toggle functions
- [ ] Quick Tools grid displays
- [ ] Modals open/close correctly
- [ ] Control rows layout properly
- [ ] All buttons respond to clicks

### 6.4 Visual Tests
- [ ] Colors match spec exactly
- [ ] Shadows are subtle and correct
- [ ] Materials look premium (not cheap)
- [ ] Typography hierarchy clear
- [ ] Spacing breathing room preserved
- [ ] Corner radius consistency
- [ ] Interactive states visible
- [ ] Overall visual matches reference image

### 6.5 Performance Tests
- [ ] Page loads in < 2 seconds
- [ ] No console errors
- [ ] Smooth transitions and animations
- [ ] No lag during interaction
- [ ] Memory usage reasonable

---

## DEPLOYMENT CHECKLIST

- [ ] All code committed to claude/quirky-rubin-s6rckq
- [ ] Pull request created
- [ ] Code review completed
- [ ] Tests passing
- [ ] No console errors in production build
- [ ] Performance verified
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Mobile responsive tested
- [ ] Accessibility checked
- [ ] Ready to merge to main

---

**Document Status:** Implementation-ready  
**Last Updated:** 2026-06-30  
**Next Phase:** Begin Phase 1 implementation
