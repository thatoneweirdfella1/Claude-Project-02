# DIVERGENCE.AI
# FEATURE SPECIFICATION
Version: 2.0

---

## PURPOSE

This document defines what features exist, how they work, what states they have, and how users interact with them.

Use alongside Information Architecture (where things live) and Visual Specification (how they look).

---

## CORE FEATURES

### 1. TRANSLATION ENGINE (Translation)

**What it does:**
Translates user input from raw ADHD-style communication into optimized prompts for AI models.

**How it works:**
1. User types in textarea: "Type how you actually think..."
2. State detection runs in background (emotion, RSD, interest, cognitive mode)
3. User clicks "TRANSLATE & ASK" or presses Enter
4. Translation engine processes raw input:
   - Detects emotional state
   - Identifies gaps in clarity
   - Restructures for optimal AI understanding
   - Preserves user intent
5. Generates refined prompt (invisible to user, runs on backend)

**Visual Feedback:**
- Button shows "Thinking..." state while translating
- All controls disable during processing
- Answer appears when complete

**Output:**
- Refined prompt sent to AI
- Translation confidence score: "92% confident this is what you meant"
- User can verify confidence (informs them if translation was uncertain)

**Persistence:**
- Translation parameters (Model, Directness, Technique) persist in session
- User can adjust these for next question without retranslating

---

### 2. ROUTING ENGINE (Model Selection)

**What it does:**
Routes translated prompt to appropriate Claude model tier based on complexity, domain, and user preference.

**Model Options:**
- **Opus 4.8 — smartest** (default) — Full capabilities, highest latency
- **Opus Fast** — Balanced speed/quality
- **Haiku** — Fast, lightweight answers

**How it works:**
1. User selects or defaults to "Opus 4.8"
2. Translation engine sends prompt to routing system
3. Router analyzes:
   - Complexity score (1-10)
   - Domain category
   - Context size
   - Time constraints
4. Router either confirms user selection or recommends alternative
5. Selected model processes request

**User Control:**
- Dropdown allows user to force a specific model
- User sees which model is currently active in Model Status (right sidebar)
- Model selection persists in session

**Transparency:**
- Transparency Details card shows which model was selected and why
- Routing decision visible on demand

---

### 3. DIRECTNESS CONTROL

**What it does:**
Adjusts the tone, verbosity, and communication style of responses based on user's emotional state and preference.

**Options:**
- **Directness Level 1** — Gentle, supportive, extensive scaffolding
- **Directness Level 2** (default) — Balanced, direct but warm, moderate detail
- **Directness Level 3** — Blunt, concise, gets straight to the point

**How it works:**
1. User selects Directness level
2. Translation engine encodes directness into refined prompt
3. Model receives directness signal in context
4. Model adjusts tone accordingly

**Example:**
Same question, three different directness levels produce different answers:
- Level 1: Long, supportive, lots of context
- Level 2: Clear and warm
- Level 3: Minimal, direct

**State Detection Integration:**
If user is detected as "Overwhelmed" (emotion), system can recommend lowering directness (Level 1) automatically. User overrides if desired.

**Persistence:**
- Selection persists in session
- Defaults to Level 2

---

### 4. TECHNIQUE SELECTION (Prompt Technique)

**What it does:**
Specifies how the AI should approach answering the question. Different techniques suit different types of questions.

**Technique Options (12 total, 1 selected per question):**

1. **Auto-detect** (system button at top of dropdown) — System analyzes question and suggests best technique. User can override.

2. **Socratic** — Ask questions instead of providing answers. Good for teaching, clarification, deep thinking.

3. **Quote-First** — Lead with a relevant quote, then build from there.

4. **Chain-of-Thought** — Show your reasoning step-by-step. Good for complex logic, math, multi-step problems.

5. **Role-Prime** — Respond as if you're a specific role (teacher, therapist, coach, etc.).

6. **Verify** — Include sources, citations, verification of claims.

7. **Examples** — Provide concrete examples throughout the answer.

8. **Simplify** — Break down complex ideas into simple language and concepts.

9. **Detailed** — Go deeper, more comprehensive, assume less prior knowledge.

10. **Step-by-step** — Break complex process into discrete, numbered steps.

11. **Comparative** — Show different perspectives, compare approaches, highlight differences.

12. **Metaphor** — Explain using analogies and metaphors (good for abstract concepts).

**How it works:**
1. User selects technique from dropdown
2. Technique is encoded into refined prompt
3. Model receives technique instruction
4. Model applies technique to answer

**Example (same question, different techniques):**
- Socratic: "What aspects of this are you most unclear about?"
- Chain-of-Thought: "Step 1: ... Step 2: ... Step 3: ..."
- Examples: "Here's an example: ... Another example: ..."

**Auto-detect Feature:**
- Button at top of Technique dropdown
- System analyzes question and suggests best technique
- User can accept suggestion or override with own choice
- Helps ADHD users who struggle with making process choices

**Persistence:**
- Selection persists in session
- Defaults to "Socratic"

---

### 5. STATE DETECTION (Emotion + Context Detection)

**What it does:**
Automatically detects user's emotional state, RSD (Rejection Sensitive Dysphoria) level, interest level, and cognitive mode while typing.

**Detected States:**
- **Emotion** — Overwhelmed, Frustrated, Calm, Excited, Anxious, etc.
- **RSD Level** — Low, Medium, High (rejection sensitivity)
- **Interest** — Low, Medium, High (engagement with topic)
- **Cognitive Mode** — Analytical, Creative, Processing, Racing, Stuck

**How it works:**
1. User types in textarea
2. System runs content analysis in background (NLP)
3. After 300-500ms pause in typing, state detection display appears below textarea
4. Shows detected states as colored pills:
   - "Emotion: Overwhelmed" (purple/red)
   - "RSD: High" (red)
   - "Interest: High" (green)
   - "Cognitive Mode: Analytical" (blue)
5. Shows explanation: "You sound overwhelmed. I told the AI to be extra supportive and break things down."
6. X button allows user to dismiss display

**Impact on Response:**
- If RSD high: Model emphasizes safety, clarity, avoiding harsh tones
- If Emotion overwhelmed: Model recommends Directness Level 1, Simplify technique
- If Interest low: Model tries to hook engagement with metaphors, examples
- If Cognitive mode racing: Model recommends step-by-step structure

**User Control:**
- User can dismiss display if desired
- User can override suggestions (select different Model, Directness, Technique)
- State detection is informative, not prescriptive

**Accuracy:**
- System learns from user feedback (ratings) to improve detection
- User can correct detected states if inaccurate

---

### 6. CONTEXT MANAGEMENT (File/Text/URL/Variable Loading)

**What it does:**
Loads external context (documents, text, URLs, variables) into the session so the AI can reference it in all subsequent questions.

**Context Sources:**
1. **Upload File** — PDF, TXT, JSON, CSV, images (OCR), etc.
2. **Paste Text** — Raw text, code, email excerpts, etc.
3. **Paste URL** — Web page, article, API documentation, etc.
4. **Create Variable** — Named variable (e.g., $project_name, $deadline) that AI references

**How it works:**
1. User clicks "Context >" button in input area
2. Context modal opens (overlay)
3. User selects one of four methods:
   - Upload file: drag-and-drop or browse
   - Paste text: textarea
   - Paste URL: input field (system fetches and ingests)
   - Create variable: name/value form
4. User clicks "Add Context"
5. System ingests, processes, tokenizes
6. Loaded context appears in Context Snapshot (right sidebar)
7. Context persists in session and is included in all subsequent questions

**Context Snapshot Display:**
- Shows count of loaded items ("0 items" or "2 files")
- Lists each item: filename, size, type
- Remove button (×) for each item
- "Use Context" toggle to enable/disable for next question only
- "Add Context" button to load more

**Limits:**
- File size: 10MB per file, 50MB total per session
- Token conversion: Files ingested and converted to tokens
- Token limit: Total context tokens counted against user's limit (visible in Token Usage meter)

**Persistence:**
- Context persists in current session only
- Closing session clears context
- User can save context snapshot as variable for reuse

---

### 7. FEEDBACK & RATING (5-Star System)

**What it does:**
Allows user to rate answer quality and provide feedback for system improvement.

**Rating System:**
- 5-star clickable display below answer
- User clicks star to rate (1-5)
- Rating saves immediately

**Feedback Field:**
- Text field: "What could be better?"
- Optional, user can skip
- Used to improve translation, routing, technique selection

**How Feedback Improves System:**
- Low ratings + feedback → system learns what went wrong
- User marks "too verbose" → system lowers Detailed technique usage for that user
- User marks "not clear" → system increases Simplify technique
- Feedback data trains future improvements

**Persistence:**
- Ratings and feedback saved to user account
- Linked to the specific answer for analysis

---

### 8. TRANSPARENCY DETAILS (Routing/Techniques/Confidence)

**What it does:**
Shows user exactly what the system did: which model was chosen, which techniques applied, confidence scores.

**Transparency Details Dropdown (Expands below answer):**

**Card 1: Routing**
- Model selected: "Claude Opus 4.8"
- Complexity score: "7/10 (complex)"
- Domain: "Technical"
- Scope: "Broad"
- Confidence: "95%"

**Card 2: Techniques**
- Techniques applied: "Socratic, Chain-of-Thought"
- Why selected: "Question requires step-by-step thinking and exploration"
- Confidence per technique: "Socratic: 92%, Chain-of-Thought: 88%"
- Effectiveness estimate: "High"

**Card 3: Confidence**
- Translation confidence: "92%"
- Routing confidence: "95%"
- Technique confidence: "90%"
- Overall confidence: "92%"
- Interpretation: "System is very confident it understood correctly"

**User Benefit:**
- Build trust by showing reasoning
- Understand why answer was generated this way
- Identify if system misunderstood something
- Learn from system's decision-making

---

### 9. MULTI-AI ACTIONS (Debate/Consensus/Synthesis)

**What it does:**
Generates multiple AI perspectives and allows user to compare, merge, or combine them.

**Three Actions:**

### 9.1 DEBATE
**Purpose:** Show opposing viewpoints on same topic. Helps user see multiple angles.

**How it works:**
1. User clicks "Debate" from Multi-AI Actions
2. Debate modal opens
3. System spins up two AI instances with opposite perspective instructions
4. Both AIs analyze the original question and respond with opposing takes
5. Modal shows two columns: "Position A" | "Position B"
6. Real-time generation visible as content appears

**Modal Contents:**
- Title: "Debating: [topic from original question]"
- Two columns, each showing different AI's argument
- "Merge to Conversation" button (adds both perspectives to conversation)
- "Download Debate" button (exports both positions)
- "Close" button

**Use Cases:**
- Understand both sides of an issue
- See weaknesses in each position
- Learn reasoning for opposing views
- Prepare for counter-arguments

---

### 9.2 CONSENSUS
**Purpose:** Find common ground and unified position after debate.

**How it works:**
1. User clicks "Consensus" from Multi-AI Actions
2. Consensus modal opens
3. System analyzes debate (both positions) and generates consensus
4. Three sections shown:
   - Disagreement statement: "The key disagreement is..."
   - Common ground: "Both positions agree..."
   - Unified perspective: "Synthesizing both..."

**Modal Contents:**
- Title: "Finding Common Ground: [topic]"
- Three sections: disagreement, common ground, unified perspective
- "Merge to Conversation" button
- "Download" button
- "Close" button

**Use Cases:**
- Move past polarized thinking
- Find middle ground
- Understand shared premises
- Build collaborative solutions

---

### 9.3 SYNTHESIS
**Purpose:** Combine best elements from multiple perspectives into single refined answer.

**How it works:**
1. User clicks "Synthesis" from Multi-AI Actions
2. Synthesis modal opens
3. System analyzes all available perspectives (original answer + debate + consensus)
4. Generates unified, synthesized answer incorporating strongest points from each

**Modal Contents:**
- Title: "Synthesis"
- Unified answer (refined version combining all perspectives)
- "Replace Current Answer" button (replaces original with synthesis, red border = destructive)
- "Merge Below" button (adds synthesis as new answer below original)
- "Download" button
- "Close" button

**Use Cases:**
- Refine answer with multiple perspectives baked in
- Get most comprehensive version
- Combine strengths of different viewpoints
- Replace weak original with stronger synthesis

---

### 9.4 Multi-AI Behavior Notes
- Each action opens its own modal (not inline)
- User can debate, then consensus, then synthesize (sequential workflow)
- Each action can be used independently or together
- Merged content adds to conversation (doesn't replace, unless user chooses "Replace")
- All multi-AI outputs are downloadable

---

### 10. DOWNLOAD & EXPORT

**What it does:**
Allows user to download/export answer in various formats and with various content selections.

**How it works:**
1. User clicks ↓ (download icon) in bottom-right of answer card
2. Download modal opens
3. User selects what to include (checkboxes):
   - ☑ Answer text
   - ☑ Confidence score
   - ☐ Rating (if provided)
   - ☐ Transparency details (routing, techniques, confidence)
   - ☐ State detection pills (emotion, RSD, etc.)
4. User selects format:
   - Markdown (default, .md file)
   - HTML (.html file)
   - JSON (.json file)
   - PDF (.pdf file)
5. User clicks "Download" or "Copy to Clipboard"

**Output Examples:**
- Markdown: Clean, readable text file with formatting
- HTML: Styled web page
- JSON: Structured data (for integrations)
- PDF: Professional document with formatting, margins

**Use Cases:**
- Save answer for reference
- Share with others
- Archive important responses
- Integrate with other tools (via JSON)
- Print-friendly format (PDF)

---

### 11. SESSION MANAGEMENT (New/Duplicate/Archive/Close)

**What it does:**
Allows user to create, manage, and switch between conversation sessions.

**Quick Actions Available:**

**New Session**
- Button in Quick Actions row
- Click to start fresh conversation
- Clears all context, history, but keeps user settings (Model, Directness, etc.)
- Creates new session with auto-generated title based on first question

**Duplicate Session**
- Button in Quick Actions row
- Copies current session (with all context, history, settings)
- New session inherits everything from original
- User can branch off a conversation without losing original

**Load Template**
- Button in Quick Actions row
- Opens template picker modal
- Shows available templates with previews
- User selects template
- Template pre-populates: Model, Directness, Technique, Context (if template includes it), optional starter question
- User can edit before applying

**Saved Prompts**
- Button in Quick Actions row
- Opens saved prompts panel/modal
- Shows previously saved question prompts
- Click to insert into current textarea
- Allows reuse of complex questions

**Import**
- Button in Quick Actions row
- Opens import options dropdown
- Options:
  * Import previous conversation
  * Import from file (.json, .txt)
  * Import from URL
  * Import variables from another session
  * Import context snapshot
  * Import saved prompts
  * Import chat history
  * Import template settings
- User selects option, follows import flow

**Close Session**
- Button in Active Session accordion (right sidebar)
- Red outline (destructive action)
- Closes current session, saves to archive
- Session is recoverable from Archive section

---

### 12. VISIBILITY TOGGLE & SIDEBAR MANAGEMENT

**What it does:**
Allows user to show/hide right sidebar sections based on preference.

**Gear Button (⚙️)**
- Located top-right of right sidebar
- Cyan color, blue marble glow on hover
- Click to open visibility dropdown

**Visibility Dropdown Options (7 checkboxes):**
- ☑ Recent Sessions (default ON)
- ☑ Context Snapshot (default ON)
- ☑ Recent Activity (default ON)
- ☑ Token Usage (default ON)
- ☑ Model Status (default ON)
- ☐ Quick Tools (default OFF)
- ☐ Active Session (default OFF)

**Behavior:**
- Unchecking hides that section immediately
- Checking shows it immediately
- Settings persist in account/session
- "Reset to defaults" button available

**Use Cases:**
- Power users: enable Quick Tools for deeper analysis
- Minimalist users: disable Active Session (already covered by other sections)
- Space-constrained users: hide less-needed sections
- Beginners: enable only essential sections

---

### 13. QUICK TOOLS (Sidebar Reference Grid)

**What it does:**
Provides quick access to system analysis tools and reference information.

**Six Tools (2×3 Grid):**

1. **Router**
   - Click to view detailed routing decision
   - Shows: which model chosen, why, complexity, domain
   - Modal or inline panel

2. **Techniques**
   - Click to view applied techniques in detail
   - Shows: which techniques used, why, confidence per technique
   - Modal or inline panel

3. **Prompt Library**
   - Click to save/load prompt templates
   - User can save current question for reuse
   - Browse saved prompts with search
   - Modal

4. **Variables**
   - Click to manage context variables
   - Create, edit, delete named variables ($project_name, $deadline, etc.)
   - Use variables in questions (AI references them)
   - Modal or panel

5. **Checkpoints**
   - Click to save/restore conversation states
   - Save checkpoint at key moments
   - Restore to checkpoint if branch off conversation
   - Modal or sidebar panel

6. **Dashboard**
   - Click to view session statistics
   - Total questions asked
   - Average answer quality (from ratings)
   - Token usage over time
   - Most-used techniques
   - Model usage distribution
   - Modal

**Visibility:**
- Quick Tools is pinned open by default (always visible in sidebar)
- Can be toggled off via visibility menu (⚙️)
- When toggled off, Quick Tools header disappears from sidebar

---

### 14. ACCORDION SECTIONS (Right Sidebar)

Each accordion is a collapsible section. Only one expanded at a time (revolving-door behavior).

**Recent Sessions**
- Shows 5-6 most recent conversations
- Click session to restore it
- "View All" expands to full list (takes over main area)
- Click "View All" to see all sessions with search, delete, archive options

**Context Snapshot**
- Shows currently loaded context items
- Item count badge
- List with remove (×) buttons
- "Use Context" toggle to enable/disable for next question
- "Add Context" button to load more

**Recent Activity**
- Activity log for current session
- Timeline of actions: "Session created", "Template loaded", "Context imported", etc.
- Timestamps
- "View All Activity" link

**Token Usage**
- Current session tokens: "12,450 / 100K"
- Visual meter (percentage usage)
- Reset timer: "Resets in 2h 45m"
- Helps user track API costs

**Model Status**
- Currently active model: "Claude Opus 4.8"
- System health: "All Systems Operational" (green dot)
- Models online: "5 of 5"
- Quick status at a glance

**Active Session** (hidden by default)
- Session metadata
- Start time, question count, tokens used, context items
- "Close Session" button
- Hidden by default because other sections already show this info

---

## FEATURE INTERACTIONS

### Interaction 1: Ask a Question (Full Pipeline)
1. User types in textarea
2. State detection runs → emotional state appears as pills
3. User selects Model, Directness, Technique (or uses defaults)
4. User adds context if needed (Context button)
5. User clicks "TRANSLATE & ASK"
6. System translates → routes → composes → calls API
7. Answer appears with confidence score
8. User rates answer (5 stars)
9. User can explore transparency, debate, consensus, synthesis, or ask follow-up

### Interaction 2: Explore Answer (Post-Submit)
1. Answer appears with confidence line and feedback buttons
2. User clicks Transparency Details ▼ to see routing/techniques/confidence
3. User clicks Multi-AI Actions ▼ to see Debate, Consensus, Synthesis options
4. User clicks Debate → opens debate modal with two perspectives
5. User merges debate back to conversation (adds both positions)
6. User continues conversation with new context

### Interaction 3: Manage Context (Session-Level)
1. User clicks Context > button
2. Context modal opens
3. User uploads file, pastes text, adds URL, or creates variable
4. User clicks "Add Context"
5. Context appears in Context Snapshot (sidebar)
6. Context included in all subsequent questions
7. User can remove context item via Context Snapshot (× button)

### Interaction 4: Switch Sessions
1. User clicks Recent Sessions in sidebar (or "View All" link)
2. Recent Sessions accordion expands
3. User clicks session title to restore it
4. App switches to that session (conversation, context, history)
5. Or: User clicks "View All" → full list view takes over main area

---

## STATE DEFINITIONS

**Thinking State:**
- Button shows "Thinking..."
- Textarea disabled
- All control dropdowns disabled
- Cannot modify context, attach files, or change settings
- User can still view sidebar accordions

**Editing State:**
- User is typing in textarea or modifying context
- State detection runs in background
- Display updates in real-time

**Answering State:**
- Answer appears in main area
- All controls re-enabled
- User can rate, explore transparency, use multi-AI actions
- User can start new question (returns to editing state)

**Modal State:**
- Modal overlays main content with semi-transparent background
- User cannot interact with conversation until modal closes
- Modal actions: submit, download, merge, cancel, close

---

**Version:** 2.0 (Updated from final comprehensive layout)
**Authority:** Final comprehensive layout image is definitive
**Purpose:** Feature reference for implementation
**Status:** Final feature specification
