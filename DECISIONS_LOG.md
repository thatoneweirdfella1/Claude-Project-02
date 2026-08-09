# DECISIONS_LOG.md
## Master Record of Divergence.AI Decisions

**Last Updated:** June 27, 2026  
**Source:** Session consolidation across multiple conversations  
**Status:** Single source of truth for all architectural decisions

---

## 1. CORE CONCEPT & PURPOSE

### Decision: Mission Statement
**Decision:** Divergence.AI is an ADHD-friendly AI communication bridge designed to facilitate clear, respectful conversations with AI while accounting for Rejection Sensitive Dysphoria (RSD), emotional state, and cognitive load.

**Why:** ADHD individuals have specific communication needs that standard AI interfaces don't address—RSD triggers, overwhelm patterns, emotional baseline variation, and the need for transparent, anti-sycophantic feedback.

**How It Works:** 
- Detects user state in real-time (emotion, RSD level, interest, cognitive mode)
- Routes requests to appropriate Claude model based on state and urgency
- Adjusts communication directness (Gentle/Balanced/Blunt) to user's emotional state
- Applies 12 techniques to match communication style to user's cognitive mode
- Learns from user corrections over time

**Impact:** 
- Users feel understood and respected
- Conversations become more productive because the AI adapts to user needs
- RSD triggers are minimized through transparency
- ADHD individuals can communicate more effectively

---

### Decision: 7 Core Values
**Decision:** Divergence.AI is built on seven non-negotiable values:
1. **Transparency** — Always show your reasoning, never hide intent
2. **Respect** — Treat user autonomy and emotional state as primary
3. **Accessibility** — ADHD is neurodivergence, not deficit
4. **Control** — User always has final say on how AI communicates
5. **Learning** — System improves based on user feedback and corrections
6. **Safety** — Protect against sycophancy, burnout, dependency
7. **Anti-Sycophancy** — Honesty over praise; feedback over false agreement

**Why:** ADHD individuals are historically over-praised and under-challenged. These values create a foundation for healthy AI interaction that isn't paternalistic or manipulative.

**How It Works:**
- Every feature is designed around one or more values
- State detection centers on Respect (knowing user's actual state)
- Learning system embodies Learning value
- Directness levels embody Control value
- Transparency value shown in state pills, reasoning display, technique selection

**Impact:** Builds trust. Users can rely on the app to be honest, not just agreeable.

---

### Decision: Target User Profile
**Decision:** Primary target is ADHD adults (18+) with RSD awareness. Secondary: caregivers, therapists, professionals working with ADHD individuals.

**Why:** 
- ADHD prevalence in adults is 4-5% but severely under-diagnosed
- RSD awareness (understanding rejection sensitivity) is emerging need
- Existing AI interfaces don't account for ADHD communication patterns
- Market gap: no AI currently designed for neurodiverse users

**How It Works:**
- User onboarding asks about ADHD/RSD levels
- Defaults adjust based on profile
- Learning system personalizes to individual's specific pattern
- Community features (future) connect similar users

**Impact:** Creates a product that feels designed FOR someone, not AT them.

---

## 2. ARCHITECTURE & TECHNICAL STACK

### Decision: Frontend Framework & Tooling
**Decision:** React 18+ with TypeScript, Zustand state management, Vite build tool, Vitest/Playwright for testing.

**Why:** 
- React ecosystem is mature, component-based reasoning matches UI needs
- TypeScript catches errors early (important for reliability)
- Zustand is lightweight, doesn't over-abstract state
- Vite is fast for development iteration
- Vitest/Playwright test both unit and E2E behavior

**How It Works:**
- Modular component structure: `/components`, `/hooks`, `/stores`, `/public`
- Zustand stores manage global state (user prefs, app settings, session data)
- localStorage for immediate persistence, API batching for sync
- Hot module replacement for fast development

**Impact:** Can iterate quickly without losing reliability. TypeScript prevents whole classes of bugs.

---

### Decision: State Management Strategy
**Decision:** Zustand for global app state (settings, preferences, learned data), localStorage for persistence, API calls batched every 5 seconds.

**Why:**
- Zustand is 2KB, doesn't bloat bundle
- localStorage is instant (no network delay)
- Batching reduces API calls while staying sync'd
- Separation of concerns: client state vs. server state

**How It Works:**
```
User types → Zustand store updated immediately
            → localStorage update instant
            → API batch queued
            → Every 5s: batch sent to server
            → Server confirms or conflicts resolved
```

**Impact:** Snappy UI responsiveness without network latency problems.

---

### Decision: Backend Model Selection
**Decision:** Three-tier model access: Opus 4.8 (most capable, slowest), Opus Fast (balanced), Haiku (fastest, good for quick analysis).

**Why:**
- Different user states need different speeds vs. reasoning depth
- Opus 4.8 for complex, nuanced reasoning
- Opus Fast for balanced interactions (default)
- Haiku for rapid feedback, emotional check-ins
- User can override or auto-route based on state

**How It Works:**
- User selects model or enables auto-routing
- Auto-routing logic: if overwhelmed (high Emotion + high RSD) → Opus Fast (faster response reduces anxiety)
- If focused analytical work → Opus 4.8 (better reasoning)
- Technique selection also influences model choice

**Impact:** Better performance for each use case. Faster responses when user is anxious.

---

### Decision: Data Persistence & Fields
**Decision:** 14 core fields persisted to localStorage and API:
1. `plan` — Current session plan/goal
2. `archivedPairs` — Previous conversations (soft-delete)
3. `ratings` — User ratings of AI responses (for learning)
4. `savedPrompts` — Templates user has saved
5. `variables` — User-defined variables for prompts
6. `visibility` — Which state pills show/hide
7. `theme` — Light/Dark mode preference
8. `layout` — "original" or "gold" (color scheme)
9. `learnedPreferences` — What system has learned about user
10. `stateCorrections` — User manual overrides of detected state
11. `sessions` — Session history with metadata
12. `trashed` — Soft-deleted items awaiting permanent deletion
13. `templates` — Saved prompt templates
14. `learningAuditLog` — Full audit trail (500-entry max) of what system learned

**Why:** Covers all user customization, learning data, and session management without overloading with unnecessary fields.

**How It Works:**
- Each field updated as user interacts
- localStorage updated immediately (instant feedback)
- API batch includes all changed fields
- Learning fields include timestamp, user rating, state at time of learning

**Impact:** User data is never lost, learning is transparent and auditable, customization is comprehensive.

---

## 3. UI/UX LAYOUT & INFORMATION ARCHITECTURE

### Decision: 3-Column Grid Layout
**Decision:** Fixed left sidebar (240px) | Flexible main content | Fixed right sidebar (300px) on desktop; responsive collapse on tablet/mobile.

**Why:**
- 3 columns = left (navigation/context), center (focus), right (state info)
- Fixed sidebars reduce cognitive load (always know where things are)
- Right sidebar always shows emotional state without needing to open panels
- Matches mental model: "What am I doing" (left) | "Doing it" (center) | "How am I?" (right)

**How It Works:**
```
┌─────────────┬─────────────────────┬──────────────┐
│  SIDEBAR    │    MAIN CONTENT     │  STATE PILLS │
│  Nav Items  │   Conversation      │ Emotion      │
│  Screens    │   or Settings       │ RSD Level    │
│  (240px)    │   or Templates      │ Interest     │
│             │  (Flexible)         │ Cognitive    │
│             │                     │ (300px)      │
└─────────────┴─────────────────────┴──────────────┘
         Top Bar: Logo | Search | Settings
```

**Impact:** Information is always visible without menu hunting. State awareness is passive/ambient.

---

### Decision: Left Sidebar Navigation (12 Screens + Translate)
**Decision:** 13 destination screens organized in left sidebar with date-based grouping:

**Screens:**
1. Home — Dashboard/entry point
2. Dashboard — Analytics, stats, mood trends
3. Messages — Conversation list
4. Archive — Organized past conversations
5. Resources — Saved links, templates, guides
6. Projects — Multi-turn project tracking
7. Integrations — Connected services
8. Tasks — Task management and tracking
9. Templates — Prompt templates and favorites
10. Customize — User preferences
11. Settings — Account, privacy, data
12. Sessions — Session management, restore old
13. Translate — Convert conversations to different formats
14. Trash — Soft-deleted items (restore/permanent delete)

**Organization by Date:**
- Today
- Yesterday  
- Earlier (This Week)
- Earlier (This Month)
- Older

**Why:** 
- 13 is the maximum before sidebar becomes overwhelming
- Date grouping matches natural user memory ("I talked about X yesterday")
- Translate as separate screen (not submenu) emphasizes it's a first-class feature
- Trash separate from Archive (clear distinction: archived=kept, trash=review for deletion)

**How It Works:**
- Click screen name to navigate
- Clicking again collapses that screen's conversation history
- Drag-to-reorder supported
- Search applies across all screens

**Impact:** Fast navigation, natural organization, no buried features.

---

### Decision: Top Bar (60px)
**Decision:** Logo | Search | Settings (minimal, clean)

**Why:**
- Search bar always visible and accessible (keyboard shortcut Cmd+K / Ctrl+K)
- Settings dropdown has account, theme, help links
- Logo reinforces brand
- Minimal = less cognitive load

**How It Works:**
```
┌────────────────────────────────────────────────┐
│ [Logo] [Search bar] ... [Settings ▼]          │
│        "Search all conversations"              │
└────────────────────────────────────────────────┘
```

**Impact:** One-second navigation to any conversation via search.

---

### Decision: Right Sidebar (300px)
**Decision:** Shows real-time state pills (Emotion, RSD, Interest, Cognitive Mode) + Quick Actions + User Profile card.

**Why:**
- State is always visible without opening panels
- User can see why AI is responding a certain way
- Quick Actions = 3-4 most common tasks (New, Archive, Template, etc.)
- Profile card shows current session context

**How It Works:**
```
┌──────────────────┐
│ EMOTION          │
│ ● Calm           │ (color-coded)
│                  │
│ RSD LEVEL        │
│ Medium ▓▓░       │
│                  │
│ INTEREST         │
│ High ▓▓▓         │
│                  │
│ COGNITIVE MODE   │
│ ● Analytical     │
│                  │
│ ───────────────  │
│ QUICK ACTIONS    │
│ + New Conv.      │
│ ★ Save           │
│ 🎨 Template      │
│ ──────────────── │
│ [Profile Card]   │
└──────────────────┘
```

**Impact:** State awareness is ambient, not intrusive. User always knows why AI is responding as it does.

---

## 4. DESIGN SYSTEM & VISUAL IDENTITY

### Decision: Color Palette
**Decision:** 
- Dark Theme (default): #0d0f14 background, #4a9eff accent, white text, mid-gray muted elements
- Light Theme: #f5f5f5 background, #2B4E9C accent, dark gray text, lighter gray muted elements
- Both themes independently selectable from layout choice

**Why:**
- Dark theme reduces eye strain (important for ADHD focus sessions)
- #4a9eff is calm, not aggressive (important for RSD-sensitive users)
- #2B4E9C in light mode provides good contrast without harshness
- Orthogonal to layout choice (user can have dark theme + gold accents if desired)

**How It Works:**
- User selects theme in Settings
- localStorage `theme` field stores choice
- CSS variables switch entire palette
- All components reference variables, not hardcoded colors

**Impact:** Reduces visual stress. User control over aesthetics matters for ADHD.

---

### Decision: Marble Texture Palette
**Decision:** Four optional marble textures for visual interest:
- Graphite (dark, moody)
- Slate (cool, professional)
- Mist (soft, ethereal)
- Pearl (bright, clean)

**Why:**
- Plain flat colors can feel sterile to ADHD brains
- Textures add richness without being chaotic
- Optional (can be disabled in Customize)
- Each has consistent color pairing

**How It Works:**
- Applied as subtle background patterns
- Optional toggle in Customize
- Doesn't interfere with text legibility
- Cache as SVG patterns (tiny file size)

**Impact:** Reduces sense of sterile, clinical interface. More organic feel.

---

### Decision: Typography & Spacing
**Decision:** 
- Font: Inter (open-source, excellent hinting)
- Line height: 1.55 (generous, easier to read)
- Hierarchy: H1 (28px) → H2 (22px) → H3 (18px) → Body (16px) → Small (14px)
- Spacing: 8px base unit, multiples only (8, 16, 24, 32)

**Why:**
- Inter is readable at all sizes
- 1.55 line height helps dyslexic readers and ADHD focus
- 8px grid keeps layout clean and predictable
- Hierarchy is clear and consistent

**How It Works:**
- CSS uses `clamp()` for responsive sizing
- All padding/margin uses 8px multiples
- Font sizes set once in theme, referenced everywhere

**Impact:** Text is easier to read, layout feels intentional not chaotic.

---

## 5. STATE DETECTION SYSTEM

### Decision: 4-Layer Emotional/Cognitive State Detection
**Decision:** Real-time detection of four independent dimensions:

**Layer 1: Emotion (6 states)**
- Calm
- Anxious
- Frustrated
- Overwhelmed
- Excited
- Stuck

**Layer 2: Rejection Sensitive Dysphoria (3 levels)**
- Low (minimal RSD sensitivity)
- Medium (typical ADHD RSD)
- High (severe RSD activation)

**Layer 3: Interest (3 levels)**
- Low (struggling to focus on topic)
- Medium (baseline engagement)
- High (hyperfocus state)

**Layer 4: Cognitive Mode (5 states)**
- Analytical (problem-solving, logical)
- Creative (brainstorming, exploration)
- Processing (working through ideas)
- Racing (thoughts moving fast)
- Stuck (blocked, can't proceed)

**Why:**
- Single "mood" is too reductive
- ADHD brains can be anxious AND excited simultaneously
- RSD is orthogonal to emotion (can be calm but RSD-triggered)
- Interest and cognitive mode change independently
- Each dimension suggests different AI response strategies

**How It Works:**
- System analyzes user input for keywords, tone, pacing
- Assigns confidence score (0-100%) for each state
- Displays as color-coded pills in right sidebar
- User can manually override any detection
- Override is logged in `stateCorrections` (learning data)

**Detection Logic:**
```
Anxious detection signals:
- Multiple question marks
- Repeated backspacing
- Capitalization changes
- Hesitant language ("maybe?", "I think?")

Overwhelmed detection signals:
- Wall of text with no line breaks
- Rambling/stream of consciousness
- Multiple tangential thoughts
- Time-based (late night + long session)

Hyperfocus detection signals:
- Very rapid input/output
- Deep technical detail
- Sustained focus on one topic
- Ignore context about other obligations
```

**Impact:** AI responses are calibrated to actual user state, not assumed state. Reduces triggering.

---

### Decision: State Pills Display & Transparency
**Decision:** 
- State pills always visible in right sidebar (ambient awareness)
- Click any pill to see reasoning (why system thinks you're in this state)
- Transparency panel shows full detection breakdown with confidence scores
- User can hide any pill in Customize if triggers anxiety

**Why:**
- Transparency prevents sycophancy ("I'll just tell you what you want to hear")
- Knowing why AI is responding X way reduces confusion
- Optional hiding prevents state detection from becoming a stressor
- Ambient display prevents constant opening/closing of panels

**How It Works:**
```
Click Emotion pill:
┌──────────────────────┐
│ Why "Overwhelmed"?   │
│                      │
│ Signals detected:    │
│ • Wall of text       │
│   (confidence: 92%)  │
│ • Rambling pattern   │
│   (confidence: 87%)  │
│ • Late time (11pm)   │
│   (confidence: 71%)  │
│                      │
│ [Override to...]     │
└──────────────────────┘
```

**Impact:** User understands AI reasoning. Reduces "why did it do that?" frustration.

---

## 6. MODEL ROUTING & SELECTION

### Decision: Three-Model Routing Strategy
**Decision:** User can select model or enable auto-routing:

**Manual Selection:**
- Opus 4.8 (most capable, slowest ~5-10s)
- Opus Fast (balanced, ~2-4s)
- Haiku (fastest, good for quick feedback ~1s)

**Auto-Routing Logic:**
- Overwhelmed or Anxious state → Opus Fast (speed reduces anxiety)
- Analytical/Processing mode → Opus 4.8 (better reasoning)
- Stuck mode → Opus 4.8 (might need nuance to unstick)
- Excited/Hyperfocus → Haiku (keep momentum)
- High RSD + Anxious → Opus Fast (speed matters more than perfection)

**Why:**
- Speed is essential when user is anxious (waiting = rumination)
- Reasoning depth matters when user is analytical
- User override always available (sometimes wants depth despite state)
- Choice is transparent (user sees which model ran)

**How It Works:**
- Model selection in top menu or auto-routing enabled
- Each response shows "[Model: Opus 4.8]" footer
- User feedback ("That was too brief" / "That was too much") informs future auto-routing

**Impact:** Matches response depth to user's actual need. Faster responses when speed helps.

---

## 7. DIRECTNESS LEVELS & COMMUNICATION STYLE

### Decision: Three-Level Directness Scale
**Decision:**
- **Level 1: Gentle** — Validation-first, indirect feedback, soften challenges ("I noticed you might be...?")
- **Level 2: Balanced** — Default, honest but respectful, direct but not harsh
- **Level 3: Blunt** — Direct feedback, challenge assumptions, cut through hedging

**Why:**
- Gentle prevents overwhelm and RSD triggers when user is vulnerable
- Blunt prevents sycophancy and false agreeability when user needs honesty
- Balanced is safest default (works for most ADHD brains)
- User can change per-conversation or set default preference

**How It Works:**
- User selects in Customize or per-conversation menu
- System applies directness layer to all responses
- Technique selection can override (some techniques demand certain directness)
- Feedback helps system learn user's preferred directness for different states

**Impact:** User always gets communication style they need. Prevents both coddling and harshness.

---

## 8. TECHNIQUE SELECTION & APPLICATION

### Decision: 12 Available Communication Techniques
**Decision:**
1. **Auto-Detect** — System chooses based on state + history
2. **Socratic** — Questions to guide thinking ("What if...?")
3. **Quote-First** — Start with relevant quote or authority
4. **Chain-of-Thought** — Show step-by-step reasoning aloud
5. **Role-Prime** — Take on a specific perspective ("As your therapist...")
6. **Verify** — Ask confirmation questions before proceeding
7. **Examples** — Lead with concrete examples, abstract later
8. **Simplify** — Explain in simplest terms first, build complexity
9. **Detailed** — Comprehensive, all-angles response
10. **Step-by-Step** — Break into discrete actionable steps
11. **Comparative** — Compare options side-by-side
12. **Metaphor** — Use analogies to explain

**Why:**
- Different cognitive modes respond to different techniques
- Analytical mode → Chain-of-Thought or Comparative
- Stuck mode → Socratic or Examples
- Racing mode → Step-by-Step (structure the chaos)
- Processing mode → Detailed (need all info)
- Auto-detect learns which techniques work best for each user

**How It Works:**
- User can select technique or enable Auto-Detect
- System learns which techniques correlate with positive ratings
- Technique choice shown in response footer
- User feedback ("This helped" vs "This was confusing") trains auto-detect

**Impact:** Responses match how user's brain works, not just what user asked for.

---

## 9. LEARNING SYSTEM & ADAPTATION

### Decision: Learning Through User Feedback & Corrections
**Decision:** 
- System logs every response with user feedback (helpful/unhelpful/neutral)
- User can manually correct detected state (override stored in `stateCorrections`)
- Learning builds profile of user's:
  - Emotional baseline (what "calm" means for this user)
  - RSD triggers (what feedback/tone causes defensiveness)
  - Preferred techniques (which approaches help most)
  - Cognitive patterns (when does user get stuck?)
- Audit trail of last 500 learning events (searchable, deletable)

**Why:**
- Generic responses don't work for ADHD (everyone is different)
- Feedback is the only signal of what actually helps
- Corrections prevent system from learning wrong patterns
- Audit trail prevents creepy/black-box personalization
- User can see what system learned and correct it

**How It Works:**
```
Session 1:
- User: "I feel stuck"
- System detects: Stuck (confidence 85%)
- AI responds with Socratic technique
- User rating: ★★★★★ (helpful)
→ Logged: Stuck + Socratic = +1 point

Session 2:
- User: "I feel stuck"
- System detects: Stuck
- Last time Socratic worked well
- → Auto-selects Socratic again
- User rates it: ★★★ (okay, but)
→ Logged: Stuck + Socratic = +0.5 points

Session 3:
- User: "I feel stuck"
- System tries: Chain-of-Thought
- User rates: ★★★★★
→ Logged: Stuck + Chain-of-Thought = +1 point
→ Future stuck detection = prefer Chain-of-Thought
```

**Impact:** App gets better for each specific user over time. Privacy-respecting (all learning happens locally).

---

### Decision: Audit Trail & Transparency
**Decision:** User can view full learning audit log (last 500 events) anytime:
- Timestamp
- What system learned
- User feedback that triggered learning
- Confidence scores
- Ability to delete any entry

**Why:**
- Prevents system from learning "bad" patterns (e.g., "user gave up feedback" ≠ "feedback wasn't helpful")
- User can audit if they want to know why system behaves a certain way
- Delete option prevents locked-in bad learning
- Transparency reduces trust issues

**How It Works:**
- Customize → Learning → View Audit Log
- Search by date, keyword, or topic
- Click entry to see full context
- Delete button removes from learning (one-time)

**Impact:** User is never trapped by system's learned assumptions.

---

## 10. NAVIGATION & SCREEN GROUPING

### Decision: Screen Organization Logic
**Decision:** 
- Primary screens (Home, Messages, Archive, Templates): Always visible
- Tool screens (Customize, Settings, Sessions, Translate): Grouped under "Tools"
- Collection screens (Resources, Projects, Tasks, Integrations): Grouped under "Collections"
- Dashboard: Separate because it's analytics, not a workspace

**Why:**
- Reduces sidebar cognitive load
- Related screens grouped = faster mental model
- Primary work (messaging) always accessible
- Tools/settings don't clutter main navigation

**How It Works:**
```
Left Sidebar:

HOME
DASHBOARD

MESSAGES (Today/Yesterday/Earlier...)

COLLECTIONS ▼
├─ ARCHIVE
├─ RESOURCES
├─ PROJECTS
├─ TASKS
├─ INTEGRATIONS

TEMPLATES

TOOLS ▼
├─ CUSTOMIZE
├─ SETTINGS
├─ SESSIONS
├─ TRANSLATE

TRASH
```

**Impact:** Navigation feels organized, not overwhelming. Power users can collapse/expand as needed.

---

## 11. SESSION MANAGEMENT & PERSISTENCE

### Decision: Session Soft-Delete & Restore
**Decision:**
- Deleting a conversation moves it to Trash (not permanent)
- Trash shows last-accessed, size, conversation snippet
- Restore button brings it back to Messages
- Permanent delete after 30 days or manual purge
- Restore is always available until permanent delete

**Why:**
- ADHD brains often delete things accidentally while hyperfocused
- Permanent loss causes regret and anxiety
- 30-day window = time to decide without data bloat
- Clear distinction: archived (keep organized) vs. trash (review for deletion)

**How It Works:**
- Delete button → Trash (not Archive)
- Archive is intentional categorization
- Trash is safety net
- Hover shows delete date + permanent delete countdown

**Impact:** User never loses work by accident. Clear intent required for permanent deletion.

---

## 12. SAVED PROMPTS & TEMPLATES

### Decision: Save Prompts, Not Just Conversations
**Decision:**
- User can save any prompt they write as a template
- Templates stored separately from conversations
- Templates support variables: `{{name}}`, `{{topic}}`, `{{emotion}}`
- Template library searchable and taggable

**Why:**
- ADHD brains benefit from structure and reuse
- "I know I've solved this before" but can't remember → templates solve it
- Prompts are reusable assets
- Variables make templates flexible (same structure, different inputs)

**How It Works:**
```
User writes:
"I'm feeling {{emotion}}. Help me break down {{task}} 
into steps. Use {{technique}} technique."

Save as template → Tagged "task-breakdown"

Later, click template → Fill in:
emotion: "overwhelmed"
task: "write chapter 5"
technique: "step-by-step"

→ Generates personalized prompt
```

**Impact:** Reduces friction for repeated patterns. Saves time and mental energy.

---

## 13. ADVANCED FEATURES (FUTURE ROADMAP)

### Decision: Multi-AI Debate Mode (TBD, Future)
**Decision:** Allow conversation between multiple Claude versions/models about same topic.

**Why:** 
- Useful for complex decisions
- Seeing disagreement teaches critical thinking
- ADHD brains benefit from structured debate format

**Status:** Concept only, not yet implemented

---

### Decision: Synthesis Mode (TBD, Future)
**Decision:** Tool to combine multiple conversation threads into coherent summary/conclusion.

**Why:**
- ADHD brains often explore many angles in separate conversations
- Hard to see bigger picture without synthesis
- Useful for research, project planning, complex problems

**Status:** Concept only, not yet implemented

---

### Decision: Team Collaboration (TBD, Future)
**Decision:** Allow sharing conversations with team members, collaborative branching.

**Why:**
- Some ADHD users work in teams
- Useful for project management
- Could help normalize ADHD communication styles in workplaces

**Status:** Concept only, not yet implemented

---

### Decision: Voice Input (TBD, Future)
**Decision:** Voice-to-text input for users who struggle with typing during overwhelm.

**Why:**
- When overwhelmed, typing is harder
- Voice is faster for hyperfocus
- Accessibility improvement

**Status:** Concept only, not yet implemented

---

## END OF DECISIONS_LOG.md

**How to use this document:**
1. Search for decision you need: Ctrl+F
2. Read "Why" to understand rationale
3. Read "How It Works" for implementation detail
4. "Impact" explains why this decision matters to the app

**Consolidation note:**
When merging with other conversations:
- If different version of same decision exists, note the conflict
- Format conflicts as: "This session: [X], Session B: [Y], Session D: [Z]"
- Let user manually resolve by reviewing reasoning in each version

