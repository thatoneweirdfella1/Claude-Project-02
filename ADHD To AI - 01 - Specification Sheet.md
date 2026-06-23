# ADHD-to-AI Translator: Complete App Specification

## THE PROBLEM

People with ADHD often have a communication pattern that differs from how AI systems expect input to be structured. Their raw questions tend to include:
- Tangential context and preamble before the core question
- Emotional intensity mixed with logical requests
- Unstated assumptions that seem obvious to them but aren't explicit
- Scope ambiguity (they don't fully know what they're asking for)
- Multiple separate questions bundled into one rambling statement
- Leading with context instead of leading with the actual need

This causes two problems:
1. They get answers that address the surface input rather than the actual question
2. They don't know which AI model would be best for their question type
3. They don't know which prompt engineering techniques would help their specific communication style

The result: worse answers than they could have gotten with a translator in between.

---

## THE SOLUTION: ADHD-to-AI Translator

A system that sits between the user and AI models and does four things:

**1. TRANSLATES raw input into clear questions**
- Analyzes what the user typed
- Identifies the actual question underneath
- Applies transformation operations (extract core, reorder context, normalize emotion, etc.)
- Returns a clearer question + confidence score
- User can accept, reject, or edit the translation

**2. ROUTES to the right model (Haiku, Opus fast, or Opus thinking)**
- Measures question complexity, domain, scope, novelty, certainty, time sensitivity, depth need
- Applies routing decision tree
- Routes to fastest/cheapest model that will work, or higher-cost model if needed
- Shows the user which model was chosen and why
- User can override if they want

**3. COMPOSES optimal prompts using technique selection**
- Selects which prompt engineering techniques to apply (hallucination-reduction, chain-of-thought, role-priming, etc.)
- Combines techniques intelligently (checks for conflicts, synergies, dependencies)
- Builds final prompt from template + techniques + translated question
- Shows the user what techniques were applied and the final prompt

**4. LEARNS from feedback**
- User rates each answer (good, bad, useful, not useful)
- System logs routing decision, technique choices, and outcome
- Pattern analysis identifies what works for that user
- Rules self-adjust over time (e.g., "when user asks about topic X, Opus-thinking gets better results")

---

## USER EXPERIENCE FLOW

1. **User types their raw ADHD-style question**
   - "okay so like i've been thinking about the architecture problem but also i notice the logging is weird and do the models handle like edge cases for the thing, and also im overthinking this but which model should i even use"

2. **System shows the translation**
   - "Translated: You're asking three separate questions: (1) How should architecture handle the logging issue? (2) Which model best handles edge cases for your specific use case? (3) Should you pick based on the problem characteristics or your time/cost constraints?"
   - User: Accept / Reject / Edit

3. **System routes and shows reasoning**
   - "Routing to Opus fast for question 1 (architectural analysis, moderate complexity)"
   - "Routing to Haiku for question 2 (straightforward comparison)"
   - "Routing to Haiku for question 3 (decision logic, low complexity)"
   - User: Accept / Override to different models

4. **System selects techniques and shows them**
   - "Selected techniques: Chain-of-Thought (for reasoning), Explicit Scope (to keep edge cases in bounds), Quote-First (to ground in specifics)"
   - User: Accept / Add techniques / Remove techniques

5. **System shows final prompt**
   - Raw final prompt that will be sent to the model

6. **User gets answers from model**

7. **User gives feedback**
   - "Good answer" / "Bad answer" / "Good but not what I needed" / rating scale
   - System logs all decisions and outcome

---

## CORE SYSTEMS (DETAILED)

### SYSTEM 1: QUESTION TRANSLATION ENGINE

**Input:** Raw ADHD-style question (rambling, multi-part, emotionally charged, unclear scope, buried core question)

**Analysis Phase:**
The system analyzes the input across 5 dimensions:
1. Emotional/contextual content vs. logical content (separate them)
2. Unstated assumptions (what's the user assuming about what they're asking?)
3. Scope ambiguity (is the ask narrow, medium, or broad?)
4. Stated vs. actual question (what's really being asked vs. what was said?)
5. Prerequisite knowledge gaps (what does the user need to understand to be answered?)

**Translation Operations (6-7 core, expandable):**
1. **extract-core-question** — strip away context/emotion and identify the actual ask
2. **reorder-context** — move buried core questions to the front
3. **normalize-emotional-language** — rephrase emotional intensity as logical description
4. **clarify-scope** — make scope explicit ("narrow yes/no answer" vs. "comprehensive exploration")
5. **surface-assumptions** — pull out unstated assumptions and make them explicit
6. **decompose-compound** — split multi-question rambles into separate clear questions
7. (Additional operations based on research)

**Confidence Scoring:**
After translation, the system rates how confident it is in the translation (0-100). This confidence score drives whether the system proceeds automatically or asks the user for clarification.

**Output:** Translated question(s) + confidence score + user can accept/reject/edit

---

### SYSTEM 2: MODEL ROUTING ENGINE

**Routing Dimensions (what the system analyzes):**
1. Complexity (1-10 scale: how many reasoning steps? Novel? Ambiguous?)
2. Domain (factual, analytical, creative, comparative, exploratory, decision-making, etc.)
3. Scope (narrow/clear vs. broad/open-ended)
4. Certainty (clear right answer vs. exploratory)
5. Time sensitivity (does token efficiency matter?)
6. Depth requirement (surface clarity vs. deep analysis)

**Three Routing Options:**
- **Haiku:** Fast, token-efficient, good for straightforward questions
- **Opus fast:** Medium complexity, no extended thinking (saves tokens vs. Opus thinking)
- **Opus thinking:** Deep reasoning, multi-step problems, ambiguous questions, novel domains

**Decision Tree:**
The router builds a decision tree (15-20 specific rules) like:
- "If complexity < 3 AND domain = factual AND scope = narrow: Haiku"
- "If complexity 5-7 OR domain = analytical: Opus fast"
- "If complexity >= 8 OR (domain = exploratory AND scope = broad): Opus thinking"
- (etc. for all combinations)

**Confidence Scoring:**
The routing itself gets a confidence score (0-100). If confidence < 75%, the system shows the user multiple options or picks the safe higher-cost model.

**Output:** Model choice + reasoning + confidence + user can override

---

### SYSTEM 3: PROMPT COMPOSITION ENGINE

**Technique Selection:**
The system has a library of 15-25 prompt engineering techniques (hallucination-reduction methods, chain-of-thought variants, role-priming, few-shot, constraint-setting, etc.). For each translated question and routed model, the system selects which techniques to apply.

**Technique Library (examples):**
1. "Give explicit permission to say 'I don't know'" (hallucination prevention)
2. Chain-of-Thought variants (basic, extended, structured)
3. Quote-First method (forces grounding in specifics)
4. Self-verification (model checks its own work)
5. Role-priming (adopts role for accuracy)
6. Retrieval-Augmented Generation (grounds in external knowledge)
7. Few-shot examples (in-context learning)
8. Instruction hierarchy (primary goal > constraints > output format)
9. Explicit scope limitation (defines boundaries)
10-25. (Additional techniques from research)

**Combination Rules:**
- Safe combinations (can be used together)
- Conflicting combinations (don't use together)
- Amplifying synergies (make each other stronger)
- Ordering dependencies (must apply in specific order)
- Maximum threshold (token overhead limit, don't stack too many)

**Composition Algorithm:**
1. Load appropriate template (varies by model)
2. Insert role prime (if selected)
3. Insert translated question
4. Inject selected techniques in correct order
5. Add output format specification
6. Validate for conflicts/clarity
7. Output final prompt

**Effectiveness Matrices:**
- Technique × Question Type: which techniques work for which question types
- Model × Question Type: which models are best for which question types
- Technique × Model: how does effectiveness vary by model

**Output:** Final prompt ready for model + list of techniques applied + confidence score

---

### SYSTEM 4: LEARNING & FEEDBACK SYSTEM

**Feedback Collection:**
After the model responds, the user rates the answer on a simple scale:
- Good answer (addressed actual need, was useful)
- Bad answer (missed the mark)
- Good but not ideal (addressed the question but could have been better)
- Rating scale (1-5 or similar)

**What Gets Logged:**
- The original raw input
- The translated question
- Model choice + routing confidence
- Techniques selected + their confidence scores
- The final prompt
- User's feedback
- The model's response
- User's rating

**Pattern Analysis:**
After 50+ questions + feedback, the system analyzes:
- "What question types consistently route to Model X?"
- "What techniques consistently improve answers for Topic Y?"
- "When I ask about Z, which model gets the best results?"
- "What topics get better results with Technique A vs. B?"

**Rule Refinement:**
Based on patterns, the system can adjust:
- Routing rules (e.g., "actually, this complexity level works better with Opus thinking")
- Technique selection (e.g., "for questions about this topic, always include Chain-of-Thought")
- Decision thresholds (e.g., "this complexity measure should be 6, not 5")

---

## KEY DESIGN DECISIONS

**Why three models (Haiku/Opus fast/Opus thinking)?**
- Haiku: fast + cheap (for simple questions)
- Opus fast: balanced (for medium questions)
- Opus thinking: comprehensive (for complex/ambiguous questions)
This gives options across the speed/quality/cost spectrum.

**Why a translation layer at all?**
Because ADHD input patterns are systematic and predictable. They're not random. The user's brain consistently leads with context, buries core questions, and mixes emotions with logic. A translation layer that understands these patterns can systematize the fix.

**Why technique selection instead of always using all techniques?**
Because techniques have costs (tokens, sometimes clarity, sometimes conflicts with each other). Stacking 10 techniques on a simple factual question wastes tokens. Technique selection picks what's actually needed.

**Why learning/feedback system?**
Because the translator can't know all of Devan's patterns upfront. After 50-100 questions, patterns emerge that could improve routing/technique selection. The system gets smarter over time.

**Why show the user every decision?**
Transparency builds trust. The user can see why the system routed them to a model, what techniques it selected, and what the final prompt looks like. They can override if they disagree. This isn't a black box.

---

## SUCCESS CRITERIA

The app succeeds if:

1. **Translation is accurate** — User's actual question is correctly identified and extracted (measure: user accepts translation without edit >80% of the time)

2. **Routing improves answers** — Questions routed with the translator get better answers than if asked raw to any single model (measure: user rates routed answers higher than baseline)

3. **Technique selection helps** — Applying selected techniques produces better answers than base model without techniques (measure: user feedback shows measurable improvement)

4. **Learning works** — After 50+ questions with feedback, routing rules and technique selection improve (measure: confidence scores go up, user ratings stabilize at higher level)

5. **User adoption** — User actually uses the system instead of asking raw questions (measure: friction is low, transparency builds trust, overrides are rare)

---

## WHAT THE USER GETS (OUTPUTS)

**For each question:**
- Translated version of the question(s)
- Model choice with reasoning
- Techniques applied with explanations
- The final prompt that will be sent
- The model's answer
- Ability to rate the answer

**Over time:**
- A log of their question patterns
- Insights into which models work best for them
- Insights into which techniques improve their answers
- Automated rule refinements that improve future questions

**Control/transparency:**
- Can reject any translation and edit
- Can override model choice
- Can add/remove techniques
- Can see the final prompt before execution
- Can see how the system is learning from their feedback

---

## TECHNICAL ARCHITECTURE SUMMARY

**Input → Translation Engine → Routing Engine → Composition Engine → Model API → Output**

Each stage has:
- Analysis/decision logic
- Confidence scoring
- Logging
- User transparency/override options
- Feedback integration (for learning)

**Databases/Libraries needed:**
- Prompt library (10+ categories, 40+ total prompts)
- Technique library (20+ techniques documented)
- Translation operation library (6-7 operations)
- Routing matrix (20+ question types × 3 models)
- Technique effectiveness matrix (techniques × question types)
- Combination rules (safe pairs, conflicts, synergies, ordering)

**Algorithms:**
- Translation algorithm (pseudocode, edge cases, failure handling)
- Routing algorithm (decision tree with 15-20 rules)
- Technique selection algorithm (scoring + conflict resolution)
- Composition algorithm (template + injection + validation)

**Testing:**
- 50+ translation test cases
- 100+ routing test cases
- 50+ technique selection test cases
- 30-50 end-to-end integration tests
- Failure mode tests (what if translation fails? routing is uncertain? techniques conflict?)
- Learning system tests (does it actually improve over 50 questions?)

---

## WHAT THIS IS NOT

This is NOT:
- A general-purpose AI assistant wrapper (not for everyone)
- A tool that fixes bad writing (not grammar-focused)
- A replacement for models (still uses Claude models)
- A one-size-fits-all solution (customized to Devan's patterns)
- A chatbot (single-question focus, not conversation)

This IS:
- A translation + routing + composition system specifically for ADHD communication patterns
- A framework for finding the right model + technique combination for specific question types
- A learning system that improves over time from user feedback
- A transparency tool that shows users exactly what decisions were made and why

---

## SUCCESS LOOKS LIKE

**Day 1:** User can translate a rambling question and see it become clearer. Can see which model was chosen and why. Can see what techniques were applied.

**Week 1:** User has answered 10-20 questions with the translator. Feedback patterns emerging.

**Month 1:** User has 50+ questions logged. Pattern analysis shows "this topic works better with technique X" or "these complexity levels route to this model best."

**Ongoing:** User no longer asks raw questions—they use the translator by default because it produces better answers and shows them why.

---

## NEXT STEP

This specification, combined with the detailed guidance document (which explains what's needed for each checklist item in 5 sentences or less), should give an AI enough context to complete most of the research, design, database-building, and algorithm work with minimal clarification questions.

The three-document system:
1. **Checklist** = What needs to be done
2. **Detailed Guidance** = How to do each item
3. **This Specification** = Why the app exists and what it should do

Together, they form a complete specification package.
