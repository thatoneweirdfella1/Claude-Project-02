# DIVERGENCE.AI: MASTER DECISIONS LOG
## Single Source of Truth for All App Decisions

**Last Updated:** 2026-07-22  
**Purpose:** Track every decision made across all conversations, preventing duplicate work and lost choices.

---

## TABLE OF CONTENTS
1. [Core Concept & Purpose](#core-concept--purpose)
2. [Architecture Decisions](#architecture-decisions)
3. [UI/UX Layout Decisions](#uiux-layout-decisions)
4. [Design System Decisions](#design-system-decisions)
5. [Feature Set Decisions](#feature-set-decisions)
6. [State Detection Decisions](#state-detection-decisions)
7. [Model Routing Decisions](#model-routing-decisions)
8. [Directness Levels Decisions](#directness-levels-decisions)
9. [Technique Selection Decisions](#technique-selection-decisions)
10. [Learning System Decisions](#learning-system-decisions)
11. [Navigation & Screens Decisions](#navigation--screens-decisions)
12. [Data Persistence Decisions](#data-persistence-decisions)
13. [Advanced Features (Future)](#advanced-features-future)

---

## CORE CONCEPT & PURPOSE

### Mission
**Decision:** "An ADHD-friendly AI communication bridge that translates raw, unstructured thinking into optimized AI prompts, with emotional awareness and personalized response adaptation."

**Why:** People with ADHD need a tool that accepts their natural, tangential thinking without requiring reformatting for AI.

### Core Values (7 principles)
1. **Transparency** — Users see why every decision was made
2. **Respect** — Emotional states are acknowledged, never dismissed
3. **Accessibility** — Neurodivergent communication patterns are valid
4. **Control** — Users always override system recommendations
5. **Learning** — System learns preferences and adapts over time
6. **Safety** — No fake flattery, no "you're amazing" when you're struggling
7. **Anti-Sycophancy** — Actively refuses to use flattery when user is self-critical

### Target User
- ADHD individuals
- Rejection Sensitive Dysphoria (RSD) awareness required
- Need emotional acknowledgment alongside factual responses
- Value transparency in AI interactions

---

## ARCHITECTURE DECISIONS

### Frontend Framework & Tech Stack
**Decision:** Vanilla JavaScript + React + Zustand state management

**Components:**
- React TypeScript (src/components/)
- Zustand stores (src/stores/)
- Vite build tool
- Vitest + Playwright for testing

**Why:** Lightweight, unopinionated, easy to debug.

### Single File vs. Modular
**Decision:** Modular component architecture with React + TypeScript

**Structure:**
- `/src/components/` — React components organized by feature
- `/src/stores/` — Zustand stores for state management
- `/src/hooks/` — Custom React hooks
- `/public/` — Static assets (textures, logo)

**Why:** Scalability, code reuse, maintainability across multiple conversations.

### Storage Solution
**Decision:** Browser localStorage + Server-side API persistence

**Persisted Fields (14 total):**
1. plan (free/paid tier)
2. archivedPairs (Q&A history)
3. ratings (message ratings)
4. savedPrompts (user-saved prompts)
5. variables (account-level variables)
6. visibility (panel visibility toggles)
7. theme (light/dark)
8. layout (original/gold)
9. learnedPreferences (routing & technique weights)
10. stateCorrections (emotional state overrides)
11. sessions (conversation records)
12. trashed (soft-deleted sessions for restore)
13. templates (user-created templates)
14. learningAuditLog (audit trail of learning decisions)

**Why:** LocalStorage for instant feedback, API for backups and cross-device sync.

### API Integration
**Decision:** Anthropic Claude API (claude-opus-4.8, claude-opus-4.8-fast, claude-haiku-4.5)

**Models Available:**
- Opus 4.8 (most capable)
- Opus Fast (balanced speed/capability)
- Haiku (fast, lightweight)

**Why:** Claude is state-of-the-art for nuanced understanding of ADHD patterns and emotional context.

---

## UI/UX LAYOUT DECISIONS

### Layout Structure: Three-Column Grid
**Decision:** Left Sidebar (240px) | Main Content (flexible) | Right Sidebar (300px)

```
┌────────────────────────────────────────────────────────┐
│  TOP BAR (60px) — Logo, Search, Settings              │
├─────────────┬──────────────────────────┬───────────────┤
│             │                          │               │
│  LEFT       │    MAIN                  │  RIGHT        │
│  SIDEBAR    │    CONTENT               │  SIDEBAR      │
│  (240px)    │    (flexible)            │  (300px)      │
│             │                          │               │
│  - Nav      │  - Textarea              │  - State      │
│  - Recent   │  - Controls              │    Pills      │
│  - Profile  │  - Response              │  - Quick      │
│             │  - Export                │    Actions    │
│             │                          │  - Profile    │
│             │                          │    Card       │
└─────────────┴──────────────────────────┴───────────────┘
```

**Why:** ADHD minds benefit from spatial clarity. Left nav for discovery, right panel for real-time feedback, center for focus.

### Top Bar (60px)
**Components:**
- Logo/Branding (left)
- Search Popover (center)
- Settings Gear Menu (right) — theme toggle, layout picker, visibility controls

**Why:** Consistent header UX, quick access to global settings without losing context.

### Left Sidebar (240px)
**Sections:**
1. **Navigation Links** (12 destination screens):
   - Home
   - Dashboard
   - Messages
   - Archive
   - Resources
   - Projects
   - Integrations
   - Tasks
   - Templates
   - Customize
   - Settings
   - Sessions
   - Translate (main editor)

2. **Conversation List** (grouped by date):
   - Today
   - Yesterday
   - Earlier

3. **Quick Access**:
   - Trash (soft-deleted sessions)

**Why:** Hierarchical navigation prevents cognitive overload. Grouping by recency matches ADHD working memory patterns.

### Right Sidebar (300px)
**Cards/Panels:**
1. **State Pills** — Real-time emotion, RSD, interest, cognitive mode display
2. **Quick Actions** — Export, Archive, Clear conversation
3. **Profile Card** — Conversation count, emotion chart, learned preferences snapshot
4. **Optional Panels** (expandable):
   - Transparency Panel (what was detected, how it was processed)
   - Confidence Panel (certainty scores for state detection)
   - Route Panel (which model + why, directness level + why)

**Why:** Immediate visual feedback reduces anxiety. Users see the "why" without hunting.

---

## DESIGN SYSTEM DECISIONS

### Theme System
**Decision:** Light/Dark theme toggle, independent of layout

**How It Works:**
- `document.documentElement` has `data-theme` attribute
- CSS uses `:root[data-theme="dark"]` / `:root[data-theme="light"]` selectors
- Persisted as `accountStore.theme`
- Defaults to dark (ADHD-friendly, reduces eye strain)

**Color Palette (Dark Theme):**
- Background: #0d0f14 (near-black)
- Card: #161921 (dark slate)
- Border: #272b3a (subtle separation)
- Text: #e8eaed (light gray, high contrast)
- Accent: #4a9eff (cyan blue)
- Success: #2dd36f (green)
- Warning: #f5a623 (amber)
- Error: #ff5c5c (red)
- RSD indicator: #9b5cff (purple)

**Color Palette (Light Theme):**
- Background: #f5f5f5 (off-white)
- Card: #ffffff (white)
- Text: #1a1a1a (near-black)
- Accent: #2B4E9C (deeper blue, maintains visibility)
- Other colors same as dark theme

**Why:** Dark theme reduces visual overwhelm; high contrast aids focus.

### Layout System
**Decision:** Independent `layout` setting, orthogonal to `theme`

**Current Layouts:**
1. **"original"** (default)
   - Marble textures (Graphite, Slate, Mist, Pearl)
   - Cyan accent (#4a9eff)
   - Brain logo mark (cyan)
   - Matches CANON.md specification

2. **"gold"** (added as layout option)
   - Marble textures (gold-specific variants)
   - Gold accent (#e69628 dark, #a08246 light)
   - Brain logo mark (recolored to gold)
   - Based on operator mockups

**Why:** Layouts are design skins, not structural changes. Users can swap visual identity without changing functionality.

### Marble Material System
**Decision:** Four large, non-repeating marble texture samples at different positions

**Textures:**
1. **Graphite** (#0d0f14) — Sidebar backgrounds
2. **Slate** (#161921) — Card backgrounds
3. **Mist** (#1a1f2e) — Accent backgrounds
4. **Pearl** (#2B4E9C) — Primary button backgrounds

**Why:** Organic visual texture reduces cognitive load by breaking up flat interfaces. Premium feel without being distracting.

### Typography
**Font Family:** Inter (sans-serif, system fallback)
**Line Height:** 1.55 (breathing room for neurodivergent readers)

**Hierarchy:**
- H1: 28px, bold
- H2: 20px, bold
- H3: 16px, semibold
- Body: 14px, regular
- Small: 12px, regular

**Why:** High line-height reduces tracking effort; clean sans-serif improves readability for dyslexia-friendly design.

---

## FEATURE SET DECISIONS

### Navigation & Screen Destinations (13 total)
**Decision:** 12 destination screens + 1 main editor (Translate)

**Screens:**

1. **Home** — Landing page
   - Welcome section with CTA to Translate
   - Recent sessions grid (if any exist)
   - Quick tips (5 key points)
   - Features list

2. **Dashboard** — Metrics overview
   - Total sessions count
   - Trash count
   - Templates count
   - Feedback ratings count
   - Q/A pairs count
   - Breakdown of archived sessions
   - Analytics: message count, avg messages/session, top model, top technique

3. **Messages** — Global message search
   - 100 most recent messages across all sessions
   - Role filter (All, Your Messages, AI Messages)
   - Content search
   - Shows timestamp, session tag, sender role

4. **Archive** — Soft-archived sessions
   - Sessions marked `archived: true`
   - Shows creation date and archive date
   - Load/Delete buttons
   - Search and sort (Most Recently Archived, Most Recently Created, Oldest First, By Name)

5. **Resources** — Educational content
   - Getting Started guide
   - Features explanation
   - Tips for better prompts

6. **Projects** — Sessions grouped by project tags
   - Parse project name from session tags (before colon)
   - Show session count per project
   - List sessions under each project with creation date

7. **Integrations** — Future integrations showcase
   - Email (Coming Soon)
   - Slack (Coming Soon)
   - Google Docs (Coming Soon)
   - Notion (Coming Soon)
   - GitHub (Coming Soon)
   - Discord (Coming Soon)

8. **Tasks** — Action item extraction
   - Extract action items from assistant responses
   - Pattern matching for bullets and TODO/FIXME markers
   - 20 most recent unique tasks
   - Shows session source

9. **Templates** — Template management
   - View built-in templates (3 default)
   - View custom templates (user-created)
   - "Use Template" button to apply settings
   - Delete button for custom templates only
   - Template creation form (name, model, directness, techniques)
   - Search by title
   - Bulk operations: select multiple, bulk delete

10. **Customize** — Future feature placeholder
    - Explanation that this is for future feature-panel layout configuration

11. **Settings** — Account and app settings
    - Account section (plan, email)
    - Storage & Sync (sessions saved, trash count, total messages, export data)
    - Display section (theme/layout/visibility note)
    - About section (version, product description)
    - Data export as JSON with timestamp

12. **Sessions** — Conversation history management
    - List all saved sessions
    - Load/Delete buttons for each
    - Search by tag or session ID
    - Sort (Most Recent, Oldest First, By Name)
    - Show message count per session
    - Bulk operations: select multiple, bulk delete
    - Selection count bar with clear selection button

13. **Translate** — Main prompt editing interface (already existed)
    - Textarea for natural language input
    - Real-time state detection display
    - Controls for model, directness, technique selection
    - Submit button
    - Response message display
    - Export/Archive buttons

**Additional Screens:**
- **Trash** — Soft-deleted sessions
  - View deleted sessions
  - Restore or Permanently Delete buttons
  - Search and sort (Most Recent, Oldest First, By Name)

**Why:** Comprehensive but not overwhelming. Every screen serves a purpose without cognitive clutter.

### Session Soft-Delete with Restore
**Decision:** Move deleted sessions to `trashed` array instead of hard-delete

**How It Works:**
1. Delete button → `moveSessionToTrash()` → session moves to `trashed` array
2. User can visit Trash screen and `restoreSessionFromTrash()`
3. Or `deleteSessionFromTrash()` for permanent deletion
4. Sessions don't fully disappear until permanently deleted

**Why:** ADHD minds often delete things impulsively and regret it. Soft-delete + trash provides safety net without guilt.

### Search Feature (Global)
**Decision:** Searchable across sessions and templates

**How It Works:**
- Accessed via TopBar SearchPopover
- Searches session tags/titles and template titles
- Results capped at 3 each (prevents overwhelm)
- Click "Load Session" → restores full session state + switches to Translate
- Click "Load Template" → applies template settings to current session

**Why:** Fast discovery of past conversations and templates. Prevents "I know I asked this" frustration.

### Keyboard Shortcuts System
**Decision:** Global keyboard event listener with registered shortcuts

**Shortcuts:**
- Ctrl+T: Translate
- Ctrl+H: Home
- Ctrl+D: Dashboard
- Ctrl+S: Sessions
- Ctrl+L: Templates
- Ctrl+M: Messages
- Ctrl+K: Search
- ?: Open keyboard shortcuts help

**Why:** Power users benefit from keyboard access. Reduces mouse dependency (ADHD + motor control issues).

---

## STATE DETECTION DECISIONS

### 4-Layer Detection System
**Decision:** Simultaneous, independent detection of 4 dimensions

**Layer 1: Emotion Detection (6 states)**
- Calm
- Anxious
- Frustrated
- Overwhelmed
- Excited
- Stuck

**Layer 2: RSD Detection (Rejection Sensitivity Dysphoria)**
- Low (neutral or positive self-language)
- Medium (some self-critical language)
- High (strong self-criticism, shame indicators)

**Markers:**
- "I'm stupid/useless/broken"
- "I can't do anything right"
- "Everyone thinks I'm..."
- "I'm failing"
- "This is impossible"

**Layer 3: Interest Level (3 states)**
- Low (disengaged, reluctant)
- Medium (normal engagement)
- High (excited, passionate)

**Layer 4: Cognitive Mode (5 states)**
- Analytical (logical, systematic thinking)
- Creative (brainstorming, artistic mode)
- Processing (overwhelmed, struggling to organize thoughts)
- Racing (thoughts moving too fast, hyperfocus)
- Stuck (blocked, can't move forward)

**Why:** ADHD brains operate differently across these 4 dimensions. State detection must be multidimensional.

### Display of Detection
**Decision:** Real-time state pills in right sidebar, optional "See the Process" button

**Visual:**
- Color-coded pills (emotion, RSD, interest, mode)
- Updates as user types
- Shows detected state without overwhelming detail
- Optional detailed transparency panel

**Why:** Immediate feedback builds trust. Transparency without cognitive cost.

---

## MODEL ROUTING DECISIONS

### 3-Tier Model Selection
**Decision:** User can select or auto-route to appropriate Claude model

**Models:**
1. **Opus 4.8** (most capable, slowest)
   - Best for: Complex reasoning, nuanced understanding
   - Cost: Higher token usage
   - Speed: ~3-5 seconds

2. **Opus Fast** (balanced)
   - Best for: Normal conversations, good quality + speed
   - Cost: Medium
   - Speed: ~1-2 seconds
   - Default: Recommended as default for most users

3. **Haiku** (fast, lightweight)
   - Best for: Quick answers, simple tasks
   - Cost: Lower token usage
   - Speed: <1 second

**Auto-Routing Logic (future):**
- Overwhelmed state → Opus (need best understanding)
- Focused state → Haiku (quick iteration)
- Complex questions → Opus
- Simple follow-ups → Haiku

**Why:** ADHD minds benefit from speed sometimes, depth other times. User choice + smart defaults.

### User Override
**Decision:** Users can always select model manually, overriding auto-routing

**Implementation:**
- Model dropdown in controls section
- Options: "Auto", "Opus 4.8", "Opus Fast", "Haiku"
- Selection persists per session via `accountStore.learnedPreferences.routing`

**Why:** Control is essential. Users know their own needs better than system.

---

## DIRECTNESS LEVELS DECISIONS

### 3-Level Directness Scale
**Decision:** Tone/style control from Gentle to Blunt

**Level 1: Gentle**
- For: Overwhelm, anxiety, RSD high
- Style: Warm, encouraging, acknowledges emotion
- Example: "I hear that you're feeling overwhelmed. Let's break this into one manageable piece..."

**Level 2: Balanced** (default)
- For: Normal, neutral state
- Style: Friendly but direct
- Example: "Here are three approaches: 1) ... 2) ... 3) ..."

**Level 3: Blunt**
- For: Focused work, urgent tasks, user preference
- Style: Direct, no fluff, action-oriented
- Example: "Option A is best. Do X, then Y, then Z."

**Implementation:**
- Slider in controls section (1-5 scale, displayed as L1/L2/L3)
- System prompt includes directness instruction
- Persisted per session

**Why:** One-size-fits-all AI responses fail for ADHD. Same person needs different styles in different states.

---

## TECHNIQUE SELECTION DECISIONS

### 12 Available Techniques
**Decision:** User selects HOW Claude should approach the answer

**Techniques:**

1. **Auto-detect** (default)
   - System recommends best technique based on question type
   - User can override

2. **Socratic**
   - Claude asks clarifying questions instead of providing answers
   - Helps user think through problem
   - Best for: Learning, self-discovery

3. **Quote-First**
   - Starts with relevant quote or expert perspective
   - Then provides analysis
   - Best for: Motivation, perspective-shifting

4. **Chain-of-Thought**
   - Shows detailed reasoning step-by-step
   - Helps understand decision logic
   - Best for: Complex reasoning, debugging

5. **Role-Prime**
   - Claude adopts a specific role (mentor, critic, peer, expert)
   - Changes tone and perspective
   - Best for: Getting different viewpoints

6. **Verify**
   - Claude provides answer + checks it against criteria
   - Notes limitations and caveats
   - Best for: Accuracy-critical work

7. **Examples**
   - Leads with concrete examples
   - Then generalizes
   - Best for: Understanding concepts

8. **Simplify**
   - Explains in plainest possible language
   - Avoids jargon
   - Best for: Dense topics, overwhelm

9. **Detailed**
   - Comprehensive, thorough response
   - Explores nuance and edge cases
   - Best for: Research, deep dives

10. **Step-by-step**
    - Clear numbered steps
    - Action-oriented
    - Best for: Tutorials, procedures

11. **Comparative**
    - Compares different approaches, tools, perspectives
    - Pros/cons for each
    - Best for: Decision-making

12. **Metaphor**
    - Uses analogies and metaphors
    - Makes abstract concepts concrete
    - Best for: Understanding new domains

**Selection:**
- Dropdown in controls section
- Default: "Auto-detect"
- Persisted per session
- Influence learning system (tracks which techniques user prefers)

**Why:** Different techniques suit different mental states and question types. Flexibility = accessibility.

---

## LEARNING SYSTEM DECISIONS

### What the System Learns
**Decision:** Track 4 types of learning patterns

**1. Emotional Baseline**
- Historical emotion detection across sessions
- Identify user's typical baseline
- Detect deviations as useful context

**2. Preference Learning**
- Directness level preference (which level user picks most)
- Technique preferences (which techniques produce good results)
- Model preferences (which model produces satisfaction)
- Stored in `learnedPreferences: { routing: {}, technique: {} }`

**3. Trigger Learning**
- What causes overwhelm (word patterns, topic types)
- What causes excitement (subject matter, question types)
- Adjust future responses to avoid/encourage triggers

**4. RSD Pattern Learning**
- Which self-critical words appear most
- When RSD is likely to spike (specific contexts, times)
- Adjust anti-sycophancy response accordingly

### Learning Audit Trail
**Decision:** Keep audit log of all learning decisions

**Stored in `learningAuditLog` (max MAX_LEARNING_AUDIT_ENTRIES = 500 entries):**
- id: unique identifier
- timestamp: when decision was made
- proposalType: "technique-weight" | "routing-weight" | "emotion-baseline" | etc.
- target: which technique/model/dimension
- adjustment: "increase" | "decrease"
- previousWeight: prior value
- newWeight: new value
- confidence: 0-100 confidence score
- reasoning: human-readable explanation
- affectedRunCount: how many sessions this influences

**Why:** Transparency. User can see why system made choices. Can override if wrong.

### State Corrections
**Decision:** User can manually override state detection

**How It Works:**
1. System detects: "Emotion: Overwhelmed, RSD: High"
2. User sees pills and thinks: "Actually, I'm calm and focused"
3. User clicks correction interface
4. Records in `stateCorrections` array (max MAX_STATE_CORRECTIONS = 100)
5. Future detections learn from correction

**Stored:**
- dimension: "emotion" | "rsd" | "interest" | "mode"
- from: detected value
- to: corrected value
- timestamp: when correction was made

**Why:** State detection isn't perfect. Users know their own minds. This teaches the system.

### Confidence Scores
**Decision:** System provides confidence % on state detection

**Range:** 0-100%
- 90-100%: High confidence (strong signal)
- 70-89%: Medium confidence (reasonable signal)
- <70%: Low confidence (user should probably correct)

**Display:** Optional confidence panel in right sidebar

**Why:** Users should know when system is guessing vs. confident.

---

## NAVIGATION & SCREENS DECISIONS

### Screen Organization Logic
**Decision:** Group by use case, not feature

**Groupings:**
1. **Discovery** — Home (start here)
2. **Conversation Management** — Sessions, Trash, Archive (organize past)
3. **Analytics** — Dashboard, Projects, Tasks (understand patterns)
4. **Global Search** — Messages (find anything)
5. **Configuration** — Templates, Customize, Settings (personalize)
6. **Learning** — Resources (get help)
7. **Future** — Integrations (what's coming)
8. **Main Work** — Translate (conversation happens here)

**Why:** Users should find what they need intuitively. Screens match mental models, not implementation model.

### Sidebar Grouping
**Decision:** Organize session list by recency (Today/Yesterday/Earlier)

**Why:** ADHD minds work with recent-first priority. Less cognitive load to find "that thing I did yesterday."

### Quick Actions
**Decision:** Consistent action buttons (Load/Delete/Archive/Export) on all session-like items

**Location:** Right side of each item
**Consistency:** Same buttons in Sessions, Archive, Trash, Messages, etc.

**Why:** Predictable interaction patterns reduce cognitive load.

---

## DATA PERSISTENCE DECISIONS

### ACCOUNT_PERSISTED_KEYS (14 fields)
**Decision:** Save these 14 fields to localStorage + API (eventual sync)

```typescript
ACCOUNT_PERSISTED_KEYS = new Set([
  "plan",                    // free | paid
  "archivedPairs",          // Q&A history
  "ratings",                // message ratings
  "savedPrompts",           // user-saved prompts
  "variables",              // account variables
  "visibility",             // panel visibility toggles
  "theme",                  // light | dark
  "layout",                 // original | gold | ...
  "learnedPreferences",     // routing & technique weights
  "stateCorrections",       // manual state overrides
  "sessions",               // conversation records
  "trashed",                // soft-deleted sessions
  "templates",              // user-created templates
  "learningAuditLog",       // audit trail of learning
]);
```

**Why:** These 14 fields represent the complete user state. Losing any = losing user data/preferences.

### Autosave Strategy
**Decision:** Persist to localStorage on every state change; batch API calls

**Timing:**
- Immediate: localStorage (instant feedback)
- Batched (1-5 min): API (eventual consistency)
- Manual: Export button for immediate backup

**Why:** Local-first ensures resilience to network issues. ADHD users appreciate instant feedback.

### Session Records Structure
**Decision:** Each session is a complete record with all context

**SessionRecord fields:**
- id: unique identifier
- createdAt: timestamp
- archived: boolean
- model: selected model
- directness: selected directness (1-3)
- techniques: array of selected techniques
- context: conversation context items
- variables: session-specific variables
- conversation: array of messages
- learnedPreferences: state at time of session

**Why:** Complete record means full restoration + debugging + learning from past.

---

## ADVANCED FEATURES (Future)

### Multi-AI Debate Mode (TIER 4)
**Decision:** Planned for future — have multiple Claude models debate a question

**How It Would Work:**
1. User asks question
2. System routes to 3+ Claude models with slight perspective tweaks
3. Models provide answers
4. System displays each perspective
5. Synthesis view shows consensus

**Why:** Useful for decision-making when torn between options.

### Synthesis Mode (TIER 4)
**Decision:** Planned for future — synthesize multiple perspectives

**How It Would Work:**
1. Take multiple answers from debate mode
2. Create unified view with consensus
3. Highlight areas of disagreement
4. Provide confidence scores

### Team Collaboration (TIER 4)
**Decision:** Planned for future — share sessions/templates with team members

**How It Would Work:**
1. Invite team members to workspace
2. Share individual sessions or templates
3. Collaborate on conversations
4. Merge learnings across team

### Voice Input (TIER 4)
**Decision:** Planned for future — accept voice input for hands-free use

**Why:** ADHD folks often think better while talking. Hands-free reduces friction.

---

## SUMMARY OF ALL DECISIONS

### Completed Decisions (Implemented)
✅ Core mission and values  
✅ Architecture (React + Zustand)  
✅ Three-column layout  
✅ 13 navigation screens + 1 main editor  
✅ Dark/Light theme system  
✅ Layout picker (original/gold)  
✅ Marble texture design system  
✅ 4-layer state detection  
✅ 3-tier model routing  
✅ 3-level directness scale  
✅ 12 technique selection  
✅ Learning system with audit trail  
✅ Session soft-delete + trash  
✅ Global search  
✅ Keyboard shortcuts  
✅ Data persistence (14 fields)  
✅ Template management  
✅ Bulk operations  
✅ State corrections (manual override)  

### Partially Complete (In Progress)
⚠️ Advanced panels (Transparency, Confidence, Route) — data collected, UI minimal  
⚠️ Auto-routing logic — routing options available, auto not yet implemented  
⚠️ Learning display — audit log recorded, visualization minimal  

### Future Decisions (Planned but not yet started)
❌ Multi-AI debate mode  
❌ Synthesis mode  
❌ Team collaboration  
❌ Voice input  
❌ API/Cloud sync  
❌ Mobile app  

---

## HOW TO USE THIS LOG

### For Decision Disputes
If a decision comes up again: **Look here first.** Don't re-litigate. Accept the decision or explicitly ask the user to override it (in writing, so it's tracked).

### For Continuation Across Conversations
When starting a new session: **Read this log.** Adopt all decisions already made. Don't invent new choices for things already decided.

### For Adding New Decisions
When making a NEW decision:
1. Add it to this log immediately
2. Note the date and reasoning
3. Commit the update
4. Reference in commit message: "Decided: [what] because [why]"

### For Resolving Confusion
When multiple conversations say different things:
1. Check this log for the authoritative version
2. If the log and conversation disagree, the log is wrong — update it
3. This becomes the source of truth

---

**STATUS:** All decisions compiled. No duplicates. No lost choices.  
**NEXT:** Use this log as the foundation for all future work.
