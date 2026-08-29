# Canonical and legacy path reconciliation

| Purpose | Canonical path | Legacy/source path | Rule |
|---|---|---|---|
| Startup router | `START-HERE-DIVERGENCE.md` | none on selected source | Canonical only |
| Claude router | `CLAUDE.md` | prior blob `6071ed9ca8cd8dc52f4c315fb0dd613f1fcacba8` | Prior file required `build` and conflicted with the authorized isolated branch; hash preserved here, root replaced by router |
| Canonical decisions | `docs/authority/DIVERGENCE-AI-CANONICAL-DECISION-AUTHORITY-v2.md` | `docs/repair-authority/DIVERGENCE-AI-CANONICAL-DECISION-AUTHORITY-v2.md` | Byte-identical at installation; canonical path governs, legacy remains compatibility evidence |
| Control map | `docs/authority/DIVERGENCE-AI-CONTROL-BEHAVIOR-MAP-v2.md` | `docs/repair-authority/DIVERGENCE-AI-CONTROL-BEHAVIOR-MAP-v2.md` | Byte-identical at installation |
| Decision queue | `docs/authority/DIVERGENCE-AI-DECISION-QUEUE-v2.md` | `docs/repair-authority/DIVERGENCE-AI-DECISION-QUEUE-v2.md` | Byte-identical at installation |
| Repair queue | `docs/authority/DIVERGENCE-AI-REPAIR-QUEUE-v2.md` | `docs/repair-authority/DIVERGENCE-AI-REPAIR-QUEUE-v2.md` | Byte-identical at installation |
| Upstream audit | `docs/authority/DIVERGENCE-AI-UPSTREAM-DECISION-RECOVERY-AUDIT-v1.md` | `docs/repair-authority/DIVERGENCE-AI-UPSTREAM-DECISION-RECOVERY-AUDIT-v1.md` | Byte-identical at installation |
| Current implementation detail | `docs/repair-authority/GPT-5.6-SOL-HANDOFF.md` | same | Compatibility file remains the detailed repair checkpoint; layer HANDOFF controls continuation |

If two paths later differ, stop and record `CONFLICT — UNRESOLVED`; never choose by recency alone.
