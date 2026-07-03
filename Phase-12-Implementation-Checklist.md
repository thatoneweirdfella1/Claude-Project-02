# Phase 12: Implementation Checklist
## Detailed Development Tasks (2-5 hour chunks)

**Status: COMPLETE FOR PHASE 12 PLANNING**

---

## OVERVIEW

This checklist breaks down Phase 11 design into implementable tasks for Phase 13 development. Each task:
- Has clear acceptance criteria
- Estimates 2-5 hours of work
- Can be completed independently (with noted dependencies)
- Lists relevant spec documents
- Identifies testing requirements

**Legend:**
- ✅ = Completed in design phase
- ⏳ = Ready for Phase 13 (code)
- 🔄 = Depends on other task(s)

---

## CATEGORY 1: BACKEND CORE SYSTEMS (40-60 hours)

### 1.1 ACCOUNT ROTATION SYSTEM (6-8 hours)

#### Task 1.1.1: Account Registry & Data Model
**Time:** 2 hours

**Description:** Create account registry data structure and database tables for storing API keys, token counts, and account metadata.

**Acceptance Criteria:**
- [ ] `accounts` table created in SQLite (8 fields per schema)
- [ ] Account IDs standardized: claude_a, claude_b, gpt_a, gpt_b, perplexity_a, etc.
- [ ] API key encryption implemented (encrypt at rest)
- [ ] Token counter functional for each account
- [ ] Account status field (active, ready, depleted) working

**Relevant Specs:**
- Data-Model-Schema.md → accounts table
- API-Endpoints-Specification.md → GET /accounts

**Dependencies:** None

**Testing:** 
- [ ] Can create/read/update account records
- [ ] Encryption/decryption working
- [ ] Token counts accurate

---

#### Task 1.1.2: Token Monitoring & Depletion Detection
**Time:** 2 hours

**Description:** Implement real-time token tracking and depletion detection logic.

**Acceptance Criteria:**
- [ ] Token counter decrements on each API call
- [ ] Depleted account automatically marked (< 100 tokens remaining)
- [ ] Warning threshold triggers at 20% capacity
- [ ] Token reset logic for new sessions/days (if applicable)
- [ ] Per-session token tracking separate from total

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Account Rotation section
- API-Endpoints-Specification.md → GET /accounts/token-status

**Dependencies:** Task 1.1.1

**Testing:**
- [ ] Token count decrements correctly
- [ ] Depleted detection at right threshold
- [ ] Warning messages triggered appropriately
- [ ] Multiple accounts tracked independently

---

#### Task 1.1.3: Auto-Swap Logic & Account Selection
**Time:** 2 hours

**Description:** Implement automatic account rotation when current account depletes.

**Acceptance Criteria:**
- [ ] When account depletes, system selects next available account
- [ ] Priority order respected: same-provider > different-provider
- [ ] If all Claude depleted, ask user before using Perplexity
- [ ] Manual override available (user can pick account)
- [ ] Swap decision logged with reason
- [ ] No API call fails due to depletion (transparent handoff)

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Account Rotation section
- API-Endpoints-Specification.md → POST /accounts/{id}/rotate

**Dependencies:** Task 1.1.1, 1.1.2

**Testing:**
- [ ] Single account swap
- [ ] Multiple sequential swaps
- [ ] All same-provider depleted (cross-provider)
- [ ] Manual rotation override
- [ ] User prompt for cross-provider swap

---

#### Task 1.1.4: Context Transfer on Account Swap
**Time:** 2 hours

**Description:** Implement system prompt that transfers dialogue context to new account.

**Acceptance Criteria:**
- [ ] Context transfer prompt built on account swap
- [ ] Dialogue history included in context window
- [ ] Model handoff message in response
- [ ] New model understands conversation state
- [ ] No loss of coherence in dialogue continuation
- [ ] Token accounting correct after swap

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Context transfer
- Dialogue-Layout-Reference.md → Inline swap notation
- API-Endpoints-Specification.md → POST /dialogues/{id}/turn

**Dependencies:** Task 1.1.1, 1.1.3

**Testing:**
- [ ] Dialogue continues smoothly after swap
- [ ] New model references previous statements correctly
- [ ] Tone/style consistency maintained
- [ ] No information loss

---

### 1.2 MULTI-AI DIALOGUE ENGINE (8-12 hours)

#### Task 1.2.1: Dialogue Mode Configuration
**Time:** 2 hours

**Description:** Create dialogue modes configuration and goal-to-mode mapping.

**Acceptance Criteria:**
- [ ] 5 core dialogue modes defined: Consensus, Adversarial, Socratic, Devil's Advocate, Synthesis
- [ ] Each mode has system prompt template
- [ ] Goal-to-mode mapping configured (1:1 primary, 1:many alternative)
- [ ] Mode parameters configurable (max rounds, auto-stop triggers)
- [ ] Custom modes framework prepared (M5+ feature)

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Dialogue Goal Framework, Auto-Stop Conditions
- API-Endpoints-Specification.md → POST /dialogues

**Dependencies:** None

**Testing:**
- [ ] All 5 modes load correctly
- [ ] Goal-to-mode mapping returns correct recommendations
- [ ] Mode parameters applied to system prompts
- [ ] Custom mode hooks work

---

#### Task 1.2.2: Auto-Stop Condition Detectors
**Time:** 3 hours

**Description:** Implement logic to detect when dialogue goal is achieved per mode.

**Acceptance Criteria:**
- [ ] Consensus mode: Detects agreement (keywords: agree, fair point, concede)
- [ ] Adversarial mode: Detects weakness found (keywords: flaw, core issue, valid)
- [ ] Socratic mode: Detects understanding (meta-commentary, increased specificity)
- [ ] Devil's Advocate mode: Detects proposal refined (iteration, length increase, revision)
- [ ] Synthesis mode: Detects synthesis complete (integration keywords: combines, integrates, both, synthesis)
- [ ] Hard max rounds enforced (Consensus:4, Adversarial:5, Socratic:3, Devil's:4, Synthesis:3)
- [ ] Stop reason returned with dialogue completion

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Dialogue-Specific Auto-Stop Conditions

**Dependencies:** Task 1.2.1

**Testing:**
- [ ] Each mode stops at correct threshold (5 test cases per mode = 25 total)
- [ ] Max rounds enforced as fallback
- [ ] Keywords detected accurately
- [ ] Stop reason logged correctly
- [ ] No premature stopping

---

#### Task 1.2.3: Dialogue Loop Controller
**Time:** 3 hours

**Description:** Implement main dialogue loop handling turns, button actions, and state transitions.

**Acceptance Criteria:**
- [ ] Dialogue initiated with goal + mode
- [ ] Accept/Continue buttons trigger appropriate logic
- [ ] Pause functionality saves state
- [ ] Resume from pause restores state
- [ ] Stop dialogue saves and closes
- [ ] Rewind/branch functionality prepared (initial)
- [ ] Take-over mode prepared (user can insert own response)
- [ ] Dialogue status tracked (initiated, in_progress, completed, paused)
- [ ] Full turn history maintained

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Universal Button System, Features Locked In
- API-Endpoints-Specification.md → POST /dialogues, POST /dialogues/{id}/turn
- Dialogue-Layout-Reference.md → Button interactions

**Dependencies:** Task 1.2.1, 1.2.2, 1.1 (account rotation)

**Testing:**
- [ ] Dialogue creation and initiation
- [ ] Turn progression (5 rounds tested)
- [ ] Button actions per mode (5 modes × 4 buttons = 20 test cases)
- [ ] Pause/resume state preservation
- [ ] Rewind branching creates new dialogue
- [ ] Take-over mode captures user input

---

### 1.3 GRANULAR FEEDBACK SYSTEM (4-6 hours)

#### Task 1.3.1: Routing Feedback Collection
**Time:** 2 hours

**Description:** Implement thumbs-down on routing decisions and capture alternatives.

**Acceptance Criteria:**
- [ ] Thumbs-down button appears on routing card
- [ ] Clicking triggers feedback capture
- [ ] System offers model alternatives if requested
- [ ] Optional comment/reason field
- [ ] Feedback logged immediately (not wait for final rating)
- [ ] Linked to question_id for correlation
- [ ] Override option: proceed with recommended model anyway

**Relevant Specs:**
- Granular-Feedback-Specification.md → Feature 1: Routing Feedback
- Data-Model-Schema.md → granular_feedback table
- API-Endpoints-Specification.md → POST /feedback/routing

**Dependencies:** None (can run parallel to dialogue engine)

**Testing:**
- [ ] Thumbs-down logged correctly
- [ ] Alternative models offered
- [ ] Feedback stored in database
- [ ] Can override and proceed

---

#### Task 1.3.2: Technique Feedback Collection
**Time:** 2 hours

**Description:** Implement thumbs-down on technique selection.

**Acceptance Criteria:**
- [ ] Thumbs-down button appears on technique card
- [ ] Clicking triggers feedback capture
- [ ] System offers technique alternatives or auto-select
- [ ] Optional comment/reason field
- [ ] Feedback logged immediately
- [ ] Linked to question_id
- [ ] Can change techniques before answering

**Relevant Specs:**
- Granular-Feedback-Specification.md → Feature 2: Technique Feedback
- Data-Model-Schema.md → granular_feedback table
- API-Endpoints-Specification.md → POST /feedback/techniques

**Dependencies:** None

**Testing:**
- [ ] Thumbs-down logged correctly
- [ ] Technique alternatives offered
- [ ] Feedback stored in database
- [ ] Technique changes applied

---

#### Task 1.3.3: Feedback-to-Learning Integration
**Time:** 2 hours

**Description:** Wire granular feedback into learning system for pattern detection.

**Acceptance Criteria:**
- [ ] Thumbs-down data feeds pattern detector
- [ ] After 10+ same-type questions with thumbs-down, pattern surfaces
- [ ] Pattern confidence calculated (thumbs-down count / total)
- [ ] User notified in History → Patterns tab
- [ ] Learning system can adjust routing/techniques for next question
- [ ] User can accept or dismiss pattern

**Relevant Specs:**
- Granular-Feedback-Specification.md → Learning System Uses This
- Phase-11-FINAL-SPECIFICATION.md → Learning system
- API-Endpoints-Specification.md → GET /patterns, POST /patterns/{id}/action

**Dependencies:** Task 1.3.1, 1.3.2

**Testing:**
- [ ] Pattern detection triggers at 10+ threshold
- [ ] Confidence calculated correctly
- [ ] Pattern surfaces in UI
- [ ] Accept/dismiss actions work
- [ ] Next question uses applied pattern

---

### 1.4 ENHANCEMENT TO EXISTING STAGES (10-14 hours)

#### Task 1.4.1: Stage 1 - Re-translate with Parameters
**Time:** 2 hours

**Description:** Add re-translate feature with decomposition/normalization options.

**Acceptance Criteria:**
- [ ] "Retranslate" button on translation result
- [ ] Opens option picker: decomposition aggressiveness, emotional normalization, compound handling
- [ ] Re-translation runs with selected parameters
- [ ] New translation compared with original
- [ ] User can choose which to keep or cherry-pick
- [ ] Version history maintained

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Stage 1: Translation
- API-Endpoints-Specification.md → POST /questions/{id}/retranslate

**Dependencies:** Translation system already exists (Phase 1-10)

**Testing:**
- [ ] Re-translate with different decomposition levels
- [ ] Emotional normalization toggles correctly
- [ ] Compound question handling options work
- [ ] Version comparison clear

---

#### Task 1.4.2: Stage 1 - Compound Question Routing
**Time:** 2 hours

**Description:** Detect and handle compound questions (multiple questions at once).

**Acceptance Criteria:**
- [ ] System detects compound questions
- [ ] User prompted: "Route together (faster) or separately (thorough)?"
- [ ] Together: Single answer addressing all
- [ ] Separately: Multiple questions created, each routed independently
- [ ] Results presented side-by-side for comparison

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Stage 1: Translation

**Dependencies:** Translation system

**Testing:**
- [ ] Compound question detection accurate
- [ ] Together routing (single answer)
- [ ] Separate routing (multiple answers)
- [ ] Results presentation clear

---

#### Task 1.4.3: Stage 2 - Routing Explanation
**Time:** 2 hours

**Description:** Expand routing explanation details (collapsed by default).

**Acceptance Criteria:**
- [ ] "Explain Routing" button shows decision factors
- [ ] Lists question characteristics (type, complexity, etc.)
- [ ] Model choice reasoning displayed
- [ ] Alternative models shown with trade-offs
- [ ] Past satisfaction history factored in (after M1)
- [ ] Confidence score explained
- [ ] Collapsed by default (power users can expand)

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Stage 2: Routing
- API-Endpoints-Specification.md → POST /questions

**Dependencies:** Routing system, learning system

**Testing:**
- [ ] Explanation logic for all question types
- [ ] Alternative suggestions accurate
- [ ] Historical satisfaction factored
- [ ] Clarity of explanation

---

#### Task 1.4.4: Stage 2 - Boundary Question Handler
**Time:** 2 hours

**Description:** Handle borderline Haiku vs Opus-Fast decisions.

**Acceptance Criteria:**
- [ ] System detects boundary questions
- [ ] Shows user: "Borderline. Haiku (fast) or Opus-Fast (thorough)?"
- [ ] User picks preference or allows auto-decision
- [ ] Decision recorded for learning
- [ ] After M3, system learns user's boundary preference

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Stage 2: Routing

**Dependencies:** Routing system

**Testing:**
- [ ] Boundary detection working
- [ ] User choice applied
- [ ] Auto-decision reasonable
- [ ] Preference learning after 10+ boundary questions

---

#### Task 1.4.5: Stage 3 - Custom Technique Stacks
**Time:** 2 hours

**Description:** Allow users to save and reuse favorite technique combinations.

**Acceptance Criteria:**
- [ ] "Favorite This Stack" button on technique card (M2+)
- [ ] Save dialog: name + description + auto-apply settings
- [ ] Auto-apply to specific question types or all questions
- [ ] User can view/edit/delete stacks in Settings
- [ ] Saved stacks pre-selected on similar future questions
- [ ] Usage count tracked

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Stage 3: Technique Selection
- API-Endpoints-Specification.md → POST /technique-stacks, GET /technique-stacks

**Dependencies:** Technique selection system

**Testing:**
- [ ] Stack creation and storage
- [ ] Auto-apply logic (by question type and general)
- [ ] Pre-selection on future questions
- [ ] Edit/delete stack operations

---

#### Task 1.4.6: Stage 4 - Fast Preview
**Time:** 2 hours

**Description:** Show 50-word preview before generating full answer.

**Acceptance Criteria:**
- [ ] "Fast Preview" button on composition stage
- [ ] Generate max_tokens=50 preview
- [ ] User decision: full answer, edit & retry, or back
- [ ] Edit & retry shows prompt editor (if transparency enabled)
- [ ] Preview skippable (go straight to full)
- [ ] Preview saved in answer metadata

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Stage 4: Composition
- API-Endpoints-Specification.md → POST /questions/{id}/answer

**Dependencies:** Composition system

**Testing:**
- [ ] Preview generation working
- [ ] Preview quality reasonable
- [ ] Full answer generation after preview
- [ ] Prompt editing functional

---

#### Task 1.4.7: Stage 5 - Regenerate vs Reroute
**Time:** 2 hours

**Description:** Add "Reroute" button alongside "Regenerate" for answer recovery.

**Acceptance Criteria:**
- [ ] Regenerate: Same model, same prompt, new response
- [ ] Reroute: Different model, same prompt, new response
- [ ] Both options available post-answer
- [ ] User selects fix strategy (speed vs quality)
- [ ] New response generated with choice logged
- [ ] Previous versions accessible in History

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Stage 5: Execution & Feedback
- API-Endpoints-Specification.md → POST /answers/{id}/regenerate

**Dependencies:** Answer/routing system

**Testing:**
- [ ] Regenerate with same model
- [ ] Reroute with different model
- [ ] Choice history tracked
- [ ] Both options produce valid answers

---

### 1.5 DATABASE & DATA MIGRATION (3-4 hours)

#### Task 1.5.1: Create Phase 11+ Database Schema
**Time:** 2 hours

**Description:** Create all 10 new tables in SQLite for Phase 11+ features.

**Acceptance Criteria:**
- [ ] dialogues table created
- [ ] dialogue_turns table created
- [ ] accounts table created
- [ ] granular_feedback table created
- [ ] patterns table created
- [ ] prompts table created
- [ ] variables table created
- [ ] context_items table created
- [ ] checkpoints table created
- [ ] activity_log table created
- [ ] All indexes created per schema
- [ ] Foreign key relationships working

**Relevant Specs:**
- Data-Model-Schema.md → All TABLE SCHEMAS section

**Dependencies:** None

**Testing:**
- [ ] All tables exist with correct schema
- [ ] Indexes created
- [ ] Can insert/read/update data

---

#### Task 1.5.2: Create Migration Script
**Time:** 2 hours

**Description:** Create migration from Phase 1-10 schema to Phase 11+ schema.

**Acceptance Criteria:**
- [ ] Migration script preserves existing data
- [ ] Creates all new tables
- [ ] Modifies settings table for new keys
- [ ] Migration reversible (rollback capability)
- [ ] Run on existing databases without data loss
- [ ] Migration logged and timestamped

**Relevant Specs:**
- Data-Model-Schema.md → MIGRATIONS NEEDED section

**Dependencies:** Task 1.5.1

**Testing:**
- [ ] Migration on test database successful
- [ ] Data integrity check after migration
- [ ] Rollback works correctly
- [ ] Performance acceptable (< 5 seconds)

---

---

## CATEGORY 2: FRONTEND CORE UI (60-80 hours)

### 2.1 DIALOGUE INTERFACE (12-16 hours)

#### Task 2.1.1: Chat-Box Vertical Layout
**Time:** 3 hours

**Description:** Implement vertical top-to-bottom dialogue display component.

**Acceptance Criteria:**
- [ ] Dialogue container scrollable
- [ ] Messages stack vertically (no side-by-side)
- [ ] Model A and Model B visually distinct
- [ ] Full message text always visible (no truncation)
- [ ] Timestamps on each message
- [ ] Automatic scroll to latest message
- [ ] Mobile-optimized swipe-scrolling
- [ ] Responsive: full width mobile, constrained width desktop

**Relevant Specs:**
- Dialogue-Layout-Reference.md → Complete reference
- Phase-11-FINAL-SPECIFICATION.md → Dialogue Display
- Component-Breakdown.md → Section 7.2

**Dependencies:** Task 1.2 (dialogue engine)

**Testing:**
- [ ] Renders 10+ turns without issues
- [ ] Scrolling smooth on desktop and mobile
- [ ] Messages readable at all breakpoints
- [ ] No content overflow

---

#### Task 2.1.2: Account Swap Notification
**Time:** 2 hours

**Description:** Implement banner and inline notifications for account swaps.

**Acceptance Criteria:**
- [ ] Banner appears at top when swap detected
- [ ] Banner message clear: "🔄 Claude A tokens depleted. Claude B continuing."
- [ ] Inline notation in dialogue: "← Claude B joins (Claude A tokens depleted)"
- [ ] Both visible simultaneously (clearest)
- [ ] Banner dismissible [×]
- [ ] Inline notation appears only for swap turn
- [ ] Notification respects Quiet Mode (shown, not hidden)

**Relevant Specs:**
- Dialogue-Layout-Reference.md → Swap Notification Examples
- Phase-11-FINAL-SPECIFICATION.md → Account Rotation section

**Dependencies:** Task 1.1 (account rotation), Task 2.1.1

**Testing:**
- [ ] Swap banner displays correctly
- [ ] Inline notation shows
- [ ] Both visible when swap occurs
- [ ] Dismiss works
- [ ] Multiple sequential swaps handled

---

#### Task 2.1.3: Per-Turn Copy & Regenerate Buttons
**Time:** 2 hours

**Description:** Implement copy and regenerate buttons below each dialogue turn.

**Acceptance Criteria:**
- [ ] Copy button: Markdown format default, options for plaintext/HTML
- [ ] Copy provides visual feedback ("Copied!")
- [ ] Regenerate button: Same model, same prompt, new response
- [ ] Only Copy & Regenerate buttons shown (no thumbs up/down on individual turns)
- [ ] Buttons visible but not intrusive
- [ ] Hover states clear
- [ ] Mobile: Touch-friendly sizing

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Dialogue Display
- Component-Breakdown.md → Section 7.3

**Dependencies:** Task 2.1.1

**Testing:**
- [ ] Copy button copies correct text
- [ ] Copy success message shows
- [ ] Regenerate starts new response
- [ ] Buttons positioned correctly
- [ ] Multiple consecutive regenerates work

---

#### Task 2.1.4: Confidence Score Display
**Time:** 1 hour

**Description:** Display unobtrusive confidence/quality score in dialogue.

**Acceptance Criteria:**
- [ ] Quality score shown (e.g., "82%") at bottom of round
- [ ] Styled as small, dim text (not prominent)
- [ ] Updated after each round
- [ ] Unobtrusive, doesn't distract from content
- [ ] Tooltip on hover explains scoring method
- [ ] Respects Quiet Mode (hidden when ON)

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Dialogue Display
- Dialogue-Layout-Reference.md → Quality score placement

**Dependencies:** Task 2.1.1

**Testing:**
- [ ] Score displays correctly
- [ ] Updates per round
- [ ] Styling appropriately dim
- [ ] Tooltip functional

---

### 2.2 GOAL PICKER & RECOMMENDATION (6-8 hours)

#### Task 2.2.1: Goal Selection UI
**Time:** 2 hours

**Description:** Implement 5 core goal selection interface.

**Acceptance Criteria:**
- [ ] 5 buttons for goals: Solid Answer, Understand, Improve Idea, Decision, Debate
- [ ] Clear button labels and descriptions
- [ ] Visual indication of selected goal
- [ ] Mobile-responsive (stack vertically)
- [ ] Desktop-responsive (5 columns or grid)
- [ ] Click goal to proceed to next step

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Dialogue Goal Framework
- Component-Breakdown.md → Section 7.1

**Dependencies:** Task 1.2 (dialogue engine)

**Testing:**
- [ ] All 5 goals selectable
- [ ] Selection highlighted
- [ ] Responsive layout tested
- [ ] Proceeds to next step correctly

---

#### Task 2.2.2: Nuance Slider (Depth Selection)
**Time:** 2 hours

**Description:** Implement depth selection (Surface/Medium/Deep) optional prompt.

**Acceptance Criteria:**
- [ ] After goal selection, optional "How deep?" prompt appears
- [ ] 3 buttons: Surface, Medium, Deep
- [ ] Each level has brief description
- [ ] Skip/default to Medium option
- [ ] Selection affects mode recommendation and max rounds

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.ms → Dialogue Goal Framework

**Dependencies:** Task 2.2.1

**Testing:**
- [ ] Depth options display
- [ ] Selection affects recommendations
- [ ] Default to Medium works

---

#### Task 2.2.3: Position Selector
**Time:** 2 hours

**Description:** Implement optional position selector (For/Against/Undecided) for debate-like goals.

**Acceptance Criteria:**
- [ ] For applicable goals (Debate, Decision), show position prompt
- [ ] 3 buttons: For, Against, Undecided
- [ ] Skip/default to Undecided
- [ ] Selection affects mode recommendation

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Dialogue Goal Framework

**Dependencies:** Task 2.2.1

**Testing:**
- [ ] Position options display for applicable goals
- [ ] Hidden for non-applicable goals
- [ ] Selection affects recommendation

---

#### Task 2.2.4: Recommendation Display
**Time:** 2 hours

**Description:** Show primary mode recommendation + alternative + "Show all options" expansion.

**Acceptance Criteria:**
- [ ] Recommendation card shows: Primary mode name + brief description
- [ ] Alternative mode shown below
- [ ] Reasoning displayed ("Why this mode?")
- [ ] "Show all options" link expands to show all 5 modes
- [ ] User selects mode or chooses different
- [ ] Selection proceeds to dialogue initiation

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Dialogue Goal Framework
- Dialogue-Layout-Reference.md → Goal/mode selection flow

**Dependencies:** Task 1.2, Task 2.2.1-3

**Testing:**
- [ ] Recommendation logic correct (goal→mode mapping)
- [ ] Recommendation displayed clearly
- [ ] "Show all" expands correctly
- [ ] Mode selection proceeds to dialogue

---

### 2.3 QUIET MODE (4-6 hours)

#### Task 2.3.1: Quiet Mode Toggle Button
**Time:** 1 hour

**Description:** Add Quiet Mode toggle button on answer card and in Settings.

**Acceptance Criteria:**
- [ ] 🔇 Quiet Mode toggle appears on answer card
- [ ] Also in Settings panel
- [ ] Persistent setting (localStorage)
- [ ] Visual indication when ON
- [ ] Clear, non-intrusive button placement

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Quiet Mode
- Quiet-Mode-Specification.md → Complete spec
- Component-Breakdown.md → Section 2.1

**Dependencies:** None

**Testing:**
- [ ] Toggle works
- [ ] Setting persists across sessions
- [ ] Visual indication clear

---

#### Task 2.3.2: Hide/Show Logic for Quiet Mode
**Time:** 2 hours

**Description:** Implement hide/show logic for all optional UI elements when Quiet Mode ON.

**Acceptance Criteria:**
- [ ] When Quiet Mode ON: Hide follow-up questions
- [ ] Hide technique explanations
- [ ] Hide routing reasoning (still shown on card, not expanded)
- [ ] Hide pattern suggestions (Patterns tab exists but not surfaced)
- [ ] Hide confidence scores
- [ ] Hide multi-AI mode toggle (shown as option, not promotional)
- [ ] Hide learning notifications
- [ ] Keep: Answer, 5-star feedback, core buttons
- [ ] When Quiet Mode OFF: All normal features visible

**Relevant Specs:**
- Quiet-Mode-Specification.md → Complete behavior

**Dependencies:** Task 2.3.1

**Testing:**
- [ ] 10+ prompts/explanations tested for hiding/showing
- [ ] Core features remain visible
- [ ] Toggle ON/OFF works immediately
- [ ] No data loss when toggled

---

#### Task 2.3.3: Settings Panel for Quiet Mode
**Time:** 1 hour

**Description:** Add Quiet Mode controls to Settings panel.

**Acceptance Criteria:**
- [ ] Quiet Mode toggle in Settings → Basics tab
- [ ] Description: "Hide all optional prompts and suggestions"
- [ ] Default: OFF
- [ ] Saves to user preferences
- [ ] Takes effect immediately

**Relevant Specs:**
- Component-Breakdown.md → Section 9.1 Settings Panel

**Dependencies:** Task 2.3.1

**Testing:**
- [ ] Settings toggle works
- [ ] Saves correctly
- [ ] Reflects in main UI

---

#### Task 2.3.4: Quiet Mode Persistence & Learning
**Time:** 2 hours

**Description:** Ensure Quiet Mode setting persists and learning still occurs silently.

**Acceptance Criteria:**
- [ ] Setting persists across sessions
- [ ] Learning system still tracks feedback (not affected by Quiet Mode)
- [ ] Patterns still detected (just not surfaced to user)
- [ ] No behavior changes, only visibility changes

**Relevant Specs:**
- Quiet-Mode-Specification.md → Testing scenarios

**Dependencies:** Task 2.3.1, 2.3.2

**Testing:**
- [ ] Persistence tested across sessions
- [ ] Learning continues silently
- [ ] Patterns computed correctly
- [ ] Can toggle off to see detected patterns

---

### 2.4 PROGRESSIVE UNLOCK SYSTEM (6-8 hours)

#### Task 2.4.1: Milestone Tracking & Counter
**Time:** 2 hours

**Description:** Track user question count and milestone progression.

**Acceptance Criteria:**
- [ ] Counter tracks total questions asked
- [ ] 5 milestones defined: M1 (0), M2 (10), M3 (25), M4 (50), M5 (100)
- [ ] Milestone unlock timestamped when crossed
- [ ] Persistent in database
- [ ] Progress visible in Settings (M2+)
- [ ] Estimated questions to next milestone shown

**Relevant Specs:**
- Progressive-Unlock-Matrix.md → All milestone definitions
- API-Endpoints-Specification.md → GET /settings/milestones

**Dependencies:** Database system

**Testing:**
- [ ] Counter increments on question creation
- [ ] Milestone crossed at correct thresholds
- [ ] Timestamps recorded
- [ ] Progress calculation accurate

---

#### Task 2.4.2: Feature Unlock Modal
**Time:** 2 hours

**Description:** Show "🎉 New features unlocked!" modal when milestone crossed.

**Acceptance Criteria:**
- [ ] Modal appears when milestone unlocked
- [ ] Lists newly unlocked features with descriptions
- [ ] Visual celebration (emoji, encouraging message)
- [ ] [Dismiss] button
- [ ] Non-intrusive timing (shown once, can dismiss)
- [ ] Can be re-viewed in Settings → Milestones

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.ms → Progressive Feature Unlock
- Component-Breakdown.md → Modals

**Dependencies:** Task 2.4.1

**Testing:**
- [ ] Modal appears at correct milestone
- [ ] Features listed correctly
- [ ] Dismiss works
- [ ] Can review in Settings

---

#### Task 2.4.3: Settings Tab Visibility by Milestone
**Time:** 2 hours

**Description:** Show/hide Settings tabs and options based on milestone progress.

**Acceptance Criteria:**
- [ ] M1: Basic Settings (default model, transparency, feedback style)
- [ ] M2: Add Technique Limits, Advanced Options
- [ ] M3: Add Account Management (future), Analytics
- [ ] M4: Add Focus Mode, ADHD Mode
- [ ] M5: Add Custom Dialogue Modes, API key management
- [ ] Grayed out (not hidden) if not yet unlocked
- [ ] Tooltip explains unlock requirement

**Relevant Specs:**
- Progressive-Unlock-Matrix.md → All feature unlocks
- Component-Breakdown.md → Section 9 Settings

**Dependencies:** Task 2.4.1

**Testing:**
- [ ] Correct tabs visible per milestone
- [ ] Grayed out tabs shown
- [ ] Tooltips appear
- [ ] Unlock triggers correctly

---

#### Task 2.4.4: Milestone Progress Display
**Time:** 2 hours

**Description:** Create Milestone Progress screen showing all 5 milestones + progress bar.

**Acceptance Criteria:**
- [ ] Shows all 5 milestones with unlock dates (if unlocked)
- [ ] Progress bar toward next milestone
- [ ] Features listed under each milestone
- [ ] Question count displayed
- [ ] Encouraging message ("27 more questions until next unlock")
- [ ] Accessible from Settings or dedicated page

**Relevant Specs:**
- Component-Breakdown.md → Section 9.3

**Dependencies:** Task 2.4.1

**Testing:**
- [ ] All milestones displayed
- [ ] Progress calculation accurate
- [ ] Features listed correctly
- [ ] Progress bar moves as questions asked

---

### 2.5 ADHD MODE PRESET (5-7 hours)

#### Task 2.5.1: ADHD Mode Enable/Disable
**Time:** 1 hour

**Description:** Add master toggle for ADHD Mode in Settings.

**Acceptance Criteria:**
- [ ] ADHD Mode toggle in Settings → Basics tab
- [ ] Unlocked at M4 (50 questions)
- [ ] Description: "Optimized for ADHD brains: high contrast, less animation, plain language"
- [ ] Default: OFF
- [ ] Takes effect immediately

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → ADHD-Specific Design
- Component-Breakdown.md → Section 9.2

**Dependencies:** Task 2.4.1 (milestone M4)

**Testing:**
- [ ] Toggle works
- [ ] Takes effect immediately
- [ ] Visible only at M4+

---

#### Task 2.5.2: High Contrast Toggle
**Time:** 1 hour

**Description:** Implement high contrast mode (7:1 color ratio).

**Acceptance Criteria:**
- [ ] Toggle in Settings (nested under ADHD Mode)
- [ ] All text contrast increases to 7:1 minimum
- [ ] Reduced number of colors (less visual noise)
- [ ] Clear visual distinction between elements
- [ ] Accessible color combinations
- [ ] Persists across sessions

**Relevant Specs:**
- Component-Breakdown.md → Section 13 Accessibility
- Phase-11-FINAL-SPECIFICATION.md → ADHD Mode

**Dependencies:** Task 2.5.1

**Testing:**
- [ ] Color contrast verified (7:1)
- [ ] Text readable
- [ ] Buttons/controls clear
- [ ] Persistence working

---

#### Task 2.5.3: Animation Reduction
**Time:** 1 hour

**Description:** Reduce or disable animations when ADHD Mode ON.

**Acceptance Criteria:**
- [ ] Toggle respects `prefers-reduced-motion`
- [ ] When ON: All animations 50% speed or disabled
- [ ] Loading spinners still visible (but slower/minimal)
- [ ] Page transitions simplified
- [ ] Hover animations reduced
- [ ] No jarring or rapid animations

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.ms → ADHD Mode
- Component-Breakdown.md → Section 15 Animation Specs

**Dependencies:** Task 2.5.1

**Testing:**
- [ ] Animations slower/disabled
- [ ] Loading states still clear
- [ ] Transitions smooth but reduced
- [ ] No jarring changes

---

#### Task 2.5.4: Plain Language Mode
**Time:** 1 hour

**Description:** Simplify language when ADHD Mode ON.

**Acceptance Criteria:**
- [ ] Toggle simplifies technical terms
- [ ] "Tokens" → "Word count"
- [ ] "Routing" → "Model selection"
- [ ] "Techniques" → "Strategies"
- [ ] Explanations shorter and simpler
- [ ] Examples more concrete
- [ ] Jargon avoided throughout UI

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → ADHD Mode
- Component-Breakdown.md → Section 2.9

**Dependencies:** Task 2.5.1

**Testing:**
- [ ] All instances of jargon simplified
- [ ] Explanations tested for clarity
- [ ] Consistency throughout UI

---

#### Task 2.5.5: Larger Text Option
**Time:** 1 hour

**Description:** Allow text size increase when ADHD Mode ON.

**Acceptance Criteria:**
- [ ] Toggle increases base font size by 20-30%
- [ ] Applies to all text (except code)
- [ ] Buttons/controls enlarge proportionally
- [ ] Layout doesn't break on mobile
- [ ] Readability improved (especially small text)
- [ ] Respects user's system text size preferences

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → ADHD Mode
- Component-Breakdown.md → Section 13 Accessibility

**Dependencies:** Task 2.5.1

**Testing:**
- [ ] Text size increased
- [ ] Layout stable at larger size
- [ ] Mobile still usable
- [ ] Readability verified

---

#### Task 2.5.6: Hide Advanced Buttons
**Time:** 1 hour

**Description:** Show only essential buttons when ADHD Mode ON.

**Acceptance Criteria:**
- [ ] Advanced buttons hidden: Details, Advanced options, Show reasoning
- [ ] Core buttons visible: Ask, Continue, Accept, Stop, Copy, Rate
- [ ] Can still access advanced features (deeper navigation)
- [ ] Reduces visual clutter
- [ ] Prevents analysis paralysis

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → ADHD Mode settings
- Component-Breakdown.md → Section 2.9

**Dependencies:** Task 2.5.1

**Testing:**
- [ ] Advanced buttons hidden
- [ ] Core buttons visible
- [ ] Advanced options still accessible (nested)
- [ ] Clutter reduced

---

### 2.6 FOCUS MODE (3-4 hours)

#### Task 2.6.1: Focus Mode Toggle
**Time:** 1 hour

**Description:** Add Focus Mode toggle (unlocked at M4).

**Acceptance Criteria:**
- [ ] Focus Mode toggle in Settings (M4+)
- [ ] Description: "Single question, minimal distractions. Hide history/settings."
- [ ] Default: OFF
- [ ] Takes effect immediately

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Focus Mode
- Component-Breakdown.md → Section 2.1

**Dependencies:** Task 2.4.1 (milestone M4)

**Testing:**
- [ ] Toggle works
- [ ] Takes effect immediately
- [ ] Visible only at M4+

---

#### Task 2.6.2: One-Question-at-a-Time Layout
**Time:** 1 hour

**Description:** Show only current question/answer when Focus Mode ON.

**Acceptance Criteria:**
- [ ] Hide history sidebar/tab
- [ ] Hide settings option (still accessible via button)
- [ ] Show only question input + answer section
- [ ] Minimal UI (top bar reduced)
- [ ] Navigation to history available but not prominent
- [ ] Full-screen question input experience

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.ms → Focus Mode

**Dependencies:** Task 2.6.1

**Testing:**
- [ ] History hidden
- [ ] Settings hidden but accessible
- [ ] Question/answer section prominent
- [ ] Focus on current question

---

#### Task 2.6.3: Minimal UI Show/Hide
**Time:** 1.5 hours

**Description:** Hide optional UI elements in Focus Mode.

**Acceptance Criteria:**
- [ ] Hide confidence scores
- [ ] Hide pattern suggestions
- [ ] Hide follow-up prompts
- [ ] Hide technique explanations
- [ ] Keep: Answer, rating, copy/regenerate buttons
- [ ] Quiet Mode behavior preserved

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Focus Mode

**Dependencies:** Task 2.6.1, 2.3 (Quiet Mode)

**Testing:**
- [ ] Optional elements hidden
- [ ] Essential elements visible
- [ ] Quiet Mode still works with Focus Mode

---

### 2.7 EXPORT DIALOGUE (3-4 hours)

#### Task 2.7.1: Markdown Export
**Time:** 1 hour

**Description:** Export dialogue to Markdown format.

**Acceptance Criteria:**
- [ ] Dialogue → [Export] button
- [ ] Select Markdown format
- [ ] Generate file with dialogue content
- [ ] Headers for each round
- [ ] Model names as subheaders
- [ ] Content preserved, formatting applied
- [ ] Download or copy to clipboard

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Markdown export
- API-Endpoints-Specification.md → POST /history/export

**Dependencies:** Dialogue system

**Testing:**
- [ ] Export generates valid Markdown
- [ ] Content complete and accurate
- [ ] Download works
- [ ] Format visually appealing

---

#### Task 2.7.2: Text Export
**Time:** 1 hour

**Description:** Export dialogue to plain text format.

**Acceptance Criteria:**
- [ ] Plain text output (no formatting)
- [ ] Clear delimitation between speakers
- [ ] Timestamps included
- [ ] Full content preserved
- [ ] Download or copy

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Text export

**Dependencies:** Task 2.7.1

**Testing:**
- [ ] Export generates plain text
- [ ] Delimiters clear
- [ ] All content included

---

#### Task 2.7.3: Copy to Clipboard
**Time:** 1 hour

**Description:** Quick copy dialogue to clipboard in default format.

**Acceptance Criteria:**
- [ ] One-click copy to clipboard
- [ ] Markdown default, option for text/HTML
- [ ] Visual feedback (toast: "Copied!")
- [ ] Works on all devices
- [ ] Preserves formatting

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Copy to clipboard
- Component-Breakdown.md → Toast notifications

**Dependencies:** Task 2.7.1, 2.7.2

**Testing:**
- [ ] Copy works
- [ ] Correct format pasted
- [ ] Toast feedback shown
- [ ] Works on mobile/desktop

---

### 2.8 HISTORY IMPROVEMENTS (8-10 hours)

#### Task 2.8.1: Full-Text Search
**Time:** 2 hours

**Description:** Implement search functionality in History.

**Acceptance Criteria:**
- [ ] Search box on History screen
- [ ] Real-time search as user types
- [ ] Search by: question text, answer text, tags, dates
- [ ] Results ranked by relevance
- [ ] Highlight search terms in results
- [ ] Clear search button
- [ ] Suggests as user types (optional)

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → History Filters
- API-Endpoints-Specification.md → GET /history
- Component-Breakdown.md → Section 8.1

**Dependencies:** History system

**Testing:**
- [ ] Search finds relevant results
- [ ] Highlighting works
- [ ] Performance acceptable (< 500ms)
- [ ] Mobile search functional

---

#### Task 2.8.2: Advanced Filters
**Time:** 2 hours

**Description:** Implement filter dropdowns (model, rating, date, type, tags).

**Acceptance Criteria:**
- [ ] Filter by Model (Claude, GPT, Perplexity, etc.)
- [ ] Filter by Rating (1-5 stars)
- [ ] Filter by Date (Last week, month, custom range)
- [ ] Filter by Question Type (inferred categories)
- [ ] Filter by Tags (multi-select)
- [ ] Combine multiple filters
- [ ] Active filter count displayed
- [ ] Clear filters button

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.ms → History Filters
- API-Endpoints-Specification.md → GET /history

**Dependencies:** Task 2.8.1

**Testing:**
- [ ] Each filter works independently
- [ ] Multiple filters combine correctly
- [ ] Filter UI clear and accessible
- [ ] Performance acceptable

---

#### Task 2.8.3: Sort Options
**Time:** 1 hour

**Description:** Implement sort functionality (recency, rating, usefulness).

**Acceptance Criteria:**
- [ ] Sort by Recency (newest first, default)
- [ ] Sort by Rating (highest first)
- [ ] Sort by Usefulness (engagement metric)
- [ ] Ascending/descending toggle
- [ ] Active sort indicator
- [ ] Works with filters

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → History
- API-Endpoints-Specification.md → GET /history

**Dependencies:** History system

**Testing:**
- [ ] All sort options work
- [ ] Direction toggle works
- [ ] Combines with filters
- [ ] Performance acceptable

---

#### Task 2.8.4: Tag System
**Time:** 2 hours

**Description:** Implement user-created and system-generated tags.

**Acceptance Criteria:**
- [ ] System generates tags (career, product, research, etc.)
- [ ] User can add custom tags
- [ ] Tag suggestions based on content
- [ ] Multi-tag per question/dialogue
- [ ] Tags editable/removable
- [ ] Filter by tag
- [ ] Tag management view (rename, merge, delete)

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → History
- API-Endpoints-Specification.md → GET /history/tags
- Component-Breakdown.md → Section 8.1

**Dependencies:** History system

**Testing:**
- [ ] Tags generated and saved
- [ ] User tags added correctly
- [ ] Filter by tag works
- [ ] Tag management functional

---

#### Task 2.8.5: Patterns Tab Integration
**Time:** 2 hours

**Description:** Integrate Patterns tab into History screen.

**Acceptance Criteria:**
- [ ] Patterns tab shows detected learning patterns
- [ ] Pattern type, text, confidence, data points shown
- [ ] User can accept or dismiss patterns
- [ ] Applied patterns used for future routing
- [ ] Pattern history maintained
- [ ] Quarterly summary accessible

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.ms → Patterns
- API-Endpoints-Specification.md → GET /patterns
- Component-Breakdown.md → Section 8.2

**Dependencies:** Learning system, Task 1.3.3

**Testing:**
- [ ] Patterns displayed
- [ ] Accept/dismiss works
- [ ] Applied patterns affect routing
- [ ] Quarterly summary generated

---

#### Task 2.8.6: Similar Questions Detection
**Time:** 1.5 hours

**Description:** Show similar past questions in History.

**Acceptance Criteria:**
- [ ] "You've asked about X N times" suggestion
- [ ] Link to view all similar questions
- [ ] Similarity scoring algorithm
- [ ] Group similar questions together
- [ ] Show past ratings on similar

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Similar Questions
- API-Endpoints-Specification.md → POST /history/questions/similar

**Dependencies:** History system, similarity algorithm

**Testing:**
- [ ] Similar questions detected
- [ ] Grouping works
- [ ] Past ratings shown
- [ ] Suggestions helpful

---

### 2.9 SETTINGS REORGANIZATION (4-5 hours)

#### Task 2.9.1: Settings Tabs Structure
**Time:** 1 hour

**Description:** Reorganize Settings into logical tabs.

**Acceptance Criteria:**
- [ ] Basics tab: Default model, transparency, Quiet Mode, feedback style, output format
- [ ] Advanced tab: Technique limits, emotional normalization, auto-apply patterns, export format
- [ ] ADHD tab (M4+): All ADHD Mode toggles
- [ ] Account tab (M5+): API key management, account rotation
- [ ] About tab: Version, changelog, help links

**Relevant Specs:**
- Component-Breakdown.md → Section 9 Settings
- Phase-11-FINAL-SPECIFICATION.md → Settings

**Dependencies:** Task 2.4.1 (milestones)

**Testing:**
- [ ] Tabs display correctly
- [ ] Visibility per milestone
- [ ] Tab navigation works

---

#### Task 2.9.2: Model Preference Setting
**Time:** 1 hour

**Description:** Add model preference dropdown in Basics tab.

**Acceptance Criteria:**
- [ ] Dropdown: Opus-Fast (default), Opus-Thinking, Haiku, Auto
- [ ] Description: "Default model for questions not requiring routing"
- [ ] Affects future routing unless overridden
- [ ] Saved to user settings

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Settings
- Component-Breakdown.md → Section 9.1

**Dependencies:** Routing system

**Testing:**
- [ ] Setting saved
- [ ] Affects routing decisions
- [ ] Override works

---

#### Task 2.9.3: Transparency Level Setting
**Time:** 1 hour

**Description:** Add transparency level selection (Minimal/Normal/Full).

**Acceptance Criteria:**
- [ ] Radio buttons: Minimal, Normal (default), Full
- [ ] Minimal: Only answers shown, no metadata
- [ ] Normal: Routing + techniques shown, explanations hidden by default
- [ ] Full: All reasoning, confidence, technique explanations visible
- [ ] Changes take effect immediately
- [ ] Respects Quiet Mode (Quiet Mode overrides)

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.md → Settings
- Component-Breakdown.md → Section 9.1

**Dependencies:** UI rendering system

**Testing:**
- [ ] Each level shows correct information
- [ ] Changes take effect
- [ ] Quiet Mode takes precedence

---

#### Task 2.9.4: Feedback Style Setting
**Time:** 1 hour

**Description:** Add feedback style selection (Explicit/Inferred).

**Acceptance Criteria:**
- [ ] Explicit: Structured feedback (checkboxes: too long, wrong model, etc.)
- [ ] Inferred (default): Open comment box, system infers details
- [ ] Affects feedback UI after answer
- [ ] User preference saved

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.ms → Settings
- Component-Breakdown.md → Section 9.1

**Dependencies:** Feedback system

**Testing:**
- [ ] Each style displays correctly
- [ ] Data collected same way
- [ ] User preference saved

---

#### Task 2.9.5: Technique Limits Setting
**Time:** 1 hour

**Description:** Add per-model technique limit configuration (Advanced tab, M2+).

**Acceptance Criteria:**
- [ ] Sliders for Haiku (6), Opus-Fast (9), Opus-Thinking (6)
- [ ] Min: 3, Max: 15 per slider
- [ ] Current limits shown
- [ ] Changes take effect immediately
- [ ] System warns if limit too low
- [ ] User preference saved

**Relevant Specs:**
- Phase-11-FINAL-SPECIFICATION.ms → Settings
- Component-Breakdown.md → Section 9.1

**Dependencies:** Technique system

**Testing:**
- [ ] Sliders adjust limits
- [ ] Warnings shown for too-low limits
- [ ] Applied to future questions

---

### 2.10 REMAINING FRONTEND TASKS

#### Task 2.10.1: Onboarding Flow (2-3 hours)
Implement walkthrough (3 steps), skippable, video tutorials optional

#### Task 2.10.2: Profile/Account Screen (2 hours)
User info, password change, account deletion, export data

#### Task 2.10.3: Help & Documentation (2 hours)
Help button on every screen, tooltips, FAQ section, glossary

---

---

## CATEGORY 3: LEARNING SYSTEM ENHANCEMENT (10-15 hours)

### 3.1 Model Performance Tracking (4-5 hours)

#### Task 3.1.1: Per-Model Rating Aggregation
Track ratings by model (Claude vs GPT vs Perplexity)

#### Task 3.1.2: Question-Type × Model Analysis
Analyze which models perform best for which question types

#### Task 3.1.3: Learned Model Preferences
Suggest models based on past satisfaction

---

### 3.2 Dialogue Mode Effectiveness (3-4 hours)

#### Task 3.2.1: Goal→Mode Effectiveness Tracking
Track which mode was effective for which goal

#### Task 3.2.2: Mode Recommendation Refinement
Improve recommendations based on historical effectiveness

---

### 3.3 Pattern Surface & Quarterly Summary (3-4 hours)

#### Task 3.3.1: Pattern Detection Logic
Implement threshold-based pattern detection (10+ data points)

#### Task 3.3.2: Quarterly Summary Generation
Generate end-of-quarter pattern report

---

---

## CATEGORY 4: TESTING (Phase 15 - 20-30 hours)

### 4.1 Multi-AI Dialogue Tests (15 hours)
- 50 test cases (10 per mode × 5 modes)
- Test goal→mode mapping
- Test button interactions
- Test auto-stop conditions
- Test quality scoring

### 4.2 Account Rotation Tests (4 hours)
- Token depletion + auto-swap
- Mixed provider swaps
- Context transfer verification

### 4.3 Feature Unlock Tests (3 hours)
- Milestone progression
- Feature visibility per milestone

### 4.4 E2E Flow Tests (8+ hours)
- Translate → Route → Techniques → Answer
- Multi-AI dialogue flow
- Account rotation during dialogue

---

## SUMMARY BY CATEGORY

| Category | Hours | Status |
|----------|-------|--------|
| Backend Core Systems | 50 | ⏳ Ready |
| Frontend Core UI | 70 | ⏳ Ready |
| Learning System | 12 | ⏳ Ready |
| Testing | 25 | ⏳ Phase 15 |
| **Total** | **157** | **Ready for Phase 13** |

---

**Status: COMPLETE**

**Next task: Developer Onboarding Guide**
