# Evidence Index

| Evidence ID | Artifact | Supports | State | Hash/version | Limitations |
|---|---|---|---|---|---|
| E-001 | `DIVERGENCE-F0-STANDALONE-HANDOFF.md` | Complete bounded F0 assignment and continuity obligations | Structural self-check passed | `e08d5823d83c7f95e7bfc07b9ecb03f1782c8dcac5c22cec99c271bc4fd26b76` | Proposed planning input; F0 not executed or independently verified. |
| E-002 | `docs/ai-control/visual-baseline/DivergenceAI-1of3-Core-Request-Flow-Controls.png` | Existing Divergence layout continuity | Supplied reference | `ae4da82950f94542c5d7e700c6374ebdac6221cc681d4c5a41a11d7f694f4318` | Visual reference is not proof of mounted implementation. |
| E-003 | `docs/ai-control/visual-baseline/DivergenceAI-2of3-Navigation-Sessions-Safe-Workflow.png` | Existing Divergence layout continuity | Supplied reference | `745fd8df9a68c2444dde19fb09f7dbadeca78a918938574b5b1a1aa8932b82f4` | Visual reference is not proof of mounted implementation. |
| E-004 | `docs/ai-control/visual-baseline/DivergenceAI-3of3-Response-Right-Rail-Settings.png` | Existing Divergence layout continuity | Supplied reference | `a74423809cbdf5bafb72abf122a8551f930634387edaf87a59a5719bc66be0c6` | Visual reference is not proof of mounted implementation. |
| E-005 | `docs/ai-control/CONTROL-MANIFEST.json` plus entry/control files | RCG-01 repository entry/control structure | Self-check passed after installation and recorded read receipt | See `SHA256SUMS`; install commit `58c89578c825a2c445df7408db059d7fb3f1586f` | Does not independently prove that a later AI will read or obey the files. |
| E-006 | `docs/ai-control/CONTINUITY-LEDGER.md`, `DECISION-LOG.md`, `HANDOFF.md`, and `TASK-INDEX.md` | RCG-04 resumable state | Structural self-check passed; gate remains Open pending an independent continuity trial | See `SHA256SUMS` | No independent continuity trial has occurred. |
| E-007 | `docs/ai-control/VERCEL-BASELINE.md` | Exact repository, preferred branch, deployed commit, and Vercel layout baseline | Live Vercel metadata lookup completed | Deployment `dpl_D1ngxz1mmJrfSB7LHsEnHfbuA5ej`; commit `10894f704a39b6c56a7fadfafb54275b82526c33` | Read-only metadata evidence; no repository checkout, browser workflow test, mutation, or independent verification. |
| E-008 | GitHub branch creation and compare result | Working-branch isolation and inherited layout baseline | Self-check passed | `divergence/reliability-v1` versus safety branch and baseline commit: `identical`, ahead 0, behind 0 | Proves starting refs matched; does not prove future work preserves behavior. |
| E-009 | GitHub commit and post-installation compare/readback | Exact control-packet installation with no application-code edits | Self-check passed | Commit `58c89578c825a2c445df7408db059d7fb3f1586f`; working branch ahead 1 by exactly 19 control/handoff files; safety branch still identical to `10894f704a39b6c56a7fadfafb54275b82526c33` | Entry files, manifest, and handoff were read back; no application workflow test or independent continuity trial occurred. |
| E-010 | `scripts/ai-course-control.test.mjs` and local Node test output | Course controller accepts an in-scope checkpoint and rejects wrong repository/branch, protected branch, scope drift, deletion, immutable-baseline changes, ledger rewrites, missing records, bad hashes/statuses, unsupported independent claims, and locked-task activation | Self-check passed: 17/17 tests | Test run 2026-09-06 23:10 UTC; validator and test syntax passed; workflow YAML parsed | Local self-check only; GitHub workflow execution, repository ruleset, and cold-start independent trial remain Open. |

## Evidence rules

- Record observed results separately from plans or requirements.
- Keep contrary evidence and failures visible.
- Use exact file hashes or stable versions after each material change.
- A changed file invalidates its prior hash until a new evidence entry or correction is recorded.
- No evidence produced by the task author is independently verified by that fact alone.
