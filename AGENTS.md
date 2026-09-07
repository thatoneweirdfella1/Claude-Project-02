# DIVERGENCE.AI — Mandatory AI Entry Rule

Before analyzing, planning, editing, running commands, or proposing changes, read and follow `docs/ai-control/00-READ-FIRST.md`.

Non-negotiable defaults:

- Use only the existing Divergence.AI repository and its existing interface/layout.
- Treat `claude/remaining-second-pass-v1` as the untouched safety/layout branch. Never write to it.
- Make new task commits only on reusable staging branch `divergence/reliability-staging`. Merge accepted work into protected integration branch `divergence/reliability-v1`. Do not create another branch.
- Do not mutate the repository while `branch_mutation_authorized` is false or the checked-out branch differs from `approved_branch`.
- Perform only the one task named in `docs/ai-control/CURRENT-TASK.md`.
- Put every useful but out-of-scope discovery in `docs/ai-control/PARKING-LOT.md`; do not implement it.
- Record what you did, why, evidence, failures, and the exact next action in the required continuity files.
- Before accepting any repository checkpoint, run `node scripts/ai-course-control.mjs` with the exact base, head, branch, repository, and policy arguments. A failed or unavailable gate means stop; never bypass it.

This file is only an entrypoint. Canonical authority is in `docs/ai-control/`; do not duplicate or reinterpret it here.
