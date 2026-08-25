# Unresolved findings

The 23 defects recorded in `AUDIT-RESULTS/2026-08-24-hybrid-reconciled.md` have proposed corrections in the current governance checkpoint. They remain open for verdict purposes until the mandatory clean full audit verifies closure.

1. **Clean post-hybrid independent governance audit pending.** The fresh Sonnet 4.6 and GPT-5.6 Sol audits found real defects. Supported findings were reconciled, but structural self-validation by the installer is not independent proof.
2. **Real-checkout preflight and baseline test rerun pending.** The local staging directory has no `.git`, so it cannot issue a Resume Certificate or prove branch ancestry. CI or a fresh checkout must run the gates.
3. **Immutable server protection unavailable.** Protected tag/ruleset changes were not authorized. This now mechanically blocks application and external-effect actions; read-only audit and governance correction may continue.
4. **Five build-only commits require later ID-level audit.** They are listed in `BASELINE-STATE-AUDIT.md`; none was silently discarded or cherry-picked.
5. **Seven product decisions remain in four sessions.** They block only the IDs listed in `LAYER-DECISION-BLOCKERS.md`.
6. **No horizontal layer is complete.** Visible-site checkpoints exist, but a site-wide L1 baseline audit has not assigned credit.
7. **Data and cross-device conflict contracts require authority derivation before L4.** They are project tasks, not permission to invent a product policy.
8. **The cited Fable task source remains outside this Layer 3 batch.** Learnable Signal Patterns source and acceptance were recovered from `PENDING-INTEGRATIONS.md`, `output/learnable_signal_set.md`, and `output/TRACEABILITY_AUDIT.md`; SPEC-LS-01 is implemented.


## SPEC-LS-01 — resolved

Recovered, implemented, and verified on `horizontal-layer-3-implementation-v1`. Evidence: `94841450b1aedb28f3d144a191ffac2301d03170`, 75 test files / 664 tests, passing TypeScript/Vite build, READY preview `dpl_3CgDffYmJvBvx5ZNBY3EHJSqkpxy`.
