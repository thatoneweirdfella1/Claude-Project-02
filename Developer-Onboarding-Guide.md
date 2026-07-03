# Developer Onboarding Guide
## How to Use Phase 11 Specifications for Phase 13 Implementation

**Status: COMPLETE FOR PHASE 12 PLANNING**

---

## OVERVIEW

This guide helps developers understand and navigate the Phase 11 specification documents to begin Phase 13 implementation. It explains:
- What each spec document contains
- How they relate to each other
- Where to find answers to specific questions
- How to approach the implementation

---

## PART 1: SPECIFICATION DOCUMENTS ROADMAP

### Core Specification Documents (Read These First)

#### 1. Phase-11-FINAL-SPECIFICATION.md (Priority: CRITICAL)
**What it is:** The complete Phase 11 design specification covering all features and system behaviors.

**Contains:**
- 5 core dialogue goals
- 5 dialogue modes with system prompts
- Account rotation + token management
- Universal button system
- Auto-stop conditions per mode
- Full app refinement (Stage 1-5)
- Quiet Mode + Focus Mode + ADHD Mode
- Progressive feature unlock (5 milestones)
- All locked decisions

**How to use it:**
- Start here for overall system understanding
- Reference when implementing any major feature
- Use as the "source of truth" for design decisions
- Check Part 6 for B.12.3 confirmation (Granular Feedback = YES)

**Key sections to bookmark:**
- Part 1.2: Dialogue Display (chat-box vertical layout)
- Part 1.4: Universal Button System (context-aware labels)
- Part 1.5: Auto-Stop Conditions (5 detection algorithms)
- Part 2.11: Progressive Unlock (5 milestone definitions)
- Part 2.9: ADHD-Specific Design (design patterns)
- Part 3.1: Quiet Mode (complete spec)

---

#### 2. Data-Model-Schema.md (Priority: CRITICAL)
**What it is:** Complete SQLite database schema for Phase 11+ features.

**Contains:**
- 10 new table definitions (CREATE TABLE statements)
- All field specifications
- Foreign key relationships
- Indexes for performance
- JSON structures for complex data (dialogue_content, conversation_snapshot)
- Migration path from Phase 1-10 schema

**How to use it:**
- Reference when creating database schema
- Use CREATE TABLE statements directly in migrations
- Check JSON structures when storing dialogue/checkpoint data
- Review indexes before deploying to production

**Key sections:**
- Table Schemas: All 10 table CREATE statements
- Indexes: Performance optimization queries
- JSON Structures: Exactly how complex data should be shaped

---

#### 3. API-Endpoints-Specification.md (Priority: HIGH)
**What it is:** Complete REST API specification for all endpoints.

**Contains:**
- 12 endpoint categories (Auth, Questions, Techniques, Dialogues, etc.)
- Request/response formats (JSON)
- Status codes and error handling
- Rate limiting specs
- Pagination specs
- Webhook events (optional)

**How to use it:**
- Reference when building backend API routes
- Use exact request/response formats
- Implement error handling per spec
- Set up rate limiting per section 14
- Code review: Verify implemented endpoint matches spec

**Key sections:**
- Section 5: Dialogue Endpoints (POST /dialogues, turn handling)
- Section 6: Feedback Endpoints (routing/technique thumbs-down)
- Section 8: Account & Token Endpoints (account rotation)
- Section 13: Error Handling (standard formats)

---

#### 4. Component-Breakdown.md (Priority: HIGH)
**What it is:** Detailed UI component breakdown with visual structure.

**Contains:**
- Visual ASCII mockups for each component
- Component purpose and placement
- States (default, active, disabled, loading, error)
- Interactions and responsive behavior
- Accessibility requirements
- Responsive breakpoints
- Dark mode support
- Animation specs

**How to use it:**
- Reference when building frontend components
- Use ASCII mockups for layout reference
- Check states section when implementing state management
- Review accessibility requirements for WCAG compliance
- Verify responsive behavior at each breakpoint

**Key sections:**
- Section 7.2: Dialogue Container (full dialogue layout)
- Section 7.4: Dialogue Action Buttons (context-aware meanings)
- Section 9: Settings & Preferences (all settings UI)
- Section 11: Global Components (navigation, modals, notifications)
- Section 13: Accessibility (WCAG requirements)

---

#### 5. Dialogue-Layout-Reference.md (Priority: HIGH)
**What it is:** Complete ASCII mockup showing multi-AI dialogue flow with visual examples.

**Contains:**
- 2-round example dialogue (Model A & B alternating)
- Account swap notifications (banner + inline)
- Button placements and functions
- Quality score display
- Feedback form after completion
- Visual hierarchy and spacing

**How to use it:**
- Reference for dialogue UI layout
- Use as CSS grid/flexbox guide
- Check spacing and alignment
- Verify account swap notifications match mockup

**Key sections:**
- ASCII MOCKUP section: Full working example
- KEY VISUAL ELEMENTS: Design principles
- SWAP NOTIFICATION EXAMPLES: Exact notification formats

---

#### 6. Granular-Feedback-Specification.md (Priority: HIGH)
**What it is:** Complete specification for B.12.3 answer (Granular Feedback = YES).

**Contains:**
- Routing feedback: thumbs-down on model choice
- Technique feedback: thumbs-down on technique selection
- Data flow: How feedback is logged and used
- Learning integration: Pattern detection threshold (10+ data points)
- UI placement: Where buttons appear
- Examples: Real-world feedback scenarios

**How to use it:**
- Reference when implementing thumbs-down buttons
- Use data structures shown for logging
- Implement learning integration per "Learning System Uses This"
- Test scenarios from examples section

**Key sections:**
- Feature 1: Routing Feedback (model selection feedback)
- Feature 2: Technique Feedback (technique selection feedback)
- Learning System Uses This: How feedback drives pattern detection
- Examples: Test cases for feedback collection

---

#### 7. Progressive-Unlock-Matrix.md (Priority: MEDIUM)
**What it is:** Feature unlock roadmap by usage milestone.

**Contains:**
- 5 milestones (M1: Day 1, M2: 10 questions, M3: 25, M4: 50, M5: 100)
- Features unlocked at each milestone
- Descriptions of each feature
- Why progressive unlock prevents overwhelm
- Testing requirements for each milestone

**How to use it:**
- Reference when implementing feature visibility
- Build Settings tab visibility per milestone
- Test feature appearance at correct thresholds
- Use as acceptance criteria for unlock tests

**Key sections:**
- Full milestone matrix: All features per level
- Rationale: Why this progression makes sense

---

#### 8. Quiet-Mode-Specification.md (Priority: MEDIUM)
**What it is:** Complete specification for Quiet Mode feature.

**Contains:**
- Feature description and purpose
- When/how to enable
- What gets hidden (complete list)
- Settings integration
- Persistence requirements
- Testing scenarios
- Interaction with other features

**How to use it:**
- Reference when implementing Quiet Mode
- Use complete list to verify all elements toggled
- Check testing scenarios for edge cases
- Verify persistence across sessions

---

#### 9. Phase-12-Implementation-Checklist.md (Priority: HIGH)
**What it is:** Detailed breakdown of Phase 11 design into implementable dev tasks.

**Contains:**
- 4 categories: Backend, Frontend, Learning, Testing
- ~70 specific 2-5 hour tasks
- Acceptance criteria for each task
- Dependencies and testing requirements
- Time estimates per task
- Relevant spec references

**How to use it:**
- Pick task from checklist
- Read acceptance criteria
- Check dependencies (what to build first)
- Reference noted spec documents
- Build test cases per testing requirements
- Mark complete when done

**Key sections:**
- Category 1: Backend (50 hours) - Start with 1.1 Account Rotation
- Category 2: Frontend (70 hours) - Parallel to backend where independent
- Category 3: Learning (12 hours) - After feedback collection working
- Category 4: Testing (25 hours) - After features implemented

---

### Supporting Documents (Reference as Needed)

#### PHASE-11-12-ROADMAP.md
**Use when:** You need timeline context or want to understand Phase 12 vs Phase 13 scope

#### MASTER-TASK-LIST.md
**Use when:** You want to see all work categories at a glance

---

## PART 2: IMPLEMENTATION FLOW & DEPENDENCIES

### Critical Path (Must Do First)

```
1. Database Schema (Task 1.5)
   ↓
2. Account System (Task 1.1)
   ↓
3. Dialogue Engine (Task 1.2)
   ↓
4. Feedback Collection (Task 1.3)
   ↓
5. Dialogue UI (Task 2.1)
   ↓
6. Everything else (can parallelize)
```

### Recommended Build Order

**Week 1-2: Backend Foundation**
1. Set up database (Task 1.5.1 & 1.5.2)
2. Build account rotation system (Task 1.1)
3. Start dialogue engine (Task 1.2)

**Week 2-3: API & Feedback**
4. Complete dialogue engine
5. Build feedback collection (Task 1.3)
6. Complete API endpoints

**Week 3-4: Frontend - Dialogue**
7. Dialogue container UI (Task 2.1.1)
8. Account swap notifications (Task 2.1.2)
9. Goal picker & recommendations (Task 2.2)

**Week 4-5: Frontend - Features**
10. Quiet Mode (Task 2.3)
11. Progressive unlock (Task 2.4)
12. ADHD Mode (Task 2.5)

**Week 5-6: Frontend - Everything Else**
13. Focus Mode (Task 2.6)
14. Export functionality (Task 2.7)
15. History improvements (Task 2.8)
16. Settings reorganization (Task 2.9)

**Week 6-7: Learning & Testing**
17. Learning system (Category 3)
18. Comprehensive testing (Category 4)

---

## PART 3: ANSWERING COMMON DEVELOPER QUESTIONS

### "Where do I find the dialogue mode system prompts?"
→ Phase-11-FINAL-SPECIFICATION.md, Part 1.1 + 1.2
→ Each mode has specific language patterns (Consensus, Adversarial, Socratic, Devil's Advocate, Synthesis)

### "What exactly should the account swap notification say?"
→ Dialogue-Layout-Reference.md, "SWAP NOTIFICATION EXAMPLES" section
→ Use exact wording: "🔄 Claude A tokens depleted. Claude B continuing."

### "How do I know when a dialogue should auto-stop?"
→ Phase-11-FINAL-SPECIFICATION.md, Section 1.5 "Auto-Stop Conditions"
→ Each mode has different detection algorithm (keywords, round count, etc.)

### "What data do I store when user clicks thumbs-down?"
→ Granular-Feedback-Specification.md, "DATA LOGGED" sections
→ Use JSON structures shown; link to question_id for correlation

### "When should feature X unlock?"
→ Progressive-Unlock-Matrix.md
→ Find feature name, see which milestone (M1-M5) it unlocks at

### "What's the API request/response format for endpoint Y?"
→ API-Endpoints-Specification.md
→ Use exact JSON structures shown; verify status codes and error formats

### "How should this UI component behave?"
→ Component-Breakdown.md
→ Find component name, check all states and interactions

### "What color scheme should I use?"
→ MARBLE-MATERIAL-SYSTEM.md (from earlier phases, still applies)
→ Component-Breakdown.md also has color guidance

### "Does Quiet Mode hide or show this feature?"
→ Quiet-Mode-Specification.md, "What it hides" section
→ Verify against complete list

### "Should this button be visible at M2 or M3?"
→ Progressive-Unlock-Matrix.md
→ Find feature, check unlock milestone

---

## PART 4: SPEC DOCUMENT CROSS-REFERENCES

### When Building [X], Reference [Y]

| Feature | Primary Spec | Secondary Specs |
|---------|--------------|-----------------|
| Account Rotation | API-Endpoints.md (Section 7) | Phase-11-FINAL (Section 1.3) |
| Dialogue Modes | Phase-11-FINAL (Part 1.1-1.5) | Dialogue-Layout-Reference.md |
| Dialogue UI | Component-Breakdown.md (Sec 7) | Dialogue-Layout-Reference.md |
| Thumbs-Down Buttons | Granular-Feedback-Spec.md | Component-Breakdown.md (Sec 3) |
| Quiet Mode | Quiet-Mode-Spec.md | Phase-11-FINAL (Part 3.1) |
| Progression | Progressive-Unlock-Matrix.md | Component-Breakdown.md (Sec 9.3) |
| ADHD Mode | Phase-11-FINAL (Part 2.9) | Component-Breakdown.md (Sec 2.9) |
| Settings | Component-Breakdown.md (Sec 9) | Phase-11-FINAL (Part 2.7) |
| Feedback Form | Component-Breakdown.md (Sec 6.3) | Phase-11-FINAL (Part 1.7) |
| History | Component-Breakdown.md (Sec 8) | API-Endpoints.md (Sec 8) |
| Export | Component-Breakdown.md (Sec 2.7) | API-Endpoints.md (Sec 8.5) |
| Database | Data-Model-Schema.md | Phase-11-FINAL (Part 1.3) |
| API Design | API-Endpoints-Spec.md | Phase-12-Checklist.md (1.1-1.4) |

---

## PART 5: TESTING YOUR IMPLEMENTATION

### Using Phase-12-Implementation-Checklist.md

Each task includes "Testing:" section. Follow this process:

1. **Read acceptance criteria** - Know what "done" looks like
2. **Implement the feature**
3. **Check testing requirements** - Run all listed test cases
4. **Verify against spec** - Compare output to specification
5. **Mark task complete** - When all tests pass

### Example: Implementing Dialogue Button System

**Task:** Phase-12-Checklist.md, Task 1.2.3 (Dialogue Loop Controller)

**Test Requirements from checklist:**
- [ ] Dialogue creation and initiation
- [ ] Turn progression (5 rounds tested)
- [ ] Button actions per mode (5 modes × 4 buttons = 20 test cases)
- [ ] Pause/resume state preservation

**Verification steps:**
1. Reference Component-Breakdown.md Section 7.4 for button meanings
2. Reference Phase-11-FINAL Section 1.4 for universal button spec
3. Create test cases for each mode × button combination
4. Verify dialogue state transitions
5. Test pause/resume functionality

---

## PART 6: KEY DECISIONS TO UNDERSTAND BEFORE CODING

### Decision 1: Dialogue Layout (NOT Side-by-Side)
**Decision:** Chat-box vertical (top-to-bottom) layout, like texting
**Why:** Easier to follow conversation flow, more natural
**Reference:** Dialogue-Layout-Reference.md, Phase-11-FINAL Section 1.2
**Impact:** Affects entire dialogue UI structure

### Decision 2: Universal Button System (Context-Aware)
**Decision:** Same 2 buttons (✅ Accept, 🔄 Continue) shift meaning by mode
**Why:** Minimizes confusion, reduces button clutter
**Reference:** Phase-11-FINAL Section 1.4, Component-Breakdown.md Section 7.4
**Impact:** Button handling logic must check current mode

### Decision 3: Granular Feedback (YES)
**Decision:** Collect thumbs-down on routing AND techniques
**Why:** Faster pattern detection, clearer learning signals
**Reference:** Granular-Feedback-Specification.md
**Impact:** Two separate feedback collection points, not just final rating

### Decision 4: Progressive Unlock (5 Milestones)
**Decision:** Features unlock at 0, 10, 25, 50, 100 questions
**Why:** Prevents Day-1 overwhelm, system teaches itself
**Reference:** Progressive-Unlock-Matrix.md
**Impact:** Feature visibility must be locked by milestone

### Decision 5: Account Auto-Swap (Transparent)
**Decision:** When account tokens deplete, auto-rotate to next account
**Why:** Seamless user experience, no failed API calls
**Reference:** Phase-11-FINAL Section 1.3, API-Endpoints Section 7
**Impact:** Account rotation logic must be automatic but visible

### Decision 6: Dialogue Auto-Stop (Per Mode)
**Decision:** Each mode has different stop condition (keywords, rounds)
**Why:** Knows when goal is achieved without user clicking "stop"
**Reference:** Phase-11-FINAL Section 1.5, Granular-Feedback-Spec examples
**Impact:** Stop detector logic must be mode-specific

---

## PART 7: PERFORMANCE & SCALE CONSIDERATIONS

### Database Optimization
- Indexes: See Data-Model-Schema.md "INDEXES" section
- Query: Dialogue_turns queries will be frequent (add indexed on dialogue_id)
- Storage: Dialogue JSON content can get large (consider compression for old data)

### API Response Times
- Most endpoints: < 500ms target
- Streaming responses: Long-polling for dialogue turns (backend pushes new content)
- File exports: Can take 1-2 seconds for large dialogues (acceptable)

### Frontend Performance
- Dialogue scrolling: Virtualize if > 100 turns (unlikely single dialogue)
- History list: Paginate per API spec (Section 15, default 20 per page)
- Search: Debounce input (300ms) before query

### Token Accounting
- Account system tracks tokens precisely
- Each API call decrements token count immediately
- If account drops below 100, trigger swap logic

---

## PART 8: DEBUGGING & TROUBLESHOOTING

### "Dialogue feels sluggish"
→ Check: Streaming response implementation, virtual scrolling for long dialogues
→ Reference: API-Endpoints.md Section 5.2 (turn submission)

### "Auto-stop not triggering"
→ Check: Stop condition algorithm for current mode
→ Reference: Phase-11-FINAL Section 1.5
→ Test: Use example dialogues from Granular-Feedback-Specification.md

### "Button labels confusing"
→ Check: Universal button meanings by mode
→ Reference: Phase-11-FINAL Section 1.4, Component-Breakdown.md Section 7.4
→ Test: All 5 modes × 4 buttons (20 combinations)

### "Feature not visible at right milestone"
→ Check: Milestone unlock logic in Task 2.4.1
→ Reference: Progressive-Unlock-Matrix.md
→ Debug: Log question count and milestone progression

### "Account swap causes dialogue to lose context"
→ Check: Context transfer prompt in Task 1.1.4
→ Reference: Phase-11-FINAL Section 1.3
→ Test: Dialogue continues smoothly after swap

---

## PART 9: CODE ORGANIZATION RECOMMENDATIONS

### Backend Structure
```
/src
  /api
    /routes
      - dialogues.ts      (Tasks 1.2.3, 2.1)
      - accounts.ts       (Task 1.1.4)
      - feedback.ts       (Task 1.3)
      - history.ts
  /database
    - schema.ts           (Task 1.5.1)
    - migrations/
      - 011_phase11.ts    (Task 1.5.2)
  /services
    - account-rotation.ts (Task 1.1)
    - dialogue-engine.ts  (Task 1.2)
    - feedback-service.ts (Task 1.3)
    - learning-system.ts  (Category 3)
```

### Frontend Structure
```
/components
  /dialogue
    - DialogueContainer.tsx    (Task 2.1.1)
    - DialogueTurnCard.tsx     (Task 2.1.3)
    - AccountSwapBanner.tsx    (Task 2.1.2)
  /goal-picker
    - GoalSelector.tsx         (Task 2.2.1)
    - RecommendationDisplay.tsx (Task 2.2.4)
  /settings
    - SettingsPanel.tsx        (Task 2.9)
    - ProgressiveUnlock.tsx    (Task 2.4)
  /features
    - QuietMode.tsx            (Task 2.3)
    - ADHDMode.tsx             (Task 2.5)
    - FocusMode.tsx            (Task 2.6)
  /history
    - HistoryList.tsx          (Task 2.8.1-2)
    - PatternsTab.tsx          (Task 2.8.5)
```

---

## PART 10: FINAL CHECKLIST BEFORE STARTING

- [ ] Read Phase-11-FINAL-SPECIFICATION.md in full
- [ ] Review Data-Model-Schema.md database design
- [ ] Check API-Endpoints-Specification.md format consistency
- [ ] Study Dialogue-Layout-Reference.md visual mockups
- [ ] Understand Component-Breakdown.md component specs
- [ ] Review Granular-Feedback-Specification.md feedback flow
- [ ] Check Progressive-Unlock-Matrix.md milestone definitions
- [ ] Read Phase-12-Implementation-Checklist.md implementation plan
- [ ] Understand dependency chain (Part 2 of this guide)
- [ ] Set up database environment
- [ ] Configure API framework (Express, FastAPI, etc.)
- [ ] Set up frontend framework (React, Vue, Svelte, etc.)
- [ ] Create test structure (unit, integration, E2E)
- [ ] Set up CI/CD pipeline

---

## PART 11: ASKING FOR CLARIFICATION

If you need clarification while implementing:

**Question:** "How should X behave in Y scenario?"
**Steps:**
1. Search this guide and all spec docs for keywords
2. Check Component-Breakdown.md for UI components
3. Check Phase-11-FINAL-SPECIFICATION.md for feature behavior
4. If not found, file question with: feature name, scenario, spec reference

**Question:** "Which task should I do next?"
**Steps:**
1. Check Phase-12-Implementation-Checklist.md
2. Find uncompleted task with no dependencies
3. Verify all dependencies (if any) are complete
4. Pick from list of available tasks

**Question:** "Is this data structure correct?"
**Steps:**
1. Check Data-Model-Schema.md for table definitions
2. Check API-Endpoints-Specification.md for request/response formats
3. Check Granular-Feedback-Specification.md for feedback data structures

---

**Status: COMPLETE**

**Next task: Architecture Diagram (text-based)**
