# Post-correction audit rating and hybrid reconciliation — 2026-08-24

**Audited checkpoint:** `7c2a123b7622e00638285d67d0ccb6121dd805df`  
**Reconciliation scope:** governance only; no application behavior, deployment, merge, secret, payment, provider, or Layer 1 work  
**Current verdict:** CORRECTIONS APPLIED / CLEAN INDEPENDENT AUDIT REQUIRED

## Audit quality rating

| Rank | Audit | Rating | Judgment |
|---:|---|---:|---|
| 1 | GPT-5.6 Sol (`2.md`, Library `libfile_ad98c2c6cdc48191a25832b314bf1d01`) | 8.6/10 | Strongest adversarial enforcement audit. It found the important machine-enforcement, evidence-fabrication, permission, protected-path, data-boundary, and platform-claim defects. It also overreached in places by proposing unapproved behavior or process. |
| 2 | Claude Sonnet 4.6 (`1.md`, Library `libfile_a79e833717f48191a25832b314bf1d01`) | 8.1/10 | Higher precision and cleaner scope. Its baseline-protection and packet-completeness findings were correct, but it missed several deeper validator weaknesses. Its packet-truncation claim described the audit interface, not a defect in the source document. |

The hybrid uses GPT-5.6 Sol as the adversarial enforcement source and Sonnet as the precision/scope check. Neither audit is accepted wholesale.

## Accepted and implemented

1. Added an exact 218-row, seven-layer obligation matrix generated from versioned profiles; each ID now has one obligation code, applicability decision, assertion, and evidence set at each web depth.
2. Made L0 a machine gate: derived registries and obligations, manifest hashes, coverage lock, audit gate, permission, batch, protected path, secret glob, handoff, branch, origin, ancestry, and remote lease checks are executable.
3. Hardened evidence promotion so a `PROVEN` row must match its resolved obligation, exact authority citation, passing scoped results, hash-bound artifacts, matching deployment identity when required, and a separate accepted independent-audit record.
4. Prevented self-auditing by requiring different implementation and audit session references and a governed JSON audit record.
5. Added the governance baseline itself and other safety-critical governance files to protection, plus safety-critical application-path patterns and exact hash-bounded exception rules.
6. Made secret patterns real globs rather than literal filenames.
7. Expanded deny-by-default permissions for auth, storage, migrations, payment, external AI calls, OAuth, companion installation, environment changes, and stable-preview promotion.
8. Reconciled branch wording: `cowork-complete-preview-20260823@16bec...` is the historical verified source; `horizontal-layer-completion-v1` is the active governed branch.
9. Split Layer 4 from Layer 5 correctly: L4 may establish durable identity/storage/service interfaces but must prove authoritative allowance/credit/entitlement/payment mutations remain disabled; L5 proves those mutations.
10. Added authority-derivation blockers for the missing data-ownership and cross-device conflict contracts rather than letting an implementer guess.
11. Made a credential/provider/permission absence a Layer 6 blocker, never completion evidence.
12. Added immutable deployment/stable-alias promotion and rollback rules.
13. Added executable dirty-work recovery snapshots and an explicit refusal to call an uncommitted handoff safe.
14. Defined L7 as web-only and retained Desktop/Windows as a separate track with its own future activation requirements.
15. Marked the missing Learnable Signal Patterns and Fable task sources explicitly; their rows cannot be completed from labels or model inference.
16. Removed the invented `refund` scope and corrected the mechanical `61 / 60` defect count to `60 / 60`.
17. Expanded the future audit packet contract to include root routers, baseline, active governance state, validators, generator dependencies, and all governed sources.

## Accepted in narrower form

- The audit requested a hand-written per-ID/per-layer obligation contract. The hybrid provides the same exact resolved result through reviewable profiles plus a deterministic 218-row matrix, avoiding 1,526 manually duplicated rules.
- The audit requested broad source protection. The hybrid protects frozen source and safety-critical paths, while ordinary authorized batch paths remain editable only inside exact `BATCH-SCOPE.json` boundaries.
- The audit requested stronger cutoff rules. The hybrid uses actual dirty state, patch capture, hashes, tests, commits, and remote lease—not an invented token or usage percentage.
- The audit requested cross-device conflict behavior. The hybrid creates a blocker and authority-recovery task because no product policy may be invented.

## Rejected

- No refund feature was added; the authority supports reconciliation and release, not an inferred refund product.
- No fixed token, percentage, or usage reserve was invented.
- No missing product behavior was supplied from model preference.
- No duplicate complete test suite was added where a scoped matrix assertion plus the layer aggregate gate already provides the required proof.
- Sonnet's “packet was truncated” statement was not treated as a source defect; it was an audit-client access limitation. The next packet nevertheless includes all active dependencies to make access verification easier.

## Required independent result

This record is a reconciliation, not a `PASS`. A clean external session must audit the corrected checkpoint, run adversarial negative cases, and return `PASS` or `FAIL`. Layer 1 remains unauthorized and unstarted.
