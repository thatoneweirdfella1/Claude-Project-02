# Parking Lot — Not Authorized Work

Items here are preserved so they are not forgotten. They are not requirements, active tasks, permission, or evidence that they should be built. Only the user may promote an item into `CURRENT-TASK.md`.

| ID | Observation or possible future work | Why parked | Promotion authority | Status |
|---|---|---|---|---|
| P-001 | Add a mechanical repository/CI validator for manifest, branch, allowed-path, logging, evidence, and handoff rules. | Originally outside F0; the user later explicitly made this the required next task. | User | Promoted to active task G0 by D-010. |
| P-002 | GitHub CI run `34170361298` for B0 reported 15 existing application Playwright failures (28 passed, 2 skipped), including missing-element/timeouts and four tests targeting unavailable `localhost:5174`. | Discovered while running the user-required repository checks. It affects application verification/CI health, but B0 changed no application/test files and the user expressly prohibited app-system implementation in this task. Ignoring it leaves the all-app CI workflow red; fixing it requires a separately authorized application/test task. | User | Open; not promoted; do not fix during B0 or F0 without explicit scope. |

New entries must identify the discovery source, affected requirement, risk if ignored, and why it is outside the active task. Do not solve or expand them here.
