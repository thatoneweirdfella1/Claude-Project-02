# Interrupted-session and unsafe-patch recovery

Recovery is fail-closed. It restores a trustworthy checkpoint; it never promotes product depth.

## Trigger

Enter recovery when local HEAD, remote HEAD, protected paths, evidence identity, status/handoff, or the working patch differs unexpectedly from the recorded checkpoint. Report exactly:

```text
STALE-CHECKPOINT — RECOVERY REQUIRED
```

## Required recovery record

Record repository/branch, local and remote HEAD, source and last stable checkpoints, every changed/untracked/binary path, commit state, affected permanent IDs/evidence, protected-path involvement, test state, disposition (`KEEP`, `ISOLATE`, `REVERT-BY-NEW-COMMIT`, or `UNKNOWN`), hashes, and one exact recovery action.

## Procedure

1. Run read-only preflight and preserve its certificate even when it fails.
2. Derive remote HEAD. If it moved, do not overwrite it; read the intervening commits and reconcile from the new head.
3. Enumerate committed, modified, untracked, and binary changes. Never reset, clean, delete, or force-push user work.
4. Run `node scripts/governance/stopping-checkpoint.mjs`. A dirty worktree produces a hash-bound tracked patch and untracked-file snapshot inside the Git metadata directory and returns `FATAL`; that snapshot is recoverable but is not a safe handoff.
5. Restore or isolate an interrupted patch, run the exact batch tests, and commit only coherent work. A revert uses a normal new commit so history remains recoverable.
6. Mark dependent evidence stale and demote working-branch claims until re-proven; preserve the separate last stable checkpoint.
7. If a protected path changed without a valid exact hash-bounded exception, stop that change. Never rewrite the baseline to bless it.
8. Update `CURRENT-LAYER-STATUS.md`, `BATCH-SCOPE.json`, and `HANDOFF.md` to the same branch, checkpoint, batch, blocker, and next action.
9. Resume only when the patch disposition, protected checks, tests, commit, and remote lease are deterministic and current.

There is no invented fixed token or usage reserve. When a usage warning appears, finish only the smallest coherent checkpoint/recovery record and do not start a new batch.

## Forbidden shortcuts

Do not force-push, delete unknown work, rewrite history, weaken a validator, rewrite the governance baseline to hide a diff, mark partial work `PROVEN`, or silently switch branches/checkpoints.
