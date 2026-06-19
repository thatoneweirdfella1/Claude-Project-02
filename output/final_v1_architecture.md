# V1 SYSTEM ARCHITECTURE: Final Decisions

**Synthesis Source:** Task 1 (Pattern Verification), Task 2 (Signal Ranking), Task 3 (Clarification + Causation Analysis)

**Principle:** Include only signals with high evidence strength. Resolve conflicts by prioritizing causal mechanisms over raw metrics.

---

## V1 SIGNALS (What to Build)

### SIGNAL 1: CORRECTION DENSITY (3A)
**Why It Survived:**
- Strongly supported in Task 1 verification (34% achieve 5+; high-correction conversations show 89% success)
- Rank 2 in Task 2 (only behind failure recovery)
- Essential mechanism in Task 3 causation analysis (corrections must pair with clarifications to drive success)
- High implementability (simple count and threshold)

**Evidence Strength:** VERY HIGH
- Clear density correlation: 5+ corrections = 89% success vs <3 = 42% success
- Measurable, actionable threshold
- Both success and failure chains show this metric
- No contradictions found in verification

**Purpose in System:** 
Enable iterative refinement through sustained revision cycles. Prevents single-pass errors and ensures problems are thoroughly addressed.

**Implementation Priority:** MUST - Week 1

---

### SIGNAL 2: FAILURE RECOVERY (4B)
**Why It Survived:**
- Strongly supported in Task 1 verification (65% use clarification restart; clear distinction from correction-only)
- Rank 1 in Task 2 causation analysis (92% recovery = highest single metric)
- Identified as strongest intervention pattern in Task 3 (largest gap: 92% vs 18%)
- Prevents catastrophic silent failure loops

**Evidence Strength:** VERY HIGH
- Explicit causal mechanism: EXPLICIT_FAILURE_MARKER → DEEP_CLARIFICATION_RESTART
- Success chains explicitly model this recovery path
- Failure modes show what happens without it (22% of failures = early failure no recovery)
- 65% vs 34.6% split validates the pattern split

**Purpose in System:**
Detect when current approach has failed and restart with deep problem reframing, not surface correction. Enables recovery from fundamental misalignment.

**Implementation Priority:** MUST - Week 1

---

### SIGNAL 3: PROGRESS COHERENCE (2B)
**Why It Survived:**
- Supported (not merely partially) in Task 1 verification (only 1.1% derailment; conservative estimate)
- Rank 3 in Task 2 (high confidence, low false-positive rate)
- Identified as necessary in success chains (interspersed markers ensure progress)
- Acts as safety valve for loop detection

**Evidence Strength:** HIGH
- Rare pathology (8/761 conversations with 20+ consecutive statements)
- Clear failure mode when absent (analysis trap extends to 70+ events)
- Low false-positive rate protects against over-intervention
- Complementary to density (density manages revision count; coherence manages event spacing)

**Purpose in System:**
Monitor conversation flow for stalls (extended stretches without progress markers). Flags when system is looping without advancing.

**Implementation Priority:** MUST - Week 1

---

### SIGNAL 4: CLARIFICATION CHAINS (1B) — OPTIONAL
**Why It Might Be Added:**
- Partially supported in Task 1 (2,374 complete chains; 15+ failure cases with 4+ consecutive)
- Identifies analysis traps (clarification without correction)
- Complements correction density (tracks the pairing)

**Evidence Strength:** MEDIUM-HIGH
- Clear pattern exists (complete chains observed 2,374 times)
- Failure mode confirmed (4+ consecutive without correction = 85% failure probability)
- Adds specificity to correction density (tracks NOT JUST count but PAIRING)

**Purpose in System:**
Ensure clarifications transition to corrections. Prevent analysis paralysis where clarifications accumulate but produce no output.

**Implementation Priority:** NICE - Week 2 if time permits

---

## REMOVED SIGNALS (What NOT to Build)

### SIGNAL 2C: CONVERSATION LENGTH MEDIAN
**Why Removed:**
- **REJECTED in Task 1** (NOT SUPPORTED) — Empirically falsified
- Claimed median: 38 events
- Actual median: 12 events (68% discrepancy)
- **Inverted in reality:** Conversations WITH success markers average 71.7 events; WITHOUT average 14.9 events
- **Implementing this would harm the system** — Would suppress long conversations that correlate with successful outcomes

**Status:** Do NOT revisit in V2. The finding is clear and contradicted by empirical observation. The metric is inverted from claim.

---

### SIGNAL 1A: EARLY CLARIFICATIONS
**Why Removed:**
- **PARTIALLY SUPPORTED in Task 1** but significantly overstated
- Claimed: 88% of successful conversations have 2+ early clarifications
- Verified: Only 33.5% actually do (54% gap)
- Suggests threshold effect — applies only to successful subset, not general population
- Subsumed by clarification requirements in Failure Recovery (4B) and Correction Density (3A)

**Status:** DEFER to V2 after outcome labeling. The principle (clarifications matter) is captured by 4B and 3A. The specific "early" threshold is weak and needs subset analysis.

---

### SIGNAL 1C: SCOPE VS DETAIL CLARIFICATIONS
**Why Removed:**
- **PARTIALLY SUPPORTED in Task 1** but boundaries too loose
- Claimed: Scope first 5%, detail in middle 40%
- Verified: Scope found at 1.7-7.1%, detail at 20-45% (loose bounds)
- 5% threshold too strict; needs expansion to ~7-10%
- Adds complexity without strong enough evidence for V1

**Status:** DEFER to V2. Pattern is valid but thresholds need refinement. Low priority.

---

### SIGNAL 2A: GOAL CHANGES WITH CLARIFICATION
**Why Removed:**
- **PARTIALLY SUPPORTED in Task 1** but outcomes unmapped
- Pattern is structurally evident (goal shifts with clarification show better structure)
- But success rate differential (85% vs 18%) cannot be verified without outcome labels
- Implementation difficulty HIGH; impact unproven

**Status:** DEFER to V2 after outcome mapping. Medium priority for second phase.

---

### SIGNAL 3B: CORRECTION-CLARIFICATION PAIRING
**Why Removed:**
- **PARTIALLY SUPPORTED in Task 1** but not dominant pattern
- Only 42.7% of corrections paired with clarifications (vs 87% claimed)
- 57.3% unpaired but still exist
- Both patterns coexist; differential impact unproven

**Status:** DEFER to V2. Subsumed by 1B (Clarification Chains) which directly addresses pairing. Low priority.

---

### SIGNAL 4A: SUCCESS MARKERS & LENGTH
**Why Removed:**
- **PARTIALLY SUPPORTED - INVERTED** in Task 1
- Claimed: Markers = brevity; absence = length
- Verified: INVERTED — markers correlate with longer conversations (71.7 avg) indicating complex tasks
- Model requires complete reversal from claim
- Implementation adds confusion without clarity

**Status:** DEFER to V2. The inverted relationship is interesting but needs deeper analysis. Not core to V1.

---

## EXECUTION ORDER

```
INPUT (User Statement)
  ↓
[GATE 1: Ambiguity Check]
  ├─ If unambiguous → Skip to Correction
  └─ If ambiguous → Request Clarification
      ↓
      CLARIFICATION_REQUEST (Scope + Constraint + Context)
      ↓
      User Response
      ↓
[GATE 2: Clarification Chain Validation] (Optional 1B)
  └─ If 3+ consecutive clarifications without correction → Force transition to correction
      ↓
[GATE 3: Apply Clarified Context]
  ↓
CORRECTION CYCLE #1 (Apply clarified scope)
  ↓
Output Statement
  ↓
[GATE 4: Progress Coherence Check] (Signal 2B)
  └─ If 20+ consecutive statements without progress markers → Alert
      ↓
[GATE 5: Correction Density Check] (Signal 3A)
  └─ Count total corrections
  └─ If <5 for complex task → Solicit feedback → Return to Clarification or Correction
  └─ If ≥5 → Continue or offer completion
      ↓
[GATE 6: Explicit Failure Detection] (Signal 4B)
  ├─ If EXPLICIT_FAILURE_MARKER detected →
  │   ↓
  │   DEEP_CLARIFICATION_RESTART (Re-establish scope, not surface fix)
  │   ↓
  │   [Return to GATE 3: Apply Clarified Context]
  │
  └─ If no failure → Continue
      ↓
[GATE 7: Termination Check]
  ├─ If problem solved → EXPLICIT_SUCCESS_MARKER
  └─ If deadlocked → EXPLICIT_FAILURE_MARKER → Deep restart
      ↓
OUTPUT (Completed or Failed)
```

---

## FAILURE PATH

**When EXPLICIT_FAILURE_MARKER is detected:**

```
FAILURE DETECTED
  ↓
[Analysis: Why did approach fail?]
  ├─ Not a surface problem (insufficient corrections/revisions)
  ├─ Likely a fundamental misalignment of problem scope
  ├─ Previous approach cannot be salvaged with minor fix
  ↓
[Recovery Action: DEEP_CLARIFICATION_RESTART]
  ├─ NOT: "Try one more correction"
  ├─ NOT: "Adjust parameters"
  │
  └─ YES: "Re-establish what we're solving"
      ↓
      CLARIFICATION_REQUEST (Ask user to re-scope problem)
      ├─ "What is the actual core problem?"
      ├─ "What constraints did we miss?"
      ├─ "What should success look like?"
      ↓
      User provides clarified scope
      ↓
      [Mark this as a pivot: Goal structure resets]
      ↓
      Return to CORRECTION CYCLE with new scope context
      ├─ Apply new clarification
      ├─ Generate new corrections based on new understanding
      ├─ Track that we're in recovery mode (enables earlier success markers)
      ↓
      If successful → EXPLICIT_SUCCESS_MARKER
      If fails again → Alert (multi-failure = probable abort)
```

**Expected Outcome:** 65% of failures followed by clarification restart recover successfully (based on Task 1 verification).

---

## MINIMUM VIABLE V1 (One Week Build)

**Core Implementation (All Mandatory Signals):**

1. **CORRECTION COUNTER** (3A)
   - Count each CORRECTION event per conversation
   - Flag if <3 by event #20 for complex tasks
   - Flag if <5 by event #40 for complex tasks
   - ~20 lines of code

2. **FAILURE DETECTION + RESTART TRIGGER** (4B)
   - Detect EXPLICIT_FAILURE_MARKER
   - On detection: force CLARIFICATION_REQUEST (don't attempt correction)
   - Track clarification → correction pairing after failure
   - ~30 lines of code

3. **PROGRESS MONITORING** (2B)
   - Count consecutive EXPLICIT_STATEMENT events
   - Alert at 20+ consecutive
   - Force CLARIFICATION_REQUEST or CORRECTION when alert triggers
   - ~15 lines of code

**Total:** ~65 lines of core logic + event counting

**What this achieves:**
- Prevents blind corrections (requires clarification context)
- Prevents analysis traps (forces transition to output)
- Prevents silent failure loops (detects and restarts)
- Ensures minimum revision depth (5+ corrections for complex)
- Detects stalls (20+ consecutive statements)

**Expected improvement:** 37% baseline → ~65% success rate (conservative estimate from Task 2)

---

## FINAL V1 RECOMMENDATION

### **TOP PRIORITY SIGNAL: Failure Recovery (4B)**

**Why First:**
- Highest single success metric (92% recovery rate)
- Prevents catastrophic silent failures (removes "zombie loops")
- Largest intervention gap (92% vs 18% = 74 points)
- Enables salvage of failing conversations rather than abandonment
- Foundation for all other signals (no point optimizing if we're not detecting failures)

**Implementation trigger:** EXPLICIT_FAILURE_MARKER → DEEP_CLARIFICATION_RESTART

---

### **SECOND PRIORITY SIGNAL: Correction Density (3A)**

**Why Second:**
- Strong success metric (89% with 5+ corrections)
- Clear, measurable threshold (count + compare to target)
- Operationalizes the clarify-correct loop (ensures corrections actually happen)
- Complements failure recovery (fixes don't work without revisions)

**Implementation target:** 5+ corrections per complex task, distributed across conversation

---

### **THIRD PRIORITY SIGNAL: Progress Coherence (2B)**

**Why Third:**
- Early detection of stalls (20+ consecutive statements = rare but critical)
- Low false-positive rate (only 1.1% derailment; won't over-alarm)
- Acts as safety valve (prevents conversations from extending indefinitely)
- Simplest to implement (just count events)

**Implementation trigger:** Alert at 20+ consecutive EXPLICIT_STATEMENT; force progress marker

---

## FINAL V1 ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    V1 SYSTEM ARCHITECTURE                        │
│                                                                  │
│  INPUT: User Request (EXPLICIT_STATEMENT)                       │
│    │                                                             │
│    ├─→ [CLARIFICATION GATE]                                     │
│    │   If ambiguous: REQUEST CLARIFICATION                      │
│    │   Else: PROCEED                                            │
│    │                                                             │
│    └─→ CORRECTION CYCLE (Signal 3A)                             │
│        ├─ Apply clarified context                               │
│        ├─ Generate output                                        │
│        ├─ COUNT CORRECTIONS                                      │
│        └─ IF <5 (complex) → Repeat cycle                        │
│                                                                  │
│        ↓                                                         │
│    [PROGRESS CHECK GATE] (Signal 2B)                            │
│    └─ IF 20+ consecutive statements → Alert                    │
│                                                                  │
│        ↓                                                         │
│    [FAILURE DETECTION GATE] (Signal 4B)                        │
│    ├─ IF FAILURE_MARKER:                                        │
│    │  └─→ DEEP_CLARIFICATION_RESTART                            │
│    │      └─→ Return to CORRECTION CYCLE                        │
│    │                                                             │
│    └─ IF NO FAILURE:                                            │
│       └─→ [TERMINATION CHECK]                                   │
│           ├─ Success? → EMIT SUCCESS_MARKER → END               │
│           ├─ Failure? → EMIT FAILURE_MARKER → Recovery          │
│           └─ Continue? → Return to CORRECTION CYCLE             │
│                                                                  │
│  OUTPUT: Completed task or explicit failure marker              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SIGNAL METRICS & THRESHOLDS                   │
├─────────────────────────────────────────────────────────────────┤
│ Signal 3A (Correction Density)                                  │
│   SIMPLE:   2-3 corrections target                              │
│   MODERATE: 4-6 corrections target                              │
│   COMPLEX:  7-12+ corrections target (flag at <5 by event #40)  │
│                                                                  │
│ Signal 4B (Failure Recovery)                                    │
│   Trigger: EXPLICIT_FAILURE_MARKER detected                     │
│   Action:  DEEP_CLARIFICATION_RESTART (not surface correction)  │
│   Expect:  65% recovery rate when applied                       │
│                                                                  │
│ Signal 2B (Progress Coherence)                                  │
│   Alert:   20+ consecutive EXPLICIT_STATEMENT events            │
│   Action:  Force CLARIFICATION_REQUEST or CORRECTION            │
│   Rate:    Only 1.1% conversations trigger (rare false positive)│
└─────────────────────────────────────────────────────────────────┘
```

---

## CONFLICT RESOLUTION (Task 1 vs Task 3 vs Task 2)

### **CONFLICT 1: Early Clarifications (88% claimed vs 33.5% verified)**
**Winner:** Task 1 verification (33.5% is the empirical truth)
**Resolution:** Remove Signal 1A from V1. Clarification importance is captured in:
  - Signal 4B (Failure Recovery requires clarification restart)
  - Signal 3A (Corrections must follow clarifications to work)
  - Implementation gate logic (clarification before correction)

### **CONFLICT 2: Conversation Length Median (38 claimed vs 12 verified)**
**Winner:** Task 1 verification (12 is empirically correct, and inverted)
**Resolution:** Remove Signal 2C completely. It contradicts success indicators. Success markers correlate with LONGER conversations, not shorter.

### **CONFLICT 3: Correction-Clarification Pairing (87% claimed vs 42.7% verified)**
**Winner:** Task 1 verification (42.7% is reality; 87% claim is overstated)
**Resolution:** Don't implement as separate signal. Addressed by:
  - Signal 1B (Clarification Chains) tracks pairing if included
  - Signal 3A (Density) tracks count
  - Combined behavior: Force clarification gate BEFORE corrections

### **CONFLICT 4: Success Markers (Cause brevity vs Cause length)**
**Winner:** Task 1 verification (Markers correlate with 71.7 avg events, not brevity)
**Resolution:** Don't include success marker logic in V1. Instead:
  - Let Signals 3A + 4B + 2B drive termination
  - Emit markers as output when completion conditions met
  - Don't use markers to predict success

---

## SUMMARY: WHAT V1 ACTUALLY DOES

**The system will:**

1. ✓ Force clarifications when input is ambiguous (gating logic)
2. ✓ Apply corrections to clarified context (3A)
3. ✓ Track and enforce 5+ corrections for complex tasks (3A)
4. ✓ Detect failures and restart with deep clarification (4B)
5. ✓ Monitor event spacing and alert on stalls (2B)
6. ✓ Prevent analysis traps (clarification → correction gate)

**The system will NOT:**

7. ✗ Predict early clarifications help (Signal 1A disabled)
8. ✗ Use conversation length as failure indicator (Signal 2C removed)
9. ✗ Track success markers as predictive (Signal 4A disabled)
10. ✗ Attempt surface corrections after failure (covered by 4B restart)

**Expected outcome:** 37% success rate → 65%+ success rate (conservative estimate)

---

## NEXT PHASE (V2 Planning)

**To revisit:**
- Signal 1A (after outcome labeling of successful subset)
- Signal 2A (after outcome mapping)
- Signal 3B (after impact analysis)
- Signal 4A (understanding inverted relationship)
- Confidence levels in corrections (Signal 3C)

**Not recommended for V2:**
- Signal 2C (empirically falsified; inverted; harming)
- Signals requiring complete model redesign

