# What Complexity Means and How It Is Scored

## The definition

Complexity, one to ten, is the estimated reasoning load of the question: how many dependent inference steps a competent answerer must chain, under how many simultaneous constraints, before an answer exists.

It is explicitly not length. A long simple question stays low. A short hard one goes high. Pure retrieval, where the answer already exists and only needs looking up, is a one. A design task that must satisfy interacting constraints and prove properties about its own output is a ten.

## How the score is computed

The scorer is deterministic. Same question, same score, every run. Every point comes from a named signal, and the full breakdown is returned with each decision, so any score can be audited.

Start at one. Then add:

1. Analysis verbs, up to plus 4.8. Words that request chained reasoning: design, analyze, prove, evaluate, optimize, diagnose, recommend, propose. Worth 1.2 each. Strongest signal because the user is stating the reasoning demand out loud.

2. Synthesis verbs, up to plus 1.6. Explain, summarize, describe, walk through, difference between. These demand composing an answer, which is more than retrieval and less than analysis. Worth 0.8 each.

3. Design nouns, up to plus 1.6. Strategy, architecture, protocol, framework, schema. Asking for one of these is asking for a designed artifact even when no analysis verb appears. Worth 0.8 each.

4. Constraints, up to plus 1.8. Conditions the answer must satisfy: under, given, without, while, tolerant to, limited to, team size phrases. Worth 0.6 each, because each interacting constraint multiplies the reasoning paths that must be checked.

5. Data points, up to plus 1.2. Numbers with units, like dollar amounts and time limits. Worth 0.4 each and capped lower than constraints on purpose: five budget line items are one dataset, not five interacting conditions. Enumerated data raises reasoning load sub linearly. This distinction came out of stress testing, where a household budget briefly outscored a distributed systems design.

6. Multi part structure, up to plus 2.4. Semicolons, "and then", "and analyze", "including x and y". Each additional required deliverable is more work product.

7. Technical depth, up to plus 2.0. Specialist vocabulary: consensus, byzantine, partition, liveness, caching, microservices. Worth only 0.4 each on purpose, because jargon alone does not make a question hard.

8. Proof demanded, plus 1.0, with a floor of six. Proving anything is chained inference by definition. There is no surface level proof, so a proof request can never score below six no matter how short it is.

9. Open endedness, plus 0.5. "Should I", "recommend", "tradeoffs" signal there is no single right answer to retrieve.

10. Length, at most plus 1.0 total. The weakest signal, because length correlates with complexity but does not cause it.

One override: the retrieval anchor. A question opening with "what year", "who was", "convert", "define" and carrying no live analysis demand is pinned to a maximum of two, no matter how long it rambles. Courtesy wrappers ("sorry to bother you but could you please tell me...") are stripped before this test, because politeness padding is exactly what this app's input contains and it does not change what is being asked.

The sum is rounded and clamped to one through ten.

## What was stress tested

The ten question cliff ramp comes out strictly non decreasing, one through ten, zero inversions, all three model tiers exercised. Deliberate scorer lies were tested: a sixty word trivia ramble stays at two, a length padded retrieval stays at one, a terse formal proof lands at six, a question that merely mentions "analyzed byzantine consensus" inside a noun phrase stays at two, and a courtesy wrapped lookup stays at one and routes Fast. Remaining weak spots are in FINDINGS.md.
