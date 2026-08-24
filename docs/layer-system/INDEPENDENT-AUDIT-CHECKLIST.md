# Independent governance audit checklist

Use together with `HYBRID-INDEPENDENT-AUDIT-PROTOCOL.md`.

The auditor must be a different account/session from the installer and must remain read-only while auditing.

For the 2026-08-24 post-correction audit cycle, the completed GPT-5.6 Sol and Claude Sonnet 4.6 audits are preserved source audits. Do not require a repeat full audit of the unchanged original packet. Reconcile their findings under the hybrid protocol, close the canonical defects, then delta-verify corrections and directly affected governance behavior.

1. Run the structural preflight and preserve its certificate.
2. Verify source selection and every branch classification.
3. Verify registry sets and counts are mechanically derived.
4. Verify repair, decision, workflow, and acceptance-test mappings are bidirectional: every ledger reference exists and every registered ID is mapped.
5. Verify all ledger statuses use the closed vocabulary and only `PROVEN` or an exact allowlisted `N/A AT THIS DEPTH` can complete a row.
6. Verify `N/A` cannot be added outside the per-layer/per-ID allowlists and that all 218 rows must resolve at every claimed completed layer.
7. Verify each test/workflow result names one layer, its assertions, environment, and verdict; broad tests cannot silently prove deeper layers.
8. Verify permissions default deny and app edits remain denied unless an explicit current grant exists.
9. Verify protected source/governance paths and secret handling.
10. Verify evidence schema, staleness, and deployment-identity rules.
11. Verify one-batch, regression/demotion, failed-gate, and remote-head lease rules.
12. Verify standalone sequential `FIX ALL` is retired and cannot override horizontal work order.
13. Verify unresolved decisions and the `SPEC-LS-01`/`SPEC-FB-01` project tasks block only their exact IDs at their declared depths.
14. Verify security, prompt-injection, accessibility, ADHD-friction, recovery, and migration gates start no later than the layer where their risk becomes real.
15. Verify routers agree and no obsolete `build` instruction survives in an active router.
16. Verify stopping/recovery procedures are executable.
17. Verify a contextless AI identifies the same exact next action.
18. Attempt adversarial false-pass cases for validators, evidence, baselines, permissions, blockers, branch/deployment identity, and missing data.
19. During defect closure, verify every canonical defect against its exact correction criterion and inspect regression impact of the changed governance files.
20. Require a new full audit only when a material-change trigger in the hybrid protocol is met.

Write or update the relevant `AUDIT-RESULTS/` record with exact findings. One supported blocking defect means `FAIL`. Do not plant defects. Silence from another auditor is not disproof.
