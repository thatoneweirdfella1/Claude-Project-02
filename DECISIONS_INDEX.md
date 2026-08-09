# DECISIONS_INDEX.md
## Quick Reference & Navigation Guide

**Purpose:** Find any decision about Divergence.AI in 10 seconds.

---

## QUICK LOOKUP TABLE

| Topic | Decision | Location in DECISIONS_LOG |
|-------|----------|--------------------------|
| **What is it?** | Mission statement | 1. Core Concept & Purpose |
| **Core values** | 7 values (Transparency, Respect, etc.) | 1. Core Concept & Purpose |
| **Target user** | ADHD adults with RSD awareness | 1. Core Concept & Purpose |
| **React or Vue?** | React 18+ with TypeScript | 2. Architecture |
| **State management** | Zustand + localStorage + API batching | 2. Architecture |
| **Which Claude model?** | 3-tier: Opus 4.8, Opus Fast, Haiku | 2. Architecture |
| **What gets saved?** | 14 fields (plan, ratings, preferences, etc.) | 2. Architecture |
| **Layout** | 3-column (left sidebar, main, right sidebar) | 3. UI/UX Layout |
| **How many screens?** | 13 destination screens | 3. UI/UX Layout |
| **Colors** | Dark: #0d0f14 bg, #4a9eff accent | 4. Design System |
| **Font** | Inter, 1.55 line-height | 4. Design System |
| **Emotion detection** | 6 emotions (Calm, Anxious, Frustrated, etc.) | 5. State Detection |
| **RSD detection** | 3 levels (Low, Medium, High) | 5. State Detection |
| **Cognitive mode** | 5 modes (Analytical, Creative, Processing, Racing, Stuck) | 5. State Detection |
| **Directness levels** | 3 levels (Gentle, Balanced, Blunt) | 7. Directness Levels |
| **Communication techniques** | 12 techniques (Socratic, Chain-of-Thought, etc.) | 8. Techniques |
| **How does it learn?** | User feedback + manual corrections | 9. Learning System |
| **Soft-delete or permanent?** | Soft-delete to Trash (30-day window) | 11. Session Management |
| **Save templates?** | Yes, with variables support | 12. Templates |

---

## LOOKUP BY QUESTION

### "What is Divergence.AI?"
→ See: **1. Core Concept & Purpose**
- Mission Statement
- 7 Core Values
- Target User Profile

### "How does the UI work?"
→ See: **3. UI/UX Layout**
- 3-Column Grid Layout (sidebar, main, pills)
- Left Sidebar Navigation (13 screens)
- Top Bar and Right Sidebar

### "What colors/fonts/visuals?"
→ See: **4. Design System**
- Color Palette (dark/light themes)
- Marble Textures
- Typography & Spacing

### "How does state detection work?"
→ See: **5. State Detection System**
- 4-Layer Detection (Emotion, RSD, Interest, Cognitive Mode)
- State Pills Display & Transparency

### "Which AI model to use?"
→ See: **6. Model Routing**
- Three-Model Routing Strategy
- Auto-Routing Logic

### "How direct should responses be?"
→ See: **7. Directness Levels**
- Gentle vs. Balanced vs. Blunt
- When to use each

### "How does the AI communicate?"
→ See: **8. Techniques**
- 12 Available Techniques
- Auto-Detect vs. Manual Selection

### "How does learning work?"
→ See: **9. Learning System**
- Learning Through Feedback
- Audit Trail & Transparency

### "What data gets saved?"
→ See: **2. Architecture**
- Data Persistence & Fields (14 core fields)

### "What's the tech stack?"
→ See: **2. Architecture**
- Frontend Framework & Tooling
- State Management Strategy
- Backend Model Selection

### "How are sessions organized?"
→ See: **11. Session Management**
- Session Soft-Delete & Restore

### "Can users save templates?"
→ See: **12. Templates**
- Save Prompts & Templates

### "What features are planned?"
→ See: **13. Advanced Features**
- Multi-AI Debate Mode
- Synthesis Mode
- Team Collaboration
- Voice Input

---

## HOW TO CONSOLIDATE WITH OTHER CONVERSATIONS

### Scenario 1: Two Sessions Describe Directness Differently

**Session A says:** "3 levels: Gentle, Balanced, Blunt"  
**Session B says:** "4 levels: Very Gentle, Gentle, Balanced, Blunt"

**Resolution Process:**
1. Read DECISIONS_LOG.md → Section 7. Directness Levels
2. Understand the rationale for 3-level decision
3. Check if COMPLETE_VISION_DIVERGENCE_AI.md explains why 3 is better than 4
4. Compare reasoning: Does 4 levels add value or create UX complexity?
5. **Decide:** Keep 3, or change to 4?
6. **Update:** If changing, edit DECISIONS_LOG.md with new reasoning

**Format for conflict:**
```markdown
### CONFLICT DETECTED: Directness Levels

**Session A (This):** 3 levels (Gentle, Balanced, Blunt)
Reasoning: Simpler UX, covers 90% of use cases

**Session B (Other):** 4 levels (Very Gentle, Gentle, Balanced, Blunt)
Reasoning: More granularity for extreme RSD

**User Decision:** [To be filled in]
→ Keep 3-level: simplicity matters more than granularity
→ OR Change to 4-level: ADHD users need granularity

**Why:** [Explain the decision]
```

### Scenario 2: Same Decision, Different Wording

**Session A says:** "Detect 6 emotions"  
**Session D says:** "Detect emotional state including Calm, Anxious, Frustrated, Overwhelmed, Excited, Stuck"

**Resolution Process:**
1. These are the same decision (both say 6 emotions, same list)
2. No conflict, just different wording
3. Pick the clearest version for DECISIONS_LOG.md

### Scenario 3: Contradictory Implementation Details

**Session A says:** "Model selection in top menu"  
**Session F says:** "Model selection in right sidebar"

**Resolution Process:**
1. Read both rationales (Why was each location chosen?)
2. Check if both work, or if one creates UX problems
3. **Decide:** Top menu (always visible) or right sidebar (contextual)?
4. **Update:** TIER0_CODEBASE_AUDIT.md with actual implementation location

---

## CONSOLIDATION CHECKLIST

When merging this session with others, verify:

- [ ] **Mission:** All sessions agree on core purpose?
- [ ] **Values:** Same 7 values consistently mentioned?
- [ ] **Target User:** Consistent ADHD + RSD focus?
- [ ] **Tech Stack:** All sessions agree React + Zustand?
- [ ] **Layout:** All describe same 3-column structure?
- [ ] **State Detection:** All mention same 4 layers?
- [ ] **Models:** All mention Opus 4.8, Opus Fast, Haiku?
- [ ] **Directness:** All mention Gentle, Balanced, Blunt?
- [ ] **Techniques:** All list same 12 techniques?
- [ ] **Learning:** All describe feedback + audit trail?
- [ ] **Data Persistence:** All list same 14 fields?
- [ ] **Screens:** All describe same 13 destination screens?
- [ ] **Colors:** All mention same dark/light themes?
- [ ] **Future Features:** Do sessions agree on roadmap?

**If something doesn't match:**
→ Use format above to document conflict
→ Let user manually resolve
→ Update the winning version into DECISIONS_LOG.md

---

## MAINTENANCE RULES

**When adding new decisions to DECISIONS_LOG.md:**

1. **Don't add to this document.** This is index only, DECISIONS_LOG.md is source of truth.
2. **Follow the format:**
   - **Decision:** What was chosen
   - **Why:** Rationale
   - **How It Works:** Implementation
   - **Impact:** Why it matters
3. **Use clear section numbers** (1. Core Concept, 2. Architecture, etc.)
4. **Link from DECISIONS_INDEX.md** by adding a row to the Quick Lookup table
5. **If decision changes,** update DECISIONS_LOG.md and note the change date

**When consolidating:**
1. Compare versions side-by-side
2. Look for conflicts (different decisions) vs. duplication (same decision, different words)
3. Use DECISIONS_INDEX.md to find relevant sections
4. Document conflicts clearly (let user decide)
5. Update DECISIONS_LOG.md with consolidated version

---

## ANTI-PATTERNS THIS PREVENTS

**Anti-pattern 1: "I forgot we decided that"**
→ Solution: Quick lookup in this index

**Anti-pattern 2: "This session says X, but old session said Y"**
→ Solution: Conflict resolution format makes comparison easy

**Anti-pattern 3: "Which decision is correct?"**
→ Solution: DECISIONS_LOG.md shows reasoning, user can judge

**Anti-pattern 4: "The codebase doesn't match the spec"**
→ Solution: TIER0_CODEBASE_AUDIT.md catches mismatches

**Anti-pattern 5: "Learning system got stuck because it learned wrong"**
→ Solution: Audit trail in DECISIONS_LOG.md explains why

**Anti-pattern 6: "We're building the wrong thing"**
→ Solution: COMPLETE_VISION_DIVERGENCE_AI.md keeps focus on why

---

## THE 4-DOCUMENT SYSTEM

This index is part of a larger system:

1. **DECISIONS_LOG.md** (This session's version)
   - Source of truth for decisions
   - Fully detailed with reasoning
   
2. **DECISIONS_INDEX.md** (You are here)
   - Quick navigation
   - Consolidation process
   - Conflict resolution

3. **COMPLETE_VISION_DIVERGENCE_AI.md**
   - Full specification
   - User experience focus
   - Why each decision matters

4. **TIER0_CODEBASE_AUDIT.md**
   - Technical audit
   - What's actually implemented
   - Implementation roadmap

**How they work together:**
```
DECISIONS_LOG → "What did we decide?"
DECISIONS_INDEX → "Where do I find that?"
COMPLETE_VISION → "Why does that decision matter?"
TIER0_AUDIT → "Is it actually built that way?"
```

---

## END OF DECISIONS_INDEX.md

Use this document to navigate decision data. Use DECISIONS_LOG.md for details.

