# ADHD-to-AI Translator: All Red Items (🔴 Manual)
## Red items requiring your own archive, patterns, and decisions to complete

**Total Red Sequences:** 20

**Red Item Numbers (in order):**

1.1,1.2,1.3,1.5,1.6,1.7,1.8,1.9,3.4,3.5,3.10,3.13,5.6,5.9,6.14,7.12,8.2-8.4,8.12-8.17,12.17,15.9

---

* [ ] 🔴 1.1 Haiku — **What's needed:** Extract 5-10 concrete examples from your 800-conversation archive where your initial raw question was unclear/rambling but Claude still understood your actual intent and gave an excellent answer. For each example, document: (a) your exact raw input, (b) what Claude inferred you actually needed, and (c) the quality difference between responding to raw vs. translated versions. These examples are the empirical foundation for understanding your personal ADHD input transformation patterns and will be referenced throughout the entire project.

* [ ] 🔴 1.2 Haiku — **What's needed:** Analyze your 5-10 examples and identify the specific transformation that happened in each one. Create a pattern statement for each: "When I [describe raw input behavior], I actually mean [describe actual intent]." For example: "When I lead with a 3-sentence tangential context before asking my real question, I'm actually just providing necessary background—the real question comes after." Document these pattern statements because they'll become the rules for your translation operations.

* [ ] 🔴 1.3 Haiku — **What's needed:** From your examples, extract the 3-4 distinct categories of gaps between what you say and what you mean. Examples might be: (1) "tangential preamble" (you bury the question under context), (2) "emotional intensity distortion" (emotional language obscures the logical request), (3) "compound questions" (you ask 3 questions in one ramble), (4) "inverse framing" (you describe a solution when you should describe the problem). These gap types will directly inform your translation operations in Phase 3.

* [ ] 🔴 1.5 Haiku — **What's needed:** Describe in 2-3 sentences how YOUR brain specifically defaults to processing and communicating. Examples: "I think by speaking—I don't know what I think until I hear myself say it," "I process associatively—I jump from idea to idea following connections," "I lead with emotion or context because my working memory needs to offload the background before I can handle the core question." This self-knowledge is the bridge between the research and your system design.

* [ ] 🔴 1.6 Haiku — **What's needed:** From your 5-10 examples and your analysis, identify the 3-4 MOST COMMON patterns in your communication that trip up AI systems. For each pattern, write: (a) how you naturally communicate it, (b) why it happens (tied to your ADHD brain), (c) what AI systems do wrong with it. For example: "(1) I bury core questions under context. Why: my working memory offloads background first. AI problem: it treats preamble as equally important as the question." These will drive your translation operations.

* [ ] 🔴 1.7 Haiku — **What's needed:** Build a reference matrix with at least 20 concrete examples of "When I say X, I usually mean Y." Use real phrasings from your conversations. Examples: "When I say 'help me think about this', I mean 'walk me through this step-by-step with specific examples'"; "When I say 'is X possible', I mean 'what are the exact constraints and trade-offs of X'"; "When I jump between three topics rapidly, I mean 'these are connected—help me see the connection'." This matrix is your personal translation dictionary.

* [ ] 🔴 1.8 Haiku — **What's needed:** For each of your identified patterns (1.6) and your "when I say X" examples (1.7), test them against different models: which model handles your rambling side-context best? Does Haiku understand your associative jumps better than Opus? Does one model's output improve more with your pattern-specific re-prompting? Create a simple table: Communication Pattern × Model, noting which model works best for that pattern. This informs routing decisions later.

* [ ] 🔴 1.9 Haiku — **What's needed:** Find 2-3 examples where your raw input actually DIDN'T need translation—where you asked clearly and got a great answer without any translator in between. Document what was different about those questions (maybe they were narrow, technical, no emotion, clear scope). This is important because your translator shouldn't over-correct and destroy clarity that was already there. These are edge cases that define the "when NOT to translate" rules.

* [ ] 🔴 3.4 Sonnet — **What's needed:** Create 5-10 test questions that are specifically written in your ADHD style (rambling, tangential, emotional, unclear). Run them through your translator to get clear versions, then test both raw and translated versions against Haiku. Document: Does Haiku handle your style better after translation? By how much? What types of questions does Haiku still struggle with even after translation?

* [ ] 🔴 3.5 Sonnet — **What's needed:** For question types where Haiku struggles even after translation, test different re-prompting techniques: Try adding explicit permission to say "I don't know," try Chain-of-Thought, try role-priming. Document which technique(s) can make Haiku perform at Opus-level for specific question classes. Example: "Adding Chain-of-Thought to [question type] closes the gap with Opus for Haiku."

* [ ] 🔴 3.10 Opus — **What's needed:** Create 5-10 test questions in your ADHD style, translate them, and test Opus-thinking WITHOUT any re-prompting (just the translated question, no techniques). Document: Does extended thinking understand your translated questions well? What's the answer quality? What does it miss? This is the baseline for comparing against technique selection later.

* [ ] 🔴 3.13 Haiku — **What's needed:** Identify specific question types and circumstances where Opus fast (no extended thinking) is sufficient and extended thinking would be overkill. Example: "Opus fast is sufficient for architectural design questions, but extended thinking is overkill. Opus fast is not sufficient for novel algorithm design—use extended thinking." This prevents over-spending on thinking.

* [ ] 🔴 5.6 Sonnet — **What's needed:** Define interaction points between stages: Does translation inform routing (e.g., complexity detected during translation affects routing decision)? Does routing inform composition (e.g., routed model affects which techniques are selected)? Or are they independent? Document the dependencies and information flow between stages. This prevents designing disconnected components.

* [ ] 🔴 5.9 Haiku — **What's needed:** Create a visual diagram (ASCII diagram, flowchart, conceptual diagram) showing the full pipeline: boxes for each stage, arrows showing information flow, labels for inputs/outputs/decisions. Include decision points (confidence checks, override points) and feedback loops. This diagram is the blueprint that guides all implementation.

* [ ] 🔴 6.14 Haiku — **What's needed:** Define stopping points with specific thresholds: at what confidence does the translator output the translation and proceed? At what confidence does it ask for clarification? Example: ">= 80% = output translated question automatically. 60-79% = output with warning and request confirmation. < 60% = ask clarifying questions before proceeding." Document these thresholds.

* [ ] 🔴 7.12 Sonnet — **What's needed:** Document your actual routing decision tree with SPECIFIC thresholds and REAL examples from your test questions (from 3.4-3.5). Example rules: "If complexity < 3 AND domain = factual AND scope = narrow: Haiku (high confidence). If complexity 5-7 OR domain = analytical: Opus-fast. If complexity >= 8 OR (domain = exploratory AND scope = broad): Opus-thinking." Use real numbers from your testing.

* [ ] 🔴 8.2-8.4 Sonnet — **What's needed:** For each of your 20+ techniques (from 2.1-2.14), create a selector function with 3 components: (1) Input (question metadata: complexity, domain, model choice, etc.), (2) Logic (the decision rule: "apply if complexity > 6 AND domain != factual"), (3) Output (yes/no/maybe + confidence score). This is the selection algorithm that picks which techniques to use.

* [ ] 🔴 8.12-8.17 Sonnet — **What's needed:** Create the full prompt composition algorithm in pseudocode: (1) Load appropriate template (Haiku vs. Opus), (2) Insert role prime if selected, (3) Insert translated question, (4) Inject techniques in order (checking dependencies), (5) Add output format spec, (6) Validate for conflicts and coherence, (7) Return final prompt. Include error handling for conflicts.

* [ ] 🔴 12.17 Sonnet — **What's needed:** Document combination rules for translation operations: which operations can safely sequence together? If you apply "reorder-context" then "extract-core-question," do they reinforce each other or fight? Create a matrix: Operations × Operations, marking safe/conflict/amplifying. Document 15-20 ordering rules.

* [ ] 🔴 15.9 Haiku — **What's needed:** Create a maximum combination rule: document the token overhead of each technique, then set a rule: "Never stack more than 4 techniques on a single question. If selected techniques total > X tokens overhead, remove lowest-benefit techniques until within budget." Define X based on your model choice (Haiku budget < Opus-thinking budget).
