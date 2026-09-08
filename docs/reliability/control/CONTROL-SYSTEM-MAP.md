# DIVERGENCE Control System Map

**Status:** G1 planning/control definition; implementation is G1-C

| Layer | Question answered | Canonical inputs | Output | May authorize work? |
|---|---|---|---|---|
| Authority | What outcome and boundaries did the user approve? | Project authority, decisions, active standalone assignment | Controlling scope and exclusions | Yes, only within explicit scope |
| Meaning | What did the user's request actually require? | Latest request, recorded decisions, meaning-confirmation record | Accepted intent boundary or one unresolved question | Only after ambiguity is resolved |
| Task control | What is the one permitted task and phase? | Course policy, task index, current task, dependency state | Allowed branch, paths, actions, and exact next phase | Yes, subject to every other control |
| Checkpoint | Can another AI safely resume now? | Local/remote identity, coherent changes, tests, records | Confirmed remote checkpoint and resume instruction | No; it preserves work only |
| Evidence | What was actually checked and observed? | Test outputs, hashes, diffs, artifacts | Evidence records with honest limitations | No |
| Audit | Did a separate reviewer validate the load-bearing claim? | Frozen checkpoint and audit assignment | Independent result and findings | No; it supplies a prerequisite result |
| Acceptance | May downstream work rely on this result? | Required gates, independent result, authority decision | Accepted dependency or explicit block | Yes, only through a valid transition |
| Lineage | What depends on what, and what becomes suspect after failure? | Accepted artifacts and dependency edges | Descendant impact/contamination state | Blocks or permits dependency use |

The machine validator is the enforcement boundary. Human-readable files explain truth; they do not override a failed machine check. GitHub rules protect refs and require the check. Integration is the accepted baseline; staging is never accepted merely because it contains a commit.

The only ordinary user projection is: requested task, current task, `SAFE TO SWITCH: YES/NO`, block reason, and one exact next action. Complete evidence remains available in the audit records.
