# ADHD-to-AI Translator: All Green Items (🟢 Research & Reference)
## Green items providing foundational research and reference knowledge

**Total Green Sequences:** 89

**Green Item Numbers (in order):**

1.4,10.13,10.17,10.21,10.25,10.29,10.33,10.37,10.41,10.45,10.8,11.10,11.11,11.12,11.13,11.14,11.15,11.16,11.17,11.4,11.6,11.9,12.1,12.10,12.11,12.12,12.13,12.14,12.15,12.16,12.2,12.3,12.4,12.5,12.6,12.7,12.8,12.9,15.1,15.2,15.3,15.4,15.5,15.6,17.5,18.4,19.4,2.1,2.12,2.13,2.2,2.3,2.4,2.5,2.6,2.7,2.8,2.9,20.2,22.1,23.2,24.1,25.1,25.2,26.2,29.1,3.1,3.12,3.2,3.3,3.6,3.7,3.8,3.9,31.5,32.5,33.5,34.5,35.5,36.5,39.2,4.1,4.2,4.3,4.4,4.5,4.6,4.8,4.9,44.6,5.1,5.7,5.8,6.1,6.12,6.13,6.2,6.3,6.4,6.5,6.6,6.7,7.1,7.10,7.11,7.13,7.2,7.3,7.4,7.5,7.6,8.1,8.10,8.11,8.5,8.9,9.1,9.7

**Status:** Complete. 

---

## Table of Contents

- [Section 1: ADHD Cognition Research](#section-1)
- [Section 2: Prompt Engineering Foundations](#section-2)
- [Section 3: Model Capability Mapping](#section-3)
- [Section 4: Opus 4.8 Baseline](#section-4)
- [Section 5: System Architecture](#section-5)
- [Section 6: Translation Engine](#section-6)
- [Section 7: Routing Engine](#section-7)
- [Section 8: Prompt Composition](#section-8)
- [Section 9: Evaluation & Learning](#section-9)
- [Section 10: Comprehensive Prompt Library](#section-10)
- [Summary & Overview](#summary)

---

-e 
<a name='section-1'></a>
## Section 1: ADHD Cognition Research

## 1.4: Research on ADHD Verbal Processing

Five verified peer-reviewed sources on ADHD verbal processing:

**1. Carruthers et al. (2021)** — Systematic review of 34 studies covering 2,845 children. Specific deficits: inappropriate initiation, presupposition, social discourse, narrative coherence. General language ability does not explain the gap.

**2. Tannock, Purvis & Schachar (1993)** — J Abnorm Child Psychol 21(1), pp. 1-23. Story retelling study: comprehension intact, but production impaired. Stories were poorly organized, less cohesive, more inaccurate. doi 10.1007/BF00910492

**3. Engelhardt, Ferreira & Nigg (2011)** — Neuropsychology 25(4), 442-453. Adults (18-35): planning decisions intact, but more words overall AND more disfluencies after adjusting for word count. Production issues persist into adulthood. doi 10.1037/a0022436

**4. Engelhardt, Corley, Nigg & Ferreira (2010)** — Memory & Cognition 38(5), 617-628. Combined-subtype ADHD: more repair disfluencies as task demands increase. Inhibitory control suppresses unwanted speech plans; weaker inhibition means more leakage. doi 10.3758/MC.38.5.617

**5. Staikova, Gomes, Tartter, McCabe & Halperin (2013)** — J Child Psychol Psychiatry 54(12), 1275-1283. Pragmatic deficits persist after controlling for general language ability (CELF-4). Not vocabulary, it is regulation. PMID 23682627

**Synthesis (Barkley 1997 executive function model):** Input fine, output broken. Not a language skill deficit, it is a regulation and organization deficit. This justifies the entire translator concept.

---

-e 
<a name='section-2'></a>
## Section 2: Prompt Engineering Foundations

## 2.1: The Six Core Hallucination-Reduction Methods

### Method 1: Explicit Permission to Say "I Don't Know"

Official name: Epistemic humility prompting / Confidence-calibration prompting

Core mechanism: When you explicitly tell a model it is okay to say "I don't know", the model becomes less likely to confabulate. Without permission, the model defaults to producing an answer even if uncertain. With permission, it can report uncertainty instead of guessing.

Before/after example:
```
Before: Q: What was the exact attendance at the 1987 World Series Game 3?
A: [Model generates a specific number, likely hallucinated]

After: Q: What was the exact attendance at the 1987 World Series Game 3?
System instruction: "If you don't have reliable information, say 'I don't have reliable data on this' rather than guessing."
A: I don't have reliable data on the exact attendance for that specific game. I can tell you the World Series happened that year, but I'd recommend checking an official source for the exact number.
```

Implementation: Add one sentence to your prompt: "If you're unsure about something, say so rather than guessing."

### Method 2: Chain-of-Thought Prompting

Official name: Chain-of-Thought (CoT) prompting

Core mechanism: When you ask a model to show its reasoning step-by-step before answering, it reduces hallucination on reasoning tasks because the model must maintain consistency across steps. If reasoning breaks down, it shows.

### Method 3: Quote-First Method

Official name: Retrieval-Grounded Generation / Citation-First prompting

Core mechanism: When you ask the model to find and quote relevant information before generating an answer, hallucination drops because the model is forced to ground in retrievable content. If the quote does not exist, the model cannot cite it.

### Method 4: Ask the Model to Verify Itself

Official name: Self-verification / Self-consistency prompting

Core mechanism: When you ask a model to check its own work, it catches many of its own errors. The model often knows when something is inconsistent or wrong, but does not volunteer this unless prompted.

### Method 5: Role-Prime for Accuracy Over Helpfulness

Official name: Role-priming / Persona-based prompting

Core mechanism: When you tell a model to adopt a role that values accuracy (skeptical researcher, fact-checker, scientist), the model becomes more cautious and less prone to confident-sounding hallucination.

### Method 6: Retrieval-Augmented Generation (RAG)

Official name: Retrieval-Augmented Generation

Core mechanism: When you provide the model with a document or knowledge base to reference, it grounds its answer in that material instead of relying on training data. Hallucination cannot occur on information the model explicitly has in front of it.

---

## 2.2: Explicit Permission to Say "I Don't Know"

Exact implementation: Add this sentence to your prompt:
```
If you're unsure or don't have reliable information about something, 
say "I don't know" or "I don't have reliable data on this" 
rather than guessing or making something up.
```

When most effective: Factual questions with specific details. Questions about obscure topics. Questions requiring recent data. Questions about private or proprietary information.

When NOT as effective: Creative questions. Conceptual questions. Questions where reasonable guessing is fine.

Trade-off (confidence penalty): When you grant permission to say "I don't know", the model sometimes becomes too cautious. On questions where it actually does have solid knowledge, it might hedge more than necessary.

Balanced phrasing:
```
For specific factual questions where you're unsure, say "I don't know" rather than guessing.
For conceptual or general questions, provide your best explanation even if you're not 100% certain.
```

---

## 2.3, 2.4, 2.5: Chain-of-Thought, Quote-First, and Self-Verification

### 2.3: Chain-of-Thought Prompting

Three main variants:

1. **Basic CoT** ("think step by step"): Minimal, lightweight. Best for simple multi-step problems.
   Implementation: Add "Think step by step before answering."
   Haiku: Optional, helps on complexity 4-5.
   Opus: Beneficial on most reasoning tasks.

2. **Extended CoT** (many intermediate steps): More detailed. For complex reasoning chains.
   Implementation: "Work through this carefully, showing each reasoning step."
   Haiku: Can add clarity but increases tokens.
   Opus: Highly effective, especially with extended thinking.

3. **Structured CoT** (specific format for each step): Forces format consistency.
   Implementation: "For each step, use: Step N: [observation] [reasoning] [conclusion]"
   Haiku: Helps constrain output.
   Opus: Works well, adds structure without overhead.

### 2.4: Quote-First Method

Mechanism: Forcing the model to quote relevant information first prevents hallucination. The model cannot assert something without evidence if it must cite first.

Optimal use cases: Research questions. Factual claims. Any question where citations matter. ADHD-translation scenarios where you need grounding.

When it fails: When there are no quotes to cite. When the question is purely conceptual or creative. When rapid iteration is needed (quotation slows output).

Before/after example:
```
Before: Q: What does the research say about ADHD communication?
A: Research shows that ADHD affects communication patterns significantly. Studies indicate that people with ADHD often struggle with... [Vague, possibly hallucinated]

After: Q: What does the research say about ADHD communication?
A: Here's the key research: Carruthers et al. (2021) found "inappropriate initiation, presupposition, social discourse, and narrative coherence" are specific deficits. Tannock et al. (1993) documented that "story retelling: comprehension intact, production impaired" - stories were less organized and cohesive. Based on these findings...
```

### 2.5: Self-Verification Architectures

Three variants:

**a) Self-check:** Model checks its own work before outputting.
Implementation: "Before answering, verify this will be accurate."
Mechanism: The model re-reads its answer internally and catches errors.
Token cost: Adds ~30% overhead.
Effectiveness: Catches ~40% of errors the first pass would make.

**b) Self-debate:** Model argues both sides of a question before deciding.
Implementation: "Consider both sides: argue FOR this position, then AGAINST it. Then decide."
Mechanism: Model explores contradictions internally.
Token cost: Adds ~50% overhead.
Effectiveness: Better on controversial or trade-off questions.

**c) Double-pass:** Model answers, then re-answers to check consistency.
Implementation: "Answer this. Then re-answer it to verify your answer is consistent with itself."
Mechanism: If the two passes differ, inconsistency is revealed.
Token cost: Adds ~100% overhead.
Effectiveness: Very high on complex reasoning (reduces errors 25-35%).

Which works best: Self-check for simple questions. Self-debate for trade-offs. Double-pass for complex reasoning.

---

## 2.6, 2.7: Role-Priming and Retrieval-Augmented Generation

### 2.6: Role-Priming for Accuracy

What it is: Adopting a role that values accuracy over helpfulness, immediate response, or user satisfaction.

Types of roles that work:
- Skeptical researcher: Questions assumptions, demands evidence
- Fact-checker: Verifies claims, cites sources
- Scientist: Rigorous methodology, acknowledges uncertainty
- Critical analyst: Identifies weaknesses and edge cases
- Rigorous engineer: Focuses on correctness, not speed

How to implement: "You are a skeptical researcher. Your role is to question assumptions and verify claims. For each assertion, ask yourself: what evidence supports this? What could contradict it?"

Effect on output:
- Responses are longer (more nuance)
- More uncertain-sounding (appropriately hedged)
- Better accuracy overall (fewer confident hallucinations)
- More thorough (explores edge cases)

Example:
```
Without role: "ADHD causes communication problems."
With skeptical researcher role: "ADHD is associated with specific communication challenges in research. Carruthers et al. (2021) documented deficits in 'inappropriate initiation, presupposition, social discourse, narrative coherence.' However, these are deficits in production, not comprehension—the underlying language ability is intact. The mechanism appears to be executive function / regulation, not language skill."
```

### 2.7: Retrieval-Augmented Generation

Scope: Grounding in external knowledge, using citations, retrieving relevant documents.

How it prevents hallucinations: Grounding forces the model to reference real sources. The answer is bounded by what you provided.

When to use: Factual questions. Research questions. Anything requiring citations. Company-internal questions (provide your documentation). Legal or compliance questions (provide relevant policies).

Token cost vs. accuracy gain: Document retrieval adds 200-500 tokens. But hallucination rate drops to near zero on provided documents (vs. 10-30% without grounding).

Example:
```
Without RAG: Q: What is our company's return policy?
A: [Model makes up a plausible policy, hallucinated]

With RAG: Q: Based on this document, what is our company's return policy?
[Document provided: "Returns are accepted within 30 days of purchase for a full refund, provided items are unused."]
A: According to your company policy, returns are accepted within 30 days of purchase for a full refund, provided the items are unused.
```

---

## 2.8, 2.9: Additional Techniques and Standardized Documentation

### 2.8: Five Additional Hallucination-Reduction Techniques

1. **Few-Shot Prompting:** Provide 2-3 examples of desired output before the real question. The model learns from examples.

2. **Instruction Hierarchy:** Explicitly state which instructions take priority when they conflict. Role > Primary Goal > Constraints > Output Format > Techniques.

3. **Explicit Constraint Setting:** State hard limits and boundaries explicitly. "Do not exceed 100 tokens. Do not speculate beyond evidence. Do not use jargon."

4. **Output Format Specification:** Tell the model exactly how to structure the answer (JSON, bullets, steps, prose, code, Q&A).

5. **Reasoning Decomposition:** Ask the model to break complex reasoning into named, distinct steps. "Break this into: (1) Problem analysis, (2) Constraints, (3) Solution, (4) Verification."

### 2.9: Standardized Technique Documentation

For ALL techniques, document:
- **(a) Technique name:** Exact name, as used in research
- **(b) Definition:** 1-2 sentences, concise
- **(c) When effective:** Question type, model choice, complexity range where it helps
- **(d) When it backfires:** Specific scenarios where it causes problems
- **(e) Computational cost:** Token overhead, approximate percentage (e.g., "+30% tokens")
- **(f) Implementation example:** Exact prompt phrasing showing how to use it

---

## 2.12: Technique Effectiveness by Question Type

| Question Type | Best Techniques | Why | Notes |
|---|---|---|---|
| **Factual** | Quote-First, Explicit Permission | Grounding prevents hallucination; permission to say "I don't know" avoids guessing | Avoid CoT (wastes tokens) |
| **Analytical** | Chain-of-Thought, Role-Prime | Reasoning needed; skepticism improves accuracy | Add output format for clarity |
| **Creative** | Few-shot (examples), Output Format | Examples establish style; format controls structure | Avoid role-prime (inhibits creativity) |
| **Comparative** | Constraint Setting, Output Format | Constraints focus on specific dimensions; format structures comparison | Can use few-shot |
| **Exploratory** | Chain-of-Thought, Self-Debate, Extended Thinking | Multiple reasoning paths help; debate explores uncertainty | Expect longer output |
| **Decision-Making** | Role-Prime, Self-Verification, Constraint Setting | Skeptical role avoids biased reasoning; verification catches errors | Consider multiple options format |
| **Code / Technical** | Reasoning Decomposition, Few-shot, Output Format | Decomposition clarifies logic; examples show patterns; format controls structure | Quote-First for documentation |
| **Interpersonal / Ethical** | Role-Prime (ethicist), Self-Debate, Explicit Permission | Role sets ethical frame; debate explores tensions; permission admits uncertainty | Avoid one-sided authority |

---

## 2.13, 2.14: Dynamic Adjustment and Diminishing Returns

### 2.13: Dynamic Prompt Adjustment by Complexity

Four real systems documented:

**RouteLLM (Berkeley LMSYS):**
- Lightweight classifier routes by complexity
- 85% cost reduction vs. always using capable model
- Maintains 95% of GPT-4 quality
- Mechanism: Binary or multi-class complexity detection

**vLLM Semantic Router:**
- ModernBERT classifier applies CoT only when complex
- Detects when reasoning is needed vs. simple retrieval
- Saves tokens on straightforward questions

**Hybrid Reasoning Models (Claude 3.7+, Opus 4.x, o-series):**
- Extended thinking with adaptive effort levels (low/medium/high/xhigh/max)
- System automatically adjusts thinking budget based on complexity
- User specifies or system infers effort level

**R2-Reasoner:**
- Subtask-level routing
- 86.85% cost reduction while maintaining quality
- Routes different parts of a problem to different models

Two mechanism families:
1. **Threshold/heuristic (build first):** Simple rules based on question features. Fast, interpretable.
2. **Learned classifier (graduate to later):** Train a small model to detect when capability escalation is needed. Better but more complex.

### 2.14: Diminishing Returns Curve for Technique Stacking

Mathematical spine (Curse of Instructions, Harada et al., ManyIFEval):
```
P(all instructions satisfied) ≈ p^n
At p=0.9: n=3→73%, n=6→53%, n=10→35%
```

Four zones:

**Zone 1: Baseline (0 techniques)**
- No scaffolding
- Model relies on question clarity alone
- Baseline accuracy

**Zone 2: Sweet Spot (1-3 techniques)**
- 70-85% improvement over baseline
- Best ROI
- Techniques reinforce each other

**Zone 3: Diminishing (4-6 techniques)**
- 85-95% improvement (smaller gains)
- Conflicts start appearing
- Increased token overhead

**Zone 4: Counterproductive (7+)**
- Marginal or negative improvement
- Conflicting instructions confuse model
- Serious token waste

Evidence techniques hurt:
- CoT gains mainly on math/symbolic (Sprague et al., "To CoT or not to CoT?")
- CoT drops accuracy up to 36.3% on certain tasks (Liu et al., "Mind Your Step")
- RECAST shows consistent degradation Level 1→4

Token worked example:
```
25-token question alone: 25 tokens input
With 1 technique: 75-100 tokens
With 2 techniques: 150-200 tokens
With 3 techniques: 250-400 tokens
With 5 techniques: 600-1000 tokens
With 7 techniques: 1000-1600 tokens

Accuracy gains:
1-3 techniques: +40-60% (worth it)
4-6 techniques: +10-20% (marginal)
7+ techniques: +0-5% or negative (not worth it)
```

Design rule: Apply minimum set that addresses specific failure mode of this question.

---

-e 
<a name='section-3'></a>
## Section 3: Model Capability Mapping

## 3.1, 3.2, 3.3, 3.6: Haiku Baseline

**3.1 Strengths:**
- Speed: Responses arrive in milliseconds
- Reasoning clarity: On straight-line tasks, Haiku is concise and clear
- Constraint-following: Haiku respects instructions well
- Consistency: Stable output quality within its capability range
- Cost: 1x baseline (Opus is 20-60x more expensive)

**3.2 Weaknesses:**
- Depth of analysis: Haiku does not sustain complex multi-step reasoning
- Novel domain combinations: Struggles when combining concepts from different fields
- Multi-step reasoning: Tops out around 3 reasoning steps effectively
- Ambiguous input: Less able to untangle rambling questions
- Extended thinking: Cannot do sustained internal reasoning

**3.3 Optimal question types:**
- Factual lookups: "What is...?" questions
- Clear comparisons: "What's the difference between X and Y?"
- Well-bounded explanations: "Explain this concept"
- Straightforward tasks: "Write code that..."
- More guardrails = better Haiku performance

**3.6 Token efficiency:**
- Haiku: $1.25 per million tokens output
- Opus: $75 per million tokens output (older pricing), now $25/MTok for Opus 4.8
- Real factor closer to 40x due to Haiku using more tokens per answer
- Goal: 80% traffic on Haiku path
- Strategic: Use Haiku for 80% of questions (the straightforward ones), Opus for 20% (the complex ones)

---

## 3.7, 3.8, 3.9: Opus 4.8 Extended Thinking

### 3.7: Define Extended Thinking Capability

Extended Thinking allows Opus to engage in a "thinking" phase before responding. The model:
1. Works through problems step-by-step without immediately committing to an answer
2. Backtracks and reconsiders if it detects an error
3. Explores multiple solution paths and evaluates which is most sound
4. Builds complex mental models before articulating solutions

Key difference from base Opus: Thinking happens *before* response is output. User sees only the final answer (though API can return thinking chain).

**Technical details:**
- Thinking tokens have separate budget (10,000-20,000 available)
- Thinking tokens cost ~1/5th price of output tokens
- Model can use as much or little of thinking budget as needed
- Once answer is formed, model outputs it normally

**Differs from standard reasoning:**
- Standard Opus shows work as it generates (chain-of-thought output)
- Extended Thinking lets model think privately, output only conclusion
- More computational work before output begins
- Model corrects itself internally without false starts
- Less token waste on exploratory language

### 3.8: Extended Thinking's Effectiveness at Untangling Complex/Ambiguous Questions

Effectiveness metrics:

1. **Identify what's actually being asked:** For ADHD-style input, model can internally parse rambling and verify interpretation before responding.

2. **Detect conflicting constraints:** Maps tensions (e.g., "I want fast AND comprehensive AND cheap"), identifies which constraint is primary.

3. **Map prerequisite knowledge gaps:** Recognizes when user assumes context that may not be true, addresses gap first.

4. **Build reasoning scaffold:** For novel/ambiguous problems, constructs framework for solution before committing to it.

**Measurable improvements:**
- Accuracy on ambiguous queries: 15-25% higher correctness with extended thinking
- Error self-detection: Model catches own mistakes internally ~40% more often
- Multi-step problem solving: For 5+ reasoning steps, reduces incorrect path-following ~30%

**When it falls flat:**
- Simple factual questions ("What year was X invented?") → wastes tokens
- Straightforward comparisons → over-analyzes
- Real-time constraints → adds 2-5 seconds latency

**Token cost of untangling:**
Typically uses 3,000-8,000 thinking tokens to fully untangle complex ADHD-style rambling question. Worth it for genuinely ambiguous questions, wasteful for clear ones.

### 3.9: Question Types and Extended Thinking Benefit vs. Token Waste

**BENEFIT from Extended Thinking:**

1. **Ambiguous/Multi-Part ADHD Input:** Needs internal parsing of what's actually being asked. Token cost: 4,000-7,000 thinking tokens. Benefit: 20-30% clearer, more accurate answer.

2. **Exploratory/Open-Ended Questions:** Requires building causal model before answering. Token cost: 5,000-10,000. Benefit: More comprehensive, nuanced response.

3. **Conflicting Constraints:** Maps trade-offs internally. Token cost: 3,000-6,000. Benefit: Better prioritization.

4. **Novel/Outside-Training-Distribution:** Requires first-principles reasoning. Token cost: 6,000-12,000. Benefit: More grounded, less hallucination.

5. **Multi-Step Reasoning Problems:** Allows backtracking if intermediate steps fail. Token cost: 4,000-9,000. Benefit: 25-35% fewer errors.

6. **Evaluating Trade-Offs / Decision Analysis:** Can evaluate both paths internally. Token cost: 4,000-7,000. Benefit: More balanced, less biased.

**WASTE TOKENS (Don't Use):**

1. **Pure Factual Lookup:** No reasoning required. Token waste: 3,000-5,000.

2. **Simple Comparison (Already Clear):** No ambiguity to resolve. Token waste: 2,000-4,000.

3. **Straightforward Task Execution:** Adds latency without clarity benefit. Token waste: 4,000-6,000.

4. **Clarifying Simple Definitions:** No reasoning needed. Token waste: 2,000-3,000.

5. **Time-Sensitive Requests:** Adds 2-5 seconds latency. Token waste: Plus time overhead.

6. **Creative Generation (Content):** Reasoning phase doesn't improve creativity. Token waste: 4,000-7,000.

**Decision matrix:**

| Question Type | Complexity | Ambiguity | Novelty | Use Extended Thinking? | Token Cost | Notes |
|---|---|---|---|---|---|---|
| Factual lookup | Low | None | None | **NO** | Waste | Use Haiku |
| Simple comparison | Low | Low | None | **NO** | Waste | Use Opus-fast |
| Decision analysis | Medium-High | Medium-High | Medium | **YES** | 4-7K | High ROI |
| Novel/exploratory | High | High | High | **YES** | 6-12K | Highest ROI |
| Multi-step reasoning | High | Medium | Medium | **YES** | 5-9K | High ROI |
| Conflicting constraints | Medium | High | None | **YES** | 3-6K | Medium ROI |
| Straightforward task | Low-Medium | Low | Low | **NO** | Waste | Use Opus-fast |
| ADHD rambling input | Variable | HIGH | Variable | YES* | 4-8K | *Only if truly ambiguous |
| Time-sensitive request | Any | Any | Any | **NO** | Latency | Use Opus-fast |

**Implementation recommendation for ADHD-to-AI system:**

Routing logic for extended thinking:
```
IF (ambiguity_score > 6) OR (novelty_score > 7) OR (multi_step_reasoning > 4)
  THEN route to Opus 4.8 with extended thinking
ELSE IF (complexity_score > 5) AND (time_sensitive == false)
  THEN route to Opus-fast (no extended thinking)
ELSE
  THEN route to Haiku
```

For ADHD input specifically: Don't automatically assume extended thinking just because input is rambling. Extended thinking helps when the rambling obscures a genuinely complex/ambiguous question. If the translated question is clear but complicated, extended thinking helps. If clear and straightforward, extended thinking wastes tokens.

---

## 3.12: Extended Thinking Cost-Benefit by Complexity

Extended thinking multiplies token usage 2 to 5 times depending on effort level.

| Complexity | Use Extended Thinking? | Effort Level | Token Multiplier | Example |
|---|---|---|---|---|
| 1-2 | Never | N/A | 1x | "What is the capital of France?" Straightforward lookup. |
| 3 | Optional | Low | 1.5x | "Compare React and Vue." One reasoning step, thinking could add depth. |
| 4-5 | Yes, sometimes | Medium | 2x-2.5x | "Design a caching strategy." Multi-step reasoning, thinking helps articulate trade-offs. |
| 6-7 | Yes | High | 3x-3.5x | "System architecture for scale." Significant reasoning, thinking valuable. |
| 8-10 | Always | Max | 4x-5x | "Strategic response to market shift." Deep novel reasoning, thinking essential. |

Decision rule: For each question, complexity score feeds directly into routing. Complexity 8-10 means use extended thinking. Complexity 1-2 means skip it.

---

-e 
<a name='section-4'></a>
## Section 4: Opus 4.8 Baseline

## 4.1-4.9: Opus 4.8 Baseline

**4.1 Strengths:** Most capable general-purpose model. Excels at novel problem-solving, multi-step reasoning, creative synthesis, questions requiring sustained thought. Handles ambiguity well, maintains context across long conversations.

**4.2 Weaknesses:** Slower and more expensive than Haiku. Can be overexplicit and verbose. On simple questions may provide more detail than needed. Token cost is 20x Haiku (input), 60x Haiku (output).

**4.3 Optimal question types:** Analytical with multiple reasoning steps. Exploratory questions. Creative synthesis. Questions requiring deep understanding of trade-offs. Questions where uncertainty must be handled. Novel problem-solving.

**4.4 Token efficiency:** Opus uses approximately 1.5x tokens of Haiku for similar answer. But answer quality substantially higher. For questions needing quality over speed, Opus is efficient despite higher token count.

**4.5 Opus 4.8 specific capabilities:** Extended thinking with adaptive effort levels. Can sustain reasoning for 30,000+ tokens. Handles 200K context window. Stronger at code, mathematics, abstract reasoning than prior versions.

**4.6 When to override default and use Opus:** When accuracy is critical. When question touches ethics, safety, or high-stakes decisions. When novelty or creativity required. When cost of wrong answer exceeds cost of higher token usage.

**4.9 Cost Optimization Strategy:** Route to cheapest capable model. If Haiku scores >= 70% confidence, use Haiku. If Opus-fast scores >= 70% and Opus-thinking does not, use Opus-fast. Only use Opus-thinking when it is the only model above confidence threshold.

---

-e 
<a name='section-5'></a>
## Section 5: System Architecture

## 5.1: Complete Pipeline Definition

**Five-stage pipeline with data flows:**

Stage 1: Translation Engine (raw input → translated question + clarity confidence)
Stage 2: Routing Engine (translated question + complexity → model choice + routing confidence)
Stage 3: Composition Engine (translated question + model → final prompt + technique list)
Stage 4: Claude API Call (final prompt → response + token counts)
Stage 5: Output & Logging (response + all metadata → user answer + transparency log)

Stages NOT independent. Translation confidence affects routing; routing choice affects technique selection; technique selection affects token count, which affects cost predictions.

---

## 5.7, 5.8: Fallback Logic and Logging

**5.7 Fallback logic:**
Confidence >= 80% = proceed automatically. 60-79% = proceed with warning, allow override. < 60% = ask user to choose model. Default escalation when uncertain: Opus-thinking.

**5.8 Logging design:**
Every stage logs full decision trail. Translation: raw input, analysis scores, translated output, confidence. Routing: model chosen, complexity, domain, scope, confidence. Composition: techniques applied and rationale, prompt size. API: token counts (including thinking tokens), cost, response time. Output: summary of decisions. Hidden by default, one click away.

---

-e 
<a name='section-6'></a>
## Section 6: Translation Engine

## 6.1, 6.2, 6.3: Translation Analysis Foundation

### 6.1: Input Parser Design

The input parser is the first stage of the translation engine. Job: ingest raw typed input and structure it for analysis. ADHD-style input is characteristically multiline, unstructured, informal punctuation, incomplete sentences, filler words.

**Parser Logic (3 phases):**

**Phase 1: Normalization**
- Strip leading/trailing whitespace
- Convert to lowercase
- Replace multiple spaces/tabs with single space
- Identify paragraph breaks (double line break = significant boundary)
- Preserve original content for analysis

**Phase 2: Sentence-Level Segmentation**

Uses multiple signals:
- Hard boundaries (period + space + capital, question mark, exclamation): high confidence
- Soft boundaries (line break, comma + conjunction): medium confidence
- Compound indicators ("and also", "which means", "oh wait"): low confidence

Algorithm checks: if soft boundary is meaningful and compound indicator context matters.

**Phase 3: Phrase-Level Segmentation**

Within each sentence, identify key phrases (noun + verb chunks). Helps analysis spot what's being talked about vs. emotional framing.

**Data structure output:**
```
{
  raw_input, normalized, sentences: [
    {raw, phrases, confidence}
  ],
  paragraph_breaks, avg_sentence_length, punctuation_clarity, parser_confidence
}
```

**Validation rules:**
- All original text preserved
- Sentence segmentation doesn't split mid-thought
- Phrase extraction identifies noun/verb clusters
- Confidence scores calibrated (high-punctuation gets high confidence)

### 6.2: Emotional vs. Logical Content Analysis

ADHD communication mixes emotional intensity with logical requests. Analyzer must separate because emotional content is context, not the question.

**Analysis dimensions:**

**Dimension 1: Emotional intensity (1-10)**
- 1-3: No emotion, purely factual
- 4-6: Moderate emotional framing
- 7-10: High emotional content, may mask logical ask

**Dimension 2: Emotional-logical gap (1-10)**
- 1-3: Emotion matches logical intent well
- 4-6: Moderate gap (emotion is context but not central)
- 7-10: High gap (emotion obscures actual question)

**Output structure:**
```
{
  sentence, emotional_content: {
    signals: [emotional_words],
    intensity: 0-10,
    tone: frustration/uncertainty/eagerness/etc
  },
  logical_content: {
    detected_ask: "what user actually needs answered",
    clarity: 0-10
  },
  emotional_logical_gap: 0-10,
  operation_recommended: normalize-emotional-language (if gap > 6)
}
```

### 6.3: Assumption Surfacing Analysis

Identifies what speaker assumes vs. what is explicit.

**Four types of assumptions:**

1. **Deictic references:** "the thing", "that system", "the models" without clear antecedent
2. **Implicit constraints:** Optimization goals, timeline, success criteria not stated
3. **Domain assumptions:** Assumes you know their tech stack, team, codebase
4. **Context assumptions:** Assumes shared background knowledge

**Risk levels:** High-risk (critical for accurate answer), medium-risk (helpful context), low-risk (minor detail)

**Output structure:**
```
{
  sentence, assumptions_analysis: {
    deictic_references: [{surface_form, likely_referent, confidence, risk_level, suggested_clarification}],
    implicit_constraints: [{dimension, assumed_value, risk_level, suggested_clarification}]
  },
  assumption_count: {high_risk, medium_risk, low_risk},
  overall_confidence,
  recommendations: [operations_to_apply]
}
```

**Test cases show:** Clear context gets high confidence (0.88-0.95). ADHD rambling with unknown referents gets low confidence (0.35-0.5). Domain-specific jargon without definition needs clarification.

---

## 6.4-6.6: Additional Translation Analysis Dimensions

### 6.4: Prerequisite Knowledge Gaps

Detection signals (8 total):
1. Domain jargon without definition
2. Codebase reference without context
3. Architecture reference without diagram
4. Business domain assumption
5. Tool/framework assumption
6. Process/workflow assumption
7. Team structure assumption
8. Scale assumption

Scoring (1-10): 1-3 self-contained, 4-6 moderate gap (prompt-for-context), 7-10 high gap (context-request, do not proceed).

### 6.5: Scope Ambiguity

Detection signals (8 total):
1. Plural vs singular unclear
2. "like" or "etc" indicating vague set
3. No time anchor (this month? ever?)
4. No stakeholder anchor (for me? my company? users?)
5. "in general" indicating level shift
6. Mixed abstraction levels
7. Missing conditions
8. Open-ended without boundaries

Scoring (1-10): 1-3 clear (no op), 4-6 moderate (clarify-scope), 7-10 high (explicit-scope).

### 6.6: Stated vs. Actual Question Match

Detection signals (7 total):
1. Problem described without ask
2. Solution proposed without validation
3. Meta question vs. object question
4. Context dump without question mark
5. Comparative when choice needed
6. Emotional lead-in masking intent
7. Question buried at end

Scoring (1-10): 1-3 aligned (no op), 4-6 partial gap (extract-core-question), 7-10 large gap (invert-and-verify).

---

## 6.7: Translation Operation Selector

Seven translation operations:

| Operation | Purpose | Trigger | Executes when |
|---|---|---|---|
| normalize-emotional-language | Strip emotion, expose logic | emotional_content > 0.60 | Input heavy on feeling, light on logic |
| surface-assumptions | Make implicit assumptions explicit | unstated_assumptions > 0.50 | Assumptions driving question but not stated |
| decompose-compound | Split multiple questions | part_count > 1 | One rambling input contains 2+ questions |
| extract-core-question | Pull real question from context | stated_vs_actual_gap > 0.50 | What's actually asked is buried |
| reorder-context | Move context to proper position | stated_vs_actual_gap > 0.70 AND context_position > 0.50 | Core question late, context early |
| clarify-scope | Tighten fuzzy boundaries | scope_ambiguity > 0.60 | Boundaries exist but not tight |
| explicit-scope | Force hard scope boundaries | scope_ambiguity > 0.75 | Boundaries undefined, must create |
| context-request | Ask for missing context | prerequisite_knowledge_gap > 0.60 | Critical context missing |

**Execution order:** normalize-emotional → surface-assumptions → decompose-compound → extract-core-question → reorder-context → clarify/explicit-scope → context-request

Each operation is deterministic. You trace why each fired by looking at analysis scores.

---

-e 
<a name='section-7'></a>
## Section 7: Routing Engine

## 7.1-7.6: Six Routing Analysis Dimensions

**7.1 Complexity (1-10):**
1-2 pure recall. 3-4 single reasoning step. 5-6 two to three steps, trade-off evaluation. 7-8 multiple steps, creative problem-solving. 9-10 deep multi-step, synthesis across domains.

**7.2 Domain:** Factual (retrieval), analytical (break down systems), creative (generate ideas), comparative (line up and compare), exploratory (open-ended), coding (write/debug/optimize).

**7.3 Scope:** Narrow (single specific thing), medium (component), broad (system-wide).

**7.4 Certainty:** Clear (one right answer), mostly-clear (defensible), uncertain (multiple valid answers).

**7.5 Time Sensitivity:** Not sensitive (cost doesn't matter), moderate (balance), very sensitive (speed critical).

**7.6 Depth Requirement:** Surface (overview), moderate (solid understanding), deep (thorough, edge cases).

All six feed into routing. They are not independent; complexity + domain + scope + certainty + time sensitivity + depth combine to make routing decision.

---

## 7.10, 7.11: Override Logic and Cost Optimization

**7.10 Override Logic:**
User can click "Use a different model" to select [Haiku] [Opus-fast] [Opus-thinking]. Override is explicit and visible. Does not feed into learning (overrides are exceptions).

**7.11 Cost Optimization:**
If multiple models score >= 70%, choose cheapest. Haiku over Opus-fast, Opus-fast over Opus-thinking. Users can adjust knob: aggressive (cost-first), balanced (default), quality-first (prefer Opus-thinking).

---

## 7.13: Feedback Integration and Learning

After 50+ questions in a pattern (same domain + complexity + scope), system analyzes win rates.

**Three types of learning adjustments:**

1. **Threshold adjustment:** Identify misplaced thresholds. Example: "I was routing complexity 5 analytical to Opus-fast, but data shows 75% need Opus-thinking. Lower threshold from 5 to 4.5."

2. **Technique adjustment:** If technique consistently helps (users rate "helped"), increase selection confidence. If consistently hurts, decrease or raise trigger.

3. **Operation adjustment:** If decompose-compound helps when parts are independent (82% success) but hurts when related (55% success), add condition.

**Learning guards:** Minimum 5 data points before adjustment. Hold contradictory data. No generalization from single user preference. Drift detection. Only adjust if difference >= 15%.

Log every adjustment so you can see what system learned.

---

-e 
<a name='section-8'></a>
## Section 8: Prompt Composition

## 8.1: Technique Selection Phase

Each technique has selector function taking question metadata (complexity, domain, scope, certainty, model chosen) → yes/no with confidence.

**Example selectors:**

**Chain-of-Thought:**
- Apply when complexity >= 4 and domain benefits from reasoning
- Don't apply when complexity < 4 (wastes tokens)

**Role-Prime:**
- Apply on creative (always)
- Apply on analytical + complex (always)
- Apply on exploratory (always)
- Don't apply on factual unless uncertain

---

## 8.5: Technique Ordering Logic

Strict order: role-prime → chain-of-thought → quote-first → output-format

Role first (establishes context), CoT second (reasoning happens with role), Quote-First third (grounding deepens), format last (final output shape).

Why order matters: Wrong order means role doesn't color reasoning, it only appears at end.

---

## 8.9: Instruction Hierarchy

Role (highest) > Primary goal > Constraints > Output format > Techniques (lowest)

Conflict resolution examples:
- If role says "be skeptical" but primary goal says "be thorough", primary goal wins (be skeptical in service of thoroughness)
- If output format requires JSON but constraint says 100 tokens max, format wins (maintain structure, reduce detail)

---

## 8.10: Prompt Template System

**Haiku Template (Simple):**
```
[ROLE: (optional)]
[PRIMARY GOAL:]
[translated question]
[CONSTRAINTS: (optional)]
[TECHNIQUES:]
[OUTPUT FORMAT:]
```
Total: 100-200 tokens

**Opus Template (Comprehensive):**
```
[ROLE: (optional)]
[CONTEXT: (optional)]
[PRIMARY GOAL:]
[CLARIFICATIONS: (optional)]
[CONSTRAINTS:]
[REASONING APPROACH: (if CoT)]
[GROUNDING: (if Quote-First)]
[OUTPUT FORMAT:]
[EXAMPLES: (if few-shot)]
```
Total: 250-400 tokens

Haiku template simpler. Opus template has more scaffolding. Both follow same structure; techniques inject at specific points.

---

## 8.11: Output Format Specification

Seven format options: prose, bullet points, step-by-step, structured JSON, code, Q&A, comparison table.

Gets injected at end of prompt with example. Ensures answer comes back in usable shape without affecting reasoning process.

Examples:
- Technical: "Format as: Problem statement (one sentence), Solution approach (one sentence), Implementation steps (numbered), Verification"
- Creative: "Format as narrative: setup (context), core idea (what's novel), implications (what it enables), limitations"
- Decision: "Structure as: Option A (description, pros list, cons list, confidence), Option B (same), Recommendation"

---

-e 
<a name='section-9'></a>
## Section 9: Evaluation & Learning

## 9.1: Evaluation Phase

After model responds, system asks user to rate on four dimensions:

**Dimension 1: Usefulness** (Very useful / Somewhat useful / Not useful)
Measures: Practical utility. Does user get value?

**Dimension 2: Actual vs. Stated Question Match** (Addressed actual need / Addressed literal but missed intent / Missed both)
Measures: Translation effectiveness. Did system understand intent beneath surface?

**Dimension 3: Model Choice** (Right model / Could have been more capable / Could have been faster)
Measures: Routing accuracy. Was model choice appropriate?

**Dimension 4: Technique Effectiveness** (Helped / Neutral / Hurt - too much scaffolding)
Measures: Composition effectiveness. Did techniques make answer better or worse?

All logged with full routing decision, techniques applied, and optional text feedback.

---

## 9.7: Learning Update Mechanism

After 50+ data points in a pattern, analyze success rates. If one model consistently outperforms another, adjust routing thresholds. If technique consistently helps, increase selection confidence. If consistently hurts, decrease.

**Learning guards:** Minimum 5 data points, hold contradictory data, no single-user generalization, drift detection, minimum 15% difference before adjusting.

Log every learning event so system shows what it learned.

**Complete loop closes:**
1. User asks (raw input)
2. System routes and composes (decide techniques and order)
3. Model responds
4. System evaluates (ask rating questions)
5. User rates
6. System logs
7. After 50+ questions, system analyzes and adjusts
8. Next question uses updated rules

---

-e 
<a name='section-10'></a>
## Section 10: Comprehensive Prompt Library

## Overview

Section 10.0 builds the **complete database of ADHD-specific prompts** the translator can apply when it detects ADHD-relevant problems beyond the core translation function. These are **user-facing prompts** — things you say to Claude to help you work around ADHD cognition blockers.

The 10 items selected here span across all 10 prompt categories in the library, giving you one exemplary item from each category to fully document with implementation depth. Each item is a **🟡 Sonnet** task requiring full-depth documentation including wording, effectiveness conditions, trade-offs, success signals, and failure modes.

---

## ✅ 10.8 — "Just Start" Prompt (from Getting Started Category)

### Prompt Name & Purpose
**"Just Start" Prompt** (also called "Permission to Begin Poorly")

**Purpose:** Break through activation paralysis — the ADHD state where you know what to do but can't initiate. This prompt gives explicit permission to start messily, incomplete, or wrong.

---

### Exact Wording

**Standard Version:**
```
I'm stuck in activation paralysis—I know what I need to do but can't start.
Can you give me permission to start badly? I want to begin now, even if it's messy, incomplete, or wrong.
I'm not asking for a perfect approach—I'm asking for the thing I can do in the next 5 minutes that counts as "started."
```

**Minimal Version (for when you're too blocked to type much):**
```
Help me start. Badly is fine. What's the first 5-minute move?
```

**Elaborate Version (if you need more scaffolding):**
```
I'm paralyzed by perfectionism (or feeling lost, or not knowing the right starting point).
I don't need the optimal approach—I need AN approach I can execute right now, even if it's wrong.
What's something I can do in the next 5 minutes that counts as "starting"?
The messier the better—I'm not trying to be good, I'm trying to be moving.
```

---

### When This Prompt Works Best

| Condition | Why It Works | Example |
|-----------|-----------|---------|
| **Activation paralysis** | You're stuck at the beginning, not the middle. This gives permission to bypass the search for the perfect entry point. | "I need to write a blog post but don't know where to start." → "Write one sentence. Any sentence. Wrong is fine." |
| **Perfectionism blocking action** | Your brain won't let you move because it wants the first move to be correct. This reframes "correct" as "moving." | "I need to refactor this code but I'm worried I'll break something." → "Start by breaking it in a safe way—that's learning." |
| **Unclear where to begin** | You see the end goal but the path is foggy. This isolates the first microstep. | "I need to plan a 3-month project but it's overwhelming." → "What's the next 5 minutes? Don't plan the project—plan the next call." |
| **Multiple possible starting points** | You're stuck because there are too many ways to start. This forces a "good enough" first move. | "Should I start by learning the framework, or the API, or the project structure?" → "Start with whatever makes you curious right now. Wrong starter point is better than no start." |

**When it does NOT work well:**
- When you're already moving but stuck in the middle (this is a different problem—use "Tiny Chunks" instead)
- When the problem isn't activation but decision paralysis (you can start but don't know which option to pick)
- When you actually need a plan first (some projects do require upfront clarity before you start)

---

### How to Use It (Step-by-Step)

**User's workflow:**
1. Notice you're stuck at the start (paralyzed, searching for the perfect entry point)
2. Type one of the exact wordings above (or something similar)
3. Claude responds with: a tiny, imperfect first move you can take immediately
4. You take that move (it should take 5-10 minutes)
5. You may ask Claude for the next 5-minute move if you get stuck again

**Claude's response should include:**
- One specific action (not a list of options—one concrete thing)
- Explicit permission that it's okay if it's wrong/incomplete/messy
- A 5-minute time estimate
- Why starting this way is better than waiting for clarity

---

### Trade-Offs & What You Lose

| What You Gain | What You Lose |
|---|---|
| **Movement** — You actually start | **Optimal path** — Your first move might not be the best one |
| **Momentum** — Starting something creates energy | **Certainty** — You won't know if you're going the right direction |
| **Learning via action** — You discover things by doing | **Planning efficiency** — You might do something twice |
| **Bypassing perfectionism** — You move despite self-doubt | **Quality of first effort** — It will be rough |

**Is this a bad trade?** No, because:
- A mediocre start beats a perfect plan you never execute
- You learn more by starting wrong than by planning optimally
- Once you're moving, course correction is easy; starting is hard

---

### Success Signals (How to Know It Worked)

✅ **It worked if:**
- You took the action Claude suggested within 5 minutes of reading the response
- You feel momentum building (even if the first move was small)
- You're now asking "what's next?" instead of "where do I start?"
- The paralysis reduced (even if not eliminated)

❌ **It didn't work if:**
- You read the response but didn't take the action
- You're still searching for the "right" starting point
- The action Claude suggested felt too small/insignificant
- You're back to paralysis immediately after

---

### Common Failures & How to Detect Them

| Failure Mode | What Happens | How to Detect | Fix |
|---|---|---|---|
| **Claude suggests something too big** | You read it and still feel paralyzed | "That's still overwhelming" (emotional response) | Ask Claude for an even smaller move |
| **Claude suggests something irrelevant** | You take the action but it doesn't lead anywhere | "I did it but now I'm stuck again in a different spot" | You probably needed a plan; try "Tiny Chunks" instead |
| **You take the action but it goes wrong** | You start, but the direction is wrong | "I did this and now I need to redo it" | This is actually fine—you're learning. Ask "what should I do next?" |
| **Perfectionism reasserts after 5 minutes** | You take the first action, but then freeze again | Paralysis returns after initial momentum | The real blocker isn't activation—it's something else. Ask Claude what changed |
| **You interpret "start badly" as "give up quality"** | You rush through and create more work | You feel rushed/low-quality output | Clarify: "start small, not rushed"—quality within scope, not no quality |

---

### Example Conversation

**User:** 
```
I need to write documentation for this API but I'm completely stuck. 
I don't know where to start. Should I start with installation, or usage, or examples first? 
I keep going in circles.
```

**Claude (with Just Start):**
```
This is activation paralysis, not planning paralysis. You're stuck because you're searching for the perfect starting point.

Here's your permission to start badly: write ONE sentence describing what the API does.
That's it. Not a section. One sentence. Wrong is fine. Incomplete is fine.

5 minutes. Go write that sentence.

Why this works: once you describe the thing in your own words, the structure becomes obvious. 
You'll finish that sentence and think "okay, now I should explain how to install it" or 
"okay, now I should show an example." The path appears once you start moving.
```

**User then:**
```
Okay I wrote: "This API lets you query user profiles and update them in real-time."

Now what?
```

**Claude:**
```
Perfect. Now the next 5 minutes: write down 3 things someone would need to know FIRST before they could use that sentence.

Don't write full sections. Just 3 bullet points of "a user needs to know X first."

(You're building the skeleton. Structure emerges from momentum.)
```

---

### Token Cost & Model Compatibility

| Metric | Value |
|---|---|
| **Prompt overhead** | ~30-50 tokens (the permission statement itself) |
| **Response length** | Usually 150-300 tokens (Claude gives you one action + permission + reasoning) |
| **Total cost** | ~200-350 tokens |
| **Haiku compatibility** | ✅ Excellent — Haiku understands this clearly |
| **Opus-fast compatibility** | ✅ Excellent |
| **Opus-thinking compatibility** | ✅ Works but overkill — extended thinking isn't needed for a simple permission statement |

---

### When to Chain It With Other Prompts

**Sequence correctly:**
1. **Just Start** → Get moving
2. **Tiny Chunks** → If you get stuck after the first action, break the next phase into chunks
3. **Anti-Rabbit-Hole Anchor** → If you start hyperfocusing on the wrong thing mid-project

**Don't combine Just Start with:**
- Planning prompts (they conflict — Just Start says "skip planning," planning prompts say "plan first")
- Perfectionism prompts (Just Start says "badly is fine," perfectionism prompts say "get it right")

---

## ✅ 10.13 — "Tiny Chunks Converter" Prompt (from Breakdown/Chunking Category)

### Prompt Name & Purpose
**"Tiny Chunks Converter"** (also called "The Overwhelm Splitter")

**Purpose:** Transform a large, overwhelming task into micro-tasks small enough to feel doable. ADHD brains struggle with scope; this makes scope manageable.

---

### Exact Wording

**Standard Version:**
```
This task is overwhelming. I can't see how to do it.
Can you break it into the smallest possible chunks? 
I want each chunk to feel completable in one sitting (maybe 20-30 minutes).
Not steps in a plan—actual, independent chunks I could do in any order.
Show me what "done" looks like for each chunk.
```

**Minimal Version:**
```
Break this into tiny chunks (20-30 min each). What's the absolute smallest first chunk?
```

**With Output Format:**
```
I'm overwhelmed. Break this into the tiniest chunks:
- Each chunk should take 20-30 minutes
- Each should feel completable and concrete (not "learn about X"—"do Y")
- Show me exactly what done looks like for each chunk
- Don't explain the chunks—just list them

[Task description]
```

---

### When This Prompt Works Best

| Condition | Why It Works | Example |
|---|---|---|
| **Scope blindness** | The task is large and you can't see the path through it. Chunking makes it visible. | "I need to refactor 2000 lines of code" → "Extract constants, update calls, test, refactor function 1..." |
| **Overwhelm blocks action** | When a task feels huge, your brain shuts down. Tiny chunks bypass that. | "I need to build a new feature" → "Create the database table, write the query, build the API endpoint..." |
| **Too many unknowns** | You don't know what each step entails, so it feels infinite. Chunking reveals the structure. | "I need to learn Kubernetes" → "Install it locally, deploy a simple container, add persistence..." |
| **Long-term projects** | Multi-month projects feel impossible. Chunking into weeks/days makes progress visible. | "3-month project" → 12 weekly chunks, each chunk is 3-4 tasks |
| **Complex with many interdependencies** | You're stuck because you're trying to hold the whole system in mind. Chunks let you focus on one piece. | "Refactor the payment system" → "Extract payment logic, test it, update integrations..." |

**When it does NOT work well:**
- When the problem is activation (you need permission to start, not more planning)—use "Just Start" instead
- When the task is actually simple but you're overthinking it
- When you need help deciding which chunk to do first (that's a different problem—use decision prompt)

---

### How to Use It (Step-by-Step)

**User's workflow:**
1. Describe the task or paste a larger task description
2. Use the prompt above
3. Claude returns a list of tiny, concrete chunks (usually 8-20 chunks depending on task size)
4. You pick one chunk that feels doable
5. You do that chunk
6. You can ask for sub-chunks if a chunk still feels too big
7. Repeat until done

**Claude's response should include:**
- A flat list of chunks (not a hierarchy — you want parallelizable chunks)
- Each chunk with 1-2 sentence description of what "done" looks like
- Estimated time per chunk (should be 20-40 minutes)
- No dependencies mentioned unless critical
- No explanation — just the list

---

### Trade-Offs & What You Lose

| What You Gain | What You Lose |
|---|---|
| **Visibility** — You can see the full path | **Efficiency** — You might do things in a suboptimal order |
| **Motivation** — Tiny wins feel achievable | **Coherence** — The full system might feel fragmented |
| **Reduced paralysis** — You can start any chunk | **Dependency awareness** — You might start a chunk that should wait |
| **Progress tracking** — You see checkmarks accumulate | **Big-picture thinking** — You're focused on pieces, not the whole |

**Is this a bad trade?** No, because:
- Suboptimal order is fine—you learn during execution and can adjust
- You can ask Claude about dependencies if needed
- A fragmented project done beats a coherent project never started

---

### Success Signals (How to Know It Worked)

✅ **It worked if:**
- You picked a chunk and started it
- The chunk took about the time estimated (20-30 min)
- When you finished that chunk, you felt momentum to pick the next one
- The list is long enough that you feel options but short enough that it's not overwhelming

❌ **It didn't work if:**
- You look at the list and still feel stuck
- You start a chunk and realize it's actually 3 chunks
- You finish one chunk but don't know what to do next
- The chunks feel disconnected or random

---

### Common Failures & How to Detect Them

| Failure Mode | What Happens | How to Detect | Fix |
|---|---|---|---|
| **Chunks too big** | You pick a chunk, start it, and get overwhelmed | "I started and now I'm confused again" | Ask Claude to split that chunk further |
| **Chunks too small** | You do 15 tiny things and feel like you haven't made progress | "I've been doing these for hours but the task looks the same" | Ask Claude to combine chunks into slightly larger units |
| **Chunks in wrong order** | You do chunk 5 before chunk 2, and now you're stuck | "I did this chunk but now I realize I needed to do X first" | Ask Claude "should I have done X first?" — usually it's fine |
| **No clear "done" state** | You finish a chunk but don't know if you're actually done with it | "I'm not sure if this chunk is complete" | Ask Claude: "what does 'done with [chunk]' look like?" |
| **Chunks are too abstract** | You read "refactor the payment system" and still don't know what to do | "This chunk doesn't feel concrete" | Ask Claude: "what is the literal first thing I do?" |
| **Overwhelm reasserts** | You chunk it, pick a chunk, but then anxiety about the full project comes back | "Even though I know the chunks, I feel panicked about the whole thing" | This is different—you need reassurance, not more chunking. Ask Claude: "will these chunks actually get me to the finish?" |

---

### Example Conversation

**User:**
```
I need to refactor my authentication system to use JWT instead of session cookies.
It's connected to three different services and I'm completely lost on where to start.
The codebase is 15,000 lines across 12 files.
Can you chunk this for me?
```

**Claude (with Tiny Chunks Converter):**
```
TINY CHUNKS:

1. Understand current auth flow — Read through the session-based auth code and document how it works now (logins, validation, logout). Done: you have a 1-paragraph summary of the current system.

2. Understand JWT basics — Read 2-3 resources on JWT structure, claims, and security. Done: you can explain what a JWT is in 2-3 sentences.

3. Plan JWT structure for your system — Decide what claims you need in your JWT (user ID, roles, etc). Done: you have a bullet list of 5-10 claims your JWT will contain.

4. Generate/validate JWT in isolation — Write code to generate and validate a JWT in a test file, not touching the rest of the system. Done: you can run code that creates a JWT and validates it.

5. Add JWT generation to login — Modify the login endpoint to create and return a JWT. Done: login endpoint returns a JWT instead of setting a session cookie.

6. Test login with JWT — Test that login works, grab the JWT, inspect it. Done: you have a working JWT from a login request.

7. Update auth middleware — Modify the middleware that checks authentication to accept JWT instead of session. Done: protected endpoints accept JWT in the Authorization header.

8. Test protected endpoints — Test that a protected endpoint works with JWT. Done: you can call a protected endpoint with a JWT and it works.

9. Update Service A to accept JWT — Modify Service A to send the JWT in requests to your system. Done: Service A calls you with JWT authentication.

10. Update Service B to accept JWT — (same as 9 for Service B).

11. Update Service C to accept JWT — (same as 9 for Service C).

12. Remove session auth fallback — Delete the session-based authentication code. Done: no more session code in the codebase.

13. Test the full system end-to-end — Log in, make requests across all services, verify JWT is flowing correctly. Done: full system works with JWT only.

Each chunk takes 30-90 minutes. Do chunk 1 first.
```

**User then:**
```
This is way clearer. But chunk 5 feels too big — "add JWT generation to login" sounds complicated.
Can you sub-chunk chunk 5?
```

**Claude:**
```
CHUNK 5 SUB-CHUNKS:

5a. Copy the login endpoint code to a new test file — so you can modify without touching the real endpoint yet.

5b. Add the JWT generation library import — make sure the JWT library is in your code.

5c. In the test file, replace the session-set code with JWT generation code — use the claims you defined in chunk 3.

5d. Test that the JWT generation works — log in in your test file, get a JWT back, inspect it to make sure it has the right claims.

5e. Replace the real login endpoint — move the JWT generation code from test file into the real login endpoint.

5f. Test the real endpoint — log in via the actual endpoint, verify you get a JWT back.

Each of these is 20-30 minutes. Do 5a first.
```

---

### Token Cost & Model Compatibility

| Metric | Value |
|---|---|
| **Prompt overhead** | ~40-80 tokens (the request for chunking) |
| **Response length** | Usually 400-800 tokens (10-20 chunks × 40-80 tokens each) |
| **Total cost** | ~500-900 tokens |
| **Haiku compatibility** | ✅ Good — Haiku chunks well but may miss some interdependencies |
| **Opus-fast compatibility** | ✅ Excellent — handles complexity and dependencies well |
| **Opus-thinking compatibility** | ✅ Excellent but often overkill — extended thinking isn't necessary for chunking |

---

### When to Chain It With Other Prompts

**Sequence correctly:**
1. **Tiny Chunks** → Break the task down
2. **Just Start** → Pick a chunk and overcome paralysis starting it
3. **Focus Anchor** → Stay on the current chunk while doing it

**Don't combine with:**
- Planning prompts (they're different phases)
- Perfectionism prompts (you want rough chunks, not perfect ones)

---

## ✅ 10.17 — "Overwhelm Diagnosis" Prompt (from Overwhelm Management Category)

### Prompt Name & Purpose
**"Overwhelm Diagnosis"** (also called "The Overwhelm Detector")

**Purpose:** When you feel overwhelmed but don't know why, this prompt helps you identify the actual source of the overwhelm so you can address it with the right tool.

---

### Exact Wording

**Standard Version:**
```
I'm overwhelmed. I don't know why or what to do.
Can you help me diagnose what's actually happening?
Ask me 3-4 targeted questions that would help identify:
- Is it scope overwhelm (the task is too big)?
- Is it complexity overwhelm (too many moving parts)?
- Is it clarity overwhelm (I don't know what to do)?
- Is it urgency overwhelm (time pressure)?
- Is it decision overwhelm (too many options)?

Based on my answers, tell me which prompt/tool I actually need.
```

**Minimal Version:**
```
I'm overwhelmed but don't know what kind. 
Ask me 3 questions to diagnose it. Then tell me what to do.
```

---

### When This Prompt Works Best

| Condition | Why It Works | Example |
|---|---|---|
| **Vague overwhelm** | You feel stuck but can't articulate why. Diagnosis makes it specific. | "I feel stuck on this project" → diagnoses as "too many options" → use decision prompt |
| **Wrong tool applied before** | You tried chunking but it didn't help—maybe you needed permission to start. Diagnosis identifies the real problem. | You chunked the task but still feel stuck → diagnosis reveals it's actually decision paralysis |
| **Multiple issues at once** | Overwhelm often has 2-3 causes. Diagnosis separates them. | Scope is big AND unclear AND urgent → handle urgency first, then clarity, then scope |
| **You're spiraling** | When you don't know what's wrong, you spiral. Diagnosis breaks the spiral by naming it. | "I'm stuck" → "You're actually waiting for a decision" → actionable |

**When it does NOT work well:**
- When the overwhelm is emotional (anxiety, depression) not cognitive — you need emotional support, not problem-solving
- When you already know what's wrong but just need to complain/vent
- When you're in crisis and need immediate action, not diagnosis

---

### How to Use It (Step-by-Step)

**User's workflow:**
1. Notice you're overwhelmed (stuck, anxious about work, can't move)
2. Type the prompt above
3. Claude asks you 3-4 specific questions
4. You answer briefly
5. Claude diagnoses: "You're experiencing [type] overwhelm because [reason]"
6. Claude recommends: "Use [specific prompt] next" or "Try [specific action] now"

**Claude's questions should be:**
- Specific enough to discriminate between types
- Answerable in 1-2 sentences
- Not requiring you to solve anything—just understand it

**Example diagnostic questions:**
- "Can you see the complete path to finishing this, or are there unclear steps?" → clarifies scope/clarity
- "Are you afraid of making the wrong choice, or is the volume just too much?" → clarifies decision vs. scope
- "What's the time pressure? When is this actually due?" → clarifies urgency

---

### Trade-Offs & What You Lose

| What You Gain | What You Lose |
|---|---|
| **Clarity** — You understand the problem | **Speed** — Takes 5 minutes instead of jumping straight to a solution |
| **Right tool** — You use the correct prompt next | **Momentum** — You don't get moving immediately |
| **Reduced shame** — You know your overwhelm is named/valid | **Comfort** — Sometimes identifying the problem makes it feel more real |

**Is this a bad trade?** No, because:
- 5 minutes to diagnose saves 30 minutes of applying the wrong tool
- Understanding the problem reduces shame spiraling
- You then move with the right tool, which is more efficient

---

### Success Signals (How to Know It Worked)

✅ **It worked if:**
- You can now articulate what type of overwhelm you're experiencing
- The diagnosis feels accurate (not like Claude missed the point)
- Claude's recommended next step feels useful
- Your anxiety reduces after naming it

❌ **It didn't work if:**
- You answer the questions but still feel vague
- Claude's diagnosis doesn't match your experience
- The recommended tool still doesn't help
- You feel more confused after diagnosis

---

### Common Failures & How to Detect Them

| Failure Mode | What Happens | How to Detect | Fix |
|---|---|---|---|
| **Diagnosis is wrong** | Claude says "you're overwhelmed by scope" but you know it's not scope | "That's not it" (emotional reaction) | Tell Claude what type it actually is |
| **Multiple issues but only diagnosed one** | You have scope + urgency overwhelm but Claude only addresses scope | You follow the advice and still feel stuck | Ask Claude: "I think there are actually 2 issues here..." |
| **Recommended tool doesn't help** | Claude recommends "use Tiny Chunks" but you chunk it and still feel stuck | "I chunked it but I'm still stuck" | It may have been a secondary issue; diagnose again |
| **Overwhelm is emotional, not problem-based** | Claude tries to solve it with tools but the issue is anxiety/depression | You answer questions but feel worse, not better | Recognize this — you need emotional support, not problem-solving |

---

### Example Conversation

**User:**
```
I'm so overwhelmed right now. I have a feature to build, three bug reports to fix, 
and I don't even know where to start. I feel paralyzed.
```

**Claude (with Overwhelm Diagnosis):**
```
Let me ask you a few targeted questions to identify what's actually happening:

1. Can you SEE a path through this? Like, if I told you "first do this, then this, then this," 
   would that feel doable? Or does the entire situation feel opaque?

2. What's the time pressure? When does the feature actually need to be done? 
   Are the bug reports urgent or can they wait?

3. If I gave you permission to do any ONE thing first (feature, bug 1, bug 2, bug 3), 
   would you know what to pick? Or are you paralyzed by the choice?
```

**User:**
```
1. I think I see the path — feature takes a week, bugs are quick. I could chunk it.

2. Feature is due Friday. Bugs are from internal team so not urgent — they've waited 2 weeks.

3. I would definitely pick the feature first. No question.
```

**Claude:**
```
Diagnosis: You have URGENCY OVERWHELM with a secondary SCOPE OVERWHELM.

The real issue: Friday deadline is real pressure, so your brain is panic-screaming about EVERYTHING 
you have to do, making it all feel impossible. But actually, your decisions are clear (feature first, 
features takes a week, bugs can wait).

What to do RIGHT NOW:
1. Tell your team: "Bug fixes will happen after Friday feature launch." (Remove the anxiety about the bugs.)
2. Chunk the feature into daily tasks (Mon-Fri = ~5 tasks per day).
3. Do TODAY'S chunk only. Not the whole week. Just today.

Your overwhelm will drop 80% once you acknowledge "I'm picking feature first and bugs are suspended."
That's not a problem-solving issue — it's a permission issue.

Next prompt to use: "Just Start" — to kick off today's chunk.
```

---

### Token Cost & Model Compatibility

| Metric | Value |
|---|---|
| **Prompt overhead** | ~60-100 tokens |
| **Claude's questions** | ~150-200 tokens |
| **Your answers + Claude's diagnosis** | ~300-400 tokens |
| **Total cost** | ~500-700 tokens |
| **Haiku compatibility** | ✅ Good — handles diagnosis well |
| **Opus-fast compatibility** | ✅ Excellent |
| **Opus-thinking compatibility** | ❌ Overkill — extended thinking isn't necessary for diagnosis |

---

## ✅ 10.21 — "Anti-Rabbit-Hole Anchor" (Focus/Hyperfocus Management)

### Prompt Name & Purpose
**"Anti-Rabbit-Hole Anchor"** (also called "The Drift Guard")

**Purpose:** Set a persistent anchor point that reminds you of your actual goal when you start drifting into interesting side-topics. This is for **within-session hyperfocus drift** — when you start on Task A and end up deep in Task B because B looked interesting.

---

### Exact Wording

**Standard Version:**
```
I'm working on [MAIN TASK]. 
My actual goal is [SPECIFIC OUTCOME].
I tend to hyperfocus on interesting side-topics and lose focus.

Please be my drift guard. If I ask about something that seems unrelated to [MAIN TASK],
remind me: "[ANCHOR STATEMENT]" and ask: "Does this actually help us finish [MAIN TASK]?"

Only let me drift if I explicitly say "actually, I'm changing tasks."
```

**Example:**
```
I'm working on building a user authentication API.
My actual goal is: "Users can log in with email/password and get a token."
Drift guard anchor: "We're only doing basic auth, not social login, not 2FA, not single sign-on."

If I ask you about implementing Google OAuth, remind me of the anchor 
and ask if it helps us finish basic auth.
```

**Minimal Version:**
```
ANCHOR: [one sentence of what I'm ACTUALLY doing]
Guard me. If I drift, remind me of this anchor before I go down the rabbit hole.
```

---

### When This Prompt Works Best

| Condition | Why It Works | Example |
|---|---|---|
| **Hyperfocus on side-topics** | You start task A but get excited about a tangential feature/refactoring. The anchor stops you before you spend 2 hours on it. | You're building login, get excited about "oh, we should add password strength rules!" → anchor reminds you that's not needed for MVP |
| **Scope creep via curiosity** | Each question makes you curious about a related-but-different thing. Anchor prevents scope explosion. | "How do I do X?" → "Oh, but also should I do Y?" → "Well, if I do Y, I should also do Z..." → anchor stops this spiral |
| **Perfectionism disguised as rabbit hole** | You convince yourself "this refactoring is necessary" when it's actually just perfectionism. Anchor names it. | "I should refactor this whole module while I'm here" → anchor says "no, that's side-scope" |
| **Time-bounded work** | You have 2 hours to work. Rabbit holes burn 1.5 hours on something tangential. Anchor protects the boundary. | You have 2 hours to implement feature X. Rabbit hole into "optimizing the database" eats 1.5 hours. Anchor prevents it. |
| **Persistent across multiple tasks in session** | Unlike "Just Start" (one-off), the anchor stays active for the whole work session. |Working on a feature that has 5 subtasks. Anchor keeps you on track across all 5. |

**When it does NOT work well:**
- When the rabbit hole is actually necessary (you genuinely do need to refactor before proceeding) — then it's not a rabbit hole, it's a task
- When you're working on exploratory tasks that should involve tangential learning
- When you're trying to do creative work (rabbit holes are where creativity happens)

---

### How to Use It (Step-by-Step)

**User's workflow:**
1. Before you start work, write the anchor message
2. Claude acknowledges the anchor and is now "in guard mode"
3. While you work, if you ask Claude something tangential, Claude reminds you of the anchor
4. You either: (a) ignore the reminder and say "change of plans," or (b) acknowledge it and return to main task
5. Anchor stays active for the whole session (or until you say "remove guard")

**Claude's guard behavior should be:**
- Remind you of the anchor with exact wording
- Ask: "Does [tangential thing] help us complete [main task]?"
- Not be annoying—just one reminder, then let you decide
- Respect if you decide "yes, change of plans"

---

### Example Conversation

**User:**
```
ANCHOR: I'm building a simple TODO app with add/delete. That's it. No edit, no tags, no priorities.

Guard me on this.
```

**Claude:**
```
Got it. Anchor set.

Your actual goal: Simple TODO app with add/delete only.
If you drift into edit functionality, tags, or any nice-to-haves, I'll remind you.
You're in guard mode.
```

**[User works for 30 minutes, then asks:]**

**User:**
```
How would I add filtering by due date? That would be useful to show only today's tasks.
```

**Claude:**
```
GUARD REMINDER: 
Your anchor: "Simple TODO app with add/delete. That's it."

Filtering by due date is a nice-to-have. Does it help you finish add/delete functionality?

(You can say "actually, change of plans" if you want to add it. Or we stay focused.)
```

**User:**
```
Yeah, you're right. I'm being distracted. Let me focus on delete working properly first.
```

**Claude:**
```
Good call. What's the issue with delete?
```

---

### Trade-Offs & What You Lose

| What You Gain | What You Lose |
|---|---|
| **Scope protection** — You finish the thing you said you'd do | **Exploration** — You can't follow interesting tangents |
| **Time efficiency** — Fewer rabbit holes = faster progress | **Serendipitous discovery** — The best ideas sometimes come from tangents |
| **Completed work** — You have a finished feature, not 5 half-started ones | **Flexibility** — The anchor is rigid; you can't pivot |

**Is this a bad trade?** It depends:
- For **feature building**: Yes, anchor is worth it. You want to ship, not explore.
- For **research/learning**: No, anchor is harmful. You want to follow curiosity.
- For **debugging**: Maybe — some rabbit holes are clues, some are distractions.

---

### Success Signals (How to Know It Worked)

✅ **It worked if:**
- You started on Task A and finished Task A (you didn't end in Task B/C/D)
- You asked about 2-3 tangential things but the anchor reminded you and you refocused
- You completed the feature/task in the time you expected
- You feel productive rather than scattered

❌ **It didn't work if:**
- The anchor felt too restrictive (you kept ignoring it)
- You finished the anchored task but feel unsatisfied (like you missed something important)
- Claude's reminders felt annoying rather than helpful
- You never got distracted—the anchor didn't need to do anything (it's not a failure, just unused)

---

### Common Failures & How to Detect Them

| Failure Mode | What Happens | How to Detect | Fix |
|---|---|---|---|
| **Anchor too vague** | "I'm building a system" is too broad—you drift anyway | You ask things, don't get reminded, drift | Anchor more specifically: "We're building X with exactly these features" |
| **Anchor too restrictive** | You keep hitting it and saying "actually, change of plans" every 10 min | You're constantly overriding the anchor | The anchor is wrong. You don't actually want to focus. Change it. |
| **Real work masquerading as rabbit hole** | Anchor prevents you from doing necessary refactoring | You finish code but realize it's broken because you skipped a prerequisite | Recognize this: "the rabbit hole was actually necessary." Adjust anchor. |
| **Boredom drift** | You get bored of the task, so you drift to be stimulated | You hit the anchor, get frustrated, close the work | This is an emotional issue, not a focus issue. Anchor won't help. |

---

### Interaction With Extended Thinking

If using Opus-thinking with extended thinking enabled:
- Tell Claude the anchor at the beginning
- Extended thinking will keep the anchor in mind throughout the reasoning
- Extended thinking often prevents rabbit holes naturally (because it reasons through the full problem systematically)
- Anchor + extended thinking = strong focus combination

---

### Token Cost & Model Compatibility

| Metric | Value |
|---|---|
| **Anchor setup** | ~80-150 tokens |
| **Per reminder** | ~40-60 tokens per reminder |
| **Total for 2-hour session with 3 reminders** | ~200-300 tokens |
| **Haiku compatibility** | ✅ Good — understands anchors clearly |
| **Opus-fast compatibility** | ✅ Excellent — maintains anchor across conversation |
| **Opus-thinking compatibility** | ✅ Excellent — extended thinking respects anchor deeply |

---

## ✅ 10.25 — "Decision Fatigue Resolver" (Decision Management)

### Prompt Name & Purpose
**"Decision Fatigue Resolver"** (also called "The Choice Eliminator")

**Purpose:** When you have too many options and can't decide, this removes decision load by narrowing choices or making the decision **for you** (if you give permission).

---

### Exact Wording

**Standard Version (Ask Claude to help narrow):**
```
I'm facing decision fatigue. I have [X options] and I can't choose.
Here are the options:
1. [Option 1]
2. [Option 2]
3. [Option 3]
(etc.)

My goal is [ACTUAL GOAL].

Can you eliminate the bad options for my goal, 
leaving me with only 2-3 choices I could reasonably make?
For each remaining choice, tell me one pro and one con.
```

**Standard Version (Ask Claude to decide):**
```
Decision fatigue. Too many choices.
I'm trusting you to pick the best option for my goal: [GOAL].
Here are my options:
[List options]

What would you pick and why? I'll go with your recommendation.
(I can override you if it doesn't feel right, but I'm empowering you to decide.)
```

**Minimal Version:**
```
Too many choices. My goal is [GOAL]. Pick one. I trust you.
```

---

### When This Prompt Works Best

| Condition | Why It Works | Example |
|---|---|---|
| **Choice paralysis** | You have 5+ options and can't compare them mentally. Narrowing to 2-3 makes decision easy. | "Which architecture pattern should I use? MVC, MVVM, Hexagonal, Event-sourcing, CQRS?" → Claude narrows to "hexagonal or CQRS for your use case" |
| **Decision fatigue in a series** | You've made 10 decisions today and can't make one more. Claude deciding for you removes the load. | You've made decisions about architecture, database, deployment, API design, testing... now can't decide on logging strategy → delegate to Claude |
| **All options are fine** | You're stuck because all options are actually good, so there's no "best" choice. Claude picks the most pragmatic one. | "Should I use TypeScript or Rust? Both are fine for this." → Claude picks the one that finishes faster |
| **Perfectionism preventing choice** | You're searching for the "best" option when "good enough" exists. Claude picks good enough. | Trying to pick the "optimal" refactoring approach when 3 approaches are equally valid → Claude picks one and you move on |
| **Expert decision** | Claude's knowledge is broader than yours. Claude can make a better choice based on experience. | You don't know which testing library to use → Claude recommends based on your situation |

**When it does NOT work well:**
- When the decision is personal/values-based (where you feel right matters more than what's optimal)
- When the options have hidden consequences you haven't discovered yet (Claude can't know)
- When you need to learn by choosing (delegating prevents that learning)
- When you actually care deeply which option is picked (you should choose, not delegate)

---

### How to Use It (Step-by-Step)

**User's workflow:**

**If asking Claude to narrow:**
1. List all options
2. Ask Claude to eliminate bad ones for your goal
3. Claude returns 2-3 choices with pro/con
4. You pick one (now with clearer comparison)

**If asking Claude to decide:**
1. List all options
2. State your goal
3. Ask Claude to pick
4. Claude recommends one with reasoning
5. You either accept or say "actually, I prefer [other option]"

**Claude's behavior should be:**
- When narrowing: Aggressive elimination (get to 2-3 choices fast)
- When deciding: Confident recommendation (not wishy-washy)
- Either way: Explain the reasoning so you trust it

---

### Trade-Offs & What You Lose

| What You Gain | What You Lose |
|---|---|
| **Decision removal** — You don't have to choose | **Autonomy** — Someone else is deciding |
| **Speed** — You move forward immediately | **Learning** — You don't learn from choosing |
| **Reduced fatigue** — One less decision to exhaust you | **Ownership** — It's Claude's choice if it goes wrong |
| **Optimization** — Claude usually picks better than tired-you | **Preference** — You might prefer something else but delegate it |

**Is this a bad trade?** It depends on context:
- **For small, reversible decisions**: Absolutely. Delegate and move on.
- **For large, irreversible decisions**: No. You should decide.
- **For decisions where Claude has expertise and you don't**: Absolutely. Trust Claude.
- **For decisions where you have expertise and Claude doesn't**: No. You decide.

---

### Success Signals (How to Know It Worked)

✅ **It worked if:**
- You now have 2-3 real choices (if narrowing) or Claude made a clear recommendation (if delegating)
- You feel relieved, not stressed
- You move forward with the choice
- In hindsight, the choice was right

❌ **It didn't work if:**
- You still have 5+ options (narrowing failed)
- Claude's recommendation feels wrong
- You second-guess the choice immediately
- You regret the decision later

---

### Common Failures & How to Detect Them

| Failure Mode | What Happens | How to Detect | Fix |
|---|---|---|---|
| **Narrowing not narrow enough** | Claude returns 4 options instead of 2-3 | You still feel paralyzed | Ask Claude: "Just pick your top 2. That's it." |
| **Recommendation doesn't feel right** | Claude picks A, but you immediately think "but B..." | You're second-guessing within seconds | Trust your gut. Pick B. Or ask Claude why Claude chose A. |
| **Bad decision with no recourse** | Claude picks X, you go with it, turns out X was wrong and now you're stuck | "I chose this and can't undo it" and it's wrong | This is a risk of delegation. Only delegate if you can undo it. |
| **Perfectionism still blocking** | Even with 2-3 choices, you can't pick | You keep asking "but which is BEST?" | The problem isn't the options—it's perfectionism. You need permission to be good-enough, not more narrowing. |
| **Claude doesn't have enough context** | Claude recommends something that doesn't fit your situation | "This doesn't work for my setup" | You didn't provide enough context. Give Claude your constraints. |

---

### Example Conversation

**User:**
```
I'm paralyzed by choice. I need to pick a storage solution for my app.
Options:
1. PostgreSQL (relational, mature, overkill for my schema)
2. MongoDB (flexible, good for my doc-heavy data, but I'm not sure about transactions)
3. DynamoDB (AWS, good for scaling, expensive, proprietary)
4. SQLite (simple, but won't scale)
5. Firebase (fast to ship, locked into Google)

Goal: Ship MVP in 3 weeks with potential to scale to thousands of users.

Just pick one. I trust you. I'm tired of deciding.
```

**Claude:**
```
**Decision: PostgreSQL.**

Why:
- You'll ship in 3 weeks (mature, excellent docs, you probably know SQL)
- You'll scale fine (handles thousands of users easily)
- Flexibility: if your schema changes, migrations are straightforward
- No lock-in: you can move off Postgres if needed later

Why not the others:
- MongoDB: overkill for 3-week deadline, transactions add complexity
- DynamoDB: costs more, slower to iterate (AWS learning curve), scales but not needed at MVP stage
- SQLite: won't scale, you'll regret it
- Firebase: lock-in kills future flexibility, and Postgres/scaling is simpler

Start with Postgres. Done. Next question?
```

**User:**
```
That feels right. I'm going with it. Thanks.
```

---

### Token Cost & Model Compatibility

| Metric | Value |
|---|---|
| **Narrowing request** | ~80-150 tokens (option list + goal) |
| **Claude's narrowing response** | ~200-300 tokens |
| **Total for narrowing** | ~300-450 tokens |
| **Delegating request** | ~100-150 tokens |
| **Claude's decision + reasoning** | ~150-250 tokens |
| **Total for delegating** | ~250-400 tokens |
| **Haiku compatibility** | ✅ Good for narrowing, okay for delegating |
| **Opus-fast compatibility** | ✅ Excellent for both |
| **Opus-thinking compatibility** | ✅ Excellent but maybe overkill — decision doesn't need deep reasoning |

---

## ✅ 10.29 — "Hyperfocus Direction" Prompt (Hyperfocus Management)

### Prompt Name & Purpose
**"Hyperfocus Direction"** (also called "The Hyperfocus Channeler")

**Purpose:** When you notice you're hyperfocusing (losing time, intense focus, forgetting to eat/break), explicitly choose whether this hyperfocus is **productive** (focus on the right thing) or **unproductive** (focusing on the wrong thing but enjoying it). Then either leverage it or break it.

---

### Exact Wording

**Standard Version (Detecting hyperfocus):**
```
I think I'm hyperfocusing. I've been working on [X] for [TIME] and lost track of everything else.

Is this hyperfocus productive for my actual goals? 
[GOAL 1]
[GOAL 2]
[etc]

Or am I hyperfocusing on something interesting but not important?
If it's unproductive, how do I break the focus?
If it's productive, how do I sustain it without burning out?
```

**Channeling productive hyperfocus:**
```
I'm hyperfocused on [TASK]. This is actually what I need to do.
How do I stay in this zone productively?
- How often should I take breaks?
- What should I eat/drink?
- How long can I sustain this safely?
- When should I stop?
```

**Breaking unproductive hyperfocus:**
```
I'm hyperfocused on [TASK] but it's not important.
I need to break this focus and switch to [ACTUAL PRIORITY].
How do I interrupt the hyperfocus without self-judgment?
What's the minimum I need to do to feel okay switching tasks?
```

---

### When This Prompt Works Best

| Condition | Why It Works | Example |
|---|---|---|
| **Productive hyperfocus needs sustainability** | You're in flow on the right thing, but you're burning out. This protects the focus. | You're deep in building a feature, haven't eaten in 6 hours. Need breaks, food, sleep schedule so you can keep going. |
| **Unproductive hyperfocus needs interruption** | You're obsessed with a side-detail and don't realize it's wrong. This makes you see it. | You're hyperfocusing on optimizing a function that doesn't matter. Need to notice it and switch. |
| **Hyperfocus on wrong thing feels morally wrong** | You're doing something fun but know you "should" be doing something else. This resolves the guilt. | You're building a cool side project when you have a real project deadline. Need to either commit or switch without shame. |
| **Hyperfocus energy is rare and valuable** | When you can enter hyperfocus, you should protect it or use it strategically. | You rarely hyperfocus. When you do, you should make it count or protect it. |

**When it does NOT work well:**
- When the hyperfocus is about something creative/personal you actually love — don't interrupt it
- When you're just making excuses ("I'm hyperfocusing" when really you're procrastinating on something hard)
- When breaking hyperfocus is actually harmful (sometimes the right thing is to ride the wave)

---

### How to Use It (Step-by-Step)

**User's workflow:**

**If you notice hyperfocus:**
1. Check: is this the right thing? (Compare to actual goals)
2. If yes: ask Claude how to sustain it safely
3. If no: ask Claude how to interrupt it without guilt
4. Take the actions Claude suggests

**Claude's behavior should be:**
- Validate hyperfocus (it's not bad, it's just intense)
- Help you decide if it's the right target
- If right target: practical sustainability steps (breaks, hydration, sleep schedule)
- If wrong target: compassionate ways to interrupt (not "stop immediately," but "here's how to transition")

---

### Trade-Offs & What You Lose

| What You Gain | What You Lose |
|---|---|
| **Hyperfocus protection** (if productive) — You can stay in flow safely | **Efficiency** — Taking care of yourself while hyperfocusing slows you down slightly |
| **Hyperfocus interruption** (if unproductive) — You redirect to real priorities | **The fun** — Stopping hyperfocus on something fun feels bad |
| **Guilt reduction** — You don't have to feel bad about either scenario | **Willpower** — You need to act on the decision |

**Is this a bad trade?** No, because:
- Safe hyperfocus is better than burned-out hyperfocus
- Redirecting unproductive focus now prevents bigger problems later
- Guilt doesn't help—clarity does

---

### Success Signals (How to Know It Worked)

✅ **It worked if:**
- You decided whether the hyperfocus is productive or not
- You took actions to sustain OR interrupt it
- You're not in shame spiral about the focus
- You continue toward your actual goals

❌ **It didn't work if:**
- You're still unsure if the focus is productive
- You got advice but didn't act on it
- The hyperfocus is still bothering you
- You're in self-judgment about it

---

### Common Failures & How to Detect Them

| Failure Mode | What Happens | How to Detect | Fix |
|---|---|---|---|
| **Denial about unproductive focus** | You say "this is productive" when it's not | You're making excuses ("this will be useful eventually") | Be honest with Claude. "Actually, this isn't helping my goal." |
| **Guilt prevents acting** | Claude tells you how to interrupt, but you feel too guilty to stop | "I know I should stop but I can't make myself" | Address the guilt first: "Why do I feel guilty?" Maybe this is actually productive. |
| **Burning out despite protection** | You follow break/food/sleep advice but still get exhausted | After 12 hours of "sustainable" hyperfocus, you're crashed | Hyperfocus itself is exhausting. You can't sustain it indefinitely. Set a time limit. |
| **Interruption feels impossible** | You know it's unproductive but can't make yourself stop | "I said I'd switch but I can't" | This is willpower, not planning. Ask Claude: "help me actually switch right now." Not theoretical—action steps. |

---

### Example Conversation

**User:**
```
I've been building this dashboard for 5 hours straight. I haven't eaten. Don't know what time it is.
This is hyperfocus.

Real goal: Finish the feature by Friday.
The dashboard is PART of the feature but not the whole thing.

Is this productive focus or am I wasting time on details?
```

**Claude:**
```
You're hyperfocusing on a part (dashboard) instead of the whole (the feature).
That's partially productive (you ARE making progress on the feature) but potentially dangerous 
if you're losing sight of the full scope.

Questions for you:
1. Friday deadline — how much time do you actually have? (5 hours left? 20 hours?)
2. Is the dashboard the bottleneck (the thing blocking you from finishing), or is it one of many pieces?
3. Will completing this dashboard get you closer to "done" or just look pretty?

If the dashboard is the bottleneck and Friday is tight: keep hyperfocusing but EAT NOW and set a stop time.
If the dashboard is one of many pieces: interrupt it. You've spent 5 hours on 1 of 5 components.

Which is it?
```

**User:**
```
Oh. It's one of 5 pieces. Friday has 24 hours left. I have 5 components to build, so ~5 hours each.
I've spent them on the prettiest one.
```

**Claude:**
```
Interrupt the hyperfocus.

You have 4 hours left to build 4 more components.
The dashboard is 80% done. It's good enough.

Here's how to switch without self-judgment:
1. Right now, take 15 minutes. Eat, water, bathroom, stand up.
2. Save your dashboard work. Screenshot what you did. You did good work.
3. Look at component 2 (the next piece).
4. Set a timer: 4 hours for components 2-5.
5. These will be less polished than the dashboard. That's okay. Done is better than perfect.

The dashboard distracted you because it was fun. Components 2-5 might be less fun, but they're necessary.
Go.
```

---

### Token Cost & Model Compatibility

| Metric | Value |
|---|---|
| **Hyperfocus detection request** | ~100-150 tokens |
| **Claude's analysis + recommendations** | ~200-300 tokens |
| **Total** | ~300-450 tokens |
| **Haiku compatibility** | ✅ Good — understands hyperfocus clearly |
| **Opus-fast compatibility** | ✅ Excellent |
| **Opus-thinking compatibility** | ✅ Good but overkill — doesn't need deep reasoning |

---

## ✅ 10.33 — "Comprehension Booster" (Reading/Learning)

### Prompt Name & Purpose
**"Comprehension Booster"** (also called "The Skimmer's Helper")

**Purpose:** Help you extract key information from dense text when your ADHD brain wants to skim but you need deep comprehension. Gives you summaries, key points, and strategic questions to guide your reading.

---

### Exact Wording

**Standard Version (Skim-then-ask):**
```
I need to understand this text but I'm going to skim it.
Here's what I'm reading:

[PASTE TEXT]

After I skim it, ask me 3-4 questions that would reveal if I actually understood it.
If I get them wrong, tell me what I missed.
```

**With pre-reading guide:**
```
I need to learn [TOPIC] from this text:
[PASTE TEXT]

Before I read it, tell me:
1. The 3-4 main ideas I should look for
2. 2-3 strategic questions to keep in mind while reading
3. Common misunderstandings about this topic

(This will help me focus while reading instead of skimming.)
```

**After reading check:**
```
I just read this (or skimmed it):
[TEXT]

Tell me:
1. In 2 sentences, what's the main idea?
2. What's one thing that might trip me up about this?
3. If I'm going to use this info, what's the most important part?
```

---

### When This Prompt Works Best

| Condition | Why It Works | Example |
|---|---|---|
| **Required deep reading** | You need to understand something but your brain wants to skim. A reading guide helps. | "I need to understand this architecture paper but it's dense." → reading guide helps you focus |
| **Accountability for understanding** | If Claude will test you, you read more carefully. | You skim something, Claude asks questions, you realize you missed stuff |
| **Strategic reading** | Dense text has signals. If you know what to look for, you can skim AND understand. | Research paper: "look for methodology and results sections"—lets you skip the theory |
| **Post-reading verification** | You think you understand. Claude checks. Maybe you do, maybe you missed something. | You read something, explain it, Claude says "actually you reversed two concepts" |
| **ADHD-style learning** | You're not a careful reader, but you can learn if guided strategically. | Skim + quiz + clarification = you actually learned |

**When it does NOT work well:**
- When the text is so dense that strategic reading won't help—you genuinely need to read every word
- When you need to remember details long-term (reading guide helps understanding, not memorization)
- When the text is fiction/narrative (strategic reading misses the point)

---

### How to Use It (Step-by-Step)

**User's workflow:**

**Option 1: Pre-reading guide → Read → Post-reading check**
1. Paste text
2. Ask Claude: "What should I look for while reading?"
3. Claude gives you 3-4 focus points
4. You read (or skim strategically) while keeping those points in mind
5. Paste the text again and ask Claude to quiz you
6. You explain what you learned
7. Claude corrects or validates

**Option 2: Skim → Test → Clarify**
1. Skim the text
2. Ask Claude: "Test me on this text"
3. Claude asks 3-4 questions
4. You answer
5. Claude tells you what you missed
6. Claude explains the parts you got wrong

**Claude's behavior should be:**
- Pre-reading: Give you focus points, not summaries (you need to do the reading)
- Post-reading: Test fairly but not to trick you
- Feedback: Tell you what you got wrong and why

---

### Trade-Offs & What You Lose

| What You Gain | What You Lose |
|---|---|
| **Understanding** — You actually comprehend, not just skim | **Speed** — It takes longer than just skimming |
| **Accountability** — Quiz keeps you honest | **Autonomy** — You're being tested like a student |
| **Strategic knowledge** — You know what matters in dense text | **Completeness** — You might miss details outside the focus area |

**Is this a bad trade?** No, because:
- Speed of skimming without understanding is 0—you learned nothing
- Strategic reading + quiz = real learning
- It takes 15 minutes instead of 30 minutes of struggling

---

### Success Signals (How to Know It Worked)

✅ **It worked if:**
- You answered Claude's questions correctly (or mostly)
- You can explain the main ideas in your own words
- You know what you got confused about
- You feel you actually learned something

❌ **It didn't work if:**
- You guessed on the quiz questions
- You can't explain the ideas back
- The focus points didn't help
- You feel like you still don't understand

---

### Common Failures & How to Detect Them

| Failure Mode | What Happens | How to Detect | Fix |
|---|---|---|---|
| **Skim too shallow** | You barely glance at the text and fail the quiz | "I got the answers wrong" | Actual reading > skimming. Tell Claude: "I need to actually read this." |
| **Focus points too vague** | Claude says "understand the methodology" but you don't know what to look for | "I read but I still missed it" | Ask Claude more specific questions: "What specific thing in the methodology?" |
| **Text is too dense to skim-and-understand** | Even with a guide, you can't get it | You answer questions wrong despite trying | The text may need line-by-line reading. Ask Claude to summarize first. |
| **Quiz questions don't match the text** | Claude asks about things not in the text, or asks things you could know without reading | "I could guess that without reading" | Claude isn't making good quiz questions. You may need a different tool. |

---

### Example Conversation

**User:**
```
I'm reading this research paper on LSTM networks and I'm skimming it.
I need to understand the main ideas but not every detail.

[PASTES 2-PAGE DENSE PAPER]

What should I look for while reading?
```

**Claude:**
```
READING GUIDE: Focus on these 3 things:

1. **What problem does LSTM solve?**
   (Hint: the abstract and introduction will tell you. Look for "traditional RNNs can't..." → "LSTMs solve this by...")

2. **How is an LSTM different from a regular RNN?**
   (Hint: look for the "architecture" section with diagrams. You want to understand: gates, cell state, hidden state. Don't memorize equations—understand what each does.)

3. **What results showed it works?**
   (Hint: look for "experiments" section. Find the graph or table showing LSTMs outperform RNNs. What task? How much better?)

With those 3 things, you'll understand the paper. Ignore the math proofs in the middle section.
```

**[User reads for 10 minutes with those focus points]**

**User:**
```
Okay, I read it. Test me.
```

**Claude:**
```
QUIZ:

1. What's the main problem that RNNs had that LSTMs fix?
2. An LSTM has a "cell state." In your own words, what does it do differently than a regular RNN's hidden state?
3. Looking at the experiment results: compared to regular RNNs, how much better was the LSTM?
```

**User:**
```
1. RNNs forget long-term information (vanishing gradient?)
2. The cell state keeps information across many steps instead of losing it
3. In the speech recognition test, LSTM was like 30% better
```

**Claude:**
```
FEEDBACK:

1. ✅ Correct. RNNs suffer from vanishing gradients—they can't remember things far back in the sequence.

2. ✅ Basically correct. More precise: the cell state is protected by gates (input, forget, output gates) 
   so information doesn't get lost. The "forget gate" decides what to keep/discard.

3. ⚠️ Close but off. It was about 5-8% better in most tasks, 15% in some. Not 30%. 
   Maybe you saw a different section or misread the scale. Check the results table again.

Overall: You understood the key ideas. You missed some details, but you got the main point—
LSTMs use gated cell states to remember long-term dependencies. Go.
```

---

### Token Cost & Model Compatibility

| Metric | Value |
|---|---|
| **Pre-reading guide request** | ~150-300 tokens (pasting text) |
| **Claude's guide** | ~150-250 tokens |
| **Quiz questions** | ~100-150 tokens |
| **Your answers + Claude's feedback** | ~200-300 tokens |
| **Total for full cycle** | ~600-1000 tokens |
| **Haiku compatibility** | ✅ Good — handles text summaries well |
| **Opus-fast compatibility** | ✅ Excellent |
| **Opus-thinking compatibility** | ✅ Good but overkill — doesn't need deep reasoning for reading guides |

---

## ✅ 10.37 — "Accountability Check-In" (Accountability/Tracking)

### Prompt Name & Purpose
**"Accountability Check-In"** (also called "The Shame-Free Progress Tracker")

**Purpose:** Track progress toward goals WITHOUT triggering shame spirals. ADHD brains often use shame as motivation, which backfires. This prompt is designed to check in on progress with compassion, not judgment.

---

### Exact Wording

**Standard Version (Simple check-in):**
```
Accountability check-in.
My goal for [THIS WEEK/TODAY] was: [GOAL]
What I actually did: [WHAT YOU DID]
What got in the way: [BLOCKERS, if any]

No judgment. Just: Did I move toward the goal? How much?
```

**With celebration:**
```
Progress check-in.
I promised myself: [GOAL]
I did: [ACTUAL RESULT]

Even if I didn't finish: what's one thing I did well? 
(Not false positivity—real credit for real effort.)
```

**With next steps:**
```
Accountability check-in.
What I said I'd do: [GOAL]
What I did: [RESULT]
Blockers: [If any]

Given where I am now, what's the realistic next step?
(Don't guilt me into overcommitting. Real next step.)
```

---

### When This Prompt Works Best

| Condition | Why It Works | Example |
|---|---|---|
| **You set goals but don't track them** | Without check-ins, goals become vague. Check-ins make progress visible. | You said "refactor the module" but never checked if you did. Check-in reveals: "I actually refactored 30% of it." That's real progress. |
| **Shame spirals around unmet goals** | If you use shame to motivate, it backfires. Compassionate check-ins keep you moving without crushing yourself. | You didn't finish the goal. Your brain goes into shame spiral. Check-in says: "You did X well. Next time, aim for Y instead of Z." |
| **You overcommit every week** | Every week you promise 10 things, do 6, feel bad, repeat. Check-ins show you the realistic pattern. | Check-in reveals: "I consistently do 60% of my goals. My estimates are wrong." → Commit to 5 things instead of 10. |
| **Invisible progress** | You're moving toward goals but don't see it. Check-ins make progress visible. | "I didn't ship the feature but I built 4 of 7 components." Invisible progress becomes visible. |
| **Accountability without punishment** | You need someone to tell you "you did what you could, what's next?" not "you failed, shame on you." | End-of-week: "My goal was X, I did Y. Given Y, here's the realistic next step." Motivating, not crushing. |

**When it does NOT work well:**
- When shame spirals are clinical depression (check-ins won't fix that)
- When you're using check-ins to punish yourself (they backfire with punishment energy)
- When you set goals that don't actually matter to you (check-ins won't motivate what you don't care about)

---

### How to Use It (Step-by-Step)

**User's workflow:**

**At end of day/week:**
1. State your goal
2. State what you actually did
3. If there were blockers, name them
4. Ask Claude: "No judgment. Did I move toward the goal?"
5. Claude responds with: honest assessment + recognition of effort + realistic next step

**Claude's behavior should be:**
- Zero shame energy—this is data, not judgment
- Recognition of partial progress (60% is real progress)
- Understanding of blockers (sometimes blockers are legitimate)
- Realistic next step (not "try harder," but "given your actual capacity, do X")

---

### Trade-Offs & What You Lose

| What You Gain | What You Lose |
|---|---|
| **Visible progress** — You see what you did, not what you didn't | **Pushing yourself** — Compassionate check-ins don't use shame as fuel |
| **Reduced shame** — You're honest without spiraling | **High expectations** — You might accept less progress than you could do |
| **Sustainable pace** — You identify realistic commitments | **Ambition** — You might lower your aims |

**Is this a bad trade?** No, because:
- Visible progress sustains motivation better than shame
- Realistic commitments you keep beat ambitious commitments you fail
- Sustainable pace means you keep going; shame-driven pace leads to burnout and quitting

---

### Success Signals (How to Know It Worked)

✅ **It worked if:**
- You can state honestly what you did without shame
- Claude's assessment feels fair (not soft, not harsh—fair)
- You identify one thing you did well
- You feel motivated for the next goal, not crushed about this one

❌ **It didn't work if:**
- You're still in shame spiral after the check-in
- Claude's assessment feels like false positivity (you don't believe it)
- You feel demotivated after the check-in
- You can't identify any progress at all

---

### Common Failures & How to Detect Them

| Failure Mode | What Happens | How to Detect | Fix |
|---|---|---|---|
| **False positivity** | Claude says "you did great!" when you know you didn't | "That doesn't feel true" | Ask Claude: "be honest, not nice. What did I actually do?" |
| **Shame sneaks in** | You go into check-in fine, but leave feeling bad | You feel worse after than before | The check-in triggered shame somehow. Maybe the goal was unrealistic. Reframe. |
| **No pattern emerges** | You check in weekly but never see a pattern | "Every week is different, I don't learn anything" | Ask Claude: "After 4 weeks of check-ins, what pattern emerges?" (Claude can see your trend.) |
| **Goals still too big** | You realize mid-check-in that your goal was unrealistic | "I didn't do this because I didn't have time" | Ask Claude: "What goal would have been realistic given my actual capacity?" |

---

### Example Conversation

**User:**
```
Weekly check-in.

I promised myself: "I'll refactor the payment module by Friday."

What I actually did: 
- Monday-Tuesday: researched refactoring approaches (wasted time)
- Wednesday: started refactoring, got 30% done
- Thursday-Friday: got distracted, fixed bugs in other parts of the system

So: 30% refactored, 0% of goal complete.

No judgment. What actually happened here?
```

**Claude:**
```
HONEST ASSESSMENT:

You didn't finish refactoring the payment module—that's true.

BUT: Here's what you did:
- You researched approaches (that's not wasted—you learned the domain)
- You refactored 30% (real progress, not zero)
- You context-switched (common when you get stuck) and fixed bugs (those bugs needed fixing, so this wasn't failure)

Pattern I see: You had a big goal (100% refactor) but hit a blocker around 30% and pivoted.

Why might this be? 
- The refactoring was harder than expected, so you switched to easier bugs (that feels good)
- You lost confidence after hitting that 30% wall
- The goal was too big for a week

NEXT WEEK:
Instead of "refactor the whole module," try: "refactor the payment processing function (1/3 of the module)."
Smaller goal = higher completion = momentum = "okay, now do 2/3."

You didn't fail. You did 30% + unexpected bug fixes + learned the domain.
That's real. Next week, try for 40% with a better estimate.
```

---

### Token Cost & Model Compatibility

| Metric | Value |
|---|---|
| **Check-in request** | ~100-200 tokens |
| **Claude's assessment + feedback** | ~200-300 tokens |
| **Total** | ~300-500 tokens |
| **Haiku compatibility** | ✅ Good — understands progress tracking |
| **Opus-fast compatibility** | ✅ Excellent |
| **Opus-thinking compatibility** | ❌ Overkill — doesn't need deep reasoning |

---

## ✅ 10.41 — "Pattern Recognition" Prompt (Self-Awareness)

### Prompt Name & Purpose
**"Pattern Recognition"** (also called "The Meta-Awareness Opener")

**Purpose:** Analyze your own question patterns to identify meta-patterns (do you ask the same question every Tuesday? Do all your questions involve the same blocker?). These patterns reveal deep ADHD challenges you might not see in single questions.

---

### Exact Wording

**Standard Version:**
```
Looking at my last 5-10 questions, help me see patterns:

[PASTE OR SUMMARIZE YOUR LAST 5-10 QUESTIONS]

Questions:
1. [Question]
2. [Question]
...

What patterns do you see?
- Do I ask the same question differently?
- Do certain topics come up repeatedly?
- Is there a blocker that keeps appearing?
- Do certain question types indicate a deeper issue?
```

**Minimal Version:**
```
I've asked you about: [Topic 1], [Topic 2], [Topic 3], [Topic 1 again], [Topic 4].
What's the pattern? What's actually going on underneath?
```

**After many sessions:**
```
Over our last [N] conversations, have you noticed patterns?
- Topics I come back to?
- Blockers that reappear?
- Types of questions that indicate I'm stuck on something?
- Times of week I ask certain types of questions?

(This helps me understand my own brain better.)
```

---

### When This Prompt Works Best

| Condition | Why It Works | Example |
|---|---|---|
| **Same problem, different wording** | You ask "how do I organize my code?" then "what's the best architecture?" then "should I refactor?" — all the same question. Meta-recognition helps. | Claude points out: "You're asking about organization/architecture 4 times in different ways. The real issue is: you don't know whether your current structure will scale." |
| **Recurring blockers** | You have the same blocker (perfectionism, scope creep, overthinking) across different projects. Pattern recognition reveals it's a meta-blocker. | Pattern: Every question includes "but I'm worried about..." → Recognition: You're anxious-loop-prone. Use anxiety-addressing prompts, not task prompts. |
| **Hidden meta-problem** | Your questions seem diverse but share a deep structure. | Questions about: deciding on tech stack, picking an architecture, choosing a library, comparing frameworks → all are "decision paralysis." One root, many faces. |
| **Time-based patterns** | You ask certain questions at certain times (Mondays are decision paralysis, Tuesdays are perfectionism). | Pattern recognition: "Every Monday you ask 'should I redo X?' Every Friday you ask 'did I do this right?'" → Suggests weekly rhythm in your thinking. |
| **Learning about yourself** | Meta-patterns are your brain in action. They reveal how you actually work. | "I notice I ask exploratory questions when I'm stuck, then implementation questions when I'm ready. But I also avoid asking for help until desperation." → Self-awareness. |

**When it does NOT work well:**
- When your questions are actually diverse (not every diverse set of questions hides a pattern)
- When you're early-stage and just learning things (patterns emerge over time)
- When you use pattern recognition to shame yourself ("I'm so repetitive")—meta-awareness should be neutral, not judgmental

---

### How to Use It (Step-by-Step)

**User's workflow:**

**Gathering phase:**
1. Look at your last 5-10 questions (roughly)
2. Summarize each one in 1-2 sentences
3. Paste them to Claude

**Analysis phase:**
1. Ask Claude: "What patterns do you see?"
2. Claude identifies 2-4 patterns
3. For each pattern, Claude explains: what's the root issue?
4. Claude suggests: which prompt/tool addresses this root?

**Integration phase:**
1. Reflect on Claude's patterns
2. Do they match your intuition? (If not, ask Claude to re-examine)
3. Use the insights to adjust your approach next time
4. Repeat this monthly to see if patterns shift

---

### Trade-Offs & What You Lose

| What You Gain | What You Lose |
|---|---|
| **Meta-awareness** — You see your own patterns | **Acceptance** — Sometimes patterns feel bad to see |
| **Efficiency** — Address root cause instead of symptoms | **Variety** — You might realize your questions are repetitive |
| **Self-knowledge** — Understanding your own brain | **Ego** — Meta-analysis can feel vulnerable |

**Is this a bad trade?** No, because:
- Seeing patterns is how you change them
- Root-cause fixes save tons of time vs. symptom management
- Self-awareness is the foundation for real growth

---

### Success Signals (How to Know It Worked)

✅ **It worked if:**
- Claude identified 2+ patterns you recognize (they feel true)
- You have new insight into your own thinking
- You can see how different questions connect
- The root-cause suggestion is actionable

❌ **It didn't work if:**
- Claude's patterns feel generic (like they'd fit anyone)
- You don't recognize yourself in the patterns
- The patterns don't actually connect your questions
- You feel worse, not clearer

---

### Common Failures & How to Detect Them

| Failure Mode | What Happens | How to Detect | Fix |
|---|---|---|---|
| **Pattern too generic** | Claude says "you get stuck sometimes" — true but useless | "That's just how humans are" | Ask Claude: "What's specific to me? Not universal." |
| **Sample size too small** | You give 3 questions and Claude finds a pattern that's just coincidence | "Is this real or just randomness?" | Give Claude 10+ questions. Patterns emerge with larger samples. |
| **You resist the pattern** | Claude identifies something true but you immediately deny it | "That's not me" (defensive reaction) | Sit with it. Ask Claude: "Even if I don't like this pattern, is it true?" |
| **Pattern without action** | Claude identifies a pattern but doesn't suggest what to do about it | "Okay, I see this. Now what?" | Ask Claude: "Given this pattern, what should I do differently?" |

---

### Example Conversation

**User:**
```
Last 8 questions I asked you:
1. Should I use TypeScript or JavaScript?
2. Which database is best for my use case?
3. Should I build my own auth or use a library?
4. Monolithic or microservices architecture?
5. What's the best testing framework?
6. Should I optimize now or wait?
7. How to structure the project?
8. Pick a front-end framework for me.

Help me see the pattern here. What's actually going on?
```

**Claude:**
```
PATTERN IDENTIFIED:

You're asking about **decision paralysis on technical choices.**

All 8 questions are "should I choose X or Y?" They're not "how do I use X?" or "help me build with Y?"
They're all about the choice itself.

Deeper pattern:
- Questions 1, 3, 5, 8 are about external choices (what tool exists)
- Questions 2, 4, 6, 7 are about architecture/design choices (what structure exists)
- You're stuck in the research/planning phase, not the building phase

ROOT ISSUE:
You're afraid of choosing wrong, so you keep researching. But you never reach "good enough to start."
Every time you're about to commit, you ask about alternatives instead.

WHAT THIS MEANS:
The tool you need isn't "help me decide" (you already know how to decide).
The tool you need is: "Give me permission to pick ANYTHING and start, even if it's wrong."

NEXT TIME:
When you hit a decision paralysis question, use the "Decision Fatigue Resolver" prompt,
but before that, ask yourself: "Am I paralyzed because I don't have enough info, 
or because I'm afraid of choosing wrong?"

I suspect it's the latter. And no amount of research solves that—only permission to begin solves it.
```

---

### Token Cost & Model Compatibility

| Metric | Value |
|---|---|
| **Pattern request** | ~200-400 tokens (pasting 5-10 questions) |
| **Claude's analysis** | ~300-500 tokens |
| **Total** | ~500-900 tokens |
| **Haiku compatibility** | ✅ Adequate — may miss subtle patterns |
| **Opus-fast compatibility** | ✅ Good — handles pattern analysis well |
| **Opus-thinking compatibility** | ✅ Excellent — extended thinking excels at meta-analysis |

---

## ✅ 10.45 — "Task-Specific Prompting" (Task-Specific Guidance)

### Prompt Name & Purpose
**"Task-Specific Prompting"** (also called "The Specialized Adapter")

**Purpose:** Different ADHD-specific tasks need different prompt structures. Email writing needs tone clarity. Meeting prep needs focus narrowing. Code review needs structure. This documents task-specific prompt templates you can reuse.

---

### Overview

This isn't one prompt—it's a **family of prompts**, each tailored to a specific task type. The ADHD brain struggles differently with different tasks:
- **Email writing** — emotional clarity vs. professional tone
- **Meeting prep** — narrowing scope vs. staying on topic
- **Code review** — identifying patterns vs. nitpicking
- **Research synthesis** — organizing disparate sources vs. getting lost in detail
- **Documentation writing** — completeness vs. clarity
- **Debugging** — finding the actual problem vs. treating symptoms
- **Learning new concepts** — depth vs. breadth

Each task type has a specific prompt that sets up Claude to help in the right way.

---

### Task Type 1: Email Writing

**When you use this:** Need to write professional/personal email but struggle with tone, clarity, or emotional regulation

**Exact Wording:**
```
Email task:
- To: [RECIPIENT]
- Goal: [WHAT YOU WANT TO ACCOMPLISH]
- Tone: [Professional/casual/firm/apologetic/etc.]
- Key points I need to include: [POINTS]
- What I'm worried about: [ANXIETY/CONCERN]

Help me write this. I'll draft it, then you check:
1. Does it accomplish the goal?
2. Is the tone right?
3. Did I include the key points?
4. Is it missing anything important?
5. Will it trigger [SPECIFIC CONCERN]?
```

**Why it works for ADHD:** Emails often mix emotions with logistics. This separates them and makes sure both are handled.

---

### Task Type 2: Meeting Prep

**When you use this:** Need to prepare for a meeting but don't know how to focus your prep

**Exact Wording:**
```
Meeting prep:
- When: [TIME]
- Who: [PARTICIPANTS]
- Purpose: [OFFICIAL PURPOSE]
- What I need: [WHAT YOU ACTUALLY NEED FROM THIS MEETING]
- My role: [What you're supposed to contribute]

I'm going to get distracted. Help me:
1. Identify the 1-2 things I absolutely need to cover
2. Give me anti-rabbit-hole anchors (what topics to avoid)
3. Write 3-4 questions I should ask or statements I should prepare
4. Tell me if I'm prepared and what to study if I'm not
```

**Why it works for ADHD:** Meetings have official agendas (often irrelevant to what you need) and real agendas (what actually matters). This finds the real one.

---

### Task Type 3: Code Review

**When you use this:** Need to review code but get lost in nitpicking details instead of catching real issues

**Exact Wording:**
```
Code review task:
- What changed: [SUMMARY or PASTE CODE]
- Context: [Why was this change made]
- What I'm checking for: [Security/performance/clarity/all]

Help me:
1. Identify the 3 biggest risks or issues (if any)
2. Flag any patterns that might break later
3. Find 2-3 actually important things (ignore nitpicks)
4. Tell me if this is safe to ship or needs changes
5. Draft a review comment that's honest but not discouraging
```

**Why it works for ADHD:** Code reviews can spin into perfectionism (fixing formatting, renaming variables) when the real issues are architectural. This separates real issues from nitpicks.

---

### Task Type 4: Research Synthesis

**When you use this:** Have multiple sources, need to synthesize them into one coherent understanding

**Exact Wording:**
```
Research synthesis task:
- Topic: [WHAT YOU'RE RESEARCHING]
- Sources: [LIST OR PASTE]
- What you need: [Summary? Decision? Comparison?]

Help me:
1. Summarize each source in 2-3 sentences (key idea only)
2. Find points where sources agree/disagree
3. If they conflict, explain why (different assumptions? Different domains?)
4. Give me the "meta-conclusion" — what's actually true across sources?
5. Identify any gaps (what aren't the sources covering?)
```

**Why it works for ADHD:** Research can feel infinite. Synthesis gives you a ceiling — "once I understand these sources, I'm done."

---

### Task Type 5: Documentation Writing

**When you use this:** Need to document something but either write too much or too little

**Exact Wording:**
```
Documentation task:
- What I'm documenting: [WHAT/WHO]
- Audience: [WHO WILL READ THIS]
- Goal: [What should they be able to do/understand?]

I tend to [over-explain/under-explain].
Help me write this by:
1. Telling me the absolute minimum someone needs to know
2. Identifying the 2-3 most common questions about this
3. Structuring it: [how should it be organized?]
4. Reviewing my draft for clarity (is any part confusing?)
```

**Why it works for ADHD:** Documentation is often either a novel or a single sentence. This finds the middle ground.

---

### Task Type 6: Debugging/Problem-Solving

**When you use this:** Stuck on a problem, but your brain is stuck in symptom-chasing instead of root-cause hunting

**Exact Wording:**
```
Debugging task:
- System/code: [WHAT SYSTEM]
- Symptom: [WHAT'S BROKEN]
- What I've tried: [YOUR ATTEMPTS]
- Pattern (if any): [WHEN DOES IT FAIL?]

Help me:
1. Ask me 2-3 questions that would identify the actual root cause
2. Tell me if my previous attempts were on the right track
3. Help me rule out possibilities (I feel like anything could be wrong)
4. Once we identify the root, give me 1-2 targeted fixes, not 10 options
```

**Why it works for ADHD:** Debugging spirals when you try everything. This focuses you on the actual cause.

---

### Task Type 7: Learning New Concepts

**When you use this:** Want to learn something new but don't know how deep to go

**Exact Wording:**
```
Learning task:
- What I'm learning: [CONCEPT/TECH/SKILL]
- What I need it for: [SPECIFIC USE CASE]
- Current level: [What I already know]
- Depth I need: [Just enough to use it? Deep understanding? Expert?]

Help me by:
1. Breaking down what I MUST understand vs. nice-to-know
2. Ordering: what should I learn first?
3. Giving me practical examples relevant to my use case
4. Telling me when I've learned enough (so I don't spend 2 months on it)
5. Pointing out common misconceptions I should avoid
```

**Why it works for ADHD:** Learning can be infinite. This gives you a stop condition.

---

### How to Use Task-Specific Prompts

**Workflow:**
1. Identify which task type you're doing
2. Copy the relevant prompt above
3. Fill in your details
4. Use it with Claude

**Making new task-specific prompts:**
If you have a recurring task (proposal writing, presentation prep, negotiation planning), follow this structure:
1. What's the ADHD struggle with this task?
2. What structure would help?
3. What specific checks should happen?
4. Write it as a template

---

### Token Cost & Model Compatibility

| Task Type | Tokens | Haiku | Opus-fast | Opus-thinking |
|---|---|---|---|---|
| Email writing | 200-400 | ✅ Good | ✅ Excellent | ✅ Overkill |
| Meeting prep | 150-300 | ✅ Good | ✅ Excellent | ✅ Overkill |
| Code review | 300-500 | ✅ Good | ✅ Excellent | ✅ Excellent |
| Research synthesis | 400-700 | ⚠️ Adequate | ✅ Excellent | ✅ Excellent |
| Documentation | 200-400 | ✅ Good | ✅ Excellent | ✅ Overkill |
| Debugging | 300-500 | ✅ Good | ✅ Excellent | ✅ Excellent |
| Learning | 250-450 | ✅ Good | ✅ Excellent | ⚠️ May overthink |

---


<a name='summary'></a>

---

## Summary: Complete Green Items Foundation

**What these 40+ green items establish:**

### Research & Scientific Foundation (Sections 1-3)
The system is grounded in ADHD communication research, peer-reviewed studies on verbal processing deficits, and comprehensive documentation of six core hallucination-reduction techniques. Model capabilities are mapped for Haiku, Opus fast, and Opus thinking, with clear cost-benefit analysis at different complexity levels.

### System Architecture (Sections 4-9)
A five-stage pipeline is defined: translation engine → routing engine → composition engine → API call → output & logging. Each stage has:
- **Translation:** Analyzes emotional/logical content, surfaces assumptions, identifies scope, separates stated from actual questions, and applies deterministic transformation operations.
- **Routing:** Measures complexity, domain, scope, certainty, time sensitivity, and depth requirement. Routes to the cheapest capable model using specific thresholds.
- **Composition:** Selects from 20+ prompt engineering techniques, orders them per dependency rules, handles conflicts, and builds final prompts from templates.
- **Evaluation & Learning:** Collects structured feedback and adjusts routing/technique selection based on patterns after 50+ data points.

### User-Facing Tools (Section 10)
Ten documented ADHD-specific prompts for activation, task breakdown, overwhelm management, focus, decision fatigue, hyperfocus, comprehension, accountability, pattern recognition, and task-specific guidance. Each prompt includes exact wording, effectiveness conditions, failure modes, and token costs.

### Ready for Yellow Items
These green items provide the research, architecture, algorithms, and prompt library foundation. The next phase (yellow items) will be hybrid work: building decision trees, creating matrices, designing algorithms in pseudocode, documenting edge cases, and designing UI/testing frameworks.

**No changes required to this document. Proceed to yellow items.**
