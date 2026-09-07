# DIVERGENCE.AI — Mandatory Repository Instructions

Read and follow `docs/ai-control/00-READ-FIRST.md` before any repository action.

Preserve `claude/remaining-second-pass-v1` as the untouched safety/layout branch. Make new task commits only on reusable staging branch `divergence/reliability-staging`; merge accepted work into protected integration branch `divergence/reliability-v1`. Do not create another branch. Preserve the existing Divergence interface/layout. Perform only the active bounded task, record work and rationale, and park all other ideas.

Canonical authority is in `docs/ai-control/`; this file must remain a pointer rather than a separate architecture or task definition.

The active machine policy is `docs/ai-control/COURSE-CONTROL.json`. A checkpoint is unacceptable unless `scripts/ai-course-control.mjs` passes with the exact repository, branch, base, and head.
