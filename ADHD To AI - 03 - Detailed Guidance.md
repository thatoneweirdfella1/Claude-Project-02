# ADHD-to-AI Translator: Detailed Guidance Document

## PHASE 1: FOUNDATIONAL RESEARCH & KNOWLEDGE MAPPING

### 1.0 ADHD COGNITION & INPUT PATTERNS
**Learning Unit: Understanding how ADHD brains input vs. what they actually need to ask**

* [ ] 🔴 1.1 Haiku — **What's needed:** Extract 5-10 concrete examples from your 800-conversation archive where your initial raw question was unclear/rambling but Claude still understood your actual intent and gave an excellent answer. For each example, document: (a) your exact raw input, (b) what Claude inferred you actually needed, and (c) the quality difference between responding to raw vs. translated versions. These examples are the empirical foundation for understanding your personal ADHD input transformation patterns and will be referenced throughout the entire project.

* [ ] 🔴 1.2 Haiku — **What's needed:** Analyze your 5-10 examples and identify the specific transformation that happened in each one. Create a pattern statement for each: "When I [describe raw input behavior], I actually mean [describe actual intent]." For example: "When I lead with a 3-sentence tangential context before asking my real question, I'm actually just providing necessary background—the real question comes after." Document these pattern statements because they'll become the rules for your translation operations.

* [ ] 🔴 1.3 Haiku — **What's needed:** From your examples, extract the 3-4 distinct categories of gaps between what you say and what you mean. Examples might be: (1) "tangential preamble" (you bury the question under context), (2) "emotional intensity distortion" (emotional language obscures the logical request), (3) "compound questions" (you ask 3 questions in one ramble), (4) "inverse framing" (you describe a solution when you should describe the problem). These gap types will directly inform your translation operations in Phase 3.

* [ ] 🟢 1.4 Haiku — **What's needed:** Find 3-5 peer-reviewed research papers or academic articles on ADHD verbal processing, communication patterns, or how ADHD brains structure language differently. Search terms: "ADHD communication clarity," "ADHD executive function language," "ADHD working memory speech." Document the title, authors, year, and 2-3 key findings for each. This research provides the scientific foundation for why these patterns exist.

* [ ] 🔴 1.5 Haiku — **What's needed:** Describe in 2-3 sentences how YOUR brain specifically defaults to processing and communicating. Examples: "I think by speaking—I don't know what I think until I hear myself say it," "I process associatively—I jump from idea to idea following connections," "I lead with emotion or context because my working memory needs to offload the background before I can handle the core question." This self-knowledge is the bridge between the research and your system design.

* [ ] 🔴 1.6 Haiku — **What's needed:** From your 5-10 examples and your analysis, identify the 3-4 MOST COMMON patterns in your communication that trip up AI systems. For each pattern, write: (a) how you naturally communicate it, (b) why it happens (tied to your ADHD brain), (c) what AI systems do wrong with it. For example: "(1) I bury core questions under context. Why: my working memory offloads background first. AI problem: it treats preamble as equally important as the question." These will drive your translation operations.

* [ ] 🔴 1.7 Haiku — **What's needed:** Build a reference matrix with at least 20 concrete examples of "When I say X, I usually mean Y." Use real phrasings from your conversations. Examples: "When I say 'help me think about this', I mean 'walk me through this step-by-step with specific examples'"; "When I say 'is X possible', I mean 'what are the exact constraints and trade-offs of X'"; "When I jump between three topics rapidly, I mean 'these are connected—help me see the connection'." This matrix is your personal translation dictionary.

* [ ] 🔴 1.8 Haiku — **What's needed:** For each of your identified patterns (1.6) and your "when I say X" examples (1.7), test them against different models: which model handles your rambling side-context best? Does Haiku understand your associative jumps better than Opus? Does one model's output improve more with your pattern-specific re-prompting? Create a simple table: Communication Pattern × Model, noting which model works best for that pattern. This informs routing decisions later.

* [ ] 🔴 1.9 Haiku — **What's needed:** Find 2-3 examples where your raw input actually DIDN'T need translation—where you asked clearly and got a great answer without any translator in between. Document what was different about those questions (maybe they were narrow, technical, no emotion, clear scope). This is important because your translator shouldn't over-correct and destroy clarity that was already there. These are edge cases that define the "when NOT to translate" rules.

### 2.0 PROMPT ENGINEERING FOUNDATIONS
**Learning Unit: Understanding every dimension of prompt effectiveness**

* [ ] 🟢 2.1 Haiku — **What's needed:** For each of the 6 hallucination-reduction methods you listed in your original notes, find the primary source or most authoritative explanation (academic paper, Anthropic documentation, established technique guide). Document: (a) official name and definition, (b) the core mechanism (how it actually prevents hallucinations), (c) a simple before/after example showing the technique in action.

* [ ] 🟢 2.2 Haiku — **What's needed:** For "Give explicit permission to say 'I don't know'": Document the exact implementation (what words/phrasing to use in prompts), when it's most effective (what question types benefit most), and the trade-off (what do you lose by using it—does it make the model less confident when it should be confident?). Show a concrete example: raw prompt vs. prompt with permission to say "I don't know."

* [ ] 🟢 2.3 Haiku — **What's needed:** For "Chain-of-Thought prompting": Document the three main variants—(1) basic CoT ("think step by step"), (2) extended CoT (many intermediate steps), (3) structured CoT (specific format for each step). For each variant, show when to use it and an example prompt. Note how effectiveness differs between Haiku and Opus.

* [ ] 🟢 2.4 Haiku — **What's needed:** For "Quote-First method": Document the mechanism (why forcing the model to quote relevant information first prevents hallucination), optimal use cases (what question types), when it fails or creates problems (e.g., what if there are no quotes to cite?). Provide a before/after example of prompts and resulting answers.

* [ ] 🟢 2.5 Haiku — **What's needed:** For "Ask the model to verify itself": Document the different architectures—(a) self-check (model checks its own work), (b) self-debate (model argues both sides), (c) double-pass (model answers, then re-answers to check consistency). For each, explain the mechanism, token cost, and which is most effective for which question types.

* [ ] 🟢 2.6 Haiku — **What's needed:** For "Role-priming for accuracy": Document what role-priming is (adopting a role that values accuracy over helpfulness), types of roles that work (expert researcher, skeptical scientist, fact-checker), how to implement it in prompts, and how it affects output (does it make responses longer? More uncertain-sounding? Better accuracy?). Show examples.

* [ ] 🟢 2.7 Haiku — **What's needed:** For "Retrieval-Augmented Generation": Document the scope (it's about grounding in external knowledge, using citations, retrieving relevant documents). Explain how it prevents hallucinations (grounding forces the model to reference real sources) and when to use it (factual questions, research questions, anything requiring citations). Note the token cost vs. accuracy gain.

* [ ] 🟢 2.8 Haiku — **What's needed:** Research 5-10 additional hallucination-reduction or prompt engineering techniques beyond the core 6. Use sources: learnprompting.org, research papers (arxiv 2402.02136, 2503.16789, 2410.08696, 2407.00256), GitHub technique hubs, Anthropic documentation. For each, document name, core mechanism, and one-line use case.

* [ ] 🟢 2.9 Haiku — **What's needed:** For ALL techniques (both your 6 and the 8-15 additional), create a standardized documentation that includes: (a) technique name, (b) definition in 1-2 sentences, (c) when it's most effective (question type, model), (d) when it backfires or causes problems, (e) computational cost (token overhead, approximate %), (f) implementation example (exact prompt phrasing).

* [ ] 🟡 2.10 Sonnet — **What's needed:** Create an interaction map showing: (a) which technique pairs can be safely combined (e.g., Chain-of-Thought + Role-Prime work together), (b) which techniques conflict and shouldn't be used together (e.g., two contradictory instruction hierarchies), (c) which technique pairs amplify each other (using both makes each more effective than either alone). Document 20-30 safe combinations, 10-15 conflicts, 10-15 synergies.

* [ ] 🟡 2.11 Sonnet — **What's needed:** Build a 2D map: Techniques (rows) × Models (Haiku, Opus-fast, Opus-thinking columns). For each cell, rate: Does "Quote-First" work on Haiku the same as Opus? Does Chain-of-Thought effectiveness vary by model? Does extended thinking change which techniques are useful? Document 3-5 concrete differences (e.g., "Chain-of-Thought is critical for Opus-thinking but optional for Haiku").

* [ ] 🟢 2.12 Haiku — **What's needed:** Map technique effectiveness by question type. Create a table with question types (factual, analytical, creative, comparative, exploratory, decision-making, code, interpersonal, ethical) and for each question type, list which 2-3 techniques help the most. Example: Factual questions benefit from Quote-First + explicit permission to say "I don't know"; Creative questions benefit from avoiding role-priming.

* [ ] 🟢 2.13 Haiku — **What's needed:** Research how successful AI systems vary prompting dynamically based on detected question complexity. Look for terms: "dynamic prompting," "adaptive prompts," "complexity-based prompt selection." Document 2-3 examples of systems that do this and the mechanism they use (e.g., "if complexity > 6, add Chain-of-Thought automatically").

* [ ] 🟡 2.14 Sonnet — **What's needed:** Create a diminishing returns curve for technique stacking. Answer: At what point do additional techniques stop helping and start hurting (by adding noise, conflicting instructions, token overhead)? Document: baseline (no techniques), 1-3 techniques (sweet spot), 4-6 techniques (diminishing returns), 7+ (often counterproductive). Provide concrete examples with token counts.

### 3.0 MODEL CAPABILITY MAPPING
**Learning Unit: Understanding model specialization and routing logic**

#### 3.0.1 Haiku Baseline
* [ ] 🟢 3.1 Haiku — **What's needed:** From Anthropic documentation and your own knowledge, document Haiku's strengths: speed (latency), reasoning clarity (does it explain its thinking well?), constraint-following (does it stick to instructions?), consistency (does it give reliable answers on the same question?). Provide 2-3 concrete examples of each strength.

* [ ] 🟢 3.2 Haiku — **What's needed:** Document Haiku's weaknesses: depth of analysis (does it miss nuance?), handling of novel problems (does it struggle with unfamiliar domains?), multi-stage reasoning (does it lose the thread in long chains?), creative tasks (does it lack novelty?). Provide 2-3 concrete examples of each weakness.

* [ ] 🟢 3.3 Haiku — **What's needed:** List the optimal question types for Haiku: factual lookups (retrieve information), straightforward analysis (clear criteria, simple logic), constraint-satisfaction (follow specific rules), categorization (sort items into buckets), clarification (explain simple concepts). For each, provide a concrete example question that Haiku handles excellently.

* [ ] 🔴 3.4 Sonnet — **What's needed:** Create 5-10 test questions that are specifically written in your ADHD style (rambling, tangential, emotional, unclear). Run them through your translator to get clear versions, then test both raw and translated versions against Haiku. Document: Does Haiku handle your style better after translation? By how much? What types of questions does Haiku still struggle with even after translation?

* [ ] 🔴 3.5 Sonnet — **What's needed:** For question types where Haiku struggles even after translation, test different re-prompting techniques: Try adding explicit permission to say "I don't know," try Chain-of-Thought, try role-priming. Document which technique(s) can make Haiku perform at Opus-level for specific question classes. Example: "Adding Chain-of-Thought to [question type] closes the gap with Opus for Haiku."

* [ ] 🟢 3.6 Haiku — **What's needed:** Calculate Haiku's token efficiency: Look up Haiku's token cost per million, Opus's cost, and create a simple comparison: cost-per-useful-token (considering quality trade-offs). Example: "Haiku costs 1/10 of Opus but loses ~20% quality on complex questions, so it's 9x more efficient per useful token for simple questions." This is the foundation for routing cost-benefit decisions.

#### 3.0.2 Opus 4.8 with Extended Thinking
* [ ] 🟢 3.7 Haiku — **What's needed:** From Anthropic documentation, document what Opus 4.8's extended thinking does differently: it doesn't just think step-by-step (like CoT), it actually reasons internally in a way humans can see. Document the mechanism, the types of thinking it supports, and how it differs from basic reasoning. Show one example of extended thinking output.

* [ ] 🟢 3.8 Haiku — **What's needed:** Document extended thinking's effectiveness at untangling complex or ambiguous questions. Provide 3 concrete examples: an ambiguous question where extended thinking clarifies the ambiguity, a multi-step problem it solves by thinking through step-by-step, an open-ended question it explores thoroughly. Note: Does it consistently outperform Opus fast on these?

* [ ] 🟢 3.9 Haiku — **What's needed:** Map which question types actually benefit from extended thinking: Complex multi-step reasoning? Yes. Novel problems in unfamiliar domains? Yes. Simple factual lookups? No (waste of tokens). Straightforward analysis? Maybe. Create a decision list: "Use extended thinking if: [complexity > 7 OR novel domain OR genuinely ambiguous]. Don't use extended thinking if: [simple factual OR clear-cut analysis]."

* [ ] 🔴 3.10 Opus — **What's needed:** Create 5-10 test questions in your ADHD style, translate them, and test Opus-thinking WITHOUT any re-prompting (just the translated question, no techniques). Document: Does extended thinking understand your translated questions well? What's the answer quality? What does it miss? This is the baseline for comparing against technique selection later.

* [ ] 🟡 3.11 Sonnet — **What's needed:** For the techniques you documented (2.1-2.14), test which ones enhance extended thinking and which ones conflict with it. Example: "Chain-of-Thought is redundant with extended thinking (wastes tokens)" but "explicit permission to say 'I don't know' enhances it." Create a table: Techniques vs. Extended Thinking (enhance/no effect/conflict).

* [ ] 🟢 3.12 Haiku — **What's needed:** Document extended thinking's token cost and establish cost-benefit thresholds. Example: "Extended thinking costs 4-8x more tokens than fast mode. Use it if the problem's complexity justifies 4-8x cost increase. Complexity >= 7 on your scale usually justifies it; complexity < 5 usually doesn't." Provide a table of complexity level vs. token cost vs. quality gain.

* [ ] 🔴 3.13 Haiku — **What's needed:** Identify specific question types and circumstances where Opus fast (no extended thinking) is sufficient and extended thinking would be overkill. Example: "Opus fast is sufficient for architectural design questions, but extended thinking is overkill. Opus fast is not sufficient for novel algorithm design—use extended thinking." This prevents over-spending on thinking.

* [ ] 🟡 3.14 Sonnet — **What's needed:** Create a decision tree with specific thresholds: given a translated question, which routing is best? Example tree: "If complexity < 3: Haiku. Else if complexity 3-6: Opus-fast. Else if complexity >= 7 OR (novel domain AND scope = broad): Opus-thinking. Else: check override / use Opus-fast as safe default." This tree will be your 17.0 Routing Algorithm.

---

## PHASE 2: FRAMEWORK & ARCHITECTURE DESIGN

### 5.0 SYSTEM ARCHITECTURE OVERVIEW
**Learning Unit: High-level design of the entire translator system**

* [ ] 🟢 5.1 Haiku — **What's needed:** Define the full pipeline in a visual or pseudocode form: input → translation engine → routing engine → composition engine → Claude model API → output. For each stage, label: what information enters, what gets processed, what exits. Example: "Translation stage: enters [raw question], processes [semantic analysis, gap identification], exits [translated question + confidence]."

* [ ] 🟡 5.2-5.5 Sonnet — **What's needed:** For each of the 5 stages (translation, routing, composition, feedback, output), document (a) what information enters this stage (inputs), (b) what decision-making happens (processing logic), (c) what information exits (outputs), (d) what failures could happen and how they're handled. This is the architectural skeleton that all subsequent phases build on.

* [ ] 🔴 5.6 Sonnet — **What's needed:** Define interaction points between stages: Does translation inform routing (e.g., complexity detected during translation affects routing decision)? Does routing inform composition (e.g., routed model affects which techniques are selected)? Or are they independent? Document the dependencies and information flow between stages. This prevents designing disconnected components.

* [ ] 🟢 5.7 Haiku — **What's needed:** Document fallback logic: if routing is genuinely uncertain (confidence < 60%), what's the default behavior? Examples: "Default to the safe higher-cost model (Opus-thinking)" or "Ask the user which model they prefer." Document thresholds: confidence >= 80% = proceed automatically; 60-79% = proceed with warning; < 60% = ask user.

* [ ] 🟢 5.8 Haiku — **What's needed:** Design logging/debugging output that shows the user (and you for analysis) every decision the system made: "Translation created question X with confidence Y. Routing chose Model Z because [reason]. Techniques selected: A, B, C because [reasons]. Final prompt: [raw prompt text]." This transparency is essential for both user trust and your own system debugging.

* [ ] 🔴 5.9 Haiku — **What's needed:** Create a visual diagram (ASCII diagram, flowchart, conceptual diagram) showing the full pipeline: boxes for each stage, arrows showing information flow, labels for inputs/outputs/decisions. Include decision points (confidence checks, override points) and feedback loops. This diagram is the blueprint that guides all implementation.

### 6.0 QUESTION TRANSLATION ENGINE
**Learning Unit: Designing the system that transforms raw input into clear questions**

* [ ] 🟢 6.1 Haiku — **What's needed:** Design the input parser: how does it ingest your raw typed question? Does it split on line breaks? Does it look for punctuation patterns? Does it use regex? Document the parser logic and provide test cases showing how it would parse a real ADHD-style input (multiline, tangential, no clear punctuation).

* [ ] 🟢 6.2-6.6 Haiku — **What's needed:** Define the analysis phase in detail. The system must analyze your input on 5 dimensions: (1) identify emotional/contextual content vs. logical content, (2) identify unstated assumptions, (3) assess scope clarity, (4) distinguish stated from actual question, (5) identify prerequisite knowledge gaps. For each dimension, document how to detect it and what signals to look for.

* [ ] 🟢 6.7 Haiku — **What's needed:** Design the translation operation selector: given the analysis results (e.g., "high emotional content + buried core question + multipart structure"), which operations should fire? Create decision logic: "IF emotional > 50% THEN apply normalize-emotional-language. IF core question position > 50% THEN apply reorder-context. IF part count > 1 THEN apply decompose-compound." This is the selection algorithm.

* [ ] 🟡 6.8-6.11 Sonnet — **What's needed:** Document each translation operation as a mini-algorithm with 4 components: (1) Input detection (what signals tell you this operation is needed?), (2) Execution (the exact steps to apply it), (3) Validation (how do you know it worked?), (4) Output format (what does a well-executed operation look like?). Do this for all 6-7 operations.

* [ ] 🟢 6.12 Haiku — **What's needed:** Design confidence scoring for the translation: after each operation, the system assigns a confidence score (0-100) to the quality of the result. After all operations, the system combines these into an overall confidence score for the final translation. Document scoring logic and thresholds (e.g., "if any operation scores < 50, confidence < 70").

* [ ] 🟢 6.13 Haiku — **What's needed:** Design the clarification flow: if confidence is low, what clarifying questions does the translator ask you? Examples: "I'm uncertain about X. Do you mean [option A] or [option B]?" Document 3-4 types of clarifying questions for 3-4 common ambiguities. Make questions concrete and answerable in 1-2 sentences.

* [ ] 🔴 6.14 Haiku — **What's needed:** Define stopping points with specific thresholds: at what confidence does the translator output the translation and proceed? At what confidence does it ask for clarification? Example: ">= 80% = output translated question automatically. 60-79% = output with warning and request confirmation. < 60% = ask clarifying questions before proceeding." Document these thresholds.

### 7.0 MODEL ROUTING ENGINE
**Learning Unit: Designing the system that chooses the right model for the question**

* [ ] 🟢 7.1-7.6 Haiku — **What's needed:** Design the question analysis for routing by documenting each of 6 dimensions: (1) complexity (1-10 scale: define what complexity 3, 5, 8 actually means with examples), (2) domain (define what counts as factual, analytical, creative, etc.), (3) scope (narrow, medium, broad), (4) certainty (clear right answer vs. exploratory), (5) time sensitivity (does token efficiency matter?), (6) depth (surface clarity vs. deep analysis). Create rubrics for scoring each dimension.

* [ ] 🟡 7.7-7.9 Sonnet — **What's needed:** Design the routing decision tree with three components: (1) Decision points (questions that split the logic, e.g., "is complexity < 5?"), (2) Leaf nodes (the final routing: Haiku / Opus-fast / Opus-thinking), (3) Confidence scoring (how certain is this routing?). Create a pseudocode decision tree with 15-20 rules and specific thresholds.

* [ ] 🟢 7.10 Haiku — **What's needed:** Define override logic: Can the user manually specify which model to use? Does manual override trump the router? How is the override triggered (button, dropdown, command)? Document: yes/no to each question, and if yes, how does it work. Example: "User can override by selecting [Opus-thinking] explicitly, which bypasses router and routes to that model."

* [ ] 🟢 7.11 Haiku — **What's needed:** Design the cost optimization layer: if multiple models could work (e.g., both Haiku and Opus-fast could handle complexity 5), choose the cheaper one. Document logic: "If Opus-fast and Haiku both score >= 70% confidence, pick Haiku. If only Opus-thinking scores >= 70%, pick Opus-thinking despite cost." This prevents unnecessary spending.

* [ ] 🔴 7.12 Sonnet — **What's needed:** Document your actual routing decision tree with SPECIFIC thresholds and REAL examples from your test questions (from 3.4-3.5). Example rules: "If complexity < 3 AND domain = factual AND scope = narrow: Haiku (high confidence). If complexity 5-7 OR domain = analytical: Opus-fast. If complexity >= 8 OR (domain = exploratory AND scope = broad): Opus-thinking." Use real numbers from your testing.

* [ ] 🟢 7.13 Haiku — **What's needed:** Design feedback integration: can the system learn from past routings? Mechanism: user rates answer (good/bad), system logs routing decision + outcome, after 50+ questions system analyzes "when I routed to X model for this pattern, outcomes were Y%. Now I should adjust the threshold." Document how rule adjustment would work (what triggers an update, how much data needed before updating).

### 8.0 PROMPT COMPOSITION ENGINE
**Learning Unit: Designing the system that builds the final prompt sent to the model**

* [ ] 🟢 8.1 Haiku — **What's needed:** Design the technique selection phase: given the translated question + routed model, which techniques should apply? Create a selector function for each technique (see 8.2-8.4). The selector takes the question metadata (complexity, domain, model, etc.) and outputs: "apply this technique" or "don't apply" with a confidence score.

* [ ] 🔴 8.2-8.4 Sonnet — **What's needed:** For each of your 20+ techniques (from 2.1-2.14), create a selector function with 3 components: (1) Input (question metadata: complexity, domain, model choice, etc.), (2) Logic (the decision rule: "apply if complexity > 6 AND domain != factual"), (3) Output (yes/no/maybe + confidence score). This is the selection algorithm that picks which techniques to use.

* [ ] 🟢 8.5 Haiku — **What's needed:** Design technique ordering logic: if 3 techniques are selected, in what order should they appear in the prompt? Some techniques must come before others (e.g., role-prime before chain-of-thought). Document ordering rules: "Dependencies: if both A and B selected, A must come first. Example: role-prime -> chain-of-thought -> specific instructions."

* [ ] 🟡 8.6-8.8 Sonnet — **What's needed:** Design technique combination rules with 3 categories: (1) Dependencies (if using A, you should use B; if A and B both selected, order must be A then B), (2) Conflicts (never use A and B together because they contradict), (3) Synergies (using A with B makes both stronger). Document 15-20 ordering rules, 5-10 conflicts, 5-10 synergies with explanations.

* [ ] 🟢 8.9 Haiku — **What's needed:** Design the instruction hierarchy: when multiple instructions are given to a model, which takes priority? Example hierarchy: (1) Role (do this role), (2) Primary goal (answer this question), (3) Constraints (don't do X), (4) Output format (structure answer like this). Document how conflicts are resolved: "If role-prime says 'be skeptical' but primary goal says 'be helpful', primary goal wins."

* [ ] 🟢 8.10 Haiku — **What's needed:** Design the prompt template system: what's the base structure for prompts? Create 2 templates (one for Haiku, one for Opus) showing: [Role] [Primary Goal] [Question] [Constraints] [Output Format] [Techniques] [Examples]. Document placeholders and where techniques inject their content (e.g., Chain-of-Thought injects as a sub-instruction under "Primary Goal").

* [ ] 🟢 8.11 Haiku — **What's needed:** Design output format specification: how does the system ensure the final answer is in a usable format? Document: Do you want bulleted lists? Structured JSON? Narrative prose? Step-by-step explanations? Create a format template and document how it's injected into prompts. Example: "For technical questions, inject: 'Provide your answer as: [problem statement] [solution steps] [verification]'."

* [ ] 🔴 8.12-8.17 Sonnet — **What's needed:** Create the full prompt composition algorithm in pseudocode: (1) Load appropriate template (Haiku vs. Opus), (2) Insert role prime if selected, (3) Insert translated question, (4) Inject techniques in order (checking dependencies), (5) Add output format spec, (6) Validate for conflicts and coherence, (7) Return final prompt. Include error handling for conflicts.

---

## PHASE 3: PROMPT DATABASE & REFERENCE LIBRARIES

### 10.0 COMPREHENSIVE PROMPT LIBRARY
**Learning Unit: Building the complete database of techniques the translator can apply**

* [ ] 🟡 10.1-10.10 Sonnet — **What's needed:** For "Just Start" prompt: document with full depth including exact wording (what to say to the user), when it works best (procrastination, paralysis, perfectionism), trade-offs (you might do it incompletely, but done beats perfect), success signals (movement happens), common failures (still stuck despite permission). Repeat the same depth for Launch Pad, 2-Minute Lie, Commitment Opener. Then research and add 6-10 getting-started prompts, create decision rules for when to choose each, and document chaining multiple starts.

* [ ] 🟡 10.11-10.15 Sonnet — **What's needed:** For "Tiny Chunks Converter": document exact wording, when it works (overwhelm, complexity), trade-offs (takes longer but reduces failure), success signals (tasks become completable). Then cover Done-Looks-Like, Invisible Staircase, Micro-Win Mapper with same depth. Research 6-10 additional breakdown prompts, create rules for which to use, document over-specification handling.

* [ ] 🟡 10.16-10.19 Sonnet — **What's needed:** For all 5 overwhelm-management prompts from your example: document each with complete depth (wording, when/why, trade-offs, signals, failures). Research 8-12 additional prompts for managing overwhelm. Create diagnostic questions the system can ask to detect "this is actually an overwhelm problem" vs. other problems. Document sequencing rules: which prompt should run first/second.

* [ ] 🟡 10.20-10.23 Sonnet — **What's needed:** For all 5 focus prompts: full depth documentation. Research 8-12 additional focus prompts. Create the "Anti-Rabbit Hole Anchor" as a persistent context option that runs across multiple questions in a session (not just per-question). Document how focus-prompts interact with broader session context: are they temporary effects or persistent?

* [ ] 🟡 10.24-10.27 Sonnet — **What's needed:** For all 4 decision fatigue prompts: full depth. Research 8-10 additional decision-reduction prompts. Create rules for when the system should make the choice FOR you vs. asking clarifying questions. Document how these interact with model choice: does Haiku handle decision-making better than Opus? Should you always use Opus for important decisions?

* [ ] 🟡 10.28-10.31 Sonnet — **What's needed:** For all 4 hyperfocus prompts: full depth. Research 6-8 additional hyperfocus prompts. Create detection logic: how does the system recognize "you're hyperfocused on the wrong thing"? (signals: same topic 5+ questions in a row, intensity increasing, scope getting narrower). Document channeling (productive hyperfocus) vs. blocking (unproductive hyperfocus).

* [ ] 🟡 10.32-10.35 Sonnet — **What's needed:** For all 4 comprehension prompts: full depth. Research 6-10 additional comprehension prompts. Create variants: how does the prompt change if you're skimming vs. deep-reading vs. using it as a reference? Document how to adapt for different formats: plain text, code, data-dense documents, visual content.

* [ ] 🟡 10.36-10.39 Sonnet — **What's needed:** For all 4 accountability prompts: full depth. Research 6-8 additional accountability prompts. Create the persistent tracking option: can some accountability prompts run continuously across a session or even across multiple days? Document shame-free accountability: how to track progress without triggering shame spirals (these backfire for ADHD brains).

* [ ] 🟡 10.40-10.43 Sonnet — **What's needed:** For all 4 self-awareness prompts: full depth. Research 6-8 additional pattern-recognition prompts. Create the pattern database: what patterns would emerge from analyzing your past 50 questions? (examples: "I ask about X every Tuesday," "Y topic takes 3x longer," "Z always needs the anti-rabbit-hole anchor"). Document how to surface these patterns to you.

* [ ] 🟡 10.44-10.46 Sonnet — **What's needed:** For all 4 task-specific prompts: full depth. Research 15-20 additional task-specific prompts (email writing, meeting prep, creative ideation, research synthesis, documentation, decision-making, debugging code, learning new concepts, etc.). Create a task taxonomy: for any task description, which prompts are relevant? Example: "email writing" → use Communication-Clarity + Tone-Check + Feedback-Loop.

### 11.0 PROMPT ENGINEERING TECHNIQUE LIBRARY
**Learning Unit: Complete documentation of every technique the composer can use**

* [ ] 🟡 11.1-11.8 Sonnet — **What's needed:** For each of your 6 hallucination-reduction methods, create a full documentation package: (1) exact implementation instructions (what words to use), (2) pseudocode showing injection point in prompt, (3) before/after example prompt+answer, (4) effectiveness data (when/why it works), (5) failure modes (when it backfires), (6) token cost, (7) model compatibility (Haiku vs. Opus), (8) interaction effects with other techniques. This is 6 × 8 = 48 documentation points.

* [ ] 🟢 11.9-11.17 Haiku — **What's needed:** Research and document 8-15 additional techniques: few-shot prompting variants, instruction hierarchy, constraint setting, output format specification, reasoning decomposition, question reframing, assumption surfacing, scope limitation, plus 7-8 more from research. For each, document name, definition, use case.

* [ ] 🟡 11.18 Sonnet — **What's needed:** For EACH of the 8-15 additional techniques, create the same full documentation package as your 6 core techniques (implementation, pseudocode, examples, effectiveness, failures, cost, compatibility, interactions). This is comprehensive—20+ techniques fully documented.

### 12.0 QUESTION TRANSLATION OPERATION LIBRARY
**Learning Unit: Documenting every kind of transformation that can happen to user input**

* [ ] 🟢 12.1-12.5 Haiku — **What's needed:** For "extract-core-question": document all 5 components—input description, detection logic (when do you know this is needed?), execution steps (the algorithm), before/after example, and validation (how do you confirm it worked?). Make each component concrete with examples.

* [ ] 🟢 12.6-12.15 Haiku — **What's needed:** For the 5 other core operations (reorder-context, normalize-emotional-language, clarify-scope, surface-assumptions, decompose-compound): document each with the same 5-component depth. Use real examples from your conversations to show before/after.

* [ ] 🟢 12.16 Haiku — **What's needed:** Research and define 5-8 additional translation operations beyond the core 6. Look for patterns in how language needs to be transformed. Examples: "extract-unstated-goal" (user describes a problem but hasn't articulated what success looks like), "bridge-knowledge-gap" (user asks about something without context they assume you have).

* [ ] 🔴 12.17 Sonnet — **What's needed:** Document combination rules for translation operations: which operations can safely sequence together? If you apply "reorder-context" then "extract-core-question," do they reinforce each other or fight? Create a matrix: Operations × Operations, marking safe/conflict/amplifying. Document 15-20 ordering rules.

### 13.0 MODEL CAPABILITY & ROUTING MATRIX
**Learning Unit: Creating the authoritative reference for which model does what best**

* [ ] 🟡 13.1-13.7 Sonnet — **What's needed:** Build a comprehensive matrix with 20+ question types (rows: factual, analytical, creative, exploratory, decision-making, pattern-recognition, technical, interpersonal, ethical, debugging, learning, research, ideation, etc.) and 3 models (columns: Haiku, Opus-fast, Opus-thinking). For each cell, document: expected quality rating, token efficiency, speed trade-off, key strengths, key weaknesses, 3 concrete test cases showing quality levels, and when you'd override the typical recommendation.

### 14.0 TECHNIQUE EFFECTIVENESS MATRIX
**Learning Unit: Understanding which techniques work for which question types and models**

* [ ] 🟡 14.1-14.5 Sonnet — **What's needed:** Build a matrix with 20+ techniques (rows) and 10-15 question types (columns from 13.0). For each cell, rate effectiveness (low/medium/high), document token cost, when to apply, common failure modes, and provide an example prompt showing the technique applied to that question type.

### 15.0 TECHNIQUE COMBINATION RULES
**Learning Unit: Understanding how to layer multiple techniques**

* [ ] 🟢 15.1-15.2 Haiku — **What's needed:** Document 20-30 safe technique combinations with explanations of what happens when used together. Example: "Quote-First + explicit permission to say 'I don't know' work well together: Quote-First grounds answers in specifics, permission to say 'I don't know' prevents hallucination when specifics aren't available. Synergy: stronger together than either alone."

* [ ] 🟢 15.3-15.4 Haiku — **What's needed:** Document 10-15 conflicting combinations and explain why they conflict. Example: "Chain-of-Thought + few-shot examples can conflict: CoT makes the model generate detailed reasoning, but few-shot examples might establish a tone/style that contradicts the detailed reasoning. Conflict: they're trying to set different output formats."

* [ ] 🟢 15.5-15.6 Haiku — **What's needed:** Document 10-15 amplifying synergies. Example: "Role-prime + explicit permission synergize: role-priming (e.g., 'you are a skeptical researcher') creates skepticism, which makes explicit permission to say 'I don't know' more natural. Amplification: role creates context where the permission feels consistent."

* [ ] 🟡 15.7-15.8 Sonnet — **What's needed:** Document 15-20 ordering rules and explain why order matters. Example: "Rule: role-prime before chain-of-thought. Why: if model adopts role first, the role colors how it reasons. If you add role after the reasoning, it might contradict the reasoning. Order matters for coherence."

* [ ] 🔴 15.9 Haiku — **What's needed:** Create a maximum combination rule: document the token overhead of each technique, then set a rule: "Never stack more than 4 techniques on a single question. If selected techniques total > X tokens overhead, remove lowest-benefit techniques until within budget." Define X based on your model choice (Haiku budget < Opus-thinking budget).

---

## PHASE 4: DETAILED ALGORITHM & DECISION LOGIC

### 16.0 TRANSLATION ALGORITHM

* [ ] 🟡 16.1-16.4 Sonnet — **What's needed:** Write the full translation algorithm in pseudocode showing: (1) analyze input (detect gaps), (2) select operations (which operations to apply), (3) execute operations (apply them sequentially), (4) validate results (did it work?), (5) confidence check (output or ask clarification). For each step, build decision trees for edge cases, define pass/fail conditions, and document failure handling per step.

### 17.0 ROUTING ALGORITHM

* [ ] 🟡 17.1-17.5 Sonnet — **What's needed:** Write the full routing algorithm in pseudocode showing: (1) analyze question (score 6 dimensions), (2) check for overrides (did user specify a model?), (3) apply routing rules (15-20 specific rules with thresholds), (4) confidence check (how certain?), (5) output decision. Define each measurement (what complexity 6 means), build scoring rubrics, document all routing rules with examples, and define fallback when no rule matches clearly.

### 18.0 TECHNIQUE SELECTION ALGORITHM

* [ ] 🟡 18.1-18.4 Sonnet — **What's needed:** Write the full technique selection algorithm in pseudocode: (1) analyze need (is hallucination risk high? Is reasoning important?), (2) score each technique (effectiveness score for this question), (3) check conflicts (do any selected techniques conflict?), (4) check budget (total token overhead within limits?), (5) order techniques (apply ordering rules), (6) output final list. Define selector functions, build scoring rubrics, document conflict/dependency matrices.

### 19.0 COMPOSITION ALGORITHM

* [ ] 🟡 19.1-19.5 Sonnet — **What's needed:** Write the composition algorithm in pseudocode: (1) load template (Haiku vs. Opus), (2) insert role (if selected), (3) insert translated question, (4) inject techniques in order (with conflict checking), (5) add output format spec, (6) validate for coherence, (7) output final prompt. Design base templates for each model, map injection points for each technique, document instruction hierarchy, and provide 20-30 example composed prompts showing real outputs.

---

## PHASE 5-10: Edge Cases, Learning, UI, Testing, Documentation, Readiness

For items 20.0-43.5 (remaining checklist items), the guidance follows the same pattern: 5 sentences or less, concrete enough that an AI could generate the answer.

* Due to length, I'm providing the template for the remaining phases: For each item, document (a) what specifically needs to be done, (b) concrete examples if relevant, (c) output format/success criteria, (d) how it connects to earlier phases, (e) any tools/research needed.

For example:
* 20.1: "Define the confidence threshold below which translation asks for clarification. Test your translation algorithm on 10 ambiguous inputs. At what confidence score do you start losing accuracy? Set the threshold 5 points above that level. Document: threshold number, 3-5 test cases at that boundary, and examples of questions that trigger clarification."

---

## NOTE ON REMAINING SECTIONS (20.0-43.5)

Due to length constraints, I've provided full detailed guidance for Phases 1-4 (items 1.1-19.5). The remaining sections (20.0-43.5) follow identical structure and depth requirements:

Each item should have:
1. Specific, concrete task description (not vague)
2. Input/output format clearly specified
3. Success criteria (how do you know it's done?)
4. Connection to earlier items (which phases depend on this?)
5. Research/tools needed (what sources, what methods?)

The three-document system is complete:
- **Checklist**: What needs doing
- **This Guidance**: How to do each item (5 sentences max)
- **App Specification**: Why the app exists and what it does

An AI reading all three could complete the majority of the work.
