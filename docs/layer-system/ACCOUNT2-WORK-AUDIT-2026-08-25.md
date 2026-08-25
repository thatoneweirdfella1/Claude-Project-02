# Account 2 Layer 3–5 implementation audit — 2026-08-25

## Verdict

**DO NOT MERGE OR USE AS TRUSTED ANCESTRY.**

The Account 2 work contains useful prototypes, tests, and implementation ideas, but none of Layers 3–5 currently satisfies the repository's formal completion gate. Preserve the work as donor material under the frozen archive refs listed in `DUAL-LINEAGE-GOVERNANCE.md`.

## Verified branch graph

| Branch | Head | Finding |
|---|---|---|
| `horizontal-layer-completion-v1` | `df90e4bb8dea73d4ff0c7373fa5f9f7c7aea11d6` | Common Layer 1–2 baseline |
| `horizontal-layer-3-implementation-v1` | `4db777514e50e011fb0887bf283a416e1a34f477` | 24 commits ahead of baseline |
| `horizontal-layer-4-implementation-v1` | `a27701c78af2ee2ca5744bc87d32b9e74d9e9d99` | 18 commits beyond Layer 3 |
| `horizontal-layer-5-implementation-v1` | `92dc92f0ba0f0cf6a8095705f3251995707eca6c` | Descends from Layer 4 checkpoint `cc0a0d5...`; diverges from the later Layer 4 evidence-only commit |
| `horizontal-layer-6-implementation-v1` | `92dc92f0ba0f0cf6a8095705f3251995707eca6c` | Identical to Layer 5; Layer 6 has not begun |

## Cross-layer governance defects

1. `LAYER-EVIDENCE-INDEX.jsonl` is empty.
2. L1 and L2 remain `UNKNOWN — INSPECTION REQUIRED` for all 218 ledger rows.
3. L3 assigns 203 rows `IMPLEMENTED — NOT FULLY PROVEN` without the required per-row evidence records.
4. L4 and L5 remain `UNKNOWN — INSPECTION REQUIRED` for all 218 ledger rows even though status files claim implementation checkpoints.
5. No implementation session may self-certify `PROVEN`; no accepted independent per-layer evidence is recorded.
6. Status, handoff, coverage ledger, and evidence index therefore do not reconcile.

## Layer 3 findings

**Classification:** Partial donor implementation; not independently verified and not complete.

Useful work includes local workspace helpers, dataset export/import scaffolding, synthetic jobs, learning-signal types, local UI behavior, and tests.

Required corrections include:

- `PENDING-INTEGRATIONS.md` still records the 3-State Methodology task as incomplete even though L3 marks applicable local-function rows implemented.
- Secondary signal helpers for usage time and edit distance are not wired into real flows.
- Tertiary search/topic-return helpers are not wired into real flows.
- `applySignalLearning()` and `recommendModelAndTechniques()` are not shown feeding the real router/technique selection path.
- The claimed “real feedback outcome” validation is represented by deterministic unit tests, not real outcome evidence.
- Schema-v1 dataset import has no size bound, checksum, full schema validation, or atomic rollback when persistence fails.
- Large-job stop/resume exists as component memory; its durable behavior belongs to L4 and must not be implied at L3.
- The empty evidence index prevents the 203 blanket implementation statuses from being audited requirement by requirement.

## Layer 4 findings

**Classification:** Incomplete durability prototype.

Useful work includes IndexedDB records, recovery-point bounding, account/sync API scaffolding, conditional Redis revisions, local dataset checksums, conflict UI, and API boundary tests.

Required corrections include:

- Live storage remains unconfigured in the matching Preview: `/api/account` returned `configured:false`.
- No two-device/account live proof exists.
- The custom account record has no role/operator authorization model, so the Layer 4 operator-only Developer authorization requirement is not satisfied.
- Remote sync accepts a checksum string without recomputing and validating the submitted dataset checksum server-side.
- Conflict resolution does not create the contractually required recovery version before destructive local or remote selection.
- Loading a newer remote copy can replace local state without first creating a recovery point.
- A repeated revision conflict recursively calls `syncNow()` without a bounded retry limit.
- “Keep both” merges selected collections but uses broad local-over-remote object spreading for other fields; this can silently choose a side for unenumerated state.
- The collision rename uses separate `Date.now()` calls for the map key and object ID.
- Account deletion removes only the current session key; other session keys remain until expiration.
- Redis requests have no explicit timeout/retry classification.
- Tests mock Redis and cover only a small subset of account/sync behavior. They do not prove register/login/session expiration, cross-device sync, migration, recovery-before-overwrite, full-data round trip, multi-account isolation, or live deletion.

## Layer 5 findings

**Classification:** In-memory demonstration/prototype; not the required authoritative whole-site money system.

Useful work includes a deterministic reference model for preflight, caps, reservations, releases, receipts, sandbox callbacks, and focused unit tests.

Required corrections include:

- `DeterministicMoneyAuthority` exists only in component memory through a Settings-page `useRef`.
- Refresh, navigation, another tab/device, or another server instance does not share its ledger.
- The real composer/provider authorization path still uses the separate legacy client-side account store and `authorizeEstimatedCost()`.
- The implementation therefore has two money authorities rather than one authoritative system.
- The demo is not wired across composer, Settings, account/plan, right rail, receipts, large jobs, Multi-AI, and Developer Mode as required.
- The “concurrency” test runs two calls against one synchronous in-memory object; it does not prove cross-request, cross-instance, or durable atomicity.
- Reservation, settlement, checkout, and callback idempotency keys are not bound to immutable request parameters. Reusing a key with different input can return a prior unrelated result instead of rejecting the mismatch.
- Automatic top-up can be configured in memory, but the required threshold/action/monthly tracking/disable workflow is not implemented.
- Sandbox checkout tokens are handed directly to the same client UI that applies them; this is a demonstration, not authoritative callback verification.
- No durable or cross-device allowance, entitlement, ledger, receipt, reservation, or reconciliation proof exists.
- Default caps and other implementation values require authority citation rather than becoming product decisions through code.
- The evidence index and L5 coverage ledger remain empty/unknown.

## Required recovery path

1. Preserve all Account 2 heads under archive refs.
2. Start Codex Layer 3 from the trusted Layer 1–2 baseline.
3. Audit the applicable Layer 3 obligation rows against existing baseline behavior.
4. Independently implement missing Layer 3 behavior; use Account 2 only as donor/reference material.
5. Populate evidence per requirement and run the complete gate before creating Codex Layer 4.
6. Repeat for Layer 4 and Layer 5.
7. Do not begin Codex Layer 6 until Codex Layer 5 is independently verified and real execution remains disabled behind that checkpoint.
