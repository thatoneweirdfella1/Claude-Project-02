# DIVERGENCE.AI — ROUTING ENGINE (ALREADY BUILT)
**The routing engine exists, is tested, and passes. routing.js is the engine and tests.js is its suite. This file states what it does and the one change to make. Do not rebuild the scorer.**

---

## STATUS

Feature 2 is done. routing.js takes a translated question plus its confidence and decides which model answers it. tests.js covers stub probes, the complexity cliff, edge stress, scorer-lie resistance, confidence coupling, plan gating, and override rules, and it passes. The build steps in Phase 3 wire this engine in, they do not recreate it.

---

## THE ONE CHANGE

routing.js currently ships claude-sonnet-4-6 as the Balanced tier string. It did this because at build time it believed claude-sonnet-5 did not exist (recorded in FINDINGS.md item 1). It exists now. Change the single line in the MODELS table so the Balanced api string is claude-sonnet-5. Change nothing else in the scorer.

---

## THE CONTRACT

In: prompt, confidence (0 to 100), gaps (optional), plan ("free" or "paid"), override (model id or null).

Out: model, apiString, complexity, effectiveComplexity, the six dimensions (complexity, domain, scope, certainty, depth, token efficiency), reasoning (user-facing text), thinkingRecommended, thinkingApplied, downgraded, notes, and the full signals audit trail.

Downstream stages (technique selection, composition, execution, learning) consume that object.

---

## THE TIERS

**Free:** automatic routing between Haiku 4.5 (claude-haiku-4-5, Fast) and Sonnet (claude-sonnet-5, Balanced). When a question scores Deep tier, it is answered by Sonnet with a visible note that Opus was the recommendation. No manual override to paid models. No extended thinking. The guarantee: the free tier never silently gives a worse answer, it always says when a stronger route existed.

**Paid:** all three models including Opus 4.8 (claude-opus-4-8, Deep). Manual override always wins. Extended thinking applied automatically when the router recommends it (complexity 8 and up, or 7 with a proof demanded).

The free/paid split is currently a flag in the routing layer, not real billing. There is no account system or payment processing yet, that is a later stage. What is proven is the routing behavior.

---

## COMPLEXITY (how the scorer works, for reference)

Complexity 1 to 10 is the reasoning load of a question: how many dependent inference steps a competent answerer must chain, under how many simultaneous constraints, before an answer exists. It is not length. Pure retrieval is 1. A design task that must satisfy interacting constraints and prove properties is 10.

The scorer is deterministic, same question same score, and returns a full signal breakdown for audit. It scores from named signals (analysis verbs, synthesis verbs, design nouns, constraints, data points, multi-part structure, technical depth, proof demanded, open-endedness, length), with a retrieval anchor that pins lookups low and a proof floor that pins proofs to at least 6. Courtesy wrappers are stripped before the retrieval test. Full detail lives in COMPLEXITY.md, which stays as a reference file.

Known and accepted: a rule-based scorer has a vocabulary ceiling. Its remaining errors bias toward a slightly stronger model than needed, never weaker, which matches the cost asymmetry (a cheap wrong answer to a misread question is the worst outcome).

---

## CONFIDENCE COUPLING (how translation confidence changes routing)

Translation confidence changes routing in one direction only, up. Confidence 80 and above, the route runs on the question's own complexity. 60 to 79, effective complexity is escalated one step with a visible note. Below 60 should not reach routing at all (the translation layer asks a clarifying question instead); if one arrives, the router floors effective complexity at 4 and flags it. Confidence never downgrades a route and never overrides the user. Full detail in CONFIDENCE_COUPLING.md.
