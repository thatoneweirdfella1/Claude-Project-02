# Evidence Index

| Evidence ID | Artifact | Supports | State | Hash/version | Limitations |
|---|---|---|---|---|---|
| E-001 | `DIVERGENCE-F0-STANDALONE-HANDOFF.md` | Complete bounded F0 assignment and continuity obligations | Structural self-check passed | `ff0285476a97c192ba87e0d2a19bff25a7af1a8f50a2d4b4ec87db05bdecae40` | Proposed planning input; F0 not executed or independently verified. |
| E-002 | `docs/ai-control/visual-baseline/DivergenceAI-1of3-Core-Request-Flow-Controls.png` | Existing Divergence layout continuity | Supplied reference | `ae4da82950f94542c5d7e700c6374ebdac6221cc681d4c5a41a11d7f694f4318` | Visual reference is not proof of mounted implementation. |
| E-003 | `docs/ai-control/visual-baseline/DivergenceAI-2of3-Navigation-Sessions-Safe-Workflow.png` | Existing Divergence layout continuity | Supplied reference | `745fd8df9a68c2444dde19fb09f7dbadeca78a918938574b5b1a1aa8932b82f4` | Visual reference is not proof of mounted implementation. |
| E-004 | `docs/ai-control/visual-baseline/DivergenceAI-3of3-Response-Right-Rail-Settings.png` | Existing Divergence layout continuity | Supplied reference | `a74423809cbdf5bafb72abf122a8551f930634387edaf87a59a5719bc66be0c6` | Visual reference is not proof of mounted implementation. |
| E-005 | `docs/ai-control/CONTROL-MANIFEST.json` plus entry/control files | RCG-01 repository entry/control structure | Structural self-check passed; gate remains Open until installation and read receipt | See `SHA256SUMS` | Does not prove an AI read or obeyed the files. |
| E-006 | `docs/ai-control/CONTINUITY-LEDGER.md`, `DECISION-LOG.md`, `HANDOFF.md`, and `TASK-INDEX.md` | RCG-04 resumable state | Structural self-check passed; gate remains Open pending an independent continuity trial | See `SHA256SUMS` | No independent continuity trial has occurred. |
| E-007 | `docs/ai-control/VERCEL-BASELINE.md` | Exact repository, preferred branch, deployed commit, and Vercel layout baseline | Live Vercel metadata lookup completed | Deployment `dpl_D1ngxz1mmJrfSB7LHsEnHfbuA5ej`; commit `10894f704a39b6c56a7fadfafb54275b82526c33` | Read-only metadata evidence; no repository checkout, browser workflow test, mutation, or independent verification. |
| E-008 | GitHub branch creation and compare result | Working-branch isolation and inherited layout baseline | Self-check passed | `divergence/reliability-v1` versus safety branch and baseline commit: `identical`, ahead 0, behind 0 | Proves starting refs matched; does not prove future work preserves behavior. |

## Evidence rules

- Record observed results separately from plans or requirements.
- Keep contrary evidence and failures visible.
- Use exact file hashes or stable versions after each material change.
- A changed file invalidates its prior hash until a new evidence entry or correction is recorded.
- No evidence produced by the task author is independently verified by that fact alone.
