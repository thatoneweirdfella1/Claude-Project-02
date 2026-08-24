# Independent governance audit checklist

The auditor must be a different account/session from the installer and must remain read-only while auditing.

1. Run the structural preflight and preserve its certificate.
2. Verify source selection and every branch classification.
3. Verify registry sets and counts are mechanically derived.
4. Verify all ledger statuses use the closed vocabulary.
5. Verify `N/A` cannot be added outside layer allowlists.
6. Verify permissions default deny and app edits remain denied.
7. Verify protected source/governance paths and secret handling.
8. Verify evidence schema, staleness, and deployment-identity rules.
9. Verify one-batch and remote-head lease rules.
10. Verify routers agree and no obsolete `build` instruction survives in an active router.
11. Verify stopping/recovery procedures are executable.
12. Verify a contextless AI identifies the same exact next action.

Write `AUDIT-RESULTS/YYYY-MM-DD-governance.md` with `PASS` or `FAIL` and exact findings. One blocking defect means `FAIL`. Do not plant defects.
