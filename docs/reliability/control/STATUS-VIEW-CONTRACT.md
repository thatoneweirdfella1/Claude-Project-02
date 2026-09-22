# Status View Contract

## Simple user view

Show only:

1. requested task;
2. actual current task and phase;
3. `SAFE TO SWITCH: YES` or `SAFE TO SWITCH: NO`;
4. one plain-language block reason, when blocked;
5. one exact next action; and
6. one copyable instruction for a replacement AI when switching is safe.

`YES` requires a coherent confirmed remote checkpoint whose task/evidence/handoff/integrity records agree. `NO` must name the last confirmed remote checkpoint and the recovery action. The view never asks the user to infer a gate, choose a file, remember an audit, or inspect technical logs.

## Audit view

Expose task ID/state, repository/branch/base/head, changed paths, authority and meaning records, dependencies and statuses, tests and actual results, evidence IDs/hashes, reviewer identity, acceptance state, lineage/contamination impact, unresolved decisions, and exact next transition.

Both views are generated or validated from the same machine state. Any contradiction, stale record, placeholder, missing hash, or impossible transition makes the checkpoint unsafe and blocks promotion.
