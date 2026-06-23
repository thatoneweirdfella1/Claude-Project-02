# ADHD-to-AI Translator: All Yellow Items (Complete)

All 28 yellow sequences from the original checklist, combined into one document in checklist order.

---

# 2.10 — Technique Interaction Records

(See companion file `interaction_records.md` for the full 113-pair extraction. Summary below.)

**18-Technique Registry (T01–T18):**

| ID | Technique | Category |
|---|---|---|
| T01 | Permission to Say "I Don't Know" | Accuracy |
| T02 | Chain-of-Thought | Reasoning |
| T03 | Quote-First | Grounding |
| T04 | Self-Verification | Validation |
| T05 | Accuracy Role-Priming | Role |
| T06 | RAG | Grounding |
| T07 | Few-Shot Examples | Instruction |
| T08 | Instruction Hierarchy | Structure |
| T09 | Explicit Constraints | Constraints |
| T10 | Output Format Specification | Structure |
| T11 | Reasoning Decomposition | Reasoning |
| T12 | Question Reframing | Analysis |
| T13 | Assumption Surfacing | Analysis |
| T14 | Scope Limitation | Constraints |
| T15 | Meta-Prompting | Control |
| T16 | Explicit Step Counting | Reasoning |
| T17 | Confidence Scoring | Validation |
| T18 | Constraint Violation Detection | Validation |

**Totals:** 113 non-neutral pairs — 1 Conflict, 5 Dependencies, 28 Synergies, 79 Safe combinations.

**Key findings:**
- Only one Conflict: T14 + T15 (Severity 4) — never combine.
- T08 (Instruction Hierarchy) is the dependency hub — all 5 dependencies flow from it (→ T09, T10, T14, T15, T18).
- T10 is the most restricted — hard dependency on T08, only works on Opus Fast / Opus Thinking, not Haiku.
- Highest-value synergy: T03 + T04 (Amplification 5).

---

# 2.11 — Model × Technique Effectiveness Map

> **Legend:** H = High · M = Medium · L = Low · N = Not Applicable

| Technique | Haiku | Opus-Fast | Opus-Thinking |
|-----------|-------|-----------|---------------|
| T01 Permission to Say "I Don't Know" | H | M | M |
| T02 Chain-of-Thought | H | M | M |
| T03 Quote-First | H | H | H |
| T04 Self-Verification | M | H | H |
| T05 Accuracy Role-Priming | H | M | L |
| T06 RAG | H | H | H |
| T07 Few-Shot Examples | H | M | L |
| T08 Instruction Hierarchy | H | M | M |
| T09 Explicit Constraints | H | M | M |
| T10 Output Format Specification | M | M | M |
| T11 Reasoning Decomposition | H | M | M |
| T12 Question Reframing | M | H | H |
| T13 Assumption Surfacing | M | H | H |
| T14 Scope Limitation | H | M | M |
| T15 Meta-Prompting | N | M | H |
| T16 Explicit Step Counting | H | M | L |
| T17 Confidence Scoring | M | H | H |
| T18 Constraint Violation Detection | M | H | H |

**Concrete Differences Across Models:**

1. Chain-of-Thought is much more valuable on Haiku than Opus-Thinking. Haiku relies on explicit reasoning steps; Opus-Thinking performs internal reasoning without needing it prompted.
2. Few-Shot Examples matter more as model capability decreases. Haiku uses examples to calibrate format and tone it cannot infer; stronger models extract intent from description alone.
3. Meta-Prompting becomes more useful as reasoning capability increases. Haiku cannot reliably self-reflect or adjust its own strategy; Opus-Thinking can act on meta-level instructions with precision.
4. Self-Verification scales upward with model capability. Weak models that verify their own output often reinforce errors rather than catching them.
5. Extended Thinking reduces the need for reasoning scaffolds. Techniques like Reasoning Decomposition and Explicit Step Counting compensate for limited native reasoning; they matter less when the model reasons deeply on its own.
6. Validation techniques scale with model capability. Self-Verification, Confidence Scoring, and Constraint Violation Detection become more effective as model reasoning improves because the model has a stronger internal representation to evaluate against.

**Key Conclusion:** Weaker models benefit most from structure and scaffolding. Stronger models benefit most from grounding, validation, and meta-level control.

---

# 2.14 — Diminishing Returns Curve for Technique Stacking

## Core Principle

Prompt engineering techniques are not additive. The first few techniques typically provide large gains because they address major failure modes (hallucination, poor reasoning, weak structure). Additional techniques provide progressively smaller benefits, eventually creating instruction noise, competing objectives, token overhead, and reduced attention to important instructions.

## Effectiveness Curve

*Illustrative relative effectiveness estimates, not measured percentages.*

| Techniques Used | Relative Effectiveness | Typical Outcome |
| --------------- | ---------------------- | ---------------- |
| 0 | 50 | Baseline model performance |
| 1–3 | 80 | Largest gains per token |
| 4–6 | 90 | Strong improvement, diminishing returns begin |
| 7–9 | 92 | Small additional gains, highly task-dependent |
| 10+ | 75 | Increased risk of overload, conflicts, instruction dilution |

## Zone 1: Baseline (0 Techniques)
Relies entirely on model defaults. Minimal token cost. Variable accuracy. No grounding, no validation, no structure.

## Zone 2: Sweet Spot (1–3 Techniques)
Highest return per token. Example stack: T03 Quote-First, T02 Chain-of-Thought, T04 Self-Verification. ~50–150 tokens overhead. Most practical prompts should remain in this range.

## Zone 3: Diminishing Returns (4–6 Techniques)
Moderate improvement over sweet spot. Example: T05, T03, T02, T09, T04, T17. ~150–350 tokens. Still often worthwhile for high-value tasks.

## Zone 4: Saturation (7–9 Techniques)
Small and inconsistent gain. Example: T05, T03, T02, T09, T11, T04, T17, T13, T18. ~350–700 tokens. Usually justified only for investigations, research, safety-critical tasks.

## Zone 5: Overloaded (10+ Techniques)
Often negative gain. ~700–1200+ tokens. Failure modes: instruction dilution, constraint conflicts, excessive verbosity, attention fragmentation, reduced compliance with highest-priority instructions.

## Why Diminishing Returns Occur

1. **Overlapping Functionality** — T04, T17, T18 all perform answer evaluation; stacking all three provides less benefit than adding the first.
2. **Instruction Competition** — T14 (narrows) vs T12 (encourages reconsideration) compete for the same decision space.
3. **Token Overhead** — every technique consumes prompt tokens, model attention, and working memory.
4. **Cognitive Saturation** — the model spends more effort following process instructions than solving the underlying problem.

## Recommended Default

Use 2–4 techniques. Suggested default stack: T03 Quote-First, T02 Chain-of-Thought, T04 Self-Verification, T17 Confidence Scoring.

## Rule of Thumb

The goal is not to maximize technique count — it's to use the minimum number necessary to address the dominant failure modes of the task. Additional techniques should be presumed unnecessary until they justify their inclusion.

## Key Caveat

10+ techniques isn't inherently bad. Well-designed prompts can use 10+ when techniques are compatible, carefully ordered, and the task is unusually complex. The real risk is the *combination* of high technique count + poor organization + overlapping functionality + conflicting objectives — not count alone.

---

# 3.11 — Technique Compatibility with Extended Thinking

## Definitions
- **Enhance:** Technique provides capabilities that complement extended reasoning.
- **Neutral:** Technique provides little additional benefit or interacts minimally.
- **Conflict/Redundant:** Technique overlaps with functionality already supplied by extended reasoning.

| ID | Technique | Interaction with Extended Thinking |
|---|---|---|
| T01 | Permission to Say "I Don't Know" | Enhance |
| T02 | Chain-of-Thought | Conflict/Redundant |
| T03 | Quote-First | Enhance |
| T04 | Self-Verification | Enhance |
| T05 | Accuracy Role-Priming | Enhance |
| T06 | RAG | Enhance |
| T07 | Few-Shot Examples | Neutral |
| T08 | Instruction Hierarchy | Neutral |
| T09 | Explicit Constraints | Enhance |
| T10 | Output Format Specification | Neutral |
| T11 | Reasoning Decomposition | Conflict/Redundant |
| T12 | Question Reframing | Enhance |
| T13 | Assumption Surfacing | Enhance |
| T14 | Scope Limitation | Neutral |
| T15 | Meta-Prompting | Enhance |
| T16 | Explicit Step Counting | Conflict/Redundant |
| T17 | Confidence Scoring | Enhance |
| T18 | Constraint Violation Detection | Enhance |

**Strongest Enhancers:** T06 RAG, T04 Self-Verification, T03 Quote-First, T15 Meta-Prompting, T18 Constraint Violation Detection — they add capabilities extended thinking doesn't provide by itself.

**Most Redundant:** T16 Explicit Step Counting, T02 Chain-of-Thought, T11 Reasoning Decomposition — these primarily improve reasoning quality, which extended thinking already addresses.

**Core Insight:** Extended Thinking does not replace grounding, validation, constraint management, or uncertainty calibration. It primarily replaces reasoning scaffolds. The techniques that benefit most are those that improve evidence quality and verification, not those that merely force the model to think harder.

---

# 3.14 & 7.7-7.9 — Model Routing Decision Tree

## Purpose
Determine which model receives a translated question: Haiku, Opus-Fast, or Opus-Thinking.

Priority order: (1) user override, (2) error consequences, (3) complexity, (4) novelty, (5) scope.

## Step 1: Check User Override
If user explicitly selected a model → use it. Otherwise continue.

## Step 2: Check Consequence of Error
Scale: 1=Trivial, 2=Low, 3=Moderate, 4=High, 5=Critical.
**IF consequence ≥ 4 → Route to Opus-Thinking.** (Gate, not modifier — overrides everything else.)

## Step 3: Check Complexity
Scale: 1–2=Simple, 3–6=Moderate, 7–10=High.
Complexity ≤2 → Haiku candidate. 3–6 → Opus-Fast candidate. ≥7 → Opus-Thinking candidate.

## Step 4: Check Novelty
Low/Medium/High. High novelty upgrades one tier (Haiku→Opus-Fast, Opus-Fast→Opus-Thinking).

## Step 5: Check Scope
Narrow/Medium/Broad. Broad scope upgrades one tier (max: Opus-Thinking).

## Step 6: Check Evidence Requirements
Low/Medium/High. High evidence requirement sets minimum model to Opus-Fast.

## Final Routing Rules

**Route to Haiku:** Complexity ≤2, Novelty=Low, Scope=Narrow, Consequence ≤3. (Definitions, simple explanations, formatting, summaries.)

**Route to Opus-Fast (default):** Complexity 3–6 OR moderate novelty OR moderate scope. (Comparisons, multi-step analysis, research summaries, planning.)

**Route to Opus-Thinking:** Complexity ≥7 OR Consequence ≥4 OR (Novelty=High AND Scope=Broad) OR two+ upgrade conditions triggered. (Investigations, hypothesis testing, strategic analysis, high-stakes reasoning.)

## Explicit Routing Rules (Gate vs. Modifier Logic) — 20 Rules

**Dimensions scored per question:** Complexity (1-10), Consequence of Error (1-5), Novelty (1-5), Scope (1-5), Evidence Requirement (1-5), Ambiguity (1-5)

1. User Override → use selected model, stop.
2. Consequence Gate: IF Consequence ≥4 → Opus-Thinking, confidence=High, stop.
3. Complexity Baseline: ≤3→Haiku, 4-6→Opus-Fast, ≥7→Opus-Thinking.
4. Evidence Escalation: IF Evidence ≥4 AND Base=Haiku → upgrade to Opus-Fast.
5. Evidence Escalation High: IF Evidence ≥4 AND Base=Opus-Fast → upgrade to Opus-Thinking.
6. Ambiguity Escalation: IF Ambiguity ≥4 AND Base=Haiku → upgrade to Opus-Fast.
7. High Ambiguity Escalation: IF Ambiguity ≥4 AND Base=Opus-Fast → upgrade to Opus-Thinking.
8. Novelty Escalation: IF Novelty ≥4 AND Base=Haiku → upgrade to Opus-Fast.
9. High Novelty Escalation: IF Novelty ≥4 AND Base=Opus-Fast → upgrade to Opus-Thinking.
10. Scope Escalation: IF Scope ≥4 AND Base=Haiku → upgrade to Opus-Fast.
11. Broad Scope Escalation: IF Scope ≥4 AND Base=Opus-Fast → upgrade to Opus-Thinking.
12. Triple Escalation: IF Novelty≥4 AND Ambiguity≥4 AND Scope≥4 → Opus-Thinking.
13. Research Rule: IF Evidence≥4 AND Ambiguity≥4 → Opus-Thinking.
14. Investigation Rule: IF Evidence≥4 AND Consequence≥3 → Opus-Thinking.
15. Architecture Rule: IF Complexity≥5 AND Novelty≥4 → Opus-Thinking.
16. Simple Lookup Rule: IF Complexity≤2 AND Scope≤2 AND Evidence≤2 AND Ambiguity≤2 → Haiku.
17. Simple Comparison Rule: IF Complexity≤4 AND Scope≤3 AND Novelty≤3 → Opus-Fast.
18. Tie-Break Rule: if multiple routes equally valid → choose higher route.
19. Confidence Calculation: compute Agreement Score, Margin Score, Conflict Level (see below).
20. Low Confidence Handling: IF Confidence<60% AND Consequence≥4 → route up to Opus-Thinking. IF Confidence<60% AND Consequence<4 → present top two options.

## Routing Confidence Scoring

Confidence is NOT subjective — it's derived from Signal Agreement, Margin of Victory, and Conflict Level.

**Step 1: Signal Weights**
| Signal | Weight |
|---|---|
| Consequence of Error | 5 |
| Evidence Requirements | 4 |
| Ambiguity | 3 |
| Novelty | 3 |
| Complexity | 2 |
| Scope | 2 |

**Step 2: Collect Signal Votes** — each dimension recommends a tier; sum weights per tier.

**Step 3: Agreement Score** = (weight supporting winning tier) / (total weight)

**Step 4: Margin Score** = (winner score − runner-up score) / (total weight)

**Step 5: Conflict Level** — Low (most signals agree), Medium (split between adjacent tiers), High (strong signals support different tiers).

**Step 6: Final Confidence** — 80-100% = High, 60-79% = Moderate, <60% = Low.

**Step 7: Low-Confidence Behavior**
- ≥80%: proceed automatically.
- 60-79%: proceed automatically, display routing rationale.
- <60%: check consequence of error. If ≥ threshold for Opus-Thinking → route up (false negatives cost more than extra tokens). Otherwise present top two options with percentages, allow override.

**Step 8: Output Format**
```
Selected Model:   [Haiku | Opus-Fast | Opus-Thinking]
Confidence:       [X%]
Conflict Level:   [Low | Medium | High]
Primary Signals:  [List strongest routing factors]
```

## Safe Default
When uncertainty exists: use **Opus-Fast** — best balance of cost, speed, accuracy, reliability.

## Design Principle
1. Avoid under-routing high-risk questions.
2. Maintain cost efficiency on low-risk questions.
3. Make routing uncertainty visible rather than hiding it.
4. Allow user override whenever confidence is low.

---

# 5.2-5.5 — Architectural Skeleton

## System Overview

Five-stage pipeline: User Input → Translation → Routing → Composition → Output Generation → Feedback Collection → Translator Improvement Loop.

Each stage has: Inputs, Processing Logic, Outputs, Failure Modes, Recovery Mechanisms.

## Stage 1: Translation
**Purpose:** Convert raw user communication into structured AI-ready metadata.
**Inputs:** Raw user message (question, request, investigation, brain dump). Optional: conversation context, user profile, historical patterns.
**Processing:** Extract intent, goal, complexity, scope, novelty, consequence of error, desired output type, evidence requirements. Generate structured question + metadata package.
**Outputs:** Translated question + metadata JSON (complexity, scope, novelty, evidence_requirement, output_type).
**Failure Modes:** F1 Intent Misidentification, F2 Context Loss, F3 Over-Translation.
**Recovery:** User review step, clarification questions, translation confidence score, preserve original input alongside translation.

## Stage 2: Routing
**Purpose:** Select the appropriate model and processing strategy.
**Inputs:** Translated question, metadata package, user overrides.
**Processing:** Apply Routing Algorithm. Determine Haiku/Opus-Fast/Opus-Thinking. Apply upgrade rules, override rules, safe defaults.
**Outputs:** Routing decision JSON (model, reason, confidence).
**Failure Modes:** F1 Under-Routing, F2 Over-Routing, F3 Override Abuse.
**Recovery:** Confidence thresholds, escalation logic, retry on failure, user warning system.

## Stage 3: Composition
**Purpose:** Construct the final prompt package.
**Inputs:** Translated question, metadata, routing decision, technique registry, interaction matrix, model compatibility data.
**Processing:** Select techniques, ordering, technique count, model-specific adjustments. Apply interaction rules, conflict checks, dependency checks, diminishing returns limits.
**Outputs:** Prompt package JSON (model, techniques list, final prompt text).
**Failure Modes:** F1 Technique Conflict, F2 Prompt Overload, F3 Missing Critical Technique.
**Recovery:** Interaction matrix validation, technique cap, composer sanity checks.

## Stage 4: Output Generation
**Purpose:** Generate final AI response.
**Inputs:** Prompt package, selected model, conversation context.
**Processing:** Model executes prompt — reasoning, grounding, verification, formatting.
**Outputs:** AI response + optional confidence score, sources, verification notes.
**Failure Modes:** F1 Hallucination, F2 Poor Reasoning, F3 Constraint Violation, F4 Format Failure.
**Recovery:** Verification pass, regeneration, alternative model routing, user review.

## Stage 5: Feedback
**Purpose:** Evaluate performance and improve future translations.
**Inputs:** AI response, user feedback, conversation outcome, performance metrics.
**Processing:** Assess accuracy, usefulness, satisfaction, routing success, technique effectiveness. Store results, update translation/routing/composition rules.
**Outputs:** Feedback record JSON (success, rating, model, techniques used).
**Failure Modes:** F1 Missing Feedback, F2 Misleading Feedback, F3 Sparse Data.
**Recovery:** Aggregate multiple examples, weight objective metrics, track long-term trends.

## Core Architectural Principle

Each stage performs ONE primary responsibility: Translation determines what the user means. Routing determines where the task goes. Composition determines how the task is asked. Output determines the answer. Feedback determines how the system improves. Keeping responsibilities separate prevents complexity accumulation in any single stage.

---

# 6.8-6.11 — Translation Operation Mini-Algorithms

## 6.8 Extract-Core-Question
**Input Detection:** Multi-sentence input, multiple requests/goals, high context/low clarity ratio, "I need/want/help me" clusters.
**Execution:** (1) Identify intent candidates, (2) rank by dependency, (3) select primary intent, (4) compress to atomic question, (5) remove non-essential secondary constraints.
**Validation:** Only one question remains; no subordinate tasks embedded; preserves original intent.
**Output Format:** `CORE_QUESTION: <atomic question>`
**Example:** "I've tried a bunch of AI tools but I get overwhelmed and I also need something that organizes my workflow..." → "How can I use AI to stay consistent and organized while managing ADHD?"

## 6.9 Reorder-Context
**Input Detection:** Non-linear storytelling, mixed timeframes, repeated ideas in different forms.
**Execution:** (1) Segment into atomic statements, (2) tag as past/present/goal/obstacle, (3) order: goal→obstacles→causes→attempts→context, (4) remove duplication.
**Validation:** No chronological contradictions; causal flow explicit; all facts preserved.
**Output Format:** Ordered bullet sequence.
**Example:** "I keep switching apps, I tried Notion, I forget everything..." → Goal: build structure / Problem: forgetfulness / Attempt: Notion / Failure: inconsistent use / Current state: system started last week.

## 6.10 Normalize-Emotional-Language
**Input Detection:** Absolutes ("always"/"never"), high frustration markers, self-defeating language.
**Execution:** (1) Detect emotional exaggeration tokens, (2) replace with frequency-based language, (3) convert absolutes to probabilistic terms, (4) preserve factual base meaning.
**Validation:** Emotional intensity reduced; no loss of factual content; no judgment added.
**Output Format:** Neutralized statement.
**Example:** "I always mess everything up and nothing works for me." → "I frequently run into issues and systems have not worked reliably for me in the past."

## 6.11 Clarify-Scope / Surface-Assumptions / Decompose-Compound
**Input Detection:** "and/also/plus" sentences, hidden system assumptions, multi-objective requests.
**Execution:** (1) Split into independent requests, (2) extract implicit assumptions, (3) separate constraints from goals, (4) convert to structured task list.
**Validation:** Each line = one task; assumptions explicitly listed; constraints separated.
**Output Format:** Tasks / Assumptions / Constraints lists.
**Example:** "I need an AI that summarizes videos and writes prompts and organizes everything automatically" → Tasks: [summarize, generate prompts, organize]. Assumptions: [one system does all, automation is reliable]. Constraints: [must be unified system].

---

# 8.6-8.8 — Technique Combination Rules (T01–T18)

## A. Dependencies (20 rules)
1. T01→T02 — extract before reorder
2. T01→T05 — extract before assumptions
3. T02→T06 — reordered context improves decomposition
4. T03→T04 — context cleanup before emotional normalization
5. T04→T05 — emotion normalization improves assumption clarity
6. T06→T07 — decomposition before recomposition
7. T06→T09 — decomposition before conflict detection
8. T07→T15 — decomposition before composition
9. T08→T11 — scoping before scoring
10. T11→T13 — scoring before selection
11. T12→T13 — budget influences selection
12. T13→T14 — selection before ordering
13. T14→T15 — ordering before final composition
14. T09→T10 — conflict detection before resolution
15. T10→T14 — resolved conflicts affect ordering
16. T05→T09 — assumptions feed conflict detection
17. T01→T11 — core extraction required for scoring
18. T02→T08 — reordering improves scoping
19. T06→T12 — decomposition informs budget allocation
20. T03→T01 — context cleanup improves extraction accuracy

## B. Conflicts (8 rules)
1. T04 vs T17 — normalize vs amplify emotion (mutually exclusive)
2. T02 vs T16 — reorder vs preserve raw structure
3. T06 vs T15 — decomposition vs single-pass composition
4. T11 vs T12 — scoring conflicts with fixed-rule locking
5. T01 vs T18 — full extraction vs minimal pipeline mode
6. T03 vs T04 — context preservation vs emotional flattening
7. T09 vs T05 — assumptions can pre-resolve conflicts incorrectly
8. T13 vs T18 — full selection vs constrained lightweight mode

## C. Synergies (10 rules)
1. T01+T06 → best structural clarity gains
2. T03+T04 → clean semantic input layer
3. T05+T09 → better conflict prediction accuracy
4. T06+T10 → reduces ambiguity explosion
5. T07+T15 → modular prompt construction
6. T11+T13 → optimal technique selection quality
7. T02+T08 → improved scoping accuracy
8. T04+T05 → emotional clarity improves reasoning
9. T12+T14 → stable ordering under constraints
10. T01+T11+T13 → high-precision selection pipeline

---

# 10.1-10.46 — Comprehensive ADHD Prompt Library (10 Categories)

## Category 1: Initiation / Getting Started
**P1 Start Small Entry Point:** "What is the smallest possible first step I can take that reduces friction and gets me started?" — When: paralysis at beginning. Trade-off: may oversimplify. Success: starts within 2-5 min. Failure: too vague.
**P2 Define First Action Only:** "Ignore the full project. What is ONLY the first physical or mental action required?" — When: overwhelm before starting.
**P3 Remove Planning Layer:** "What can I do immediately without planning, organizing, or optimizing?" — When: analysis paralysis.
**P4 Momentum Trigger:** "What action would create forward momentum even if imperfect?" — When: stuck in perfection loops.
**Expanded family:** "What is the first irreversible action?" / "What can I do in under 2 minutes to begin?" / "What is the entry-level version of this task?" / "What step would future-me thank me for starting?" / "What part requires zero thinking?"
**Decision Rules:** Avoidance→P1/P4. Overthinking→P2/P3. Fear-based freeze→P4.

## Category 2: Breaking Things Down
**P1 Atomic Decomposition:** "Break this into steps where each step is physically executable in under 5 minutes."
**P2 Dependency Map:** "What must happen before anything else can happen?"
**P3 Minimum Viable Breakdown:** "What is the simplest version of this task that still counts as completion?"
**P4 Step Compression:** "Combine overlapping steps into the fewest possible actions."
**Expanded family:** "Split into irreversible actions only" / "Turn into checklist with zero abstraction" / "Remove all optional steps" / "Convert to physical actions only" / "Break until no step requires interpretation"
**Decision Rules:** Complex task→P1. Unclear order→P2. Over-detailed plan→P4.

## Category 3: Managing Overwhelm
**P1 Load Reduction:** "What part of this can I safely ignore for now without affecting outcome?"
**P2 Priority Collapse:** "What is the one thing that matters most right now?"
**P3 Mental Stack Dump:** "List everything in my head, then remove 80% of it."
**P4 Single Thread Mode:** "Convert this into one linear sequence with no branching."
**Decision Rules:** Emotional overwhelm→P3. Decision overload→P2. Complexity overload→P4.

## Category 4: Focus & Staying On Track
**P1 Attention Anchor:** "What is the one thing I should be looking at or doing right now?"
**P2 Drift Detection:** "What is pulling my attention away from the main task?"
**P3 Re-anchor Prompt:** "Restate the task in one sentence I can repeat while working."
**P4 External Focus Lock:** "Turn this task into a checklist I must follow without deviation."

## Category 5: Decision Fatigue
**P1 Forced Binary:** "Reduce all choices to two options only and recommend one."
**P2 Default Selection:** "If I do nothing, what is the default outcome?"
**P3 Best Safe Option:** "What is the safest acceptable choice?"
**P4 Elimination Method:** "Remove all options that are not clearly necessary."

## Category 6: Hyperfocus Control
**P1 Boundary Setter:** "What is the stopping condition for this task?"
**P2 Time Box Definition:** "Define a 30–60 minute version of this task."
**P3 Exit Signal:** "What signals that I should stop immediately?"
**P4 Scope Lock:** "Prevent expansion beyond this exact goal."

## Category 7: Comprehension & Intake
**P1 Simplify Input:** "Explain this as if I only need to understand 20% to proceed."
**P2 Key Extraction:** "What are the 3 most important facts here?"
**P3 Noise Removal:** "Remove everything not directly useful for action."
**P4 Translation Mode:** "Convert this into plain actionable language."

## Category 8: Accountability
**P1 External Checkpoint:** "What would I need to show someone to prove progress?"
**P2 Commitment Lock:** "What is the smallest commit I can make that is still real?"
**P3 Consequence Frame:** "What happens if I do nothing?"
**P4 Progress Marker:** "Define what 'done for today' looks like."

## Category 9: Self-Awareness / Pattern Recognition
**P1 Pattern Detection:** "What patterns are repeating in my behavior?"
**P2 Failure Mode Identification:** "Where do I consistently break down in tasks like this?"
**P3 Trigger Mapping:** "What conditions lead me to stop working?"
**P4 Bias Detection:** "What assumptions am I making that may be wrong?"

## Category 10: Task-Specific Utility
**P1 Execution Script:** "Turn this into a step-by-step execution script."
**P2 Checklist Mode:** "Convert into a checklist I can follow without thinking."
**P3 Automation Angle:** "What parts of this can be automated or simplified?"
**P4 Output Definition:** "Define exactly what the final output should look like."

## Category Selection Rules (Global)
| Symptom | Category |
|---|---|
| Freeze | Initiation / Overwhelm |
| Confusion | Comprehension |
| Procrastination | Initiation / Focus |
| Chaos | Breaking Down |
| Too many choices | Decision Fatigue |
| Overwork loops | Hyperfocus Control |

---

# 11.1-11.18 — T01–T18 Technique Documentation

Each card: Function, Injection point, Before/After, Failure modes, Cost, Compatibility.

**T01 Core Extraction** — Isolate primary intent from multi-goal input. Injection: first step. Before: messy multi-goal input. After: single atomic question. Failure: over-compression discards secondary goals. Cost: Low. Compat: all models.

**T02 Context Reordering** — Reorder non-linear input into causal sequence. Injection: after T01, before decomposition. Before: mixed timeframes. After: goal→obstacles→causes→attempts→context. Failure: misidentifying temporal order. Cost: Low. Compat: all models.

**T03 Context Cleanup** — Remove noise/redundancy. Injection: before T01 when cluttered. Before: rambling input. After: clean, deduplicated statements. Failure: removing signal mistaken for noise. Cost: Low. Compat: all models.

**T04 Emotional Normalization** — Reduce emotional distortion without losing facts. Injection: before reasoning steps. Before: "I always fail at everything." After: "I frequently encounter difficulty completing tasks." Failure: loss of urgency signal. Cost: Low-Medium. Compat: all models.

**T05 Assumption Surfacing** — Make implicit assumptions explicit. Injection: after T04, before conflict detection. Failure: surfacing trivially obvious assumptions. Cost: Medium. Compat: Opus-Fast/Thinking preferred.

**T06 Decomposition** — Split compound tasks into atomic steps. Injection: early-middle pipeline. Before: "Build a productivity system." After: numbered atomic step list. Failure: fragmentation overload. Cost: Medium. Compat: all models.

**T07 Recomposition** — Reassemble decomposed pieces. Injection: after T06. Failure: incoherent assembly if decomposition flawed. Cost: Medium. Compat: Opus-Fast/Thinking.

**T08 Scoping** — Define/enforce task boundaries. Injection: after context reordering. Failure: scope too narrow. Cost: Low. Compat: all models.

**T09 Conflict Detection** — Identify contradictions in constraints/goals. Injection: after assumption surfacing. Failure: false positives (treating tradeoffs as contradictions). Cost: Medium. Compat: Opus-Fast/Thinking.

**T10 Conflict Resolution** — Resolve detected conflicts. Injection: immediately after T09. Failure: wrong resolution priority. Cost: Medium-High. Compat: Opus-Thinking preferred.

**T11 Technique Scoring** — Score techniques against input profile. Injection: mid pipeline, after scoping. Failure: bias toward familiar techniques. Cost: Medium. Compat: Opus-Fast/Thinking.

**T12 Budget Allocation** — Apply token/technique constraints. Injection: concurrent with T11. Failure: budget too tight, forces omissions. Cost: Low. Compat: all models.

**T13 Technique Selection** — Choose optimal technique set. Injection: after T11/T12. Failure: over-selection bias. Cost: Medium. Compat: Opus-Fast/Thinking.

**T14 Technique Ordering** — Sort by dependency graph. Injection: after T13. Failure: circular dependency uncaught. Cost: Low. Compat: all models.

**T15 Composition** — Assemble final prompt. Injection: last stage. Failure: incoherent blending. Cost: Medium. Compat: all models.

**T16 Meta Validation** — Validate full pipeline output. Injection: final step. Failure: low upside if upstream was already clean. Cost: Low. Compat: all models.

**T17 Emotional Amplification** — Preserve/elevate urgency when flattening would hurt. Injection: context-dependent; conflicts with T04. Failure: over-amplification creates pressure without clarity. Cost: Low. Compat: all models. Mutually exclusive with T04.

**T18 Minimal Pipeline Mode** — Bypass full pipeline for low-complexity inputs. Injection: override, replaces normal pipeline. Failure: applied to inputs that needed full processing. Cost: Very low. Compat: all models, especially Haiku. Conflicts with T01/T13 in full pipeline context.

**Effectiveness Model Summary:**
| Layer | Techniques | Primary Gain |
|---|---|---|
| Structural | T01, T02, T06 | Clarity of intent and structure |
| Clarity | T04, T05 | Semantic and emotional accuracy |
| Optimization | T11, T12, T13, T14 | Technique selection quality |
| Output shaping | T15, T16, T17, T18 | Final prompt quality and control |

---

# 13.1-13.7 — Model × Question Type Matrix

**Question Type Taxonomy:** Ambiguity resolution, Planning, Breakdown, Emotional regulation, Ideation, Summarization, Decision-making, Learning, Productivity systems, Debugging, Creativity, Prioritization, Pattern recognition, Research synthesis, Investigation, Constraint analysis, Comparison, Self-awareness, Scope definition, System design.

**Model Profiles:**
- **Haiku:** Fast, low depth. Best for simple lookups, definitions, formatting, quick summaries. Weak at multi-step reasoning, novel frameworks. Max techniques: 3.
- **Opus-Fast:** Moderate speed, medium-high depth. Best for structured reasoning, comparisons, planning, research summaries. Weak at deeply novel/high-consequence problems. Max techniques: 6-9. Default route — best cost/quality balance.
- **Opus-Thinking:** Slow, very high depth. Best for complex decomposition, investigations, high-stakes reasoning, system design. Weak at speed-sensitive tasks; risks over-analysis on simple inputs. Max techniques: 4-6.

**Sample Cells:**
- Breakdown × Opus-Thinking: 9.5/10, slow, deep dependency mapping, weak at over-analysis on simple tasks. Override: if urgency high → Opus-Fast.
- Decision-Making × Opus-Fast: 8.5/10, moderate, structured comparison. Override: if consequence≥4 → Opus-Thinking.
- Summarization × Haiku: 8/10, fast, clean concise output. Override: if source highly technical → Opus-Fast.
- Emotional Regulation × Opus-Fast: 8/10, moderate, normalizes without dismissing. Override: severe entangled emotional+logical → Opus-Thinking.
- Investigation × Opus-Thinking: 10/10, slow, hypothesis generation/multi-source synthesis. No override — correct ceiling model.

**Global Routing Rule:**
| Input Type | Model |
|---|---|
| Simple, low-stakes | Haiku |
| Structured, moderate complexity | Opus-Fast |
| Complex systems, high stakes | Opus-Thinking |
| Unknown/uncertain | Opus-Fast (safe default) |

---

# 14.1-14.5 — Technique × Question Type Matrix

**Key Findings:**
| Technique | Strongest Question Types |
|---|---|
| T01 | Ambiguity resolution, summarization |
| T02 | Planning, pattern recognition |
| T03 | Research synthesis, comprehension |
| T04 | Emotional regulation, self-awareness |
| T05 | Constraint analysis, investigation |
| T06 | Planning, breakdown, system design |
| T07 | Recomposition after breakdown |
| T08 | Scope definition, system design |
| T09 | Constraint analysis, investigation |
| T10 | Decision-making, conflict resolution |
| T11 | Optimization-heavy tasks |
| T12 | Budget-constrained planning |
| T13 | Decision optimization, technique selection |
| T14 | Pipeline sequencing, system design |
| T15 | Final output for all types |
| T16 | Validation-critical tasks |
| T17 | Motivation, urgency-sensitive tasks |
| T18 | Simple lookups, low-complexity tasks |

**Sample Cells:**
- Decision Fatigue × T13: 10/10, medium cost. Use when too many options. Failure: oversimplifies nuanced decisions.
- Emotional Regulation × T04: 9/10, low cost. Use when absolutes/frustration markers present. Failure: strips urgency from situations that need it.
- Breakdown × T06: 10/10, medium cost. Use when task is complex/overwhelming. Failure: too many micro-steps.
- Ambiguity Resolution × T01: 9.5/10, low cost. Use when multiple competing intents. Failure: over-compression discards an important secondary goal.
- Investigation × T05+T09: 9/10 combined, medium cost. Use when hidden assumptions + constraint conflicts. Failure: T05 surfaces trivial assumptions; T09 flags tradeoffs as conflicts.
- Final Output × T15: context-dependent, medium cost. Always the final assembly layer. Failure: incoherent blending if upstream conflicted.

**Global Rules:**
- If emotional content present → T04 before T13
- If structure missing → T06 before T13
- If output format unclear → T15 last, always
- If input is simple → T18 overrides full pipeline
- If conflict detected → T09→T10 before selection

---

# 15.7-15.8 — Technique Ordering Rules

## Why Order Matters
The pipeline functions as a prompt compiler — early steps define the problem, middle steps define the solution approach, late steps define the presentation. Misordering causes wrong intent extraction, wrong tool selection, and broken final prompts.

## Core Ordering Rules (15 rules)
| # | Rule | Reason |
|---|---|---|
| 1 | T01 before all | Cannot process without extracted intent |
| 2 | T04 before T06 | Emotional distortion corrupts structural decomposition |
| 3 | T06 before T13 | Cannot select techniques before task is broken down |
| 4 | T02 before T08 | Structure must be established before scope is enforced |
| 5 | T05 before T09 | Assumptions must be surfaced before conflicts detected |
| 6 | T09 before T10 | Must detect conflicts before resolving them |
| 7 | T11 before T13 | Scoring must precede selection |
| 8 | T12 before T13 | Budget constraint applies before final selection |
| 9 | T13 before T14 | Selection must precede ordering |
| 10 | T14 before T15 | Ordering must precede composition |
| 11 | T03 before T01 | Context cleanup improves extraction accuracy |
| 12 | T07 before T15 | Recomposed structure needed before final assembly |
| 13 | T16 last | Meta-validation is the final gate |
| 14 | T18 overrides all | Minimal mode bypasses standard pipeline entirely |
| 15 | T04 must never follow T15 | Emotional normalization post-composition risks distorting final output |

## Canonical Pipeline Order
```
T03 → T01 → T04 → T02 → T08 → T05 → T06 → T09 → T10
    → T07 → T11 → T12 → T13 → T14 → T15 → T16
```
**Exceptions:** T17 replaces T04 when emotional amplification is needed (never both). T18 replaces the full pipeline for simple inputs. T10 only runs if T09 detected a conflict.

## Pipeline Layer Summary
| Layer | Techniques | Responsibility |
|---|---|---|
| Input prep | T03, T01, T04 | Clean and extract intent |
| Structure | T02, T08, T05 | Reorder, scope, surface assumptions |
| Decomposition | T06, T09, T10, T07 | Break down, detect/resolve conflicts, recompose |
| Optimization | T11, T12, T13, T14 | Score, budget, select, order techniques |
| Output | T15, T16 | Compose and validate final prompt |
| Overrides | T17, T18 | Amplify or bypass as needed |

---

# 16.1-16.4 — Full Translation Algorithm

## 16.1 Main Pipeline
```python
function translate(input):
    core        = extract_core_question(input)
    context     = reorder_context(input)
    normalized  = normalize_emotion(context)
    scoped      = clarify_scope(normalized)
    assumptions = surface_assumptions(scoped)
    decomposed  = decompose_compound(scoped)
    techniques  = select_techniques(decomposed)
    ordered     = order_techniques(techniques)
    result      = execute_pipeline(ordered, decomposed)

    if not validate(result):
        return failure_handler(result)

    confidence  = compute_confidence(result)
    if confidence < threshold:
        return request_clarification(result)

    return format_output(result)
```

## 16.2 Edge Case Decision Trees
- **Overloaded Input (>3 intents):** Force T06 decomposition first.
- **High Emotional Intensity:** Run T04 before all other steps.
- **Low Clarity Core Question:** Stop pipeline → request clarification.
- **Conflicting Constraints Detected:** Run T09→T10 before selection.

## 16.3 Failure Handling
| Failure Type | Recovery Action |
|---|---|
| Extraction failure | Keyword clustering fallback |
| Decomposition failure | Partial segmentation output |
| Validation failure | Rerun with reduced technique set |
| Confidence failure | Return clarification request |

## 16.4 Pipeline Notes
Each step is independently recoverable. Steps earlier in the pipeline improve the quality of all subsequent steps. The confidence check at the end is the final gate before output is returned to the user. Clarification requests are not failures — they're valid outputs when the input is genuinely ambiguous.

---

# 17.1-17.5 — Routing Algorithm

(Fully covered above under "3.14 & 7.7-7.9 — Model Routing Decision Tree." That section is the complete routing algorithm: 6-dimension scoring, override check, 20 explicit gate/modifier rules, confidence check, fallback to Opus-Fast as safe default.)

---

# 18.1-18.4 — Technique Selection Algorithm

## 18.1 Pipeline
```python
function select_techniques(input):
    profile    = analyze_need(input)
    scores     = {}
    for t in T01..T18:
        scores[t] = score(t, profile)

    candidates = filter(scores, threshold)
    candidates = apply_dependency_graph(candidates)
    candidates = remove_conflicts(candidates)

    if exceeds_budget(candidates):
        candidates = prune_lowest_impact(candidates)

    ordered    = topological_order(candidates)
    return ordered
```

## 18.2 Scoring Function
```
score = relevance(0–5) + impact(0–5) + synergy_bonus(0–5) − complexity_cost(0–3)
```

## 18.3 Constraint System
- Dependency graph (DAG enforced)
- Hard conflict exclusion overrides scoring
- Max techniques per input type:

| Input Type | Max Techniques |
|---|---|
| Simple | 3–5 |
| Normal | 6–9 |
| Complex | 4–6 |

## 18.4 Selector Functions
| Function | Purpose |
|---|---|
| `analyze_need()` | Build input profile from metadata |
| `score()` | Score each technique against profile |
| `filter()` | Remove techniques below threshold |
| `apply_dependency_graph()` | Enforce required ordering/prerequisites |
| `remove_conflicts()` | Exclude mutually exclusive techniques |
| `prune_lowest_impact()` | Trim to budget if over max technique count |
| `topological_order()` | Sort remaining candidates by dependency graph |

---

# 19.1-19.5 — Composition Algorithm

## 19.1 Pipeline
```python
function compose(role, question, techniques, model):
    template = load_template(model)
    prompt   = template
    prompt   = insert_role(prompt, role)
    prompt   = insert_question(prompt, question)
    prompt   = inject_techniques(prompt, techniques)
    prompt   = inject_format_rules(prompt)
    validate(prompt)
    return prompt
```

## 19.2 Templates
- **Haiku (Lightweight):** Minimal instruction set, max 3 techniques, fast execution bias.
- **Opus (Full System):** Full T01–T18 support, strict ordering rules, full decomposition allowed.

## 19.3 Instruction Hierarchy
1. System constraints
2. Role definition
3. Core question
4. Techniques
5. Output format rules
6. Examples

## 19.4 Technique Injection Map
| Techniques | Layer |
|---|---|
| T01–T06 | Early framing layer |
| T07–T10 | Reasoning layer |
| T11–T14 | Selection/order layer |
| T15–T18 | Final shaping layer |

## 19.5 Example Composed Prompts
1. "You are an ADHD planning assistant. Break tasks into atomic steps and prioritize clarity."
2. "Extract the core question, remove redundancy, and output a structured plan."
3. "Decompose multi-goal input into independent tasks and order by dependency."
4. "Normalize emotional language, then extract actionable steps only."
5. "Analyze input, extract intent, and produce a structured execution plan."
6. "Separate goals, rank dependencies, and execute sequentially."
7. "Identify constraints, resolve conflicts, and output a clean plan."
8. "Convert messy input into structured reasoning steps using extraction → decomposition → ordering."

---

# YELLOW PHASE: COMPLETE

All 28 yellow sequences from the original checklist are documented above:
2.10, 2.11, 2.14, 3.11, 3.14, 5.2-5.5, 6.8-6.11, 7.7-7.9, 8.6-8.8, 10.1-10.46, 11.1-11.8, 11.18, 13.1-13.7, 14.1-14.5, 15.7-15.8, 16.1-16.4, 17.1-17.5, 18.1-18.4, 19.1-19.5

Next phase: RED (20 sequences — your own archive, patterns, and decisions).
