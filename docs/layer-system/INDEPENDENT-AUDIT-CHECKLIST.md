# Independent governance audit checklist

Use together with `HYBRID-INDEPENDENT-AUDIT-PROTOCOL.md` and the canonical 23-defect record in `AUDIT-RESULTS/2026-08-24-hybrid-reconciled.md`.

The auditor must be a different account/session from the installer and must remain read-only while auditing.

Because the current correction materially changes validator architecture, obligation/layer semantics, evidence and permission semantics, and packet scope, perform a full audit of the new checkpoint. Preserve the prior audits as cumulative evidence; do not treat this as erasing them.

1. Run the structural preflight and preserve its certificate.
2. Verify source selection and every branch classification.
3. Verify registry sets and counts are mechanically derived.
4. Verify repair, decision, workflow, and acceptance-test mappings are bidirectional: every ledger reference exists and every registered ID is mapped.
5. Verify all 218 IDs resolve exactly once into `LAYER-OBLIGATION-MATRIX.csv`; recompute the file and inspect the assignment profiles for false applicability, false `N/A`, and invented behavior.
6. Verify all ledger statuses use the closed vocabulary and only `PROVEN` or the exact resolved-matrix `N/A AT THIS DEPTH` can complete a row.
7. Verify each test/workflow result names one layer, obligation code, exact assertion, environment, artifacts, and verdict; broad tests cannot silently prove deeper layers.
8. Verify permissions default deny and app edits remain denied.
9. Verify protected source/governance/safety-critical paths, exact hash-bounded exceptions, secret globs, and the protected-governance-ref app-edit blocker.
10. Verify evidence schema, artifact hashes, failed/blocked result rejection, deployment identity, and independent-session audit-record rules by attempting adversarial fabricated records.
11. Verify one-batch, regression/demotion, failed-gate, exact action permission, and remote-head lease rules by exercising negative cases.
12. Verify standalone sequential `FIX ALL` is retired and cannot override horizontal work order.
13. Verify unresolved decisions, missing data/cross-device contracts, and the `SPEC-LS-01`/`SPEC-FB-01` project tasks block only their exact IDs at their declared depths and cannot trigger guessed implementation.
14. Verify security, prompt-injection, accessibility, ADHD-friction, recovery, and migration gates start no later than the layer where their risk becomes real.
15. Verify routers agree and no obsolete `build` instruction survives in an active router.
16. Verify stopping/recovery procedures actually capture a hash-bound patch and untracked files while refusing to call a dirty handoff safe.
17. Verify immutable deployment, stable-alias promotion permission, rollback, web-only L7, and deferred desktop-track claims.
18. Verify a contextless AI identifies the same exact next action.

Write `AUDIT-RESULTS/YYYY-MM-DD-governance.md` with `PASS` or `FAIL` and exact findings. One blocking defect means `FAIL`. Do not plant defects.
