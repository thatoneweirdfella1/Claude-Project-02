# COMPLETE_VISION_DIVERGENCE_AI.md
## Full Specification & Implementation Blueprint

---

## HEADLINE DEFINITION

**Divergence.AI** is an ADHD-optimized, RSD-aware communication interface for interacting with Claude AI. It adapts to user's real-time emotional state, cognitive load, and communication preferences—delivering personalized responses that respect neurodivergent needs while preventing the sycophancy and burnout that standard AI interfaces enable.

**Reality:** Most AI interfaces are designed for "average" users. They don't account for Rejection Sensitive Dysphoria, hyperfocus cycles, emotional volatility, or the specific communication patterns of ADHD brains. Divergence.AI closes this gap.

**Who It's For:** ADHD adults (18+) with awareness of RSD. Secondary: therapists, coaches, and professionals supporting neurodivergent users.

**Why It Matters:** ADHD brains represent 4-5% of adults but are historically under-diagnosed and under-served. Existing AI treats them like any other user. Divergence.AI is explicitly designed for them.

---

## CORE PURPOSE & VALUES

### Mission
Enable clear, honest, respectful conversations with AI that account for neurodivergent communication patterns and emotional states.

### 7 Core Values

1. **Transparency**
   - Show your reasoning, don't hide intent
   - Explain why you chose a particular response style
   - Make state detection visible (not invisible/creepy)

2. **Respect**
   - Treat user autonomy as primary
   - Don't override user preferences with "better" defaults
   - Honor emotional boundaries

3. **Accessibility**
   - ADHD is neurodiversity, not deficit
   - No inspiration porn, no "you can do anything" platitudes
   - Assume intelligent, capable user with different communication needs

4. **Control**
   - User always has final say on how AI communicates
   - Can override any automatic detection
   - Can customize every aspect

5. **Learning**
   - System improves based on user feedback
   - Every interaction teaches the system something
   - User can audit and correct learning

6. **Safety**
   - Protect against sycophancy (false agreement)
   - Protect against dependency formation
   - Protect against burnout (don't enable all-night coding sessions)
   - Warn when conversation looks like avoidance behavior

7. **Anti-Sycophancy**
   - Honesty over praise
   - Feedback over false agreement
   - "That's a good idea, but here's why it won't work" > "That's brilliant!"
   - Challenge assumptions when appropriate

---

## FIVE CORE FEATURES

### Feature 1: Real-Time State Detection
**What it does:** Continuously detects user's emotional state, RSD sensitivity, interest level, and cognitive mode without asking "how are you?"

**Why it matters:** ADHD brains are highly state-dependent. Same question asked during hyperfocus vs. overwhelm requires completely different responses.

**How it works:**
- Analyzes text patterns (punctuation, pacing, keywords)
- Considers context (time of day, conversation length)
- Assigns confidence scores (not 100% certainty)
- Displays as color-coded pills: Emotion, RSD Level, Interest, Cognitive Mode
- User can override any detection

**Example:**
```
User types: "ok so like i have this idea but maybe not it's probably dumb"
→ Detection: Anxious (87%), RSD High (92%), Interest Medium (67%)
→ Right sidebar shows: 
  • Emotion: ● Anxious
  • RSD Level: High ▓▓▓
  • Interest: Medium ▓▓░
  • Cognitive: ● Processing
→ AI adjusts response to be gentle and validation-first
```

---

### Feature 2: Adaptive Communication Directness
**What it does:** Adjusts how direct/blunt the AI is based on user state or explicit preference.

**Why it matters:** When overwhelmed, harsh feedback triggers anxiety. When focused, too much coddling is frustrating. Same user needs different directness at different times.

**Three Levels:**

**Level 1: Gentle**
- Validation-first approach
- Indirect feedback ("I noticed you might..." vs. "You're doing X wrong")
- Soften challenges with "and" not "but"
- Acknowledge emotions before giving advice

**Level 2: Balanced** (Default)
- Honest but respectful
- Direct without being harsh
- Feedback is clear and actionable
- Acknowledges complexity without over-hedging

**Level 3: Blunt**
- Direct feedback with no sugar-coating
- Challenge assumptions
- Cut through hedging and self-doubt
- Useful when user needs reality check

**Example response to "I can't write this chapter":**

*Gentle:* "I hear that you're feeling stuck on this chapter. That's actually really common when approaching new material. What if we broke down what's feeling most overwhelming?"

*Balanced:* "You're stuck on the chapter. Let's figure out why. Is it the structure, the ideas, or the writing process itself?"

*Blunt:* "You can write the chapter. You're avoiding it because you're afraid it'll be bad. Let's write a bad draft first, edit later."

---

### Feature 3: Model & Technique Routing
**What it does:** Automatically selects which Claude model and which communication technique will be most effective based on state.

**Why it matters:** A complex reasoning problem needs Opus 4.8. A simple check-in needs Haiku. Analytical problem needs Chain-of-Thought. Stuck creative problem needs Socratic questioning.

**Three Models:**
- **Opus 4.8:** Most capable, best for complex reasoning (~5-10s response time)
- **Opus Fast:** Balanced capability and speed (~2-4s)
- **Haiku:** Fastest, good for quick feedback and emotional check-ins (~1s)

**Auto-Routing Logic:**
```
IF state = (Anxious OR Overwhelmed):
  USE Opus Fast (speed reduces anxiety)
ELSE IF cognitive_mode = Analytical:
  USE Opus 4.8 (better reasoning)
ELSE IF state = Excited AND Hyperfocus:
  USE Haiku (keep momentum)
ELSE:
  USE Opus Fast (balanced default)
```

**Twelve Communication Techniques:**

1. **Auto-Detect** — System chooses based on learning
2. **Socratic** — Questions to guide thinking ("What if...?")
3. **Quote-First** — Start with relevant quote or authority
4. **Chain-of-Thought** — Show step-by-step reasoning aloud
5. **Role-Prime** — Take on a perspective ("As your coach...")
6. **Verify** — Ask confirmation before proceeding
7. **Examples** — Lead with concrete examples
8. **Simplify** — Simplest terms first, build complexity
9. **Detailed** — Comprehensive, all-angles response
10. **Step-by-Step** — Break into discrete actionable steps
11. **Comparative** — Side-by-side option comparison
12. **Metaphor** — Use analogies to explain

**Technique Selection by Cognitive Mode:**
- **Analytical** → Chain-of-Thought or Comparative
- **Creative** → Role-Prime or Metaphor
- **Processing** → Detailed or Step-by-Step
- **Racing** → Step-by-Step (structure the chaos)
- **Stuck** → Socratic or Examples

---

### Feature 4: Learning & Adaptation
**What it does:** Tracks what works for this specific user and improves over time.

**Why it matters:** Generic responses don't work for ADHD. Every person is unique. System should learn what helps and what doesn't.

**What Gets Learned:**
- Which techniques correlate with positive feedback
- Which emotions indicate the user needs what kind of support
- RSD triggers (what feedback causes defensiveness?)
- Preferred directness level for different states
- Optimal model selection (does this user prefer fast or thorough?)
- Cognitive patterns (when does user get stuck?)

**How It Learns:**
```
Session 1:
- User: "I feel stuck"
- System suggests: Socratic technique
- User rates: ★★★★★ (very helpful)
→ Logged: stuck + Socratic = +1 learning point

Session 5:
- User: "I feel stuck" (again)
- System: "Last time Socratic worked, try that again?"
- User rates: ★★★ (okay, but different would be better)
→ Logged: stuck + Socratic = +0.5 points

Session 10:
- System tries: Chain-of-Thought instead
- User rates: ★★★★★
→ Logged: stuck + Chain-of-Thought = +1 point
→ Future: When stuck, prefer Chain-of-Thought
```

**Audit Trail & Transparency:**
- User can view full learning audit anytime
- See every decision system made and why
- Can delete any learning entry ("forget that")
- Can manually correct state detections
- Search audit by date, keyword, or topic

---

### Feature 5: Conversation Management & Persistence
**What it does:** Saves conversations, allows templates, supports soft-delete, learns from sessions.

**Why it matters:** ADHD brains don't remember "I solved this before." Templates and history solve that.

**Core Capabilities:**
- Save unlimited conversations
- Create templates from prompts (with variable support)
- Soft-delete to Trash (30-day restore window)
- Archive for organized keeping
- Search across all conversations
- Sessions tab shows recent work

**Template System:**
```
Save prompt as template:
"I'm feeling {{emotion}}. Help me break down {{task}} 
into steps using {{technique}} technique."

Later, click template → Fill in variables:
emotion: "overwhelmed"
task: "write client proposal"
technique: "step-by-step"

→ Generates personalized prompt instantly
```

**Data Persistence:**
14 fields saved locally and synced to server:
1. plan — Current session goal
2. archivedPairs — Organized past conversations
3. ratings — User feedback on responses
4. savedPrompts — Favorite templates
5. variables — User-defined variables
6. visibility — Which state pills to show
7. theme — Light/Dark mode preference
8. layout — "original" or "gold" layout variant
9. learnedPreferences — System's learning profile
10. stateCorrections — User manual overrides
11. sessions — Session history with metadata
12. trashed — Soft-deleted items
13. templates — Saved prompt templates
14. learningAuditLog — Full audit (500-entry max)

---

## USER EXPERIENCE FLOW (Happy Path)

### First Time: Onboarding
```
1. User opens Divergence.AI
2. Welcome screen
3. "Do you have ADHD?" → Yes
4. "Are you familiar with RSD?" → Yes/No
5. Brief state detection intro
6. Set default preferences:
   - Directness level (Gentle/Balanced/Blunt)
   - Theme (Light/Dark)
   - Layout (original/gold)
   - Which state pills to show
7. Explain: "System learns as we talk"
8. → Start first conversation
```

### Returning User: Continue Conversation
```
1. Open app → Home dashboard
2. Left sidebar shows recent conversations
3. Click conversation → Loaded instantly from cache
4. Right sidebar shows current state (live detection)
5. Continue typing → AI responds in learned style
6. Rate response (helpful/neutral/unhelpful)
7. If unhelpful, can override technique/model selection
8. Conversation auto-saved
```

### Complex Session: Multi-Turn Work
```
1. User: "I need to plan a project"
2. System detects: Analytical mood, high interest, calm
   → Routes to Opus 4.8, Chain-of-Thought technique
3. User: "That helps. But I'm overwhelmed by step 3"
4. System detects: Anxiety level jumped
   → Switches to Opus Fast for quicker response, Step-by-Step technique
5. User: "Actually I need Gentle here"
6. User manually selects Gentle directness
   → Next response is validation-first
7. User rates: "Much better"
8. System learns: Overwhelmed + Step-by-Step + Gentle = effective
```

### State Uncertainty: User Questions Detection
```
1. Right sidebar shows: Emotion ● Anxious
2. User hovers over pill
3. Explanation appears: "Why anxious? Multiple questions + backspacing detected"
4. User: "No, actually I'm fine"
5. Clicks override button
6. Manual correction logged to learning audit
7. System learns: This user's anxiety signals ≠ backspacing
```

---

## INFORMATION ARCHITECTURE

### 3-Column Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      TOP BAR (60px)                         │
│  [Logo] [Search...] ............ [Settings ▼]              │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬─────────────────────────────┬────────────────┐
│   SIDEBAR    │    MAIN CONTENT             │  STATE PILLS   │
│   (240px)    │    (Flexible)               │    (300px)     │
│              │                             │                │
│ HOME         │  Conversation Thread        │ EMOTION        │
│ DASHBOARD    │  [User message]             │ ● Calm         │
│              │  [AI response]              │                │
│ MESSAGES     │  [User message]             │ RSD LEVEL      │
│ (Today,      │  [AI response]              │ Medium ▓▓░     │
│  Yesterday,  │                             │                │
│  Earlier)    │  [Input box]                │ INTEREST       │
│              │  [Send button]              │ High ▓▓▓       │
│              │                             │                │
│ COLLECTIONS  │                             │ COGNITIVE      │
│ ├─ Archive   │                             │ ● Analytical   │
│ ├─ Resources │                             │                │
│ ├─ Projects  │                             │ ───────────    │
│ ├─ Tasks     │                             │ QUICK ACTIONS  │
│ └─ Integr.   │                             │ + New          │
│              │                             │ ★ Save         │
│ TEMPLATES    │                             │ 🎨 Template    │
│              │                             │                │
│ TOOLS        │                             │ ───────────    │
│ ├─ Customize │                             │ [Profile]      │
│ ├─ Settings  │                             │                │
│ ├─ Sessions  │                             │                │
│ └─ Translate │                             │                │
│              │                             │                │
│ TRASH        │                             │                │
│              │                             │                │
└──────────────┴─────────────────────────────┴────────────────┘
```

### 13 Destination Screens

**Primary Screens (Always Visible):**
1. **Home** — Dashboard and overview
2. **Messages** — Active conversations (sorted by date)
3. **Archive** — Organized saved conversations
4. **Templates** — Saved prompt templates

**Collections (Grouped under "Collections"):**
5. **Resources** — Saved links, articles, references
6. **Projects** — Multi-turn project tracking
7. **Tasks** — Task management integrated with AI
8. **Integrations** — Connected services

**Tools (Grouped under "Tools"):**
9. **Customize** — Preferences, defaults, learning setup
10. **Settings** — Account, privacy, data export
11. **Sessions** — Manage past sessions, restore old
12. **Translate** — Convert conversations to different formats

**Special:**
13. **Translate** — Convert to email, summary, outline, etc.
14. **Trash** — Soft-deleted items (30-day restore window)

---

## VISUAL DESIGN SYSTEM

### Color Palette

**Dark Theme (Default):**
- Background: #0d0f14 (near-black, easy on eyes)
- Accent: #4a9eff (calm blue, not aggressive)
- Text: #ffffff (white, high contrast)
- Muted: #666666 (mid-gray for secondary info)
- Success: #4ade80 (soft green)
- Warning: #fbbf24 (amber)
- Error: #f87171 (soft red)

**Light Theme:**
- Background: #f5f5f5 (light gray, not pure white)
- Accent: #2B4E9C (deep blue, professional)
- Text: #1a1a1a (dark gray, not pure black)
- Muted: #999999 (lighter gray)
- Success: #15803d (forest green)
- Warning: #b45309 (brown-ish amber)
- Error: #991b1b (dark red)

### Marble Textures (Optional)
- **Graphite** — Dark, moody, good with dark theme
- **Slate** — Cool, professional, works both themes
- **Mist** — Soft, ethereal, light theme optimal
- **Pearl** — Bright, clean, light theme optimal

### Typography
- **Font:** Inter (open-source, excellent readability)
- **Line Height:** 1.55 (generous, helps dyslexic readers)
- **Hierarchy:**
  - H1: 28px bold (page titles)
  - H2: 22px semibold (sections)
  - H3: 18px semibold (subsections)
  - Body: 16px regular (content)
  - Small: 14px (metadata, timestamps)
- **Spacing:** 8px base unit (all multiples: 8, 16, 24, 32, 40px)

---

## TECHNICAL IMPLEMENTATION

### Frontend Stack
- **Framework:** React 18+
- **Language:** TypeScript (strict mode)
- **State:** Zustand
- **Build:** Vite
- **Testing:** Vitest (unit), Playwright (E2E)
- **Styling:** CSS modules or Tailwind (decision pending)
- **Storage:** localStorage + API sync

### Directory Structure
```
src/
├── components/        # React components
│   ├── Layout/       # Page layout components
│   ├── Sidebar/      # Navigation and sidebar
│   ├── Chat/         # Conversation UI
│   ├── State/        # State detection display
│   └── Settings/     # Preference panels
├── stores/           # Zustand stores
│   ├── userStore.ts  # User preferences
│   ├── chatStore.ts  # Conversation data
│   ├── stateStore.ts # Detected state
│   └── learnStore.ts # Learning data
├── hooks/            # Custom React hooks
│   ├── useChat.ts
│   ├── useState.ts
│   └── useLearn.ts
├── services/         # API and external services
│   ├── api.ts
│   ├── claude.ts
│   └── storage.ts
├── types/            # TypeScript types
├── utils/            # Helper functions
├── public/           # Static assets
└── App.tsx          # Root component
```

### Data Persistence Flow
```
User Action
  ↓
Zustand Store Updated (instant)
  ↓
localStorage Updated (immediate)
  ↓
API Batch Queued
  ↓
Every 5 seconds: Batch Sent to Server
  ↓
Server Confirms or Resolves Conflicts
  ↓
localStorage Updated with Server Version
```

### API Endpoints (Conceptual)
```
POST /api/messages          — Send message, get AI response
POST /api/rate              — Rate a response (feedback)
POST /api/state-correction  — Manual state override
POST /api/learn-event       — Log learning data
GET  /api/conversations     — List all conversations
POST /api/sync              — Sync all data with server
```

---

## FEATURE COMPLETENESS MATRIX

| Feature | Status | Notes |
|---------|--------|-------|
| State detection (4-layer) | ⚠️ Partial | Emotion detection complete, RSD TBD |
| Directness levels (3) | ⚠️ Partial | Logic exists, UI not fully styled |
| Model routing (3 models) | ⚠️ Partial | Opus selection works, auto-routing TBD |
| Techniques (12) | ✅ Complete | All techniques available, auto-detect learning |
| Learning system | ⚠️ Partial | Feedback collection works, audit UI TBD |
| Conversation save | ✅ Complete | localStorage working |
| Templates | ✅ Complete | Save and load working |
| Soft-delete | ⚠️ Partial | Trash screen exists, restore UI TBD |
| Search | ⚠️ Partial | Local search works, server search TBD |
| Settings/Customize | ⚠️ Partial | Theme toggle works, other prefs TBD |
| Responsive layout | ✅ Complete | Mobile collapse tested |
| Dark/Light theme | ✅ Complete | Full toggle working |
| Marble textures | ⚠️ Partial | Implemented, not all used |
| Session management | ✅ Complete | Session tracking working |

**Legend:** ✅ = Fully Implemented | ⚠️ = Partially Implemented | ❌ = Not Started

---

## TIER-BY-TIER IMPLEMENTATION ROADMAP

### TIER 0 (Foundation — Current)
- ✅ Basic React app with 3-column layout
- ✅ Zustand state management
- ✅ localStorage persistence
- ✅ Switch between screens
- ✅ Basic chat interface
- ✅ Theme toggle (light/dark)

**Effort:** Foundation set, ready for features

---

### TIER 1 (Core State Detection & Routing)
**Estimated Effort:** 2-3 weeks

- [ ] Emotion detection (6 states) with keyword matching
- [ ] RSD level detection (3 levels)
- [ ] Interest level detection (3 levels)
- [ ] Cognitive mode detection (5 states)
- [ ] Display state pills in right sidebar
- [ ] State explanation on click
- [ ] Manual override (correction) UI
- [ ] Model selection UI (Opus 4.8, Fast, Haiku)
- [ ] Auto-routing logic

**What this enables:** AI responses adapt to detected state

---

### TIER 2 (Directness & Techniques)
**Estimated Effort:** 2 weeks

- [ ] Directness level selector UI
- [ ] Gentle/Balanced/Blunt variants of responses
- [ ] Technique selector (12 options + auto-detect)
- [ ] Auto-detect learning (which techniques work for this user?)
- [ ] Technique display in response footer
- [ ] User feedback on technique helpfulness

**What this enables:** Customizable communication style

---

### TIER 3 (Learning System & Audit)
**Estimated Effort:** 2-3 weeks

- [ ] Learning audit log viewer
- [ ] Audit log search (date, keyword, topic)
- [ ] Delete/forget learning entries
- [ ] Learning export
- [ ] Confidence scoring for detections
- [ ] Learning insights dashboard (what's the system learning?)

**What this enables:** Transparent, auditable adaptation

---

### TIER 4 (Advanced Features)
**Estimated Effort:** 4+ weeks

- [ ] Multi-AI debate mode
- [ ] Synthesis mode
- [ ] Team collaboration
- [ ] Voice input
- [ ] Advanced analytics
- [ ] Share conversations (with privacy controls)

**What this enables:** Power-user features, social features

---

## WHAT EXISTS TODAY

### Fully Implemented ✅
- React app structure
- 3-column layout
- Zustand state management
- localStorage persistence
- Basic conversation UI
- Theme toggle (light/dark)
- Session tracking
- Navigation between screens
- Mobile responsive design

### Partially Implemented ⚠️
- State detection (partial keywords only)
- Directness logic (exists, not applied)
- Model selection (manual only, no auto-route)
- Technique selection (UI exists, learning TBD)
- Learning audit (collection works, UI partial)
- Settings panel (theme only, other prefs TBD)

### Not Yet Implemented ❌
- RSD-specific detection
- Interest level tracking
- Cognitive mode detection
- State explanation modal
- State manual override UI
- Auto-routing logic
- Full technique implementation
- Learning audit viewer
- Advanced features (debate, synthesis, etc.)

---

## WHAT NEEDS BUILDING

**Critical Path (do first):**
1. Emotion detection UI (TIER 1)
2. Model routing UI (TIER 1)
3. Directness selector (TIER 2)
4. Learning audit viewer (TIER 3)

**Nice-to-have (after critical path):**
5. Advanced features (TIER 4)

---

## SUCCESS METRICS

The app is successful when:

✅ User can have a 10-turn conversation and see state detection adapt  
✅ User can select directness level and see response tone change  
✅ User can view learning audit and understand why system behaves a certain way  
✅ User rates the app 4+ stars for "understands my needs"  
✅ User returns 5+ times in a week (habit formation)  
✅ User reports feeling "heard" and "respected" (not patronized)  

---

## END OF COMPLETE_VISION_DIVERGENCE_AI.md

This document is the north star. When decisions conflict, refer here to understand the "why."

