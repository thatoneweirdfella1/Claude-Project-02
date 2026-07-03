# MASTER TASK LIST - All Work Remaining
## Organized by Category, Tier, & Sequence

---

## LEGEND

- ✅ = Can do without user input (do it now)
- ❓ = Needs simple YES/NO answer from user
- 🔧 = Code implementation (after Phase 12)
- 📋 = Documentation/specification

---

## CATEGORY 1: DESIGN FINALIZATION
**(No user input needed - all locked in as of B.12.3=YES)**

### Tier 1: Current (DO NOW)

- ✅ Update Task-40.0-checklist.md with B.12.3=YES answer
- ✅ Update Phase-11-FINAL-SPECIFICATION.md with B.12.3 confirmation
- ✅ Create "Granular Feedback Specification" detail doc
- ✅ Create "Dialogue Layout Visual Reference" (ascii mockup)
- ✅ Create consolidated "Implementation Order" doc
- ✅ Review all 4 new spec docs for completeness

### Tier 2: Complete (After Tier 1)

- ✅ Generate "Data Model & Schema" spec
- ✅ Generate "API Endpoints" specification
- ✅ Generate "Component Breakdown" (detailed UI sections)
- ✅ Generate "Testing Strategy" (extends Phase 8 test cases)

---

## CATEGORY 2: PHASE 12 PLANNING
**(No user input needed - just planning)**

### Tier 1: Current (DO NOW)

- ✅ Create "Phase 12 Implementation Checklist" (break design into dev tasks)
- ✅ Create "Developer Onboarding Guide" (how to use all specs)
- ✅ Create "Architecture Diagram" (text/ascii, shows all systems)
- ✅ Estimate time per subsystem
- ✅ Identify critical path (what to build first)

### Tier 2: Waiting for Tier 1 Complete

- ✅ Create "Backend Task List" (broken into ~2-5 hour chunks)
- ✅ Create "Frontend Task List" (broken into ~2-5 hour chunks)
- ✅ Create "Testing Task List"

---

## CATEGORY 3: IMPLEMENTATION (Phase 13+)
**(Code - AFTER Phase 12 complete)**

### Tier 1: Backend Core Systems (40-60 hours)

- 🔧 Implement account rotation system
  - [ ] Create ACCOUNT_REGISTRY.json structure
  - [ ] Implement token monitoring
  - [ ] Implement auto-swap logic
  - [ ] Implement context transfer prompt builder
  - [ ] Test account rotation flows (8 test cases)

- 🔧 Implement Multi-AI dialogue engine
  - [ ] Create DIALOGUE_MODES config (5 modes + optional user-defined)
  - [ ] Implement goal-to-mode recommendation engine
  - [ ] Implement auto-stop condition detectors (5 functions)
  - [ ] Implement dialogue loop controller
  - [ ] Test all 5 modes with button interactions (50 test cases)

- 🔧 Implement granular feedback system
  - [ ] Add thumbs-down on routing card (wrong model)
  - [ ] Add thumbs-down on techniques (bad selection)
  - [ ] Wire to learning system
  - [ ] Test intermediate feedback flows

- 🔧 Enhance existing stages
  - [ ] Stage 1: Re-translate with parameters
  - [ ] Stage 1: Compound question routing choice
  - [ ] Stage 2: Routing explanation detail
  - [ ] Stage 2: Boundary question choice (Haiku vs Opus-Fast)
  - [ ] Stage 3: Custom technique stacks
  - [ ] Stage 4: Fast preview (max_tokens=50)
  - [ ] Stage 5: Regenerate vs Reroute buttons

### Tier 2: Frontend Core UI (60-80 hours)

- 🔧 Dialogue interface
  - [ ] Chat-box vertical layout (top-to-bottom)
  - [ ] Account swap banner notification
  - [ ] Inline swap notation
  - [ ] Per-turn copy + regenerate buttons
  - [ ] Confidence score display (unobtrusive)

- 🔧 Goal picker + recommendation
  - [ ] Goal selection UI (5 options)
  - [ ] Nuance slider (Surface/Medium/Deep)
  - [ ] Position selector (For/Against/Undecided)
  - [ ] Recommendation display (primary + alternative)
  - [ ] "Show all options" expansion

- 🔧 Quiet Mode
  - [ ] Toggle button on answer card
  - [ ] Hide/show logic for all prompts
  - [ ] Settings panel for Quiet Mode
  - [ ] Persistent option

- 🔧 Progressive unlock system
  - [ ] Milestone tracking (0, 10, 25, 50, 100 questions)
  - [ ] Feature unlock modal ("🎉 New features unlocked!")
  - [ ] Settings tab visibility by milestone
  - [ ] Settings content visibility by milestone

- 🔧 ADHD Mode preset
  - [ ] High contrast toggle
  - [ ] Animation reduction
  - [ ] Plain language mode
  - [ ] Larger text option
  - [ ] Hide advanced buttons

- 🔧 Focus Mode
  - [ ] One-question-at-a-time layout
  - [ ] Hide history/settings by default
  - [ ] Show minimal UI

- 🔧 Export dialogue
  - [ ] Markdown export
  - [ ] Text export
  - [ ] Copy to clipboard

- 🔧 History improvements
  - [ ] Search by keyword
  - [ ] Filter by model/rating/date/question-type
  - [ ] Tag system
  - [ ] Patterns tab with auto-insights
  - [ ] Similar questions detection

- 🔧 Settings reorganization
  - [ ] Model preference setting
  - [ ] Transparency level setting
  - [ ] Feedback style setting
  - [ ] Technique limits setting
  - [ ] Account management section (M5+)

### Tier 3: Learning System Enhancement (10-15 hours)

- 🔧 Model performance tracking
  - [ ] Per-model ratings tracking
  - [ ] Question-type × model × rating analysis
  - [ ] Learned model preferences

- 🔧 Dialogue mode effectiveness
  - [ ] Track which goal → which mode was effective
  - [ ] Suggest modes based on history

- 🔧 Pattern surface (quarterly summary)
  - [ ] Generate quarterly pattern reports
  - [ ] Store in History → Patterns tab

### Tier 4: Post-MVP Features (v1.1+)

- 🔧 Dialogue branching (rewind/retry)
- 🔧 Take-over mode (user types responses)
- 🔧 Custom dialogue modes (M5+)
- 🔧 Template library (pre-filled questions)
- 🔧 Custom technique stacks saving (M4+)
- 🔧 Analytics dashboard (M5+)
- 🔧 Notion integration
- 🔧 Mobile app
- 🔧 Browser extension

---

## CATEGORY 4: TESTING (Phase 15)

### Tier 1: Core Testing (20-30 hours)

- 🔧 Multi-AI dialogue mode tests
  - [ ] Consensus mode: 10 test cases
  - [ ] Adversarial mode: 10 test cases
  - [ ] Socratic mode: 10 test cases
  - [ ] Devil's Advocate mode: 10 test cases
  - [ ] Synthesis mode: 10 test cases
  - **Total: 50 Multi-AI specific tests**

- 🔧 Account rotation tests
  - [ ] Token depletion + auto-swap
  - [ ] Context transfer coherence
  - [ ] Mixed provider swaps (Claude → GPT)
  - [ ] Token limit handling
  - **Total: 8 account rotation tests**

- 🔧 Progressive unlock tests
  - [ ] Feature visibility at M1 (Day 1)
  - [ ] Feature visibility at M2 (10 questions)
  - [ ] Feature visibility at M3 (25 questions)
  - [ ] Feature visibility at M4 (50 questions)
  - [ ] Feature visibility at M5 (100 questions)
  - [ ] Unlock notification display
  - **Total: 7 unlock tests**

- 🔧 Quiet Mode tests
  - [ ] Toggle ON/OFF
  - [ ] Prompts hide when ON
  - [ ] Prompts show when OFF
  - [ ] Persistence across sessions
  - [ ] Learning still works silently
  - **Total: 5 Quiet Mode tests**

- 🔧 Granular feedback tests
  - [ ] Thumbs-down on routing card
  - [ ] Thumbs-down on techniques
  - [ ] Feedback feeds learning system
  - **Total: 3 feedback tests**

- 🔧 Existing tests extended
  - [ ] Phase 8 tests (196 cases) still passing
  - [ ] New variants for boundary questions
  - [ ] New variants for compound question routing

### Tier 2: E2E Testing (all 5 stages)

- 🔧 Full flow tests
  - [ ] Translate → Route → Techniques → Answer (basic)
  - [ ] With Multi-AI dialogue (5 variants)
  - [ ] With account rotation (3 variants)
  - [ ] With ADHD Mode
  - [ ] With Quiet Mode
  - [ ] With Focus Mode
  - **Total: ~15 full E2E flows**

---

## WHAT TO DO NOW (NO USER INPUT NEEDED)

### Phase 12 Planning Documents (Do these IMMEDIATELY)

1. ✅ Update B.12.3 in all spec documents (YES to granular feedback)
2. ✅ Create "Granular Feedback Specification" detail
3. ✅ Create "Dialogue Layout Reference" (ascii mockup)
4. ✅ Create "Data Model & Schema" specification
5. ✅ Create "API Endpoints" specification
6. ✅ Create "Component Breakdown" (detailed UI per section)
7. ✅ Create "Phase 12 Checklist" (break into dev tasks)
8. ✅ Create "Developer Onboarding Guide"
9. ✅ Create "Architecture Diagram" (text-based)
10. ✅ Create "Critical Path Analysis" (what to build first)

**These 10 items are pure planning/documentation. No user input needed. No blocking dependencies.**

---

## WHAT NEEDS SIMPLE ANSWERS (1-2 WORDS)

Once Phase 12 planning complete, will need:

- ❓ Approval to proceed with implementation timeline estimates
- ❓ Confirmation of critical path priority

---

## TIMELINE (Estimates)

**Now - Next 1 hour:** Phase 12 planning documents (10 items above)

**After planning complete:** Ready to start Phase 13 (code)
- Backend: 40-60 hours
- Frontend: 60-80 hours
- Learning: 10-15 hours
- Testing: 20-30 hours
- **Total estimate: 130-185 hours (~4-5 weeks full-time)**

---

## STATUS

✅ Design: COMPLETE (all phases 1-11 locked)
✅ Specs: COMPLETE (4 major docs + clarifications)
⏳ Phase 12 Planning: STARTING NOW (10 tasks)
⏸️ Phase 13 Implementation: WAITING (after Phase 12 complete)

---

**Next action: Work through Phase 12 Planning (10 docs above) with no further user input needed.**
