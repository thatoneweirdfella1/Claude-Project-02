# ADHD-to-AI Translator Program: Complete Build Checklist

**Overview:** This checklist defines every research, design, database, and architectural component required before a single line of production code is written. It is organized as a teaching curriculum: each section represents a learning unit, and subsections represent specific competencies that must be mastered or completed before moving forward.

**Completion Standard:** When all items are checked, you possess the knowledge, frameworks, and data structures necessary to architect and build the program.

---

## KEY: Work Type & Model

🔴 Red = Manual — You do it.
🟡 Yellow = Hybrid — You + something else.
🟢 Green = Auto — Get it from elsewhere.

---

## PHASE 1: FOUNDATIONAL RESEARCH & KNOWLEDGE MAPPING

### 1.0 ADHD COGNITION & INPUT PATTERNS
**Learning Unit: Understanding how ADHD brains input vs. what they actually need to ask**

* [ ] 🔴 1.1 Haiku Document 5-10 real examples of your own ADHD input vs. the actual question underneath (from past Claude conversations)
* [ ] 🔴 1.2 Haiku Identify the gap pattern: What specifically transforms your initial statement into the real question?
* [ ] 🔴 1.3 Haiku Categorize these gaps into types (e.g., "tangential preamble," "mixed problem statement," "inverse framing," "emotional context bleeding into task definition," etc.)
* [ ] 🟢 1.4 Haiku Research existing ADHD communication literature: identify 3-5 peer-reviewed sources on ADHD verbal processing and communication clarity gaps
* [ ] 🔴 1.5 Haiku Document how your brain defaults to processing (e.g., "I think by speaking," "I process associatively," "I lead with context before the core question")
* [ ] 🔴 1.6 Haiku Map the 3-4 most common patterns in your communication that would need to be normalized for better AI responses
* [ ] 🔴 1.7 Haiku Create a reference matrix: "When I say X, I usually mean Y" (at least 20 examples from your own history)
* [ ] 🔴 1.8 Haiku Identify which communication patterns work better with which AI models (e.g., "Haiku handles my side-context better than Opus when I ask rambling questions")
* [ ] 🔴 1.9 Haiku Document edge cases: questions where your raw input actually works fine, and model that so the translator doesn't over-correct

### 2.0 PROMPT ENGINEERING FOUNDATIONS
**Learning Unit: Understanding every dimension of prompt effectiveness**

* [ ] 🟢 2.1 Haiku Study and document the 6 hallucination-reduction methods you listed:
* [ ] 🟢 2.2 Haiku "Give explicit permission to say I don't know" - define exact implementation, when it's most effective, trade-offs
* [ ] 🟢 2.3 Haiku "Chain-of-Thought prompting" - define variants (basic CoT, extended CoT, structured CoT), effectiveness by model
* [ ] 🟢 2.4 Haiku "Quote First method" - define implementation, optimal use cases, when it fails
* [ ] 🟢 2.5 Haiku "Ask the model to verify itself" - define verification architectures (e.g., self-check, self-debate, double-pass)
* [ ] 🟢 2.6 Haiku "Role-prime for accuracy over helpfulness" - define role types, accuracy impact measurements
* [ ] 🟢 2.7 Haiku "Retrieval-Augmented Generation" - define scope (external knowledge, citations, grounding)
* [ ] 🟢 2.8 Haiku Research and document 5-10 additional prompt engineering techniques beyond the 6 above (e.g., few-shot prompting, instruction hierarchy, explicit constraint setting, output format specification, etc.)
* [ ] 🟢 2.9 Haiku For each technique, document: name, definition, when it's most effective, when it backfires, computational cost, token overhead
* [ ] 🟡 2.10 Sonnet Create interaction map: Which techniques can be combined? Which conflict? Which amplify each other?
* [ ] 🟡 2.11 Sonnet Map technique effectiveness by model: does "Quote First" work differently on Haiku vs. Opus 4.8?
* [ ] 🟢 2.12 Haiku Document technique effectiveness by question type: which techniques help most for factual questions? Analytical? Creative? Comparative?
* [ ] 🟢 2.13 Haiku Research dynamic prompt adjustment: how do successful AI systems vary prompting based on detected question complexity?
* [ ] 🟡 2.14 Sonnet Document the diminishing returns curve: at what point do you have too many techniques stacked?

### 3.0 MODEL CAPABILITY MAPPING
**Learning Unit: Understanding model specialization and routing logic**

#### 3.0.1 Haiku Baseline
* [ ] 🟢 3.1 Haiku Define Haiku's strengths: speed, reasoning clarity, constraint-following, consistency
* [ ] 🟢 3.2 Haiku Define Haiku's weaknesses: depth of analysis, handling of novel problems, multi-stage reasoning
* [ ] 🟢 3.3 Haiku Document optimal question types for Haiku (factual lookups, clear-cut analysis, straightforward tasks)
* [ ] 🔴 3.4 Sonnet Benchmark Haiku's actual accuracy on ADHD-processed input (rambling, context-heavy, tangential)
* [ ] 🔴 3.5 Sonnet Identify what re-prompting can make Haiku perform at Opus level for specific question classes
* [ ] 🟢 3.6 Haiku Document Haiku's token efficiency: cost-per-useful-token vs. Opus 4.8

#### 3.0.2 Opus 4.8 with Extended Thinking
* [ ] 🟢 3.7 Haiku Define Opus 4.8's extended thinking capability: what does it actually do differently?
* [ ] 🟢 3.8 Haiku Document extended thinking's effectiveness at untangling complex or ambiguous questions
* [ ] 🟢 3.9 Haiku Map which question types actually benefit from extended thinking (vs. which just waste tokens)
* [ ] 🔴 3.10 Opus Benchmark Opus 4.8 with extended thinking on ADHD-style input without re-prompting
* [ ] 🟡 3.11 Sonnet Identify which prompt engineering techniques enhance extended thinking (vs. which conflict with it)
* [ ] 🟢 3.12 Haiku Document the token cost of extended thinking and establish cost-benefit thresholds
* [ ] 🔴 3.13 Haiku Identify where Opus 4.8 without extended thinking is sufficient (to avoid unnecessary token spend)
* [ ] 🟡 3.14 Sonnet Create a decision tree: given a question, should it route to Haiku, Opus-fast, or Opus-thinking?

### 4.0 QUESTION TRANSLATION LOGIC
**Learning Unit: How to systematically transform raw ADHD input into clear AI questions**

* [ ] 🟢 4.1 Haiku Document the structure of "question translation": what actually changes between input and output?
* [ ] 🟢 4.2 Haiku Identify the 5-7 most common translation operations (e.g., "extract core question," "reorder context," "normalize emotional language," "clarify scope," "state unstated assumptions")
* [ ] 🟢 4.3 Haiku For each operation, document: When to apply it (trigger conditions)
* [ ] 🟢 4.4 Haiku For each operation, document: How to apply it (step-by-step)
* [ ] 🟢 4.5 Haiku For each operation, document: How to know if it worked (validation)
* [ ] 🟢 4.6 Haiku For each operation, document: Common failures and how to detect them
* [ ] 🔴 4.7 Sonnet Create a decision matrix: given an input pattern, which translation operations should sequence in what order?
* [ ] 🔴 4.8 Haiku Document when to apply ZERO translation (when raw input is actually better for the AI)
* [ ] 🟢 4.9 Haiku Research question clarification frameworks (the 5 Whys, Socratic method, problem scoping techniques) and map which ones align with your ADHD processing style
* [ ] 🔴 4.10 Haiku Create a reference library: 50+ examples of your input → translated question → actual response quality difference

---

## PHASE 2: FRAMEWORK & ARCHITECTURE DESIGN

### 5.0 SYSTEM ARCHITECTURE OVERVIEW
**Learning Unit: High-level design of the entire translator system**

* [ ] 🟢 5.1 Haiku Define the pipeline: input → translation → model routing → prompt composition → output
* [ ] 🟡 5.2 Sonnet For each stage, document: What information enters this stage
* [ ] 🟡 5.3 Sonnet For each stage, document: What decision-making happens here
* [ ] 🟡 5.4 Sonnet For each stage, document: What information exits this stage
* [ ] 🟡 5.5 Sonnet For each stage, document: What happens if this stage fails or is uncertain
* [ ] 🔴 5.6 Sonnet Define interaction points between stages (is translation fully independent of model routing, or do they inform each other?)
* [ ] 🟢 5.7 Haiku Document fallback logic: if routing is uncertain, what's the default?
* [ ] 🟢 5.8 Haiku Design the logging/debugging output so you can see what the translator is deciding at each stage
* [ ] 🔴 5.9 Haiku Create a visual diagram of the full pipeline (ASCII or conceptual)

### 6.0 QUESTION TRANSLATION ENGINE
**Learning Unit: Designing the system that transforms raw input into clear questions**

* [ ] 🟢 6.1 Haiku Design the input parser: how does the system ingest your raw typed question?
* [ ] 🟢 6.2 Haiku Define analysis phase: Identify emotional/contextual content separate from core question
* [ ] 🟢 6.3 Haiku Define analysis phase: Identify unstated assumptions
* [ ] 🟢 6.4 Haiku Define analysis phase: Identify scope ambiguity
* [ ] 🟢 6.5 Haiku Define analysis phase: Identify what's actually being asked vs. what's being said
* [ ] 🟢 6.6 Haiku Define analysis phase: Identify prerequisite knowledge gaps
* [ ] 🟢 6.7 Haiku Design the translation operation selector: given analysis results, which operations should execute?
* [ ] 🟡 6.8 Sonnet Document each translation operation as a mini-algorithm: Input detection (how do you recognize when this operation is needed?)
* [ ] 🟡 6.9 Sonnet Document each translation operation as a mini-algorithm: Execution (the exact steps to transform input)
* [ ] 🟡 6.10 Sonnet Document each translation operation as a mini-algorithm: Validation (how do you know it worked?)
* [ ] 🟡 6.11 Sonnet Document each translation operation as a mini-algorithm: Output format (what does a translated question look like?)
* [ ] 🟢 6.12 Haiku Design the confidence scoring: how confident is the translator in its translation? (this affects whether it should proceed or ask clarification)
* [ ] 🟢 6.13 Haiku Design the clarification flow: if confidence is low, what questions does the translator ask YOU?
* [ ] 🔴 6.14 Haiku Define stopping points: at what confidence threshold does the translator output, and at what point does it ask for human input?

### 7.0 MODEL ROUTING ENGINE
**Learning Unit: Designing the system that chooses the right model for the question**

* [ ] 🟢 7.1 Haiku Design the question analysis for routing: Complexity indicators (multi-step reasoning needed? Novel problem? Ambiguity?)
* [ ] 🟢 7.2 Haiku Design the question analysis for routing: Domain (factual, analytical, creative, comparative, exploratory)
* [ ] 🟢 7.3 Haiku Design the question analysis for routing: Scope (narrow and clear vs. broad and open-ended)
* [ ] 🟢 7.4 Haiku Design the question analysis for routing: Certainty (is there a clear right answer vs. is this exploratory?)
* [ ] 🟢 7.5 Haiku Design the question analysis for routing: Time sensitivity (does token efficiency matter for this session?)
* [ ] 🟢 7.6 Haiku Design the question analysis for routing: Depth requirement (does the answer need deep analysis or surface clarity?)
* [ ] 🟡 7.7 Sonnet Design the routing decision tree: Decision points (questions that split the routing logic)
* [ ] 🟡 7.8 Sonnet Design the routing decision tree: Leaf nodes (the final routing decision: Haiku / Opus-fast / Opus-thinking)
* [ ] 🟡 7.9 Sonnet Design the routing decision tree: Confidence scoring (how certain is the routing choice?)
* [ ] 🟢 7.10 Haiku Define override logic: can you manually specify which model to use, and does that override the router?
* [ ] 🟢 7.11 Haiku Design the cost optimization layer: if multiple models could work, choose the one with best token efficiency
* [ ] 🔴 7.12 Sonnet Document the actual decision tree with thresholds (e.g., "if reasoning steps > 4 AND confidence > 3, route to Opus-thinking")
* [ ] 🟢 7.13 Haiku Design feedback integration: can the system learn from past routings? (e.g., "last time I routed this type to Haiku, the answer was weak; next time use Opus")

### 8.0 PROMPT COMPOSITION ENGINE
**Learning Unit: Designing the system that builds the final prompt sent to the model**

* [ ] 🟢 8.1 Haiku Design the technique selection phase: given the translated question and routing decision, which techniques should apply?
* [ ] 🔴 8.2 Sonnet For each technique in your library, create a selector function: Input (question metadata: complexity, domain, model choice, etc.)
* [ ] 🔴 8.3 Sonnet For each technique in your library, create a selector function: Logic (should this technique apply?)
* [ ] 🔴 8.4 Sonnet For each technique in your library, create a selector function: Output (yes/no/maybe with confidence score)
* [ ] 🟢 8.5 Haiku Design the technique ordering logic: if 3 techniques are selected, in what order should they appear in the prompt?
* [ ] 🟡 8.6 Sonnet Design the technique combination rules: Are there dependencies? (e.g., "if using Chain-of-Thought, the Role-Prime comes before it")
* [ ] 🟡 8.7 Sonnet Design the technique combination rules: Are there conflicts? (e.g., "Quote First and few-shot examples might compete for space")
* [ ] 🟡 8.8 Sonnet Design the technique combination rules: Are there synergies? (e.g., "Role-Prime + explicit permission to say 'I don't know' amplify each other")
* [ ] 🟢 8.9 Haiku Design the instruction hierarchy: when multiple instructions are given, which takes priority?
* [ ] 🟢 8.10 Haiku Design the prompt template system: what's the base structure, and where do techniques inject content?
* [ ] 🟢 8.11 Haiku Design the output format specification: how does the system ensure the final answer is in a usable format?
* [ ] 🔴 8.12 Sonnet Create a prompt composition algorithm: Take translated question
* [ ] 🔴 8.13 Sonnet Create a prompt composition algorithm: Select applicable techniques
* [ ] 🔴 8.14 Sonnet Create a prompt composition algorithm: Order techniques
* [ ] 🔴 8.15 Sonnet Create a prompt composition algorithm: Weave into base prompt template
* [ ] 🔴 8.16 Sonnet Create a prompt composition algorithm: Validate final prompt
* [ ] 🔴 8.17 Sonnet Create a prompt composition algorithm: Output final prompt for model

### 9.0 FEEDBACK & LEARNING LAYER
**Learning Unit: Designing how the system improves over time**

* [ ] 🟢 9.1 Haiku Design the evaluation phase: after the model responds, how is the quality assessed?
* [ ] 🔴 9.2 Haiku Define success metrics: Was the answer useful to you?
* [ ] 🔴 9.3 Haiku Define success metrics: Did it address the actual question or just the surface input?
* [ ] 🔴 9.4 Haiku Define success metrics: Could the answer have been better with different model choice?
* [ ] 🔴 9.5 Haiku Define success metrics: Could the answer have been better with different techniques?
* [ ] 🔴 9.6 Haiku Design the feedback collection: how do you signal success/failure to the system?
* [ ] 🟢 9.7 Haiku Design the learning update: does the system adjust routing/technique selection based on feedback?
* [ ] 🔴 9.8 Haiku Define what gets logged for future analysis (routing decision, technique choices, outcome, your feedback)

---

## PHASE 3: PROMPT DATABASE & REFERENCE LIBRARIES

### 10.0 COMPREHENSIVE PROMPT LIBRARY
**Learning Unit: Building the complete database of techniques the translator can apply**

**Start with your existing library and expand systematically:**

#### 10.0.1 Initiation & Getting Started
* [ ] 🟡 10.1 Sonnet Document "Just Start" prompt: Exact wording
* [ ] 🟡 10.2 Sonnet Document "Just Start" prompt: When it's most effective
* [ ] 🟡 10.3 Sonnet Document "Just Start" prompt: Trade-offs (speed vs. thoroughness)
* [ ] 🟡 10.4 Sonnet Document "Just Start" prompt: Success indicators
* [ ] 🟡 10.5 Sonnet Document "Just Start" prompt: Common failures
* [ ] 🟡 10.6 Sonnet Document "Just Start" prompt: ADHD-specific modifications needed
* [ ] 🟡 10.7 Sonnet Repeat for: Launch Pad, 2-Minute Lie, Commitment Opener (4 total from your example)
* [ ] 🟢 10.8 Haiku Research and add 6-10 additional getting-started prompts not in your example
* [ ] 🔴 10.9 Sonnet Create decision rules: when should the system choose each one vs. another?
* [ ] 🔴 10.10 Haiku Document how to chain multiple start-prompts (if needed)

#### 10.0.2 Breaking Things Down
* [ ] 🟡 10.11 Sonnet Document Tiny Chunks Converter with same depth as above
* [ ] 🟡 10.12 Sonnet Document Done-Looks-Like Definer, Invisible Staircase, Micro-Win Mapper
* [ ] 🟢 10.13 Haiku Research and add 6-10 additional breakdown prompts
* [ ] 🔴 10.14 Sonnet Create decision rules for when each is appropriate
* [ ] 🔴 10.15 Haiku Document how to handle over-specification (breaking down too far)

#### 10.0.3 Managing Overwhelm & Mental Chaos
* [ ] 🟡 10.16 Sonnet Document all 5 prompts from your example at full depth
* [ ] 🟢 10.17 Haiku Research and add 8-12 additional overwhelm-management prompts
* [ ] 🔴 10.18 Sonnet Create diagnostic questions: how does the system detect that overwhelm is the actual problem?
* [ ] 🔴 10.19 Haiku Document sequencing: which overwhelm-prompt should run first, second, etc.?

#### 10.0.4 Focus & Staying On Track
* [ ] 🟡 10.20 Sonnet Document all 5 prompts from your example at full depth
* [ ] 🟢 10.21 Haiku Research and add 8-12 additional focus prompts
* [ ] 🔴 10.22 Sonnet Create the "Anti-Rabbit Hole Anchor" as a persistent context option (can it run across multiple questions?)
* [ ] 🔴 10.23 Haiku Document how focus-prompts interact with the broader session (are they one-shot or ongoing?)

#### 10.0.5 Decision Fatigue & Choice Elimination
* [ ] 🟡 10.24 Sonnet Document all 4 prompts from your example at full depth
* [ ] 🟢 10.25 Haiku Research and add 8-10 additional decision-reduction prompts
* [ ] 🔴 10.26 Sonnet Create decision rules: when should system make the choice FOR you vs. asking clarifying questions?
* [ ] 🔴 10.27 Haiku Document how these interact with model capability (does Haiku handle decision-making better than Opus for these cases?)

#### 10.0.6 Hyperfocus Harnessing & Redirecting
* [ ] 🟡 10.28 Sonnet Document all 4 prompts from your example at full depth
* [ ] 🟢 10.29 Haiku Research and add 6-8 additional hyperfocus prompts
* [ ] 🔴 10.30 Sonnet Create the hyperfocus detection logic: how does the system recognize when you're hyperfocused on the wrong thing?
* [ ] 🔴 10.31 Haiku Document how to channel hyperfocus productively vs. blocking it

#### 10.0.7 Comprehension & Information Intake
* [ ] 🟡 10.32 Sonnet Document all 4 prompts from your example at full depth
* [ ] 🟢 10.33 Haiku Research and add 6-10 additional comprehension-support prompts
* [ ] 🔴 10.34 Sonnet Create variants: how does comprehension support change if you're skimming vs. deep-reading vs. reference-checking?
* [ ] 🔴 10.35 Haiku Document how to adapt these for different input formats (text, video summaries, data-heavy documents, etc.)

#### 10.0.8 Accountability & Follow-Through
* [ ] 🟡 10.36 Sonnet Document all 4 prompts from your example at full depth
* [ ] 🟢 10.37 Haiku Research and add 6-8 additional accountability prompts
* [ ] 🔴 10.38 Sonnet Create the persistent tracking option: can some accountability prompts run continuously across sessions?
* [ ] 🔴 10.39 Haiku Document shame-free accountability vs. guilt-based (and why you want shame-free)

#### 10.0.9 Self-Awareness & Pattern Recognition
* [ ] 🟡 10.40 Sonnet Document all 4 prompts from your example at full depth
* [ ] 🟢 10.41 Haiku Research and add 6-8 additional pattern-recognition prompts
* [ ] 🔴 10.42 Sonnet Create the pattern database: what patterns emerge from analyzing your past questions/answers?
* [ ] 🔴 10.43 Haiku Document how to surface non-obvious patterns to you

#### 10.0.10 Task-Specific Utility Prompts
* [ ] 🟡 10.44 Sonnet Document all 4 prompts from your example at full depth
* [ ] 🟢 10.45 Haiku Research and add 15-20 additional task-specific prompts (email, meeting prep, creative work, summarization, research, documentation, etc.)
* [ ] 🔴 10.46 Sonnet Create a task taxonomy: for any given task, which utility prompts are relevant?

### 11.0 PROMPT ENGINEERING TECHNIQUE LIBRARY
**Learning Unit: Complete documentation of every technique the composer can use**

* [ ] 🟡 11.1 Sonnet For each of your 6 hallucination-reduction methods, document: Exact implementation instructions
* [ ] 🟡 11.2 Sonnet For each of your 6 hallucination-reduction methods, document: Pseudo-code showing how the system would inject this into a prompt
* [ ] 🟡 11.3 Sonnet For each of your 6 hallucination-reduction methods, document: Example before/after prompt showing the technique in action
* [ ] 🟢 11.4 Haiku For each of your 6 hallucination-reduction methods, document: Effectiveness data (when does this work best?)
* [ ] 🟡 11.5 Sonnet For each of your 6 hallucination-reduction methods, document: Failure modes (when does this backfire?)
* [ ] 🟢 11.6 Haiku For each of your 6 hallucination-reduction methods, document: Token cost (typical overhead)
* [ ] 🟡 11.7 Sonnet For each of your 6 hallucination-reduction methods, document: Model compatibility (does this work on Haiku? Opus? Both equally?)
* [ ] 🟡 11.8 Sonnet For each of your 6 hallucination-reduction methods, document: Interaction effects (which other techniques amplify/conflict with this?)
* [ ] 🟢 11.9 Haiku Research and document additional techniques: Few-shot prompting (with variants: in-context examples, structured examples, edge cases)
* [ ] 🟢 11.10 Haiku Research and document additional techniques: Instruction hierarchy (primary goal, constraints, output format, etc.)
* [ ] 🟢 11.11 Haiku Research and document additional techniques: Explicit constraint setting
* [ ] 🟢 11.12 Haiku Research and document additional techniques: Output format specification
* [ ] 🟢 11.13 Haiku Research and document additional techniques: Reasoning decomposition
* [ ] 🟢 11.14 Haiku Research and document additional techniques: Question reframing
* [ ] 🟢 11.15 Haiku Research and document additional techniques: Assumption surfacing
* [ ] 🟢 11.16 Haiku Research and document additional techniques: Scope limitation
* [ ] 🟢 11.17 Haiku Research and document 7-8 more additional techniques from research
* [ ] 🟡 11.18 Sonnet For EACH additional technique, create the same detailed spec as the hallucination-reduction methods

### 12.0 QUESTION TRANSLATION OPERATION LIBRARY
**Learning Unit: Documenting every kind of transformation that can happen to user input**

* [ ] 🟢 12.1 Haiku Define "translate-extract-core-question": Input (user's raw statement)
* [ ] 🟢 12.2 Haiku Define "translate-extract-core-question": Detection logic (how do you know when this operation is needed?)
* [ ] 🟢 12.3 Haiku Define "translate-extract-core-question": Execution (step-by-step process)
* [ ] 🟢 12.4 Haiku Define "translate-extract-core-question": Example (before/after)
* [ ] 🟢 12.5 Haiku Define "translate-extract-core-question": Validation (how do you know it worked?)
* [ ] 🟢 12.6 Haiku Define "translate-reorder-context": When ADHD input buries the actual question under context/preamble
* [ ] 🟢 12.7 Haiku Define "translate-reorder-context": Implementation and example
* [ ] 🟢 12.8 Haiku Define "translate-normalize-emotional-language": When emotional intensity is obscuring the logical problem
* [ ] 🟢 12.9 Haiku Define "translate-normalize-emotional-language": Implementation and example
* [ ] 🟢 12.10 Haiku Define "translate-clarify-scope": When scope is vague ("help me understand X"), make it specific
* [ ] 🟢 12.11 Haiku Define "translate-clarify-scope": Implementation and example
* [ ] 🟢 12.12 Haiku Define "translate-surface-assumptions": When unstated assumptions are hiding the real question
* [ ] 🟢 12.13 Haiku Define "translate-surface-assumptions": Implementation and example
* [ ] 🟢 12.14 Haiku Define "translate-decompose-compound": When one rambling input is actually 3 separate questions
* [ ] 🟢 12.15 Haiku Define "translate-decompose-compound": Implementation and example
* [ ] 🟢 12.16 Haiku Research and define 5-8 additional translation operations
* [ ] 🔴 12.17 Sonnet For each operation, document combination rules: which operations can safely sequence together?

### 13.0 MODEL CAPABILITY & ROUTING MATRIX
**Learning Unit: Creating the authoritative reference for which model does what best**

Create a matrix with rows (question types: factual, analytical, creative, exploratory, decision-making, pattern-recognition, technical, interpersonal, ethical, etc. — 20+ rows) and columns (Haiku, Opus-fast, Opus-thinking)

* [ ] 🟡 13.1 Sonnet For each cell, document: Expected quality (poor / adequate / good / excellent)
* [ ] 🟡 13.2 Sonnet For each cell, document: Token efficiency (cost per useful token)
* [ ] 🟡 13.3 Sonnet For each cell, document: Speed trade-off (if speed matters, what's the quality hit?)
* [ ] 🟡 13.4 Sonnet For each cell, document: Key strengths of this model for this question type
* [ ] 🟡 13.5 Sonnet For each cell, document: Key weaknesses
* [ ] 🔴 13.6 Sonnet For each cell, document: Examples (e.g., "Haiku on factual questions") with 3 test cases showing quality levels
* [ ] 🔴 13.7 Haiku For each cell, document: When to override (in what situation would you choose a different model despite the typical recommendation?)

### 14.0 TECHNIQUE EFFECTIVENESS MATRIX
**Learning Unit: Understanding which techniques work for which question types and models**

Create a matrix with rows (each technique: hallucination-reduction methods + 8-15 additional techniques = 20+ rows) and columns (question types from 13.0)

* [ ] 🟡 14.1 Sonnet For each cell, document: Effectiveness (low / medium / high)
* [ ] 🟡 14.2 Sonnet For each cell, document: Token cost (low / medium / high)
* [ ] 🟡 14.3 Sonnet For each cell, document: When to apply
* [ ] 🟡 14.4 Sonnet For each cell, document: Common failure modes
* [ ] 🟡 14.5 Sonnet For each cell, document: Example prompt showing the technique applied to that question type

### 15.0 TECHNIQUE COMBINATION RULES
**Learning Unit: Understanding how to layer multiple techniques**

* [ ] 🟢 15.1 Haiku Define "safe combinations": Document 20-30 safe pairs of techniques
* [ ] 🟢 15.2 Haiku Define "safe combinations": Document what happens when they're combined (synergy? No effect? Diminishing returns?)
* [ ] 🟢 15.3 Haiku Define "conflicting combinations": Document 10-15 conflicts
* [ ] 🟢 15.4 Haiku Define "conflicting combinations": Explain why each conflict exists
* [ ] 🟢 15.5 Haiku Define "amplifying combinations": Document 10-15 synergies
* [ ] 🟢 15.6 Haiku Define "amplifying combinations": Explain the amplification effect
* [ ] 🟡 15.7 Sonnet Define "ordering dependencies": Document 15-20 ordering rules (e.g., "Role-Prime before Chain-of-Thought")
* [ ] 🟡 15.8 Sonnet Define "ordering dependencies": Explain why order matters
* [ ] 🔴 15.9 Haiku Create a maximum combination rule: at what point are too many techniques stacked? (define a token-overhead threshold)

---

## PHASE 4: DETAILED ALGORITHM & DECISION LOGIC

### 16.0 TRANSLATION ALGORITHM
**Learning Unit: The exact step-by-step process to transform user input**

* [ ] 🟡 16.1 Sonnet Write full pseudocode for translation algorithm: input → analyze → select operations → execute → validate → output decision
* [ ] 🔴 16.2 Sonnet For each step, build decision trees for edge cases
* [ ] 🔴 16.3 Haiku Define pass conditions for each validation
* [ ] 🔴 16.4 Haiku Define failure handling per step

### 17.0 ROUTING ALGORITHM
**Learning Unit: The exact decision tree for choosing which model to use**

* [ ] 🟡 17.1 Sonnet Write full pseudocode for routing algorithm: analyze question → check override → apply routing rules → confidence check → output
* [ ] 🟡 17.2 Sonnet Define each measurement (what complexity 6 actually means)
* [ ] 🔴 17.3 Sonnet Build scoring rubrics per dimension
* [ ] 🟡 17.4 Sonnet Document 15-20 routing rules with examples
* [ ] 🟢 17.5 Haiku Define fallback when no rule matches

### 18.0 TECHNIQUE SELECTION ALGORITHM
**Learning Unit: Choosing which prompt engineering techniques to apply**

* [ ] 🟡 18.1 Sonnet Write full pseudocode for technique selection: analyze need → score techniques → check conflicts → budget check → order → output
* [ ] 🔴 18.2 Sonnet Define selector functions for each technique
* [ ] 🔴 18.3 Sonnet Build scoring rubrics
* [ ] 🟢 18.4 Haiku Build conflict and dependency matrices

### 19.0 COMPOSITION ALGORITHM
**Learning Unit: Building the final prompt from translated question + techniques**

* [ ] 🟡 19.1 Sonnet Write full pseudocode for composition: load template → insert role → insert question → inject techniques → inject format → validate → output
* [ ] 🟡 19.2 Sonnet Design base template per model
* [ ] 🔴 19.3 Sonnet Map where each technique injects
* [ ] 🟢 19.4 Haiku Document instruction hierarchy
* [ ] 🔴 19.5 Sonnet Build 20-30 example composed prompts

---

## PHASE 5: EDGE CASES & FAILURE HANDLING

### 20.0 TRANSLATION FAILURES
**Learning Unit: What happens when the translator can't figure out what you're asking**

* [ ] 🔴 20.1 Haiku Define confidence threshold below which translation asks for clarification
* [ ] 🟢 20.2 Haiku Design clarifying questions: what 3-5 questions would disambiguate the input?
* [ ] 🔴 20.3 Haiku Document safe default: if clarification doesn't help, what's the safest default?
* [ ] 🔴 20.4 Haiku Create 10-15 test cases of genuinely ambiguous inputs and how the system should handle them

### 21.0 ROUTING UNCERTAINTY
**Learning Unit: What happens when model choice is unclear**

* [ ] 🔴 21.1 Haiku Define confidence threshold below which routing is uncertain
* [ ] 🔴 21.2 Haiku Decide: should system ask you, or pick the higher-cost model to be safe?
* [ ] 🔴 21.3 Haiku Define safe default model: if truly uncertain, which model should be chosen?
* [ ] 🔴 21.4 Haiku Create 10-15 test cases of genuinely ambiguous routing decisions

### 22.0 TECHNIQUE SELECTION CONFLICTS
**Learning Unit: What happens when techniques conflict**

* [ ] 🟢 22.1 Haiku Document conflict resolution hierarchy: if two techniques conflict, which one wins?
* [ ] 🔴 22.2 Sonnet Create 10-15 specific conflict scenarios and how the system resolves them
* [ ] 🔴 22.3 Haiku Design override: can you specify "use technique X even if it conflicts with Y"?

### 23.0 OUTPUT VALIDATION
**Learning Unit: What does the system do if the model's output doesn't match expectations**

* [ ] 🔴 23.1 Haiku Define success criteria: what makes a good answer?
* [ ] 🟢 23.2 Haiku Design output validation: does the system check that the model followed the prompt?
* [ ] 🔴 23.3 Sonnet Document feedback loop: if output is poor, what happens next?
* [ ] 🔴 23.4 Sonnet Does the system re-prompt with different techniques?
* [ ] 🔴 23.5 Sonnet Does it change model choice?
* [ ] 🔴 23.6 Sonnet Does it ask you if the output is actually useful?

---

## PHASE 6: LEARNING & ITERATION SYSTEM

### 24.0 FEEDBACK COLLECTION
**Learning Unit: How the system learns from results**

* [ ] 🟢 24.1 Haiku Design feedback mechanism: how do you signal "good answer" vs. "bad answer" vs. "good but not what I needed"?
* [ ] 🔴 24.2 Haiku Define feedback scale: simple binary, or more nuanced (e.g., 1-5 scale)?
* [ ] 🔴 24.3 Haiku Design feedback question: what minimum info does the system need to improve?

### 25.0 PATTERN ANALYSIS
**Learning Unit: How the system recognizes patterns in your usage**

* [ ] 🟢 25.1 Haiku Design session logging: what data should be captured for analysis?
* [ ] 🟢 25.2 Haiku Design pattern detection: what patterns would reveal useful rules?
* [ ] 🔴 25.3 Haiku Create analysis queries: what questions would reveal useful patterns?

### 26.0 RULE REFINEMENT
**Learning Unit: How the system improves its routing and technique selection**

* [ ] 🔴 26.1 Haiku Design hypothesis: "should this rule be adjusted based on feedback?"
* [ ] 🟢 26.2 Haiku Design A/B testing: if routing is uncertain between two models, test both and measure effectiveness
* [ ] 🔴 26.3 Haiku Create rule update triggers: at what point does sufficient feedback warrant changing a rule?

---

## PHASE 7: USER INTERFACE & INTERACTION DESIGN

### 27.0 INPUT INTERFACE
**Learning Unit: How you interact with the system**

* [ ] 🔴 27.1 Haiku Design input method: simple text box where you type your raw question?
* [ ] 🔴 27.2 Haiku Design feedback on translation: does the system show you what it translated your input into, before executing?
* [ ] 🔴 27.3 Haiku Design the choice: can you accept the translation, reject it, or manually edit it?
* [ ] 🔴 27.4 Haiku Create wireframes: what does the input screen look like?

### 28.0 TRANSPARENCY MODES
**Learning Unit: Showing you what the system decided**

* [ ] 🔴 28.1 Haiku Design "see my translation" mode: show how your input was translated
* [ ] 🔴 28.2 Haiku Design "see my routing" mode: show which model was chosen and why
* [ ] 🔴 28.3 Haiku Design "see my techniques" mode: show which prompt engineering techniques were applied
* [ ] 🔴 28.4 Haiku Design "see my prompt" mode: show the final prompt sent to the AI model
* [ ] 🔴 28.5 Haiku Design "see my feedback" mode: show what the system learned from past sessions

### 29.0 OVERRIDE & CONTROL
**Learning Unit: User control over system decisions**

* [ ] 🟢 29.1 Haiku Design model override: can you force it to use a specific model?
* [ ] 🔴 29.2 Haiku Design technique override: can you force inclusion/exclusion of specific techniques?
* [ ] 🔴 29.3 Haiku Design translation override: can you manually edit the translated question?
* [ ] 🔴 29.4 Haiku Document interaction: if you override, does that override get logged for pattern analysis?

### 30.0 OUTPUT PRESENTATION
**Learning Unit: How the model's response is delivered**

* [ ] 🔴 30.1 Haiku Design display: does the system show the raw response, or does it further process it?
* [ ] 🔴 30.2 Haiku Design "comprehension support": should the system automatically apply your chosen comprehension-aid prompts to the output?
* [ ] 🔴 30.3 Haiku Design post-processing: any reformatting or highlighting of key points?

---

## PHASE 8: TESTING & VALIDATION FRAMEWORK

### 31.0 TRANSLATION TESTING
**Learning Unit: Verifying the translation engine works**

* [ ] 🔴 31.1 Haiku Create 50+ test cases: real ADHD inputs paired with what you think the "correct" translation is
* [ ] 🔴 31.2 Haiku Test 1: raw translation accuracy (does the system translate as you would have?)
* [ ] 🔴 31.3 Haiku Test 2: translation → response quality (does translating actually improve the answer?)
* [ ] 🔴 31.4 Haiku Test 3: edge cases (genuinely ambiguous inputs, questions that don't need translation, etc.)
* [ ] 🟢 31.5 Haiku Document test methodology: how do you measure "translation worked"?

### 32.0 ROUTING TESTING
**Learning Unit: Verifying the routing engine chooses the right model**

* [ ] 🔴 32.1 Haiku Create 100+ test questions: diverse complexity levels, domains, scope clarity levels
* [ ] 🔴 32.2 Haiku Test 1: routing accuracy (does the system choose the model you would choose?)
* [ ] 🔴 32.3 Haiku Test 2: routing → quality (does the routed model actually produce better answers than the alternatives?)
* [ ] 🔴 32.4 Haiku Test 3: cost-benefit (does the routed model provide enough quality improvement to justify the token cost?)
* [ ] 🟢 32.5 Haiku Document test methodology: how do you measure "routing worked"?

### 33.0 TECHNIQUE SELECTION TESTING
**Learning Unit: Verifying the technique selection engine works**

* [ ] 🔴 33.1 Haiku Create 50+ test cases: diverse question types, complexity levels, goals
* [ ] 🔴 33.2 Haiku Test 1: technique selection accuracy (does the system choose techniques you would choose?)
* [ ] 🔴 33.3 Haiku Test 2: technique selection → quality (do the selected techniques actually improve the answer?)
* [ ] 🔴 33.4 Haiku Test 3: technique load (are too many techniques being stacked? Or too few?)
* [ ] 🟢 33.5 Haiku Document test methodology

### 34.0 INTEGRATION TESTING
**Learning Unit: Verifying the whole pipeline works end-to-end**

* [ ] 🔴 34.1 Haiku Create 30-50 real scenarios: you type a raw ADHD-style question, system processes it end-to-end
* [ ] 🔴 34.2 Haiku Test 1: does the answer address your actual need?
* [ ] 🔴 34.3 Haiku Test 2: would you have gotten a better answer without the translator?
* [ ] 🔴 34.4 Haiku Test 3: is the token cost justified?
* [ ] 🟢 34.5 Haiku Document test methodology

### 35.0 FAILURE MODE TESTING
**Learning Unit: Verifying the system handles failures gracefully**

* [ ] 🔴 35.1 Haiku Create test cases for each failure mode defined in Phase 5
* [ ] 🔴 35.2 Haiku Test 1: translation fails → does system ask good clarifying questions?
* [ ] 🔴 35.3 Haiku Test 2: routing fails → does system pick a safe default?
* [ ] 🔴 35.4 Haiku Test 3: technique conflict → does system resolve it intelligently?
* [ ] 🟢 35.5 Haiku Document test methodology

### 36.0 LEARNING SYSTEM TESTING
**Learning Unit: Verifying the system improves over time**

* [ ] 🔴 36.1 Haiku Create a test trajectory: 50 questions answered, with feedback provided
* [ ] 🔴 36.2 Haiku Test 1: does the system show measurable improvement in routing decisions?
* [ ] 🔴 36.3 Haiku Test 2: does the system show measurable improvement in technique selection?
* [ ] 🔴 36.4 Haiku Test 3: does the system identify meaningful patterns?
* [ ] 🟢 36.5 Haiku Document test methodology

---

## PHASE 9: DOCUMENTATION & KNOWLEDGE TRANSFER

### 37.0 SYSTEM DOCUMENTATION
**Learning Unit: Documenting how the system works**

* [ ] 🟡 37.1 Sonnet Create architecture overview document: explain the full pipeline to a new developer
* [ ] 🟡 37.2 Sonnet Create algorithm documentation: fully detailed pseudocode for each major component
* [ ] 🟡 37.3 Sonnet Create reference library documentation: organized database of all prompts, techniques, rules
* [ ] 🟡 37.4 Sonnet Create decision tree documentation: visual and text representation of all decision logic

### 38.0 USER DOCUMENTATION
**Learning Unit: Documenting how to use the system**

* [ ] 🟡 38.1 Sonnet Create quickstart guide: 5 minutes to first question
* [ ] 🟡 38.2 Sonnet Create feature guide: what each mode does, how to use it
* [ ] 🟡 38.3 Sonnet Create troubleshooting guide: what to do if something goes wrong
* [ ] 🟡 38.4 Sonnet Create feedback guide: how to provide feedback that helps the system improve

### 39.0 RESEARCH DOCUMENTATION
**Learning Unit: Documenting what you learned**

* [ ] 🟡 39.1 Sonnet Create research summary: key findings from all research phases
* [ ] 🟢 39.2 Haiku Create prompt engineering guide: comprehensive guide to all techniques documented
* [ ] 🔴 39.3 Haiku Create ADHD communication patterns document: what you learned about your own cognition
* [ ] 🔴 39.4 Haiku Create model comparison document: detailed findings on Haiku vs. Opus performance

---

## PHASE 10: FINAL READINESS ASSESSMENT

### 40.0 KNOWLEDGE COMPLETENESS CHECK
**Learning Unit: Confirming you have all knowledge needed to build**

* [ ] 🔴 40.1 Haiku Can you explain the entire pipeline from raw input to model response?
* [ ] 🔴 40.2 Haiku Can you execute each algorithm (translation, routing, technique selection, composition) by hand?
* [ ] 🔴 40.3 Haiku Can you make routing decisions for 20 diverse questions with clear reasoning?
* [ ] 🔴 40.4 Haiku Can you select techniques for 20 diverse questions with clear reasoning?
* [ ] 🔴 40.5 Haiku Can you explain why each rule in your decision trees exists?

### 41.0 DATABASE COMPLETENESS CHECK
**Learning Unit: Confirming all databases are built**

* [ ] 🔴 41.1 Haiku Do you have 40+ prompts documented (from your library sections)?
* [ ] 🔴 41.2 Haiku Do you have 15+ prompt engineering techniques documented?
* [ ] 🔴 41.3 Haiku Do you have 7+ translation operations documented?
* [ ] 🔴 41.4 Haiku Do you have routing rules for all question types?
* [ ] 🔴 41.5 Haiku Do you have technique selection logic for all question types?

### 42.0 DESIGN COMPLETENESS CHECK
**Learning Unit: Confirming all architecture is designed**

* [ ] 🔴 42.1 Haiku Do you have pseudocode for: translation, routing, technique selection, composition?
* [ ] 🔴 42.2 Haiku Do you have all decision trees designed with specific thresholds?
* [ ] 🔴 42.3 Haiku Do you have UI mockups for: input, transparency modes, overrides, output?
* [ ] 🔴 42.4 Haiku Do you have test plans for: translation, routing, techniques, integration, failures?

### 43.0 CONFIDENCE ASSESSMENT
**Learning Unit: Am I actually ready to code this?**

* [ ] 🔴 43.1 Haiku Rate your understanding of the problem: 1-10 (target: 9+)
* [ ] 🔴 43.2 Haiku Rate your understanding of the solution: 1-10 (target: 9+)
* [ ] 🔴 43.3 Haiku Rate your confidence in your prompt library: 1-10 (target: 8+)
* [ ] 🔴 43.4 Haiku Rate your confidence in your algorithms: 1-10 (target: 9+)
* [ ] 🔴 43.5 Haiku Rate your confidence in your test plans: 1-10 (target: 8+)

If all are 8+, you are ready. If any are below 8, go back and deepen that section.

---

## MASTER CHECKLIST SUMMARY

Use this to track overall progress:

* [ ] 🔴 44.1 Haiku **Phase 1 Complete:** All research done, all knowledge documented
* [ ] 🟡 44.2 Sonnet **Phase 2 Complete:** Architecture designed, all major systems blueprinted
* [ ] 🟡 44.3 Sonnet **Phase 3 Complete:** All databases built (prompts, techniques, rules)
* [ ] 🟡 44.4 Sonnet **Phase 4 Complete:** All algorithms defined in pseudocode with test cases
* [ ] 🔴 44.5 Haiku **Phase 5 Complete:** All edge cases and failures documented
* [ ] 🟢 44.6 Haiku **Phase 6 Complete:** Learning and iteration system designed
* [ ] 🔴 44.7 Haiku **Phase 7 Complete:** UI and interaction design complete
* [ ] 🔴 44.8 Haiku **Phase 8 Complete:** Testing frameworks created for all components
* [ ] 🟡 44.9 Sonnet **Phase 9 Complete:** Full documentation written
* [ ] 🔴 44.10 Haiku **Phase 10 Complete:** Final readiness assessment passed

---

## NEXT STEP

When all boxes above are checked, you possess the complete blueprint to build this system. At that point, the actual coding becomes straightforward architectural implementation rather than design-as-you-go. You will know:

1. What the system needs to do (Phase 1-2)
2. What data it needs (Phase 3)
3. How to make decisions (Phase 4)
4. How to handle problems (Phase 5)
5. How to improve over time (Phase 6)
6. How users interact with it (Phase 7)
7. How to verify it works (Phase 8)
8. How to explain it (Phase 9)

The actual code is the implementation of those blueprints.
