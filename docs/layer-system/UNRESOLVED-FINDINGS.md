# Unresolved findings

The 23 defects recorded in `AUDIT-RESULTS/2026-08-24-hybrid-reconciled.md` have proposed corrections in the current governance checkpoint. They remain open for verdict purposes until the mandatory clean full audit verifies closure.

1. **Clean post-hybrid independent governance audit pending.** The fresh Sonnet 4.6 and GPT-5.6 Sol audits found real defects. Supported findings were reconciled, but structural self-validation by the installer is not independent proof.
2. **Real-checkout preflight and baseline test rerun pending.** The local staging directory has no `.git`, so it cannot issue a Resume Certificate or prove branch ancestry. CI or a fresh checkout must run the gates.
3. **Immutable server protection unavailable.** Protected tag/ruleset changes were not authorized. This now mechanically blocks application and external-effect actions; read-only audit and governance correction may continue.
4. **Five build-only commits require later ID-level audit.** They are listed in `BASELINE-STATE-AUDIT.md`; none was silently discarded or cherry-picked.
5. **Seven product decisions remain in four sessions.** They block only the IDs listed in `LAYER-DECISION-BLOCKERS.md`.
6. **No horizontal layer is complete.** Visible-site checkpoints exist, but a site-wide L1 baseline audit has not assigned credit.
7. **Data and cross-device conflict contracts require authority derivation before L4.** They are project tasks, not permission to invent a product policy.
8. **The cited Learnable Signal Patterns and Fable task sources are absent from the governed packet.** Their exact rows remain blocked at the depths recorded in `LAYER-DECISION-BLOCKERS.md`.

## SPEC-LS-01 — Layer 3 completion blocker

- Status: BLOCKED — documented Learnable Signal Patterns source and acceptance contract unavailable.
- Scope: only SPEC-LS-01 and formal Layer 3 completion; unrelated local/manual work is checkpointed.
- Evidence: LAYER-DEFINITIONS.yml and LAYER-OBLIGATION-MATRIX.csv require project_task_source_and_acceptance at L3.
- Exact next action: recover the documented source and acceptance contract before implementation or PROVEN status is claimed.
