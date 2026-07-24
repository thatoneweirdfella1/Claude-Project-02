# ADHD Extraction Guide — What to Look For

This guide clarifies the new ADHD-specific extraction fields added to each pattern type. **Read this for context; the actual extraction rules still live in DIVERGENCE_DATASET_METHODOLOGY.md.**

The goal: extract patterns that explain what made interactions succeed or fail specifically for ADHD users, so we can improve the app's communication, detection, and handling.

---

## Quick Map: New Fields by Pattern Type

### TRANSLATION_MISMATCH — Why did the AI misunderstand?

**New fields capture:**
- **adhd_communication_factor** — Did this mismatch stem from ADHD-specific input patterns? (scattered thoughts, emotional framing, layered questions, missing context, scope confusion)
- **cognitive_load_indicator** — Was the question complicated by high input volume or multiple topics?
- **clarification_patience** — How many back-and-forths were needed? Did frustration build?
- **success_communication** — What rephrasing/clarification worked? (Can we detect patterns AI should recognize?)

**Why it matters:** Distinguishes "user phrased ambiguously" (fixable via clarity) from "AI can't parse ADHD input" (design gap).

**Example:** User asks a compound question mixing three topics. AI answers only one. User clarifies by splitting it. The friction isn't the user's phrasing—it's AI not recognizing compound questions as common ADHD input and parsing them differently.

---

### ESCALATION_PATTERN — What triggered frustration? How recoverable is it?

**New fields capture:**
- **escalation_trigger_type** — Specific root cause: misunderstanding, back-and-forth tedium, perceived judgment, cognitive overload, off-topic drift, time pressure?
- **escalation_recovery** — Did user return after escalating? (Tells us if friction is reversible.)
- **recovery_intervention** — What brought them back? (Direct answer, acknowledgment, space to breathe, simplification?)
- **abandonment_signal** — Did escalation lead to conversation/task end? (Indicators of permanent vs. temporary friction.)

**Why it matters:** ADHD escalation is often recoverable with the right intervention. Knowing what works prevents permanent damage.

**Example:** User escalates ("STOP ASKING ME THIS"), then returns after AI gives a direct answer. The trigger was repeated clarifications (executive overload); the recovery was AI cutting to the point. This pattern repeats across conversations—it's actionable.

---

### DE_ESCALATION_OPPORTUNITY — What should AI have done differently?

**New fields capture:**
- **adhd_intervention_failure** — What did AI miss? (Didn't parse scattered input, asked too many questions, hedged when directness needed, ignored stated preference, went too complex?)
- **intervention_that_worked** — If de-escalation succeeded, what AI response worked? (Exact quote or behavior.)
- **directness_match** — Did AI match the user's directness preference at that moment?
- **time_sensitivity_factor** — Was slowness (multiple clarifications) the problem?
- **context_reuse_failure** — Did AI ignore already-loaded context or ask for repeated info?

**Why it matters:** Identifies specific, teachable patterns — "when user is escalated + in time pressure + wanted direct, DO X" instead of guessing.

**Example:** User is frustrated and time-pressed. AI asks clarifying questions. Escalation. Later, different conversation: same situation, AI gives direct answer first, then offers clarifications. No escalation. The intervention that worked: directness + time-sensitivity awareness.

---

### MOOD_SIGNAL — What emotional patterns predict what?

**New fields capture:**
- **mood_state_raw** — Detected mood: frustrated, overwhelmed, scattered, bored, engaged, urgent, stuck?
- **adhd_state_correlation** — Does this mood link to observable ADHD patterns? (Scattered typing → executive dysfunction; short clipped sentences + curse → overwhelm/shutdown risk.)
- **trigger_context** — What caused this mood? (Cognitive overload, time pressure, repeated clarification, off-topic response?)
- **recovery_signal** — Does mood improve later? What changed? (Success, clarity, simplification?)
- **state_persistence** — Is this mood one moment or across multiple turns? (Affects if it's a conversation problem or just a blip.)
- **abandonment_risk** — Is this mood a precursor to task abandonment? (Overwhelmed + shutdown risk often ends the conversation.)

**Why it matters:** Maps emotional/ADHD states to outcomes. Helps predict when intervention is most critical.

**Example:** User types scattered, jumps topics, uses curse words sporadically. Mood detected: scattered/overwhelmed. Trigger: three context items loaded + complex question. Later turns show no recovery—conversation ends without answer. This is an abandonment signal: overwhelm → executive meltdown → task dropped.

---

### BLUNTNESS_PREFERENCE — When does the user want what tone?

**New fields capture:**
- **context_type** — Technical, personal, meta, or mixed?
- **emotional_state_at_preference** — Calm, frustrated, rushed, overwhelmed when this showed?
- **consistency_pattern** — Does user always prefer bluntness here, or does it depend on mood/complexity/time?
- **hedging_rejection_signal** — How did user signal rejection? (Explicit complaint, silence, topic switch, escalation?)
- **success_example** — What direct phrasing worked?
- **failure_example** — What softening failed?
- **directness_with_complexity_tradeoff** — When answer is complex, does user prefer Level 3 (blunt) or Level 1 (supportive)?

**Why it matters:** Directness is context-dependent, not absolute. Technical + calm = blunt preferred. Personal + overwhelmed = maybe supportive better. This captures the nuance.

**Example:** User prefers blunt on technical topics but rejects hedging on personal topics if they're overwhelmed (paradox: when emotional, they want directness even more, but not about their emotions—about the solution). Mapping this means directness control can adapt.

---

### FRICTION_POINT — What recurring problems should we fix?

**New fields capture:**
- **friction_category_adhd** — Root cause specific to ADHD: AI doesn't parse ADHD input, response too complex, too many clarifications, hedging when direct needed, ignores context, derails from intent, speed too slow, judgment/tone critical?
- **frequency_same_conversation** — Happens once or repeatedly in one conversation?
- **frequency_dataset_estimate** — Rough: rare, occasional, common, very common across 900 conversations?
- **abandonment_correlation** — Does this friction type end conversations/tasks?
- **solution_effectiveness_adhd** — If there was a workaround or AI adapted, did it work? Did it transfer to future conversations?
- **impact_severity_adhd** — Slows interaction, causes escalation, causes misunderstanding, causes abandonment, causes task failure?

**Why it matters:** Identifies the highest-impact friction to fix. "AI asks too many clarifying questions" (common, causes escalation, abandonment) is a priority. "AI sometimes uses passive voice" (rare, minor impact) is not.

**Example:** Across 900 conversations, AI repeatedly asks for context already in loaded files. Friction category: "ignores context." Frequency: very common. Abandonment correlation: strong (users give up after repeating themselves). Impact: causes task failure. Solution effectiveness: when AI synthesizes loaded context first, friction drops to zero. This is a high-ROI fix.

---

## How These Fields Work Together

Each conversation extraction captures:
1. **Mechanical facts** (what happened, exact text) — high confidence
2. **Pattern type** (which of 6 categories) — per-type rules
3. **ADHD context** (specific to ADHD communication/ADHD needs) — lower confidence, higher insight value

Example flow:
- **Pattern found:** ESCALATION_PATTERN in turn 7
- **Mechanical:** User typed in caps, included curse word, after AI asked a clarifying question
- **Pattern analysis:** Escalation triggered by redundant question (context existed)
- **ADHD context:** Trigger type = "tedious back-and-forth"; recovery = yes; intervention = "AI gave direct answer"; no abandonment
- **Confidence:** Mechanical facts 95%, trigger type 70%, recovery intervention 75%

This single data point contributes to: "redundant clarifications trigger escalation in ADHD conversations, direct answers recover trust, pattern is recoverable."

---

## What You're NOT Doing

- **No psychology claims.** ("User has executive dysfunction" — can observe scattered input, not diagnose)
- **No causality** as certainty. ("AI caused the escalation" — can say it coincided; effects are lower confidence)
- **No counterfactuals.** ("If AI had said X, user would have...") — not extractable
- **No learning/success claims.** ("User learned to write clearer" — can observe improvement, not claim causality)

You're extracting: observable patterns, detectable triggers, attempted interventions, outcomes.

---

## Using This Guide During Extraction

1. Read the conversation normally, identify the pattern (existing methodology)
2. Ask: "What does this tell me about ADHD communication / ADHD needs?"
3. Fill in the ADHD context fields (use the specific values listed in each pattern's section above)
4. Assign confidence — mechanical facts are high, ADHD-context inference is lower
5. Move on

Don't overthink it. If the ADHD angle isn't obvious, note that and move to the next pattern. The methodology accepts partial data.

---

## Expected Outcomes

After Phase 1 pilot (5 conversations):
- Roughly 80-150 patterns extracted (rough estimate)
- ~60-70% will have ADHD context data (some patterns won't have ADHD angle)
- Confidence scores will range 50-95% (mechanical high, ADHD-context inference moderate)
- Clear examples of what works/fails for ADHD users

After full extraction (900 conversations):
- ~15,000-20,000 patterns with ADHD context
- Frequency distributions showing most common friction types
- Correlation data: which ADHD triggers correlate with abandonment/escalation
- Actionable insights: "90% of context-ignore friction is recoverable with…", "overwhelm + time pressure predicts abandonment 75% of the time", etc.

This data directly informs app improvements: better context handling, faster response time, recognizing overwhelm earlier, adapting directness to mood, etc.

