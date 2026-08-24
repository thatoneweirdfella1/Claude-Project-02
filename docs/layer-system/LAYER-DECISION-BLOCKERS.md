# Decision blockers

Only the exact affected IDs are blocked. Everything unrelated continues.

| Session | Decision IDs | Affected IDs | Status |
|---|---|---|---|
| DS-01 Browser-conflicting shortcuts | V2-DQ-001, V2-DQ-002, V2-DQ-003, V2-DQ-004 | KB-01, KB-04, KB-05, KB-07 | UNRESOLVED |
| DS-02 Mobile scope | V2-DQ-005 | SRC-VIS-01, SPEC-SE-02 | UNRESOLVED — does not block proof of the already approved fixed-desktop scope |
| DS-03 Developer heavy-use strategy | V2-DQ-006 | SPEC-DV-08, SPEC-DV-09 | UNRESOLVED |
| DS-04 Developer entry location | V2-DQ-007 | SPEC-DV-01, SPEC-DV-02 | UNRESOLVED LOCATION ONLY |

## Non-decision project-task blockers

These are not `V2-DQ-*` product choices and therefore must not disappear from the decision-session workflow.

| Task | Affected IDs | Blocks from | Status |
|---|---|---|---|
| `PROJECT-TASK-DATA-CONTRACT` | USR-ACCOUNT-01, USR-DATA-01, USR-OPT-01, USR-SC-01–09, SPEC-SE-09 | L4 | OPEN — derive the authoritative ownership, local/remote source-of-truth, migration, deletion, export, and rollback contract from existing authority; if authority is silent, return a scoped blocker instead of inventing behavior |
| `PROJECT-TASK-CROSS-DEVICE-CONFLICT` | USR-ACCOUNT-01, USR-DATA-01, USR-OPT-01, USR-SC-01–09 | L4 | OPEN — derive synchronization, concurrent-edit, deletion, and recovery behavior from existing authority; no default conflict policy is authorized |
| Learnable Signal Patterns verification/integration | SPEC-LS-01 / V2-RQ-033 | L3 | OPEN — the cited documented task source is not present in the governed packet; recover the source and exact acceptance contract before the row can be `PROVEN` at L3 or deeper |
| Fable recommendation/prompt-translation integration | SPEC-FB-01 / V2-RQ-034 | L6 | OPEN — the cited documented task source is not present in the governed packet; recover the source and exact acceptance contract before the row can be `PROVEN` at L6 or L7 |
