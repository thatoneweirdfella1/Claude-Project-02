# Structural Findings

What is structurally true about this build, as opposed to merely undertuned. Per the run spec, this list outranks polish.

## 1. The spec's model table contains a model that does not exist

The spec names "claude-sonnet-5" as the Balanced tier API string. There is no such model string in the live API. The nearest real balanced tier model is claude-sonnet-4-6, and that is what the engine and the web app use. Flagged here instead of silently shipping a string that would fail on every Balanced route, which is most routes. If a Sonnet 5 ships later, it is a one line change in the MODELS table.

## 2. The cliff test's quality column now has a home, but was not measured in this report

The build container has no API key (verified by probe, same as both prior runs), so complexity assigned and model chosen are recorded for all ten ramp questions, and answer quality is not. The difference from the prior attempt: the web app authenticates through the artifact environment, so live answers are one click away inside it. Run the ramp questions through Route and answer on the paid toggle and judge quality directly. Whether answer quality cliffs at the tier boundaries remains the open question the spec cares about, and the app is now the instrument for answering it.

## 3. A rule based scorer has a vocabulary ceiling, and one residual miss is kept on purpose

The scorer recognizes reasoning demand through vocabulary. Stress tests show it survives the standard lies: length inflation, courtesy padding, and mention versus use ("the paper that analyzed byzantine consensus" stays a lookup). One residual weakness is documented rather than patched: noun verb ambiguous words. "What year did the design of the tcp protocol get standardized" scores three and routes Balanced when it is really a lookup. The error direction is over provisioning, a slightly stronger model than needed. Given the spec's own cost asymmetry, wrong model matters more than cost, every remaining known error is biased expensive rather than cheap. A genuinely hard question phrased in vocabulary the lexicons have never seen will still underscore; the production shape is probably a fast model call scoring complexity with this deterministic layer as gate keeper, audit trail, and fallback.

## 4. An interrupted prior attempt existed, and porting its adversarial tests found a real bug

This folder contained a Python routing engine from an interrupted earlier pass at this run, before the web version was requested. It was not shipped: it used the dead claude-sonnet-5 string and is not the code inside the web app. Its adversarial test ideas were ported into the current suite. Two passed immediately. The third, a courtesy wrapped lookup, exposed a real defect in the shipped engine: the retrieval anchor was pinned to the string start, so "sorry to bother you but could you please tell me what year..." lost its anchor and routed Balanced. Fixed by stripping courtesy wrappers before the anchor test. Adversarial tests survive reimplementation better than code does. Carry them forward, always.

## 5. Parallel data is not parallel constraints

Early ramp runs had a household budget outscoring a distributed systems design, because five dollar figures counted as five constraints. The fix was structural, not a weight nudge: data points (numbers with units) are scored separately from constraint keywords and capped lower, on the model that enumerated data is one dataset and raises reasoning load sub linearly, while interacting conditions raise it linearly.

## 6. The free and paid tiers are a routing layer flag, not billing infrastructure

There is no account system, no payment processing, no rate limiting, and no server in this deliverable. The plan toggle demonstrates every enforcement point the routing layer owns: Deep tier auto routes downgrade to Balanced with a visible note (never silently), manual override to a paid model is blocked with a visible note, and extended thinking is recommended but not applied. Wiring "plan" to a real billing system is someone else's stage. What is guaranteed here: the free tier never silently gives a worse answer, it always says when a stronger route existed.

## 7. The embedded engine is provably the tested engine

The web app is built by embedding routing.js into the page verbatim. The build step verifies byte identical embedding, and the test run extracts the embedded copy back out of the built page and routes through it. What was tested is what ships. This closes the classic gap where the tested module and the pasted in copy drift apart.

## 8. The stability probe has no teeth against this implementation, again

The three run probes passed with identical outputs, but a deterministic router passes by construction. The probe exists to catch stochastic routing instability, which only a model backed scorer can exhibit. Keep it for the production version, where it will mean something.
