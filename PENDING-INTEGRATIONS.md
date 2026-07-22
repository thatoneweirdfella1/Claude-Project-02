# PENDING-INTEGRATIONS.md

**Status**: BLOCKING TASKS — These must be completed before claiming the app is feature-complete.

**Purpose**: Record two specific test suites and data integrations from prior Claude Code sessions that were discovered during Divergence consolidation work but not yet wired into the codebase.

**How to use this file**:
- When you ask "What's not finished?", this file is the answer for these two tasks
- Each task specifies which GitHub files to edit
- When a task is done, move it to COMPLETED section and commit with reference to this file
- Never delete completed tasks — keep them for reference

---

## TASK 1: 3-State Methodology Validation & Integration

**Source**: Prior Claude Code session analyzing `cleaned_workflow.md` (decision record generation from workflow conversation)

**What it is**: A tested problem-solving methodology that works specifically for ADHD workflows:
- **DEFINE phase**: Lock the problem statement (prevents drift)
- **TEST phase**: Run solution, detect failures, critique output
- **STABILIZE phase**: Verify claims, remove unverifiable assertions, freeze methodology

**Why it matters**: 
- Reduces goal drift by locking problem statements
- Catches hallucinations/errors during TEST phase via self-critique
- Produces 72/100+ reliability on real problems (tested on Agenda 2030 research task)
- Directly reduces friction and errors for ADHD users

**Data to integrate** (from conversation):

```
ADHD CONSTRAINTS DISCOVERED:
1. Zero procedural memory retention
2. Cognitive shutdown under load
3. Working memory limits (false choices cause loops)
4. Pressure-induced execution failure
5. Loop-without-closure pattern
6. Dopamine/reward driven motivation
7. Context loss on long sessions
8. Sensitivity to vague instructions
9. Paralysis when multiple paths exist

COMMUNICATION RULES THAT WORK:
1. Directive-only (no "if you want to")
2. Extreme brevity (max ~10 lines)
3. No explanations unless asked
4. No branching paths
5. Single chosen path (model decides, not user)
6. Visible progress markers
7. Locked problem statement (repeat it at each phase)

FAILURE MODES TO AVOID:
1. Clarification questions (triggers expansion)
2. Optional statements (triggers infinite calculation)
3. Long explanations (triggers shutdown)
4. Back-and-forth loops (triggers disengagement)
5. Goal drift mid-session (requires restart)

HALLUCINATION REDUCTION TECHNIQUES:
1. Fact-checking outputs during TEST phase
2. Confidence scoring on claims
3. Internal critique phase (AI reviews own work)
4. Locked problem statements prevent drift
5. Remove unverifiable assertions before finalizing
```

**Files to edit**:

1. **`src/stores/accountStore.ts`**
   - Add field: `preferredMethodology: "3-state" | "standard" | "auto"` (user preference)
   - Add action: `setMethodologyPreference(pref)`
   - Add field: `methodologyAuditLog: MethodologyEntry[]` (track which methodology was used for each session)
   - Type: `MethodologyEntry = { sessionId, methodologyUsed, phase, timestamp, critique }`

2. **`src/stores/sessionStore.ts`**
   - Add field: `currentPhase: "define" | "test" | "stabilize" | null` (tracks where we are in 3-state)
   - Add field: `lockedProblem: string` (the DEFINE phase output that doesn't change)
   - Add field: `phaseProgress: { define: boolean, test: boolean, stabilize: boolean }`
   - Add action: `setPhase(phase, lockedProblem?)`
   - Add action: `recordPhaseCompletion(phase, critique, confidenceScore)`

3. **`src/components/composer/ControlRow.tsx`** (or new file `MethodologySelector.tsx`)
   - Add dropdown: Select "3-State Methodology" vs "Standard" vs "Auto-detect"
   - When 3-State selected, show phase indicator badge (DEFINE / TEST / STABILIZE)
   - On send: detect which phase user is in based on conversation history

4. **`src/services/methodologyEngine.ts`** (NEW FILE)
   - Export function: `detectPhase(conversation: ConversationMessage[], lockedProblem: string): Phase`
   - Export function: `shouldEnterTestPhase(definitionDone: boolean): boolean`
   - Export function: `shouldEnterStabilizePhase(testingComplete: boolean): boolean`
   - Export function: `applyADHDCommunicationRules(text: string): string` (makes output directive-only, ultra-brief)
   - Export function: `auditForHallucinations(claimText: string, supportingEvidence: string[]): HallucinationAudit`

5. **`src/components/streaming/TransparencyCard.tsx`** (add 3-state awareness)
   - When in TEST phase: Show "Self-Critique" section automatically
   - Display hallucination audit results from TEST phase
   - Show confidence scores on claims

6. **`CLAUDE.md`** (add section)
   ```markdown
   ## 3-State Methodology (ADHD-Optimized)
   
   When user selects "3-State Methodology":
   - DEFINE phase: Lock problem statement, repeat it in each message
   - TEST phase: Run solution, self-critique, audit for hallucinations
   - STABILIZE phase: Verify claims against evidence, remove unverifiable, freeze solution
   
   Apply ADHD communication rules (directive-only, extreme brevity, visible progress)
   
   Track methodology usage in accountStore.methodologyAuditLog
   ```

**How to know when done**:
- [ ] User can select 3-State Methodology from dropdown
- [ ] Phase indicator shows current phase (DEFINE/TEST/STABILIZE)
- [ ] Problem statement stays locked across all messages in DEFINE
- [ ] TEST phase automatically shows self-critique section
- [ ] Hallucination audit runs and displays during TEST
- [ ] Confidence scores appear on claims
- [ ] ADHD communication rules applied to all outputs when 3-State is active
- [ ] Methodology usage logged to accountStore
- [ ] User can switch between Standard and 3-State mid-session
- [ ] Audit shows which methodology was used for each past session

**Acceptance criteria**:
- 3-State methodology selectable in composer
- Phase tracking works (tested through a full DEFINE → TEST → STABILIZE cycle)
- ADHD rules applied (brevity, directiveness verified)
- Hallucination audit displays and is accurate
- Methodology audit log persists across sessions

---

## TASK 2: Learnable Signal Patterns Verification & Integration

**Source**: Prior Claude Code session analyzing learnable signal patterns for accuracy degradation based on multi-signal feedback hierarchy

**What it is**: A learning system that:
- Captures feedback signals in hierarchy order (primary → secondary → tertiary)
- Each signal offers less accuracy but provides more learning
- User rating is primary signal (max accuracy benefit)
- System learns user preferences by tracking which signals were used
- Accuracy degradation formula: each additional signal consulted reduces accuracy by ~10-20%

**Why it matters**:
- Directly implements CANON Feature 6-8 (rating, variables, learning)
- Reduces hallucination over time by learning from user corrections
- Tracks confidence in recommendations based on signal hierarchy
- Enables personalized model/technique routing over time

**Data to integrate** (from conversation):

```
SIGNAL HIERARCHY:
1. PRIMARY (Max benefit, immediate feedback)
   - User star rating (1-5)
   - Rating comment ("What could be better?")
   - Confidence score given by user

2. SECONDARY (Moderate benefit, requires inference)
   - Whether answer was used (proxy: time to next question)
   - Edit distance (did user modify the answer?)
   - Model switching (did user pick a different model after this?)
   - Technique switching (did user add/remove techniques after this?)

3. TERTIARY (Lower benefit, noisy inference)
   - Session continuation vs. close (implied satisfaction)
   - Download/export choice (implied value)
   - Search queries in same session (implied confusion)
   - Return to same topic (implied unresolved)

ACCURACY DEGRADATION:
- Primary signal only: 100% accuracy (new feedback)
- Primary + Secondary: ~85% accuracy (inference cost)
- Primary + Secondary + Tertiary: ~70% accuracy (noise accumulation)
- No signal collected: Fallback to base model (50% accuracy)

LEARNING RULES:
- If user rates 5-stars consistently with Model X + Technique Y: increase weight for future
- If user rating drops after model switch: penalize that model for that question type
- If editing pattern shows "removed X from answer": learn user dislikes X format
- If download rate is high for certain model: increase its ranking
- After N signals, apply learned preferences to future routing

MAX_LEARNING_AUDIT_ENTRIES:
- Keep last 500 entries (current implementation in accountStore.ts)
- Purge oldest on overflow
- Audit log schema: timestamp, sessionId, signal type, source, confidence, outcome
```

**Files to edit**:

1. **`src/stores/types.ts`** (expand LearningAuditEntry)
   ```typescript
   type SignalType = "rating" | "comment" | "usage_time" | "edit_distance" | "model_switch" | "technique_switch" | "session_close" | "download" | "search_query" | "topic_return";
   
   interface LearningAuditEntry {
     id: string;
     timestamp: Date;
     sessionId: string;
     messageId: string;
     signalType: SignalType;
     signalValue: number | string; // rating value, time delta, edit %, etc.
     signalConfidence: 0.1 | 0.3 | 0.5 | 0.7 | 0.9; // confidence in this signal
     hierarchy: "primary" | "secondary" | "tertiary"; // which tier
     modelUsed: ModelId;
     techniquesUsed: TechniqueId[];
     outcome: "positive" | "negative" | "neutral" | "unknown";
     verified: boolean; // did we confirm this signal actually predicts success?
   }
   ```

2. **`src/stores/accountStore.ts`** (wire up learning loop)
   - Add action: `recordSignal(entry: LearningAuditEntry)`
   - Add action: `computeSignalWeight(signalType: SignalType): number` (returns 1.0, 0.85, 0.70 based on hierarchy)
   - Add action: `applyLearningRefinements(messageIds: string[], refinements: Partial<LearnedPreferences>)` (already exists but not wired)
   - Add getter: `getLearnedPreferences(): LearnedPreferences` (return current learned state)
   - Add method to purge oldest entries when audit log exceeds 500

3. **`src/components/streaming/RatingRow.tsx`** (wire to learning)
   - On star click: record PRIMARY signal
   - On comment blur: record PRIMARY signal (comment text)
   - On download click: prepare TERTIARY signal (will be recorded later when confirmed used)

4. **`src/services/learningEngine.ts`** (NEW FILE)
   - Export function: `recordSecondarySignals(sessionId, messageId, metrics: { timeDelta, editDistance, modelSwitched, techniqueSwitched })` → records SECONDARY
   - Export function: `recordTertiarySignals(sessionId, metrics: { sessionClosed, downloaded, searches, topicReturned })` → records TERTIARY
   - Export function: `computeAccuracyScore(signals: LearningAuditEntry[]): number` (0-1 scale, degrades by hierarchy)
   - Export function: `recommendModelAndTechniques(question: string, learnedPrefs: LearnedPreferences): { model, techniques, confidence }` → uses learned weights

5. **`src/stores/sessionStore.ts`** (track for secondary signals)
   - Add field: `messageTimestamps: Map<messageId, timestamp>` (for calculating time-to-next-message)
   - Add field: `messageEdits: Map<messageId, editDistance>` (for tracking if answer was modified)
   - Add action: `recordMessageEdit(messageId, editDistance)`
   - Add hook on close: send all secondary/tertiary signals to accountStore

6. **`src/components/layout/ScreenRouter.tsx`** → SessionsScreen
   - When session is closed/deleted: compute final tertiary signals (did user close session? download? search in it?)
   - Record those signals to learning audit log

7. **`src/services/debug/learningAuditViewer.ts`** (NEW FILE - debug tool)
   - Export function: `generateLearningReport(limit: 100)`: show last N signals, their hierarchy, confidence, outcome
   - Export function: `validateSignalWeights()`: audit that signals are accurately classified
   - For debugging: show which signals actually correlate with good outcomes

8. **`CLAUDE.md`** (add section)
   ```markdown
   ## Learning & Signal Hierarchy
   
   Three-tier signal system for continuous improvement:
   - PRIMARY: user rating/comment (100% weight)
   - SECONDARY: derived from behavior (85% weight)
   - TERTIARY: inferred from patterns (70% weight)
   
   Accuracy degrades with each additional signal tier (noise accumulation).
   
   Learning happens in accountStore.applyLearningRefinements() after each session.
   Track all signals in accountStore.learningAuditLog (max 500 entries, purge oldest).
   
   Router and Technique selection use learnedPreferences computed from signals.
   ```

**How to know when done**:
- [ ] LearningAuditEntry type includes all three signal hierarchies
- [ ] RatingRow records PRIMARY signals to audit log
- [ ] Secondary signals (model switch, technique switch, time delta, edits) are recorded
- [ ] Tertiary signals (session close, download, search, topic return) are recorded
- [ ] Accuracy score computed: PRIMARY=1.0, PRIMARY+SECONDARY=0.85, ALL=0.70
- [ ] LearnedPreferences updated after collecting 5+ signals
- [ ] Model/Technique router uses learnedPreferences for future recommendations
- [ ] Audit log bounded at 500 entries (purges oldest)
- [ ] Debug viewer shows signal hierarchy and weights
- [ ] Full end-to-end test: rate answer → check audit log → verify signal recorded → check accuracy score

**Acceptance criteria**:
- All three signal hierarchies working (primary/secondary/tertiary)
- Signals persist to accountStore.learningAuditLog
- Accuracy score reflects hierarchy (1.0 → 0.85 → 0.70)
- LearnedPreferences update and feed back to router/techniques
- Audit log persists across sessions and has max 500 bound
- Signal weights verified against real feedback outcomes

---

## TASK 3: Fable 5 Model Recommendation & Prompt Translation

**Source**: User uploaded `fabletranslator.ts`, `fable-translator-system-prompt.md`, and `Fable 5 Prompting Guide` requesting integration for model-aware prompt reformatting.

**What it is**: A three-part system that:
1. **Model Recommendation Engine**: Analyzes user input and suggests best model (Haiku/Sonnet/Fable)
2. **Prompt Translator**: Reformats user text to match selected model's strengths/weaknesses
3. **Context-Aware Reformatting**: Applies model-specific rules (Fable gets 5-part structure, Haiku gets compressed, Sonnet balanced)

**Why it matters**:
- Fable 5 has different optimal prompting patterns than Opus/Sonnet (goal ≠ steps, strict boundaries, evidence-citation clauses)
- Reduces friction by auto-suggesting best model for each question type
- Reduces hallucinations by reformatting prompts to match model's strengths (Fable excels at autonomous work with clear boundaries)
- Implements smart model routing per Divergence's core feature set

**Data to integrate** (from uploaded files):

```
FABLE 5 PROMPTING RULES:
- NEVER step-by-step micromanagement (punishes Fable)
- DO: Give goal (not steps), reason, boundaries, verification, format
- DO: Explicit evidence-citation requirement before reporting progress
- AVOID: Vague "be thorough" without success criteria
- AVOID: Asking Fable to narrate its reasoning (can trigger fallback to Opus)

MODEL SELECTION HEURISTICS:
- Haiku: Simple factual lookups, routine work (<5 min thinking)
- Sonnet: Balanced reasoning, tradeoff analysis, moderate complexity
- Fable: Autonomous long-horizon work, architecture decisions, difficult debugging
  
ACCURACY PATTERNS:
- Fable: High accuracy on autonomous work, first-shot correctness on complex problems
- Fable weakness: Verbosity (2.4x token output), confident fabrication in narrative
- Fable cost: $10/$50 per million tokens (2x Opus pricing)
```

**Files to edit**:

1. **`src/services/modelRecommendation.ts`** (NEW FILE)
   - Export function: `analyzeQuestion(text: string): { recommended: ModelId, reasoning: string, confidence: 0-1 }`
   - Heuristics: keyword detection (autonomous, debug, architecture), complexity scoring, task type inference
   - Returns one of: "claude-haiku-4-5" | "claude-sonnet-5" | "claude-opus-4-8"

2. **`src/services/promptTranslator.ts`** (NEW FILE, wraps fabletranslator.ts)
   - Export function: `translateForModel(rawText: string, model: ModelId, context: AppContext): Promise<string>`
   - Fable path: Run through 5-part structure translator (using uploaded `fable-translator-system-prompt.md`)
   - Opus/Sonnet path: Light cleanup or pass-through (traditional prompting still works)
   - Haiku path: Compress to essentials, drop verbose context

3. **`src/components/composer/ControlRow.tsx`** (integrate recommendation)
   - Add visual badge/chip showing recommended model (optional, faded if not selected)
   - On model dropdown change: show tooltip explaining why that model is good/not ideal for detected question type

4. **`src/components/composer/TranslateAskButton.tsx`** (wire translator)
   - Before sending: detect question type, recommend model
   - If Fable selected (or recommended): run through `promptTranslator.translateForModel()`
   - Show reformatted text option (let user see what was rewritten)
   - Send reformatted text to API with model choice

5. **`src/stores/sessionStore.ts`** (track recommendations)
   - Add field: `suggestedModel: ModelId | null` (the recommendation from analyzer)
   - Add field: `translatedPrompt: string | null` (reformatted text before sending)
   - Add action: `recordModelChoice(chosen: ModelId, suggested: ModelId, used: boolean)` (track if user follows recommendation)

6. **`CLAUDE.md`** (add section)
   ```markdown
   ## Model Recommendation & Prompt Translation
   
   When user types a question:
   1. Analyzer detects question type and recommends best model
   2. If Fable selected: reformats prompt into 5-part structure (goal, reason, boundaries, verification, format)
   3. If Haiku selected: compresses to essentials
   4. If Sonnet selected: keeps balanced detail
   
   Fable rules: goal ≠ steps, explicit boundaries, evidence-citation clauses, no step-by-step micromanagement
   
   Track recommendation accuracy: did user accept recommendation? Did chosen model succeed?
   ```

7. **Integrate uploaded files**:
   - Copy `fabletranslator.ts` content into `src/services/promptTranslator.ts` as helper
   - Load `fable-translator-system-prompt.md` as constant in promptTranslator (cached, not re-fetched each time)
   - Reference `Fable 5 Prompting Guide` as source for model-selection heuristics

**How to know when done**:
- [ ] `analyzeQuestion()` detects question type and recommends model with reasoning
- [ ] Model recommendation shown in composer (optional badge)
- [ ] `translateForModel()` works for Fable (5-part structure applied)
- [ ] `translateForModel()` works for Haiku (compression applied)
- [ ] `translateForModel()` works for Sonnet (pass-through or light cleanup)
- [ ] Fable path uses uploaded system prompt (not generating new one)
- [ ] User can see reformatted prompt before sending
- [ ] Recommendation tracking persists (did user follow suggestion?)
- [ ] Tooltip explains model choice reasoning
- [ ] End-to-end test: type complex question → get Fable recommended → see 5-part reformat → send works

**Acceptance criteria**:
- Model recommendation working (tested on variety of question types)
- Prompt translation for Fable applies all 5 parts correctly
- Prompt translation for other models doesn't break existing behavior
- User can toggle between auto-reformatted and original prompt
- Recommendation accuracy tracked (for learning which questions really need which model)
- No extra API calls for recommendation (heuristic-based, not LLM-based)

---

## COMPLETED TASKS

*(Move tasks here when done. Keep for reference.)*

---

## References

- Task 1 source: Decision Record Generation From Workflow conversation (3-state methodology validation)
- Task 2 source: Learnable Signal Patterns Verification conversation (multi-signal learning system)
- Task 3 source: User uploaded Fable files + guide (model recommendation and prompt translation)
- Tasks 1-2 reduce friction and hallucinations for ADHD users
- Tasks 1-2 implement core CANON features (Feature 6-8: Rating, Variables, Learning)
- Task 3 implements model-aware prompt optimization (Fable 5 specific integration)
- All three tasks together make Divergence app feature-complete and production-ready

---

## How to Check Status

**"What's not finished?"** → Read this file. Tasks 1, 2, and 3 are the answer.

**Auditing progress**: 
```bash
# Check how many items are complete in Task 1
grep -c "^\- \[x\]" PENDING-INTEGRATIONS.md | head -20

# Same for Task 2
grep -c "^\- \[x\]" PENDING-INTEGRATIONS.md | tail -20

# View only incomplete items
grep "^\- \[ \]" PENDING-INTEGRATIONS.md
```

**Committing completion**:
```bash
# When a checkbox is done, mark it with [x]
# Then commit with reference to this file

git add PENDING-INTEGRATIONS.md
git commit -m "[Account] Complete Task 1 phase tracking in sessionStore.ts

Wired 3-state methodology:
- DEFINE/TEST/STABILIZE phase tracking
- Locked problem statement
- Self-critique during TEST
- Hallucination audit display

Refs PENDING-INTEGRATIONS.md Task 1
Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

