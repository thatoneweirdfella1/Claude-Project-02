# G1-B Authority-Package Gap Audit

**Status:** Self-check working record; independent audit Open  
**Scope:** G1 controls only; no product architecture or implementation claim

## Reuse decision

| Required record | Existing source retained | Verified gap | Canonical G1 completion |
|---|---|---|---|
| Readable system map | `docs/ai-control/00-READ-FIRST.md`, `PROJECT-AUTHORITY.md`, `TASK-INDEX.md` | No one-screen relationship map for authority, execution, evidence, and acceptance | `CONTROL-SYSTEM-MAP.md` |
| Stable constitution | `PROJECT-AUTHORITY.md`, `DECISION-LOG.md`, `COURSE-CONTROL.json` | Rules existed across files; no compact invariant set resolving old branch/process guidance against current authority | `CONTROL-CONSTITUTION.md` |
| Global traceability | Master blueprint and existing product/layer matrices | No G1 outcome-to-owner/artifact/test/evidence/gate registry | `G1-TRACEABILITY.json` |
| Standalone assignments | F0/G1 handoffs and historical handoff plan | No mandatory portable assignment schema and completeness rule | `STANDALONE-ASSIGNMENT-CONTRACT.md` |
| Meaning confirmation | User corrections and product meaning-packet material | No pre-work protocol for detecting ambiguous or reversed user intent | `MEANING-CONFIRMATION-PROTOCOL.md` |
| Creation/verification lifecycle | Existing audit, evidence, recovery, and handoff records | No single task-state transition contract separating authored, verified, and accepted states | `TASK-LIFECYCLE.md` |
| Simple/audit views | `CURRENT-TASK.md`, `HANDOFF.md`, `EVIDENCE-INDEX.md`, `GATE-STATUS.md` | No defined projection rule ensuring the short status and audit truth cannot disagree | `STATUS-VIEW-CONTRACT.md` |

## Preserved sources

The existing authority, layer, traceability, evidence, audit, recovery, and lineage documents remain evidence and historical authority within their stated scopes. These G1 files do not replace product requirements, renormalize problem IDs, reactivate retired branch-per-layer instructions, or modify F0. Where historical process guidance conflicts with the user's later recorded decision, the current `PROJECT-AUTHORITY.md`, `DECISION-LOG.md`, and `COURSE-CONTROL.json` control.

## G1-B boundary

G1-B defines the missing contracts. It does not implement their validator behavior, execute hostile tests, independently validate them, accept them into integration, or begin later work. Those remain G1-C, G1-D, and G1-E respectively.
