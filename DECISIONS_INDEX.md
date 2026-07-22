# DIVERGENCE.AI: CONSOLIDATED DECISIONS INDEX
## Where to Find Every Decision You Ever Made

**Three Master Documents:**
1. **DECISIONS_LOG.md** ← START HERE for all decisions
2. **COMPLETE_VISION_DIVERGENCE_AI.md** ← Vision & specifications
3. **TIER0_CODEBASE_AUDIT.md** ← What currently exists

---

## Quick Decision Lookup

### "What did I decide about X?"

| Topic | File | Section |
|-------|------|---------|
| **Core Concept** | DECISIONS_LOG.md | Core Concept & Purpose |
| **Architecture** | DECISIONS_LOG.md | Architecture Decisions |
| **Layout (3-column)** | DECISIONS_LOG.md | UI/UX Layout Decisions |
| **Colors & Themes** | DECISIONS_LOG.md | Design System Decisions |
| **Visual Design (marble)** | DECISIONS_LOG.md | Marble Material System |
| **State Detection (4-layer)** | DECISIONS_LOG.md | State Detection Decisions |
| **Emotions** | DECISIONS_LOG.md | Layer 1: Emotion Detection |
| **RSD (Rejection Sensitivity)** | DECISIONS_LOG.md | Layer 2: RSD Detection |
| **Models (Opus/Fast/Haiku)** | DECISIONS_LOG.md | Model Routing Decisions |
| **Directness (1-3)** | DECISIONS_LOG.md | Directness Levels Decisions |
| **Techniques (12 types)** | DECISIONS_LOG.md | Technique Selection Decisions |
| **Learning System** | DECISIONS_LOG.md | Learning System Decisions |
| **Navigation Screens** | DECISIONS_LOG.md | Navigation & Screens Decisions |
| **Data Persistence** | DECISIONS_LOG.md | Data Persistence Decisions |
| **What currently works** | TIER0_CODEBASE_AUDIT.md | Feature Completeness Matrix |
| **Full feature list** | COMPLETE_VISION_DIVERGENCE_AI.md | Five Core Features |

---

## The Three-Document System

### 1. DECISIONS_LOG.md — The Master Record
**Contains:** Every decision you ever made  
**Organized by:** Decision category (not chronological)  
**Use when:** Settling a debate, preventing re-work, starting new sessions  
**What it answers:**
- "What did I decide about X?"
- "Why did I choose that?"
- "Is this already decided?"

### 2. COMPLETE_VISION_DIVERGENCE_AI.md — The Specification
**Contains:** What the app should be (complete vision)  
**Organized by:** Feature and user experience  
**Use when:** Designing new features, understanding "why" behind decisions  
**What it answers:**
- "What is Divergence.AI supposed to do?"
- "What are the 5 core features?"
- "What does the user experience look like?"
- "What's not built yet?"

### 3. TIER0_CODEBASE_AUDIT.md — The Current State
**Contains:** What actually exists right now (technical audit)  
**Organized by:** Implementation status (✅/⚠️/❌)  
**Use when:** Starting implementation, finding dead code, understanding effort  
**What it answers:**
- "What's already built?"
- "What's half-built?"
- "What's a stub?"
- "How much work is X?"

---

## How to Use This System

### Scenario 1: You Don't Remember a Decision
1. **Start:** Open DECISIONS_LOG.md
2. **Search:** Find the category (e.g., "Directness Levels")
3. **Read:** Get the decision, why it was made, what you chose
4. **Done:** You have your answer

### Scenario 2: You're Repeating Work
1. **Notice:** "Wait, I think I already did this..."
2. **Check:** DECISIONS_LOG.md for the decision
3. **If found:** Reference the decision, don't re-do it
4. **If not found:** Add it to DECISIONS_LOG.md immediately after deciding

### Scenario 3: Starting a New Session
1. **First:** Read DECISIONS_LOG.md (all decisions)
2. **Second:** Skim COMPLETE_VISION_DIVERGENCE_AI.md (goals)
3. **Third:** Check TIER0_CODEBASE_AUDIT.md (what's done)
4. **Then:** Start work knowing full context

### Scenario 4: Multiple Conversations Say Different Things
1. **Check:** DECISIONS_LOG.md for authoritative version
2. **If conflict:** Update DECISIONS_LOG.md to be correct
3. **Commit:** Update with note "Resolved conflict: X was Y, corrected to Z"
4. **Reference:** Point to this decision in future work

---

## Decision Categories in DECISIONS_LOG.md

Each major section has subsections explaining:
- **Decision:** What you chose
- **Why:** Reasoning behind it
- **How It Works:** Implementation details
- **Why This Matters:** Impact on the app

**Categories:**
1. Core Concept & Purpose (mission, values, target user)
2. Architecture (tech stack, structure, storage)
3. UI/UX Layout (three-column, sidebars, navigation)
4. Design System (colors, marble textures, typography)
5. Features (13 screens, soft-delete, search, etc.)
6. State Detection (4-layer system: emotion, RSD, interest, mode)
7. Model Routing (3 models, auto-routing, user override)
8. Directness Levels (3 levels: gentle, balanced, blunt)
9. Techniques (12 techniques: socratic, chain-of-thought, etc.)
10. Learning System (what it learns, audit trail, corrections)
11. Navigation (screen organization, grouping logic)
12. Data Persistence (14 fields saved, autosave strategy)
13. Advanced Features (future: debate mode, synthesis, etc.)

---

## Anti-Patterns This System Prevents

### ❌ **Before This System**
- Restarted conversations, re-made same decisions
- Forgot why you chose something, changed it
- Multiple conversations said different things
- Lost decisions from earlier conversations
- Spent hours re-inventing color scheme
- "Wait, did I decide to use Opus or Haiku?"

### ✅ **With This System**
- One source of truth (DECISIONS_LOG.md)
- All decisions documented with reasoning
- Conflicts resolved by checking the log
- No duplicate work
- Decisions made once, referenced forever
- New sessions start informed

---

## Maintenance Rules

### When You Make a NEW Decision
1. **Immediately:** Add it to DECISIONS_LOG.md in the appropriate section
2. **Include:** The decision, reasoning, and impact
3. **Commit:** Reference the decision in commit message
4. **Example:** "Decided to use gold layout as alternative to original"

### When a Decision Gets Questioned
1. **Check:** DECISIONS_LOG.md for the original reasoning
2. **If still valid:** Reference the log, don't re-debate
3. **If wrong:** Update the log with the new decision and reasoning
4. **Commit:** "Updated decision: X was wrong, now is Y because Z"

### When Starting a Session
1. **Read:** DECISIONS_LOG.md from top to bottom
2. **Skim:** Focus on sections relevant to today's work
3. **Internalize:** These decisions apply to all work going forward
4. **Reference:** When confused, check the log

---

## Files at a Glance

```
DECISIONS_LOG.md (28 KB)
├── Core Concept & Purpose
├── Architecture (React, Zustand, localStorage)
├── UI/UX (3-column layout, 13 screens)
├── Design System (colors, marble, typography)
├── Features (soft-delete, search, keyboard shortcuts)
├── State Detection (4-layer system)
├── Model Routing (Opus/Fast/Haiku)
├── Directness (Gentle/Balanced/Blunt)
├── Techniques (12 types)
├── Learning System (audit trail, corrections)
├── Navigation (13 screens + Translate)
├── Data Persistence (14 fields, autosave)
└── Advanced Features (future work)

COMPLETE_VISION_DIVERGENCE_AI.md (15 KB)
├── What is Divergence.AI?
├── Core Purpose (mission, values, capabilities)
├── Five Core Features (Translation, State, Routing, Techniques, Learning)
├── User Experience Flow
├── Information Architecture
├── Visual Design System
├── Technical Implementation
├── Feature Completeness Matrix
├── What Exists Today
├── What Needs Building
└── Tier-by-Tier Roadmap

TIER0_CODEBASE_AUDIT.md (15 KB)
├── File Inventory
├── Component Map
├── Feature Implementation Status
├── Technical Debt Analysis
├── Effort Estimates
└── Dependency Graph
```

---

## Status: COMPLETE

**All decisions consolidated.** No more duplicate work. No more lost context. This system prevents the scattered-conversation problem permanently.

**How to proceed:**
1. Read DECISIONS_LOG.md once fully
2. Check it before making any decision
3. Update it immediately when new decisions are made
4. Reference it in every commit message
5. Next session starts from here, informed and clear

