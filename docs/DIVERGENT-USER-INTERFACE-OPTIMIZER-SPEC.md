# Divergent User Interface Extraction/Optimizer

**Document role:** Customer-product scope and dataset registry  
**Product:** Divergent User Interface  
**Engine:** Divergent User Interface Extraction/Optimizer  
**Version:** FROZEN 1.0  
**Approval state:** APPROVED AND FROZEN 2026-08-29  
**Frozen now:** Product identity, customer workflow, C01–C10 checkbox labels, 50-dataset mapping, and separation from the personal extraction program

## 1. Product purpose

The Divergent User Interface is the customer-facing Divergence.AI experience. Its Extraction/Optimizer uses each customer's own eligible saved Divergence.AI conversations to tailor that customer's experience.

Different ADHD users respond to different wording, pacing, structure, tone, choices, and forms of assistance. The optimizer must learn from the individual customer's evidence. It must not apply a universal ADHD personality or assume that a pattern found for one customer applies to another.

## 2. Frozen customer workflow

The complete customer decision flow is:

1. The customer sees a short checklist of areas Divergence.AI can tailor.
2. The customer checks or leaves unchecked each area.
3. The customer presses one button: **Personalize My Divergence**.
4. The optimizer automatically selects the matching dataset groups.
5. The optimizer analyzes all eligible saved conversations for that customer.
6. Evidence-supported findings update only the selected parts of that customer's profile.
7. Divergence.AI uses the updated profile in future interactions.

The customer does not select conversations, write an extraction prompt, choose datasets, choose a model, choose a search method, choose an output folder, or manage extraction files.

An unchecked item means: do not analyze or alter that category during this run. It does not silently erase an existing preference.

Progress and a final status message may be displayed, but they must not introduce additional customer decisions.

## 3. Frozen customer checklist

These are plain-language customer choices. The technical datasets remain hidden.

| ID | Customer checkbox | Plain-language meaning |
|---|---|---|
| C01 | **Keep Responses the Right Length** | Learn when this customer needs a short answer, more detail, or information revealed gradually. |
| C02 | **Explain Things in the Way I Understand** | Learn which explanation structures, wording, examples, and instruction formats work best. |
| C03 | **Match My Tone and Directness** | Learn how direct, gentle, formal, casual, concise, or conversational responses should be. |
| C04 | **Prevent and Reduce Overwhelm** | Learn what creates cognitive overload and what reliably reduces it. |
| C05 | **Respond Better When I’m Frustrated or Correcting the AI** | Learn what causes escalation and what successfully repairs the interaction. |
| C06 | **Stay Focused on What I Asked** | Learn how to preserve the customer's objective, constraints, context, and place in a task. |
| C07 | **Help Me Start, Continue, and Finish Things** | Learn the forms of assistance that improve task initiation, resumption, progress, and completion. |
| C08 | **Give Me the Right Amount of Choice** | Learn when to recommend one answer, offer options, ask a question, or make an objective default decision. |
| C09 | **Personalize Encouragement and Emotional Support** | Learn which forms of acknowledgment, reassurance, encouragement, urgency, or accountability help or harm. |
| C10 | **Adapt the Interface and Workflow to Me** | Learn supported preferences about information density, visible tools, defaults, navigation, notifications, and workflow. |

This checklist and its dataset mapping are implementation authority for version 1.0. Adding, removing, renaming, merging, or reassigning a checkbox or dataset requires a versioned specification change.

## 4. Checkbox-to-dataset mapping

Checking a customer item activates every dataset in its assigned group. Customers never see or select the individual datasets.

| Checkbox | Dataset group | Profile area allowed to change |
|---|---|---|
| C01 | G01 Length and detail | Response length, initial detail, progressive disclosure, task-specific detail |
| C02 | G02 Explanation and comprehension | Explanation format, vocabulary, examples, sequencing, copy-ready formatting |
| C03 | G03 Tone and directness | Directness, warmth, formality, conversational style, acknowledgment style |
| C04 | G04 Overwhelm and cognitive load | Information density, chunk size, pacing, number of simultaneous demands |
| C05 | G05 Frustration, correction, and repair | Correction handling, reflection, verification, apology, repair behavior |
| C06 | G06 Focus and continuity | Objective preservation, scope control, constraint retention, resume behavior |
| C07 | G07 Task progress and completion | Starting support, next-action size, planning, resumption, completion support |
| C08 | G08 Choice and decision support | Option count, recommendation strength, clarification frequency, default decisions |
| C09 | G09 Encouragement and emotional support | Encouragement, validation, reassurance, pressure, accountability style |
| C10 | G10 Interface and workflow | Supported interface density, visibility, defaults, navigation, notification preferences |

## 5. Dataset registry

Each dataset is an extraction question applied across the customer's eligible conversations. It must gather semantic, contextual, sequential, comparative, and outcome evidence. Keyword matches may locate candidates but can never define the dataset's findings.

### G01 — Length and detail

- **G01-D01 Explicit length requests:** Extract direct requests for shorter, longer, simpler, fuller, or more detailed responses and the context in which each request occurred.
- **G01-D02 Excess-detail failures:** Find cases where response length, density, repetition, or unnecessary background contributed to confusion, frustration, disengagement, or abandonment.
- **G01-D03 Insufficient-detail failures:** Find cases where missing explanation, omitted steps, or unsupported conclusions caused follow-up questions, errors, or dissatisfaction.
- **G01-D04 Successful detail by context:** Compare successful interactions across task types to determine when concise, moderate, detailed, or progressive responses worked best.
- **G01-D05 Detail transitions:** Extract when the customer wanted an initial short answer followed by optional expansion, and when that pattern did or did not work.

### G02 — Explanation and comprehension

- **G02-D01 Confusion onset:** Find moments where understanding broke down and preserve the AI explanation immediately before the breakdown.
- **G02-D02 Successful re-explanations:** Extract the rewording, example, comparison, demonstration, or structure that resolved confusion.
- **G02-D03 Format effectiveness:** Compare steps, examples, analogies, definitions, comparisons, demonstrations, and summaries against observed outcomes.
- **G02-D04 Vocabulary and terminology:** Extract preferred wording, jargon tolerance, definitions requested, and terms the customer repeatedly misunderstands or corrects.
- **G02-D05 Usable instruction format:** Find whether copy-ready text, numbered actions, checklists, demonstrations, or completed examples most often lead to successful use.

### G03 — Tone and directness

- **G03-D01 Explicit tone preferences:** Extract direct instructions or corrections about tone, directness, politeness, formality, warmth, brevity, and conversational style.
- **G03-D02 Indirectness and hedging outcomes:** Find when caveats, excessive qualification, avoidance, or indirect answers helped or harmed the interaction.
- **G03-D03 Bluntness and softness outcomes:** Compare reactions to blunt, gentle, neutral, enthusiastic, or emotionally expressive responses.
- **G03-D04 Tone by situation:** Determine whether preferred tone changes by task type, emotional state, urgency, error severity, or conversation stage.
- **G03-D05 Acknowledgment style:** Extract which apologies, confirmations, reflections, or acknowledgments restore trust and which feel repetitive or performative.

### G04 — Overwhelm and cognitive load

- **G04-D01 Overwhelm onset sequences:** Reconstruct what happened before overload, including response structure, demands, options, questions, repetition, and unresolved context.
- **G04-D02 Overwhelm triggers:** Aggregate recurring triggers without requiring the customer to use the word “overwhelmed.”
- **G04-D03 Successful reduction:** Find changes that measurably reduced overload and allowed the customer to continue.
- **G04-D04 Failed reduction and escalation:** Find attempted de-escalation that made overload worse or caused disengagement.
- **G04-D05 Cognitive-load boundaries:** Compare successful and unsuccessful instruction sizes, pacing, simultaneous choices, nested steps, and topic changes.

### G05 — Frustration, correction, and repair

- **G05-D01 Frustration onset sequences:** Find frustration signals and preserve the AI messages, assumptions, omissions, or repeated behavior immediately beforehand.
- **G05-D02 Repeated corrections:** Identify instructions, facts, boundaries, or preferences the customer had to repeat and why they were not retained.
- **G05-D03 Successful repairs:** Extract the responses that restored cooperation, trust, clarity, or progress after a failure.
- **G05-D04 Failed repairs and abandonment:** Find apologies, explanations, retries, or redirections that escalated frustration or caused the customer to stop.
- **G05-D05 Verification behavior:** Compare when restating, quoting, confirming, or asking one targeted question prevented another mistake.

### G06 — Focus and continuity

- **G06-D01 Topic drift and objective substitution:** Find when the AI pursued an adjacent goal instead of the customer's actual goal and what consequences followed.
- **G06-D02 Lost requirements and constraints:** Extract requirements the AI forgot, altered, or contradicted during a conversation.
- **G06-D03 Successful focus preservation:** Find techniques that kept the original goal, exclusions, and success conditions active through long or interrupted work.
- **G06-D04 Resume and interruption behavior:** Extract what information was needed to resume correctly after pauses, new sessions, interruptions, or topic changes.
- **G06-D05 Scope-change tolerance:** Determine when useful initiative helped and when additions, alternatives, future steps, or unsolicited redesign created friction.

### G07 — Task progress and completion

- **G07-D01 Starting barriers:** Find what prevented action from beginning and what type of first step successfully initiated progress.
- **G07-D02 Stuck and abandonment sequences:** Reconstruct where progress stopped, what happened immediately beforehand, and what assistance failed.
- **G07-D03 Successful continuation:** Extract response patterns associated with sustained progress across multiple steps.
- **G07-D04 Successful resumption:** Find what allowed an interrupted or abandoned task to be resumed without reconstructing everything manually.
- **G07-D05 Completion patterns:** Compare completed and uncompleted tasks to identify evidence-backed differences in pacing, instruction size, examples, decisions, and assistance.

### G08 — Choice and decision support

- **G08-D01 Choice overload:** Find when the number, similarity, or presentation of options delayed action or created frustration.
- **G08-D02 Successful recommendations:** Extract when one clear recommendation or ranked choice helped the customer move forward.
- **G08-D03 Clarification-question outcomes:** Compare helpful questions with unnecessary, repeated, technical, or decision-transferring questions.
- **G08-D04 Decision responsibility:** Identify objective decisions the customer expects the AI to make and subjective decisions the customer wants to retain.
- **G08-D05 Reversals and corrections:** Find decisions later reversed because the earlier recommendation ignored a requirement, preference, risk, or missing context.

### G09 — Encouragement and emotional support

- **G09-D01 Encouragement outcomes:** Compare encouragement that improved engagement with encouragement that felt distracting, excessive, generic, or patronizing.
- **G09-D02 Validation and reassurance:** Extract when acknowledgment or reassurance helped and when it replaced the requested work.
- **G09-D03 Pressure and urgency:** Find whether deadlines, urgency, challenge, or pressure motivated action or increased avoidance and distress.
- **G09-D04 Accountability style:** Extract responses to reminders, check-ins, progress acknowledgment, and commitment language.
- **G09-D05 Sensitivity during correction:** Find wording and sequencing that allowed errors, disagreement, refusals, or limitations to be communicated without unnecessary escalation.

### G10 — Interface and workflow

- **G10-D01 Explicit interface preferences:** Extract direct statements about layout, density, visibility, themes, controls, navigation, notifications, and workflow.
- **G10-D02 Navigation and discovery friction:** Find conversation evidence that the customer could not locate, understand, or use a feature or control.
- **G10-D03 Information-density preferences:** Extract evidence about crowded screens, hidden controls, progressive disclosure, labels, and visual hierarchy.
- **G10-D04 Defaults and shortcuts:** Find repeated workflows, preferred starting locations, frequently requested actions, and safe defaults supported by conversation evidence.
- **G10-D05 Notification and interruption preferences:** Extract supported preferences about timing, frequency, urgency, dismissal, and interruption. Absence of a complaint is not evidence of a preference.

Interface changes require evidence from explicit conversation statements or separately consented product-interaction data. The optimizer must not infer visual or accessibility preferences merely because a feature was not mentioned.

## 6. Universal dataset analysis contract

Every dataset must evaluate all relevant evidence forms:

- Explicit requests and corrections
- Meaning and semantic similarity, not only exact words
- Conversation sequence and what occurred immediately before and after an event
- Repeated behavior across conversations
- Contrasting cases with different outcomes
- Successful recovery versus failed recovery
- Completion, abandonment, continued engagement, or repeated correction
- Context-dependent preferences and exceptions
- Changes over time and recent evidence
- Conflicting evidence and uncertainty

Each dataset must return:

- Dataset ID and selected checkbox ID
- Candidate personal preference or optimization rule
- Contexts where it applies
- Contexts where it must not apply
- Supporting account, conversation, message, and timestamp references
- Evidence excerpts sufficient for audit
- Counterevidence and contradictions
- Observed outcome
- Confidence and evidence strength
- Proposed profile field change
- No-change reason when support is insufficient

An explicit customer instruction may support a preference immediately. An inferred behavioral preference requires repeated independent evidence. Contradictory patterns must be preserved as contextual rules; they must not be flattened into one global preference.

## 7. Optimization rules

- Only checked categories may be analyzed or changed during the run.
- Findings apply only to the customer whose conversations supplied the evidence.
- No generic ADHD assumption may be converted into a personal preference.
- Keyword detection is a candidate-locating tool only.
- The AI must analyze context, sequence, contrast, and outcomes.
- No evidence means no change.
- Uncertain or contradictory evidence must not produce a silent global rule.
- Source conversations are never rewritten or deleted.
- Profile changes must be versioned, auditable, and reversible.
- A failed or incomplete run changes nothing.
- Future runs use new evidence to refine or contextualize preferences without silently erasing supported earlier rules.

## 8. Cost-efficient execution

1. Code inventories eligible saved conversations and tracks what has already been processed.
2. Code identifies broad candidate passages for only the selected dataset groups.
3. The system builds compact context windows around candidates.
4. AI performs semantic, sequence, comparison, contradiction, and outcome analysis on those windows.
5. A validation stage rejects unsupported profile changes.
6. Only validated, category-scoped changes are written to the customer's profile.

The model and technical extraction controls are system decisions, not customer choices. Whole histories must not be resent when an incremental run can reuse prior validated state and process only new or changed conversations.

## 9. Customer-visible result

The customer receives a short completion statement, for example:

> Personalization complete. Divergence.AI updated 4 selected areas using patterns supported by your conversations. One selected area was unchanged because there was not enough evidence.

Supporting evidence, technical datasets, profile fields, model controls, and diagnostics are not part of the normal customer workflow. They may exist in operator-only Developer Mode for validation and rollback.

## 10. Explicit exclusions

This system is not the personal general-purpose extraction program. It must not gain:

- Arbitrary natural-language extraction requests
- Customer-supplied dataset files
- Source-folder or output-folder selection
- General topic, timeline, relationship, or evidence research
- Output-format selection
- Lite, Balanced, or Professional extraction modes
- Model selection
- Batch extraction queues
- A/B extraction testing
- Multi-extraction comparison
- General extraction documents or result folders

Those capabilities belong only to the separate personal general-purpose extraction program.

## 11. Freeze record

- **Operator approval date:** 2026-08-29
- **Approved implementation commit:** `cb2687c49aea9c92d9887aedd4dad449e37cbc34`
- **Frozen mapping:** C01–C10 and G01-D01 through G10-D05 exactly as recorded above
- **Change control:** Any addition, removal, rename, merge, or reassignment requires a versioned specification change and new operator approval.

