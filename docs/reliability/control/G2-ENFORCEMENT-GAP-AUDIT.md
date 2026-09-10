# G2 — Maximum-Feasible Automation and Non-Bypass Hardening

## Scope and preserved failure

G1-E failed at exact target 983baaa2315db32e2cc772edc2bcad053e4e3d69. That audit is immutable historical evidence. G2 is authored correction work, not independent verification. Product, F0, S02/S03/S18/S20, F1, layout, deployment, integration, and safety-branch work remain prohibited.

## Gap classification

| Gap | Before G2 | Classification | G2 action / exact gate | Residual risk |
|---|---|---|---|---|
| Audit required after author completion | Partly mechanical | Mechanically preventable now | Require an audit queue entry; G2-G01 | Queue can be forged with control-plane tampering |
| Exact next-AI audit instruction | Status projection | Mechanically detectable now | State/handoff alignment; G2-G01 | Semantic quality needs independent review |
| Stale checkpoint/handoff | Partial | Mechanically detectable now | Candidate base equals confirmed and lock base; G2-G01 | A commit cannot name its future SHA |
| Concurrent/overlapping edit | Git fast-forward only | Mechanically detectable now | Owner/base lock plus stale-base gate; G2-G01 | No distributed lease |
| Task ownership | Missing | Mechanically detectable now | Require owner, acquisition time, base; G2-G01 | Identity is declarative |
| Dependent work early | Implemented | Mechanically preventable now | Retain accepted-prerequisite matrix; G2-G02 | Host bypass remains possible |
| Work after upstream failure | Partial | Mechanically preventable now | Only explicit authorized correction transition; G2-G02 | Authority text needs audit |
| Contamination descendants | Deterministic detection | Mechanically detectable now | Retain lineage traversal and acceptance block; G2-G02 | State propagation is not automatically committed |
| Last accepted recovery | Documented | Mechanically detectable now | Preserve accepted commit and recovery action; G2-G02 | Recovery needs operator authority |
| Forged/reused evidence | Hash/metadata checks | Requires independent verification | Preserve matching review fields; G2-G03 | Actor strings can be forged |
| Judge changed with evidence | Critical failure | Mechanically detectable now | Protected-path declaration and no same-change approval; G2-G03 | Malicious coordinated judge rewrite remains possible |
| Reviewer separation | Declarative | Requires repository-host/admin configuration | CODEOWNERS and host-bound actor; G2-G04 | Repository code cannot authenticate independence |
| Ruleset/check readback | Historical | Requires repository-host/admin configuration | Exact readback required; G2-G04 | Admin connector unavailable here |
| Admin bypass | Disclosed | Cannot be guaranteed; residual risk must be disclosed | Fail-closed documentation; G2-G04 | Administrator controls host settings |
| Workflow trigger failure | Required check only | Requires repository-host/admin configuration | Missing required check must block; G2-G04 | Staging accepts commits before checks finish |
| Audit queue visibility | Missing | Mechanically detectable now | Machine audit_queue and status; G2-G01 | Notification delivery not guaranteed |
| Automatic notifications | Missing/optional | Requires repository-host/admin configuration | Keep non-authoritative; G2-G05 | Provider failure must never unlock |
| Context/usage loss | Checkpoints | Mechanically detectable now | Lock base, checkpoint, next/recovery; G2-G01 | Uncommitted work can be lost |
| Invented direction | Blocker implemented | Mechanically preventable now | Unknown/non-active rejection; G2-G02 | Malicious rewrite can bypass |
| Semantic misunderstanding | Protocol only | Requires independent verification | Meaning confirmation retained; G2-G05 | Intent cannot be guaranteed mechanically |

## Required host configuration

Protect integration and staging; require the named course-control check; require CODEOWNERS approval from a reviewer other than the author for workflows, validators, policy, state/evidence schemas, and ruleset requirements; dismiss stale approvals; require approval after the latest push; disallow bypass; and read back exact targets/rules after every configuration change. Anything not observed remains Open.

## Gates

- G2-G01: freshness, ownership, audit queue, and exact next action.
- G2-G02: correction, dependency, contamination, and recovery.
- G2-G03: protected-plane declaration and no same-change self-approval.
- G2-G04: live GitHub ruleset/check/reviewer binding; Open pending readback.
- G2-G05: residual-risk and semantic/notification disclosure.
- G2-G06: different-AI independent audit of every G2-authored change.

Owner: openai-codex-work-session-2026-09-08-g2-author. Evidence: focused tests, full checks, exact gate, commits, remote readback, and this audit. All authored changes remain Self-check passed or Open until G2-G06.
