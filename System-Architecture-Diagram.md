# System Architecture Diagram
## Phase 11+ Multi-AI System (Text-Based)

**Status: COMPLETE FOR PHASE 12 PLANNING**

---

## HIGH-LEVEL SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │              Frontend Application (React/Vue)           │  │  │
│  │  │  ┌─────────────────────────────────────────────────┐    │  │  │
│  │  │  │ Components Layer                                │    │  │  │
│  │  │  │ • Question Input                                │    │  │  │
│  │  │  │ • Dialogue Container (vertical layout)          │    │  │  │
│  │  │  │ • Goal Picker                                   │    │  │  │
│  │  │  │ • Settings Panel                                │    │  │  │
│  │  │  │ • History Screen                                │    │  │  │
│  │  │  │ • Quiet Mode / ADHD Mode / Focus Mode           │    │  │  │
│  │  │  └─────────────────────────────────────────────────┘    │  │  │
│  │  │  ┌─────────────────────────────────────────────────┐    │  │  │
│  │  │  │ State Management (localStorage + Redux/Vuex)    │    │  │  │
│  │  │  │ • User preferences                              │    │  │  │
│  │  │  │ • Conversation history (in-session)             │    │  │  │
│  │  │  │ • Milestone progress                            │    │  │  │
│  │  │  │ • Settings cache                                │    │  │  │
│  │  │  └─────────────────────────────────────────────────┘    │  │  │
│  │  │                                                         │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ WebSocket / HTTP (HTTPS with proxy)                          │  │
│  └────────────────┬────────────────────────────────────────────┬─┘  │
│                   │                                            │     │
└───────────────────┼────────────────────────────────────────────┼─────┘
                    │                                            │
                    ▼                                            ▼
        ┌──────────────────────┐              ┌──────────────────────┐
        │   Backend Server     │              │  Model APIs (External)
        │   (Node.js / Python) │              │  ┌────────────────┐  │
        │                      │              │  │ • Claude API   │  │
        │ [REST API Routes]    │◄─────────┐   │  │ • GPT API      │  │
        │ ┌──────────────────┐ │          │   │  │ • Perplexity   │  │
        │ │ POST /dialogues  │ │          │   │  └────────────────┘  │
        │ │ POST /feedback   │ │          │   └──────────────────────┘
        │ │ GET /history     │ │          │
        │ │ POST /questions  │ │          │
        │ │ GET /settings    │ │          │
        │ │ POST /accounts   │ │          │
        │ │ ... more ...     │ │          │
        │ └──────────────────┘ │          │
        │                      │          │
        └──────────┬───────────┘          │
                   │                      │
        ┌──────────▼──────────┐           │
        │ Service Layer       │           │
        │ ┌────────────────┐  │           │
        │ │ Dialogue       │  │           │
        │ │ Engine         │  │           │
        │ │ • Mode config  │  │           │
        │ │ • State mgmt   │  │           │
        │ │ • Auto-stop    │  │           │
        │ │ • Button logic │  │           │
        │ └────────────────┘  │           │
        │ ┌────────────────┐  │           │
        │ │ Account        │  │           │
        │ │ Rotation       │  │           │
        │ │ • Token count  │  │           │
        │ │ • Auto-swap    │  │───────────┘
        │ │ • Context xfer │  │
        │ └────────────────┘  │
        │ ┌────────────────┐  │
        │ │ Translation    │  │
        │ │ Service        │  │
        │ │ (Phase 1-10)   │  │
        │ └────────────────┘  │
        │ ┌────────────────┐  │
        │ │ Routing        │  │
        │ │ Service        │  │
        │ │ (Phase 1-10)   │  │
        │ └────────────────┘  │
        │ ┌────────────────┐  │
        │ │ Technique      │  │
        │ │ Selection      │  │
        │ │ (Phase 1-10)   │  │
        │ └────────────────┘  │
        │ ┌────────────────┐  │
        │ │ Feedback       │  │
        │ │ Service        │  │
        │ │ • Routing FB   │  │
        │ │ • Technique FB │  │
        │ │ • Final Rating │  │
        │ └────────────────┘  │
        │ ┌────────────────┐  │
        │ │ Learning       │  │
        │ │ System         │  │
        │ │ • Pattern det  │  │
        │ │ • Model perf   │  │
        │ │ • Mode effect  │  │
        │ └────────────────┘  │
        │                      │
        └──────────┬───────────┘
                   │
        ┌──────────▼──────────┐
        │ Data Layer (SQLite) │
        │ ┌────────────────┐  │
        │ │ Questions      │  │
        │ │ Answers        │  │
        │ │ Translations   │  │
        │ │ Routings       │  │
        │ │ Feedback       │  │
        │ └────────────────┘  │
        │ ┌────────────────┐  │
        │ │ Dialogue       │  │
        │ │ Dialogue_turns │  │
        │ │ Patterns       │  │
        │ │ Checkpoints    │  │
        │ │ Activity_log   │  │
        │ └────────────────┘  │
        │ ┌────────────────┐  │
        │ │ Config         │  │
        │ │ Accounts       │  │
        │ │ Variables      │  │
        │ │ Settings       │  │
        │ └────────────────┘  │
        │                      │
        └──────────────────────┘
```

---

## DETAILED COMPONENT INTERACTIONS

### 1. QUESTION CREATION FLOW

```
User Input
    │
    ▼
┌──────────────┐
│ Translation  │  ◄── Processes raw question
│ Service      │      Detects gaps, emotional content
└────┬─────────┘      Compound question handling
     │
     ▼
┌──────────────┐
│ Routing      │  ◄── Selects model based on:
│ Service      │      • Question type (ML classifier)
└────┬─────────┘      • User preferences
     │                 • Past satisfaction
     ▼
┌──────────────┐
│ Technique    │  ◄── Selects 3-9 techniques based on:
│ Selection    │      • Model capacity
└────┬─────────┘      • Technique conflicts
     │                 • Custom stacks
     ▼
┌──────────────┐
│ Granular FB  │  ◄── Capture optional thumbs-down
│ (optional)   │      • Routing feedback
└────┬─────────┘      • Technique feedback
     │
     ▼
┌──────────────┐
│ Composition  │  ◄── Build final prompt
└────┬─────────┘      Combine all signals
     │
     ▼
┌──────────────┐
│ API Call     │  ◄── Send to selected model
│ (Streaming)  │      (Claude/GPT/Perplexity)
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Answer       │  ◄── Stream response to frontend
│ Returned     │      Store in database
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Final FB     │  ◄── User rates answer (5 stars)
│ Collection   │      Correlates with routing/tech FB
└──────────────┘
     │
     ▼
┌──────────────┐
│ Learning     │  ◄── Pattern detection (10+ threshold)
│ System       │      Updates user preferences
└──────────────┘
```

---

### 2. DIALOGUE FLOW (MULTI-AI)

```
Goal Selection (User Picks: solid_answer, understand, improve_idea, decision, debate)
    │
    ├─── Depth Selector (Surface/Medium/Deep) - optional
    │
    └─── Position Selector (For/Against/Undecided) - conditional
         │
         ▼
    ┌──────────────────────────┐
    │ Mode Recommendation      │  ◄── Maps goal to mode:
    │ Engine                   │      • solid_answer → Adversarial
    └────┬─────────────────────┘      • understand → Socratic
         │                            • improve_idea → Devil's Advocate
         ▼                            • decision → Synthesis
    ┌──────────────────────────┐      • debate → Consensus
    │ User Selects Mode        │
    │ (primary or alternative) │
    └────┬─────────────────────┘
         │
         ▼
    ┌──────────────────────────┐
    │ Dialogue Initiated       │  ◄── Setup:
    │ (Selected Mode + Config) │      • Max rounds per mode
    └────┬─────────────────────┘      • System prompts loaded
         │                            • Dialog state created
         ▼
    ┌─────────────────────────────────────────┐
    │ DIALOGUE LOOP                           │
    │                                         │
    │ Turn 1: Model A speaks                  │
    │         (Account check: tokens OK?)     │
    │         API call → Response → Display   │
    │         User sees: [Copy] [Regen]       │
    │         Quality Score: 82%              │
    │                                         │
    │         User clicks: [✅ Accept] or     │
    │                      [🔄 Continue]      │
    │                                         │
    │ Turn 2: Model B speaks                  │
    │         (Account check → possible swap) │
    │         If swap: Show banner + inline   │
    │         API call → Response → Display   │
    │                                         │
    │ [Check Auto-Stop Condition]             │
    │ ├─ Consensus mode: Keywords → agree?   │
    │ ├─ Adversarial mode: Keywords → flaw?  │
    │ ├─ Socratic mode: Meta-commentary?     │
    │ ├─ Devil's Advocate: Refined proposal? │
    │ └─ Synthesis mode: Integration words?  │
    │                                         │
    │ If auto-stop triggered → Show complete │
    │ If max rounds reached → Show complete  │
    │ Else → Continue loop                   │
    │                                         │
    └──────────┬──────────────────────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Dialogue Completion      │  ◄── User rates dialogue
    │ Feedback Collection      │      Selects what worked
    └────┬─────────────────────┘      Tags dialogue
         │
         ▼
    ┌──────────────────────────┐
    │ Learning System          │  ◄── Records:
    │ Update                   │      • Goal vs Mode effective
    └──────────────────────────┘      • Model performance in role
                                      • Mode success rate
```

---

### 3. ACCOUNT ROTATION SYSTEM

```
Account Registry (8 Free Accounts Pooled):
├─ Claude A (Anthropic) ─────┐
├─ Claude B (Anthropic) ─────┤ Priority 1
├─ Claude C (Anthropic) ─────┘
│
├─ GPT A (OpenAI) ───────┐
├─ GPT B (OpenAI) ───────┤ Priority 2
│
├─ Perplexity A ─────────┐
├─ Perplexity B ─────────┤ Priority 3
├─ Perplexity C ─────────┘

Before API Call:
    │
    ▼
┌──────────────────────────┐
│ Token Check:             │
│ Current Account Tokens?  │
│ If < 100 → DEPLETED      │
└────┬─────────────────────┘
     │
     ├─ YES: Proceed with call
     │       └─ Decrement token count after response
     │
     └─ NO (Depleted): Auto-Swap
        │
        ▼
    ┌──────────────────────────────┐
    │ Find Next Available Account: │
    │ • Same provider first        │
    │ • Different provider if all  │
    │   same-provider depleted     │
    └────┬─────────────────────────┘
         │
         ▼
    ┌──────────────────────────┐
    │ Context Transfer:        │  ◄── Build system prompt with:
    │ Prepare for New Account  │      • Dialogue history
    └────┬─────────────────────┘      • Conversation state
         │                             • Previous responses
         ▼
    ┌──────────────────────────┐
    │ Show Notifications:      │  ◄── User feedback:
    │ • Banner at top          │      Banner: "🔄 Claude A depleted"
    │ • Inline in dialogue     │      Inline: "← Claude B joins"
    └────┬─────────────────────┘
         │
         ▼
    ┌──────────────────────────┐
    │ API Call with New Account│
    │ (Seamless handoff)       │
    └──────────────────────────┘

Edge Cases:
├─ Both Claude depleted, user clicks [Continue]
│  └─ Ask: "Use Perplexity?" before proceeding
│
├─ Mid-dialogue swap
│  └─ Transfer full dialogue context to new account
│
└─ User manual rotation (Settings)
   └─ Manual dropdown to pick account
```

---

### 4. FEEDBACK & LEARNING PIPELINE

```
User Feedback Collection (3 Points):

Point 1: Routing Feedback (Optional)
    │
    ├─ User clicks: 👎 Wrong model
    │  └─ Capture: routing_recommended, model_preferred
    │     Store: granular_feedback table
    │     Field: feedback_type = "routing"
    │
    ▼ (Continue with same model or change)

Point 2: Technique Feedback (Optional)
    │
    ├─ User clicks: 👎 Bad selection
    │  └─ Capture: techniques_selected, techniques_preferred
    │     Store: granular_feedback table
    │     Field: feedback_type = "technique"
    │
    ▼ (Continue or change techniques)

Point 3: Final Answer Feedback (Required)
    │
    ├─ User rates: ⭐⭐⭐⭐ (4 stars)
    │  └─ Optional comment: "Missing one aspect"
    │     Optional details: [Check boxes if explicit mode]
    │     Store: feedback table, correlation to question_id
    │
    ▼
┌──────────────────────────────────┐
│ Feedback Correlation:            │
│ Link routing FB + technique FB   │
│ + final answer rating            │
└────┬─────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│ Pattern Detection (Offline):     │
│ After N questions (N=10):        │
│                                  │
│ If 6+ thumbs-down routing:       │
│  └─ "For career Q, users prefer  │
│     Opus-Thinking (60%)"         │
│     Confidence: 0.60             │
│     Surface in: History → Patterns
│                                  │
│ If 7+ thumbs-down techniques:    │
│  └─ "T03+T16 conflict for        │
│     product research (70%)"      │
│     Confidence: 0.70             │
│                                  │
│ If model X always rated 5 stars: │
│  └─ "You prefer Model X for      │
│     questions like this"         │
└────┬─────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│ Learning System Update:          │
│ • Update patterns table          │
│ • Adjust routing weights         │
│ • Adjust technique preferences   │
│ • Track model effectiveness      │
└────┬─────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│ Next Question Application:       │
│ • Apply learned patterns         │
│ • Suggest routing if pattern     │
│ • Avoid technique conflicts      │
│ • Respect user overrides         │
└──────────────────────────────────┘
```

---

### 5. FEATURE UNLOCK (PROGRESSIVE) SYSTEM

```
User Question Counter (tracks total questions asked):
    │
    ├─ M1 (Milestone 1): 0 questions (Day 1)
    │  Features visible: Basic mode only
    │  ├─ Question input
    │  ├─ Answer display
    │  └─ 5-star feedback
    │
    ├─ M2: 10 questions
    │  New unlocked:
    │  ├─ Technique visibility
    │  ├─ Custom multi-AI goals
    │  └─ History screen
    │
    ├─ M3: 25 questions
    │  New unlocked:
    │  ├─ Advanced routing explanation
    │  ├─ Template library
    │  └─ Patterns tab
    │
    ├─ M4: 50 questions
    │  New unlocked:
    │  ├─ Dialogue branching (rewind/retry)
    │  ├─ Focus Mode
    │  ├─ Custom technique stacks
    │  └─ ADHD Mode
    │
    └─ M5: 100 questions
       New unlocked:
       ├─ Account management (custom API keys)
       ├─ Custom dialogue modes
       └─ Analytics dashboard

Implementation:
    │
    ▼
┌──────────────────────────────────┐
│ On Question Completion:          │
│ counter += 1                     │
│ Check: counter vs milestones     │
│ If crossed: trigger unlock logic │
└────┬─────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│ Milestone Crossed:               │
│ Show modal: "🎉 Features unlocked"│
│ List new features                │
│ [Dismiss]                        │
└────┬─────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│ Update Settings Visibility:      │
│ • Show newly unlocked tabs       │
│ • Gray out future milestone      │
│ • Show unlock tooltips           │
└────┬─────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│ Persist Milestone Data:          │
│ • Store unlock timestamp         │
│ • Store feature visibility state │
│ • Update user preferences DB     │
└──────────────────────────────────┘
```

---

### 6. QUIET MODE & ADHD MODE SYSTEM

```
Quiet Mode Toggle (On/Off):
    │
    ├─ When ON:
    │  Hide:
    │  ├─ Follow-up questions
    │  ├─ Technique explanations
    │  ├─ Routing reasoning
    │  ├─ Pattern suggestions
    │  ├─ Confidence scores
    │  ├─ Multi-AI mode toggle (not promotional)
    │  └─ Learning notifications
    │
    │  Keep visible:
    │  ├─ Question input
    │  ├─ Answer output
    │  ├─ 5-star feedback
    │  ├─ Copy/regenerate buttons
    │  └─ Core navigation
    │
    └─ When OFF: Show all normal features

ADHD Mode Toggle (On/Off):
    │
    ├─ When ON (Preset combination):
    │  1. High Contrast Mode (7:1 color ratio)
    │  2. Reduce Animations (50% speed or disabled)
    │  3. Plain Language (simplify jargon)
    │  4. Large Text Option (20-30% size increase)
    │  5. Hide Advanced Buttons (only core shown)
    │
    └─ When OFF: Normal theme

Implementation:
    │
    ▼
┌──────────────────────────────────┐
│ Settings Storage (localStorage): │
│ quiet_mode: boolean              │
│ adhd_mode: boolean               │
│ adhd_settings: {                 │
│   high_contrast: boolean         │
│   reduce_animations: boolean     │
│   plain_language: boolean        │
│   large_text: boolean            │
│   hide_advanced: boolean         │
│ }                                │
└────┬─────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│ CSS Class Application:           │
│ document.body.classList.toggle() │
│ ├─ .quiet-mode ───► Hide elements
│ ├─ .adhd-mode  ───► Apply presets
│ ├─ .high-contrast ─► 7:1 colors
│ ├─ .reduce-motion ─► Slower anim
│ └─ .plain-language ► Simplify UI
└────┬─────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│ Component Render Logic:          │
│ if (quietMode) ─┐ Hide component │
│ if (adhd.hideAdv) ┘              │
│                                  │
│ Applied immediately on toggle    │
│ No page reload                   │
└──────────────────────────────────┘
```

---

## DATA FLOW DIAGRAMS

### Complete Question Flow (Start to Finish)

```
User asks question:
"Should I launch this feature?"
    │
    ├──► Translation Service
    │    Input: Raw question + emotion
    │    Output: Translated question + gaps detected
    │    Store: questions.translated_text
    │
    ├──► Routing Service
    │    Input: Translated question, user history
    │    Factors: Question type, model performance, preference
    │    Output: Recommended model (Opus-Fast, 87% confidence)
    │    Collect: Optional thumbs-down feedback
    │    Store: routings.model, routings.confidence
    │
    ├──► Technique Selection
    │    Input: Model type, question category
    │    Factors: Model capacity, technique conflicts, custom stacks
    │    Output: 3 techniques (T01, T03, T04)
    │    Collect: Optional thumbs-down feedback
    │    Store: compositions.techniques
    │
    ├──► Composition
    │    Input: Question + Routing + Techniques
    │    Build: Final prompt with all signals
    │    Store: compositions.prompt (or build on-the-fly)
    │
    ├──► Account Rotation Check
    │    Check: Current account tokens
    │    If depleted: Rotate to next account + show notification
    │    Store: accounts.last_used, tokens_available
    │
    ├──► API Call (Streaming)
    │    Send: Prompt to selected model
    │    Receive: Response stream
    │    Display: Real-time text streaming to frontend
    │    Decrement: Token count
    │
    ├──► Answer Storage
    │    Store: answers table with full response + metadata
    │    Store: tokens_used, latency, model, confidence
    │
    ├──► Feedback Collection (3-Point System)
    │    
    │    Point 1 (Optional): Routing feedback
    │    Collect: Was routing wrong?
    │    Store: granular_feedback table, feedback_type="routing"
    │
    │    Point 2 (Optional): Technique feedback
    │    Collect: Were techniques wrong?
    │    Store: granular_feedback table, feedback_type="technique"
    │
    │    Point 3 (Required): Final rating
    │    Collect: 5-star rating + comment + optional checkboxes
    │    Store: feedback table, correlate to question_id
    │
    ├──► Learning Pipeline
    │    Analyze: All feedback points together
    │    Detect: Patterns (10+ threshold)
    │    Update: patterns table with detected patterns
    │    Suggestion: "You prefer Opus-Thinking for research"
    │    Surface: History → Patterns tab
    │
    └──► Next Question Application
         Apply: Any detected patterns
         Suggest: New routing/technique based on learning
         Track: Question counter for milestone progression
         Check: Feature unlock status

Total time: 2-30 seconds depending on model
All data persisted in SQLite
Learning applied retroactively for future questions
```

---

## DEPLOYMENT & INFRASTRUCTURE

```
┌─────────────────────────────────────────────────────┐
│ Client Environment (Chromium Pre-installed)         │
│ ├─ Playwright for E2E testing (pre-configured)     │
│ ├─ Environment variables for API proxy             │
│ │  └─ HTTPS_PROXY pointing to corporate proxy      │
│ └─ TLS verification using provided CA bundle       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Backend (Same Remote Container)                     │
│ ├─ SQLite database (local file storage)            │
│ ├─ Node.js / Python API server                     │
│ ├─ Service layer (dialogue, routing, etc.)         │
│ ├─ Environment variables:                          │
│ │  ├─ MODEL_API_KEYS (encrypted)                   │
│ │  ├─ DATABASE_PATH                                │
│ │  └─ PORT (3000 recommended)                       │
│ └─ Rate limiting middleware                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ External APIs (Outbound HTTPS via Proxy)           │
│ ├─ Anthropic Claude API                            │
│ ├─ OpenAI GPT API                                  │
│ └─ Perplexity API                                  │
│    All routed through: HTTPS_PROXY agent           │
│    With CA bundle: /root/.ccr/ca-bundle.crt        │
└─────────────────────────────────────────────────────┘

Proxy Behavior:
├─ TLS verification enabled
├─ If 403/405/407: Check /root/.ccr/README.md
├─ If 407 (auth): Submit credentials
├─ If DNS fails: Query proxy status with:
│  curl -sS "$HTTPS_PROXY/__agentproxy/status"
└─ Never disable TLS verification
```

---

## KEY ARCHITECTURAL DECISIONS

### 1. Vertical Dialogue Layout (Not Side-by-Side)
**Decision:** Stream conversation top-to-bottom
**Why:** Mirrors natural conversation flow (like texting)
**Impact:** Affects entire dialogue UI structure

### 2. Automatic Account Rotation (Transparent)
**Decision:** Auto-swap accounts when tokens deplete
**Why:** Seamless UX, no failed API calls
**Impact:** Token tracking must be precise, context transfer critical

### 3. Context Transfer via System Prompt
**Decision:** Pass dialogue history in system prompt to new account
**Why:** Simplest, most reliable approach
**Impact:** System prompt must be carefully crafted, test thoroughly

### 4. Progressive Feature Unlock (5 Milestones)
**Decision:** Features unlock at 0, 10, 25, 50, 100 questions
**Why:** Prevents Day-1 overwhelm, teaches system gradually
**Impact:** All features must be labeled with milestone level

### 5. Granular Feedback (3 Points)
**Decision:** Collect thumbs-down on routing AND techniques, plus final rating
**Why:** Clearer signals for learning, faster pattern detection
**Impact:** Two separate feedback collection points, linked data flow

### 6. Universal Button System (Context-Aware)
**Decision:** Same 2 buttons shift meaning by mode
**Why:** Minimizes button confusion, reduces visual clutter
**Impact:** Button handling logic must check mode, document meanings

### 7. Quiet Mode (Complete Hide)
**Decision:** Toggle hides ALL optional UI elements
**Why:** Handles overwhelm without changing behavior
**Impact:** All prompts/explanations must be toggleable via CSS

### 8. ADHD Mode (Preset Combination)
**Decision:** Single toggle enables 5 sub-settings simultaneously
**Why:** Optimized for ADHD needs without overwhelming with choices
**Impact:** CSS must support all 5 aspects, test all combinations

---

## SCALABILITY CONSIDERATIONS

### Database
- Dialogue_turns indexed on dialogue_id (frequent queries)
- Patterns table indexed on pattern_type (pattern surfacing)
- Activity_log indexed on created_at (timeline queries)
- Potential: Archive old dialogue_turns to separate table

### API
- Rate limiting: 50 req/hour for question creation (per user)
- Pagination: Default 20 items, max 100 per request
- Streaming: Long-polling or WebSocket for dialogue turns
- Cache: User settings cached in localStorage + server session

### Frontend
- Virtualize dialogue list if > 100 turns (unlikely for single dialogue)
- Lazy-load history (infinite scroll)
- Code-split settings/history tabs
- Service worker for offline queue (future feature)

---

**Status: COMPLETE**

**Next task: Critical Path Analysis**
