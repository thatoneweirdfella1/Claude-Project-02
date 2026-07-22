# DIVERGENCE.AI — PIPELINE AND ENGINES
**The internal behavior of the app: the five stages a request flows through, and the engines inside them. Routing is covered separately in ROUTING.md because it is already built.**

---

## THE FIVE-STAGE PIPELINE

A user request flows through five stages in order. The orchestrator (build step 5.2) owns this flow and passes each stage's output into the next.

**Stage 1, Translation.** Raw input, detect gaps, reorder buried context, decompose compound questions, normalize language. Out: translated question plus confidence plus detected gap types.

**Stage 2, Routing.** Analyze complexity, domain, scope. Select the model or honor the user override. Out: model choice plus complexity score. Already built, see ROUTING.md.

**Stage 3, Technique Selection.** Score the techniques, check conflicts and dependencies, stack at most 4. Out: selected techniques and their order.

**Stage 4, Composition.** Load a base template, insert the role prime, inject the translated question, encode the directness level, inject the techniques in order, add the output format, inject the confidence requirement. Out: the final optimized prompt.

**Stage 5, Execution and Learning.** Send to the model through the proxy, stream the response, log telemetry, collect the rating and feedback, and after 15+ questions analyze patterns and refine rules. Out: the answer plus logged data.

---

## TRANSLATION ENGINE (Feature 1)

Takes raw ADHD input (rambling, emotional, tangential) and returns the real question reframed clearly, a confidence score, and the gap types detected.

**Gap taxonomy.** Tangential preamble, emotional intensity distortion, compound buried request, typo/pronoun/wrapper corruption, scope ambiguity, unstated assumptions.

**Confidence** is 0 to 100 and means "did the engine identify the right request," not "is the answer good."

**Confidence gates.** 80 and above proceeds and shows the score. 60 to 79 proceeds with a visible note that it was interpreted with moderate confidence. Below 60 does NOT proceed; the engine asks a clarifying question instead, phrased neutral and curious, never corrective, never making the user feel stupid.

**Runtime model** for translation calls is claude-sonnet-5 through the proxy.

**Verification.** A 50-case test corpus (31_0_translation_test_cases.md) drawn from the user's real conversation archive. Target 90 percent overall, no category below 80, reported per category, not averaged.

---

## STATE DETECTION (Feature 5)

RESOLVED behavior, this overrides the old spec text: detection runs ON DEMAND when the user hits TRANSLATE & ASK, alongside the translation call. It does NOT run live while the user types. There is no local heuristic tier and no sub-300ms detection budget. It is a single on-demand classification calling claude-haiku-4-5 through the proxy.

**Four dimensions and their system impact.**

Emotion: Overwhelmed (recommend directness Level 1), Frustrated (Simplify), Calm (Socratic), Excited (Detailed), Anxious (Verify). Detected from exclamation, capitalization, rambling versus organized structure, hesitation, sarcasm.

RSD Level (rejection sensitivity): High (extra warm tone, explicit positive framing), Medium (balanced), Low (direct, factual). Detected from apologies, self-criticism, hedging, "if that's okay," parenthetical disclaimers.

Interest: Low (Simplify), Medium (standard), High (Detailed or Comparative). Detected from generic versus specific phrasing, "have to" versus passionate language, depth of the question.

Cognitive Mode: Analytical (Chain-of-Thought or Step-by-step), Creative (Metaphor or Comparative), Processing (Socratic), Racing (Simplify), Stuck (Examples). Detected from step-by-step versus brainstorming, "what if" questions, rapid-fire versus deliberate, repetition.

**Pills** are dismissible (X) and correctable (click to open a correction control). After 15 or more corrections for a given state, detection adapts for that user. The detected state feeds four consumers: directness auto-recommendation, technique selection, answer tone, and the transparency card.

---

## TECHNIQUE SELECTION AND COMPOSITION (Feature 4)

Include every technique, prune later. Socratic (default), Quote-First, Chain-of-Thought, Role-Prime, Verify, Examples, Simplify, Detailed, Step-by-step, Comparative, Metaphor, Auto-detect.

Each technique has an effect, conflicts with certain other techniques, and dependencies on others. Auto-detect scores each technique for the current question, respects conflicts and dependencies, and stacks at most 4.

Composition assembles the final prompt in this fixed order: base template, role prime, translated question, directness encoding, techniques in order, output format, confidence requirement.

---

## DIRECTNESS (Feature 3)

Three levels persisting in the session. Level 1 supportive with extensive scaffolding, Level 2 clear and warm with moderate detail (default), Level 3 direct and concise with minimal explanation. State detection can auto-recommend a level.

---

## MULTI-AI ACTIONS (Feature 9)

Debate: two AI streams argue opposite sides in a two-column view. Consensus: common ground after a debate (disagreement, common ground, unified view). Synthesis: combine perspectives into one refined answer the user can use to replace the original or merge below. Consensus and Synthesis run on claude-opus-4-8 at runtime.

---

## LEARNING LOOP (Feature 7 and Stage 5)

After 15 or more questions, an async background job analyzes feedback and correction patterns and proposes rule refinements (for example, low ratings plus "too verbose" reduce the Detailed technique), with dampening so a single rating does not swing behavior. An applier writes accepted refinements to the account store with an audit log. It never blocks the user.
