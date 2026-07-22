# TECHNIQUE-MATRIX.md — technique conflicts and dependencies (Step 4.1)

The human-readable matrix for CANON Feature 4's techniques. The **executable
source of truth is `src/services/techniques/registry.ts`** — this file explains
it; if the two ever disagree, the code wins (and `registry.test.ts` enforces the
invariants below). Step 4.2's auto-detect scorer reads the registry, respects
these conflicts and dependencies, and stacks **at most 4** techniques.

Product truth: CANON.md Feature 4, PIPELINE.md "TECHNIQUE SELECTION AND
COMPOSITION". CANON LOCKED DECISION 8 — include every technique, prune later —
so all are present; none was dropped for the count.

## Techniques

| id | label | effect | default | meta |
|----|-------|--------|:------:|:----:|
| `socratic` | Socratic | Leads you to the answer with guiding questions | ✓ | |
| `quote-first` | Quote-First | Anchors the answer in a direct quote first | | |
| `chain-of-thought` | Chain-of-Thought | Shows the reasoning steps before the conclusion | | |
| `role-prime` | Role-Prime | Answers as the most relevant domain expert | | |
| `verify` | Verify | Adds a self-check pass and flags uncertainty | | |
| `examples` | Examples | Illustrates with concrete examples | | |
| `simplify` | Simplify | Plain language, simplest accurate form | | |
| `detailed` | Detailed | Thorough, comprehensive depth | | |
| `step-by-step` | Step-by-step | Ordered, actionable steps | | |
| `comparative` | Comparative | Side-by-side comparison of the options | | |
| `metaphor` | Metaphor | Explains through an analogy | | |
| `auto-detect` | Auto-detect | Picks the best techniques automatically | | ✓ |

`auto-detect` is a **selection mode**, not a stackable technique: it has no
prompt fragment and is never itself composed. When chosen, the scorer picks
among the other 11.

## Conflicts (mutually exclusive — symmetric)

Two techniques conflict when their instructions to the answering model would
contradict (opposite verbosity, or "ask vs. answer" response modes). Conflicts
are **symmetric**: if A conflicts with B, B conflicts with A.

| Pair | Why they can't stack |
|------|----------------------|
| `simplify` ⟷ `detailed` | Opposite verbosity: strip-to-simplest vs. comprehensive depth. |
| `simplify` ⟷ `chain-of-thought` | Simplify wants brevity; showing every reasoning step pulls the other way. |
| `socratic` ⟷ `detailed` | Socratic withholds the answer and asks; Detailed delivers an exhaustive one. |
| `socratic` ⟷ `step-by-step` | Socratic asks guiding questions; Step-by-step hands over a finished procedure. |

All other pairs may co-exist (subject to the stack limit).

## Dependencies (auto-selecting A also pulls in B)

A dependency fires only for **auto-detect**: if the scorer selects the dependent
technique, it must also include what it depends on. By invariant, a dependency
never points at a technique the dependent conflicts with.

| Technique | Depends on | Why |
|-----------|-----------|-----|
| `verify` | `chain-of-thought` | Verifying is only meaningful when there is explicit reasoning to check. |
| `comparative` | `examples` | A comparison lands best when each option is shown concretely. |

Note a consequence the scorer must handle: `verify` pulls in `chain-of-thought`,
which **conflicts with** `simplify` — so `verify` and `simplify` cannot end up in
the same stack. That is intended, not a bug.

## Invariants (enforced by `registry.test.ts`)

1. All 12 CANON techniques present; each `id` matches its registry key.
2. Exactly one default (`socratic`); exactly one meta mode (`auto-detect`).
3. Every composable technique has a non-empty effect and prompt fragment.
4. No technique conflicts with itself.
5. Conflicts are symmetric.
6. Dependencies reference real, non-self techniques.
7. No technique depends on a technique it conflicts with (in either direction).
8. `MAX_TECHNIQUE_STACK` = 4.
