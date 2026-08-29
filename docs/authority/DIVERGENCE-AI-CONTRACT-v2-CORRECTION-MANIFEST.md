# DIVERGENCE.AI — CONTRACT v2 CORRECTION MANIFEST

**Old Contract:** `DIVERGENCE-AI-SITE-CONTRACT.md` — superseded as a complete authority.
**Corrected denominator:** `DIVERGENCE-AI-CANONICAL-DECISION-AUTHORITY-v2.md`.

## 1. Why v1 failed

The v1 audit proved one-to-one coverage of its own inventory, but did not independently prove that the inventory contained every approved decision. The upstream decision audit found approved/recovered domains absent from the denominator.

## 2. Required structural corrections

- Retain the useful 156 atomic control rows.
- Add **62** permanent IDs for omitted/under-atomic provider, connection, cost, large-job, evaluation, learning, desktop and Developer requirements.
- Replace blanket `SRC-DEV-01 = OUT_OF_SCOPE` with scoped ordinary-user vs operator-domain treatment.
- Remove Local AI/Ollama from the normal target behavior under the later explicit user correction.
- Add Fable-under-Claude, BYOK, licensed OAuth, optional browser companion, provider adapters and refreshable registry as explicit requirements.
- Add auto-top-up, three-level caps, server reservation/reconciliation, receipts, nonnegative concurrent balance and idempotency as explicit cost requirements.
- Add resumable large-job processing and its checkpoint/evidence/quality/cost invariants.
- Add explicit evaluation-gate requirements.
- Add the missing Developer async-testing and heavy-use goal family.
- Replace any global `156/156`, `190/190`, or `all 26 repairs` completeness claim with v2-denominator totals.

## 3. Requirement changes/additions

| ID | Requirement | v1 disposition | v2 status | Required implementation correction |
|---|---|---|---|---|
| SPEC-PN-01 | Provider/model registry — refreshable source | Missing/under-atomic in v1 | WRONG | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-PN-02 | Provider/model registry — stale/deprecated behavior | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-PN-03 | Claude destination family | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-PN-04 | Fable placement under Claude | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-PN-05 | OpenAI / ChatGPT destination | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-PN-06 | Google Gemini destination | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-PN-07 | xAI Grok destination | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-PN-08 | Perplexity destination | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-PN-09 | DeepSeek destination | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-PN-10 | Mistral destination | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-PN-11 | Microsoft Copilot destination | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-PN-12 | Custom / Other destination | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-PN-13 | Local AI / Ollama removal | Missing/under-atomic in v1 | WRONG | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-PN-14 | Provider-specific request adapters | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-CN-01 | BYOK connection | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-CN-02 | Licensed account API / OAuth | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-CN-03 | Optional browser companion | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-CN-04 | Manual handoff credential boundary | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-CN-05 | Connection removal / revoke | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-TR-01 | Translator Engine — exact option set | Missing/under-atomic in v1 | WRONG | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-TS-01 | Translate & Ask state — Checking state | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-TS-02 | Translate & Ask state — Preparing | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-TS-03 | Translate & Ask state — Review request | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-TS-04 | Translate & Ask state — Confirm cost | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-TS-05 | Translate & Ask state — Copy & Open | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-TS-06 | Translate & Ask state — Sending | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-TS-07 | Translate & Ask state — Waiting for response | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-TS-08 | Translate & Ask state — Import response | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-TS-09 | Translate & Ask state — Retry / cancel / error | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-CC-01 | Automatic top-up | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-CC-02 | Request/session/month cost caps | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-CC-03 | Credit reservation | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-CC-04 | Cost reconciliation / release | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-CC-05 | Receipts | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-CC-06 | Nonnegative concurrent balance invariant | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-CC-07 | Idempotent charging and crediting | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-CC-08 | Subscription / managed credits separation | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-CC-09 | Developer billing boundary | Missing/under-atomic in v1 | WRONG | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-LJ-01 | Resumable large-job orchestration | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-LJ-02 | Large-job checkpoints and evidence references | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-LJ-03 | Large-job quality audit and final synthesis | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-LJ-04 | Large-job cost cap / stop-resume | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-EG-01 | Evaluation gate — Security/privacy gate | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-EG-02 | Evaluation gate — Prompt-injection gate | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-EG-03 | Evaluation gate — Accessibility gate | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-EG-04 | Evaluation gate — ADHD-friction gate | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-EG-05 | Evaluation gate — Historical-session migration gate | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-LS-01 | Learnable Signal Patterns integration | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-FB-01 | Fable model recommendation / prompt translation integration | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-DS-01 | Desktop / Windows platform scope register | Missing/under-atomic in v1 | OUT_OF_SCOPE | Keep in scope register; verify only on its applicable platform. |
| SPEC-DV-01 | Operator Developer Mode — separate domain | Missing/under-atomic in v1 | BROKEN | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-DV-02 | Developer Mode — reachable operator entry | Missing/under-atomic in v1 | BROKEN | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-DV-03 | Developer Mode — async testing toggle | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-DV-04 | Developer Mode — recoverable draft queue / rapid switching | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-DV-05 | Developer Mode — Preview Request dry run | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-DV-06 | Developer Mode — Mark Sent / simulated completion | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-DV-07 | Developer Mode — async persistence/recovery | Missing/under-atomic in v1 | PARTIAL | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-DV-08 | Developer Mode — personal heavy-use AI goal | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-DV-09 | Developer Mode — cost-optimization candidate set | Missing/under-atomic in v1 | UNDECIDED | Track without inventing a decision; do not use as a completion blocker for unrelated decided work. |
| SPEC-GV-01 | Upstream decision-universe audit gate | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-GV-02 | Authority resolution — no timestamp shortcut | Missing/under-atomic in v1 | WRONG | Implement/fix against approved behavior and add acceptance evidence. |
| SPEC-GV-03 | No circular completeness claim | Missing/under-atomic in v1 | MISSING | Implement/fix against approved behavior and add acceptance evidence. |

## 4. v1 claims explicitly withdrawn

- `156/156` = complete product-decision coverage.
- `190/190` = all required acceptance tests.
- `26 repairs` = complete repair universe.
- `SRC-DEV-01 OUT_OF_SCOPE` = sufficient documentation of Developer Mode.
- `SAFE AS A COMPLETE STANDALONE IMPLEMENTATION AUTHORITY` for the old Contract.

## 5. v2 rebuild gate

- v2 permanent denominator currently documented: **218 IDs**.
- Decided new/expanded rows requiring implementation/source comparison: **61**.
- New rows currently WRONG/MISSING/BROKEN/PARTIAL: **60**.
- All downstream repairs/tests/evidence/traceability must map to this denominator, not the old one.

**VERDICT: PASS — the known v1 omissions are now explicitly enumerated and assigned permanent IDs.**